// ABOUTME: Generates TTS audio files from the tts-manifest.json using Google Cloud Text-to-Speech.
// ABOUTME: Supports dry-run, language filtering, category filtering, and resumable generation.

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

interface ManifestEntry {
  id: string;
  text: string;
  locale: 'he' | 'en';
  category: 'question' | 'number' | 'feedback' | 'instruction' | 'level';
  filePath: string;
  metadata: Record<string, number | string>;
}

interface Manifest {
  generatedAt: string;
  totalEntries: number;
  entries: ManifestEntry[];
}

interface VoiceConfig {
  languageCode: string;
  name: string;
}

const VOICE_CONFIG: Record<string, VoiceConfig> = {
  he: { languageCode: 'he-IL', name: 'he-IL-Wavenet-A' },
  en: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
};

const USAGE = `
Usage: npx tsx scripts/generate-tts.ts --project <gcp-project-id> [options]

Options:
  --project <id>       GCP project ID (required)
  --dry-run            Preview what would be generated without calling the API
  --locale <he|en>     Generate only for specified locale
  --category <cat>     Generate only for specified category
                       (question, number, feedback, instruction, level)
  --skip-existing      Skip files that already exist on disk
  --concurrency <n>    Max parallel API requests (default: 5)
  --help               Show this help message
`;

function loadManifest(): Manifest {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const manifestPath = path.resolve(scriptDir, 'tts-manifest.json');

  if (!fs.existsSync(manifestPath)) {
    console.error(
      'tts-manifest.json not found. Run "npx tsx scripts/generate-tts-script.ts" first.',
    );
    process.exit(1);
  }

  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as Manifest;
}

function filterEntries(
  entries: ManifestEntry[],
  locale: string | undefined,
  category: string | undefined,
): ManifestEntry[] {
  let filtered = entries;

  if (locale) {
    filtered = filtered.filter((e) => e.locale === locale);
  }

  if (category) {
    filtered = filtered.filter((e) => e.category === category);
  }

  return filtered;
}

function resolveOutputPath(filePath: string): string {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, '..');
  return path.resolve(projectRoot, 'public', 'assets', 'audio', filePath);
}

async function synthesize(
  client: InstanceType<typeof import('@google-cloud/text-to-speech').TextToSpeechClient>,
  entry: ManifestEntry,
): Promise<Buffer> {
  const voice = VOICE_CONFIG[entry.locale];

  const [response] = await client.synthesizeSpeech({
    input: { text: entry.text },
    voice: {
      languageCode: voice.languageCode,
      name: voice.name,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.9,
      pitch: 1.0,
    },
  });

  if (!response.audioContent) {
    throw new Error(`No audio content returned for ${entry.id}`);
  }

  return Buffer.from(response.audioContent as Uint8Array);
}

async function processEntry(
  client: InstanceType<typeof import('@google-cloud/text-to-speech').TextToSpeechClient>,
  entry: ManifestEntry,
  skipExisting: boolean,
): Promise<{ id: string; status: 'generated' | 'skipped' | 'error'; error?: string }> {
  const outputPath = resolveOutputPath(entry.filePath);

  if (skipExisting && fs.existsSync(outputPath)) {
    return { id: entry.id, status: 'skipped' };
  }

  try {
    const audioBuffer = await synthesize(client, entry);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, audioBuffer);
    return { id: entry.id, status: 'generated' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { id: entry.id, status: 'error', error: message };
  }
}

async function processBatch(
  client: InstanceType<typeof import('@google-cloud/text-to-speech').TextToSpeechClient>,
  entries: ManifestEntry[],
  concurrency: number,
  skipExisting: boolean,
): Promise<void> {
  let generated = 0;
  let skipped = 0;
  let errors = 0;
  let processed = 0;

  for (let i = 0; i < entries.length; i += concurrency) {
    const batch = entries.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map((entry) => processEntry(client, entry, skipExisting)),
    );

    for (const result of results) {
      processed++;
      if (result.status === 'generated') {
        generated++;
      } else if (result.status === 'skipped') {
        skipped++;
      } else {
        errors++;
        console.error(`  Error: ${result.id}: ${result.error}`);
      }
    }

    const pct = Math.round((processed / entries.length) * 100);
    process.stdout.write(`\r  Progress: ${processed}/${entries.length} (${pct}%)`);
  }

  console.log('');
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Errors:    ${errors}`);
}

function printDryRun(entries: ManifestEntry[], skipExisting: boolean): void {
  let wouldGenerate = 0;
  let wouldSkip = 0;

  const byCategory = new Map<string, number>();
  const byLocale = new Map<string, number>();

  for (const entry of entries) {
    const outputPath = resolveOutputPath(entry.filePath);
    const exists = fs.existsSync(outputPath);

    if (skipExisting && exists) {
      wouldSkip++;
      continue;
    }

    wouldGenerate++;
    byCategory.set(entry.category, (byCategory.get(entry.category) ?? 0) + 1);
    byLocale.set(entry.locale, (byLocale.get(entry.locale) ?? 0) + 1);
  }

  console.log('\nDry Run Summary');
  console.log('===============');
  console.log(`Total entries in selection: ${entries.length}`);
  console.log(`Would generate: ${wouldGenerate}`);
  console.log(`Would skip (existing): ${wouldSkip}`);

  console.log('\nBy category:');
  for (const [cat, count] of [...byCategory.entries()].sort()) {
    console.log(`  ${cat}: ${count}`);
  }

  console.log('\nBy locale:');
  for (const [loc, count] of [...byLocale.entries()].sort()) {
    console.log(`  ${loc}: ${count}`);
  }

  console.log('\nSample entries:');
  const samples = entries.slice(0, 5);
  for (const entry of samples) {
    console.log(`  [${entry.locale}/${entry.category}] "${entry.text}" -> ${entry.filePath}`);
  }
  if (entries.length > 5) {
    console.log(`  ... and ${entries.length - 5} more`);
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      project: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
      locale: { type: 'string' },
      category: { type: 'string' },
      'skip-existing': { type: 'boolean', default: false },
      concurrency: { type: 'string', default: '5' },
      help: { type: 'boolean', default: false },
    },
    strict: true,
  });

  if (values.help) {
    console.log(USAGE);
    process.exit(0);
  }

  if (!values.project) {
    console.error('Error: --project is required');
    console.log(USAGE);
    process.exit(1);
  }

  if (values.locale && values.locale !== 'he' && values.locale !== 'en') {
    console.error('Error: --locale must be "he" or "en"');
    process.exit(1);
  }

  const validCategories = ['question', 'number', 'feedback', 'instruction', 'level'];
  if (values.category && !validCategories.includes(values.category)) {
    console.error(`Error: --category must be one of: ${validCategories.join(', ')}`);
    process.exit(1);
  }

  const manifest = loadManifest();
  console.log(`Loaded manifest: ${manifest.totalEntries} total entries (${manifest.generatedAt})`);

  const entries = filterEntries(manifest.entries, values.locale, values.category);
  console.log(`Selected ${entries.length} entries for generation`);

  const skipExisting = values['skip-existing'] ?? false;

  if (values['dry-run']) {
    printDryRun(entries, skipExisting);
    return;
  }

  const concurrency = parseInt(values.concurrency ?? '5', 10);

  process.env.GCLOUD_PROJECT = values.project;

  const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
  const client = new TextToSpeechClient({ projectId: values.project });

  console.log(`\nGenerating audio (concurrency: ${concurrency})...`);
  await processBatch(client, entries, concurrency, skipExisting);
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
