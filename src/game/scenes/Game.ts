// ABOUTME: Main gameplay scene: question display, building, numpad, and answer flow.
// ABOUTME: Orchestrates the loop: show question -> wait for answer -> animate result -> next.

import Phaser from 'phaser';
import { EventBus, GameEvents } from '../EventBus';
import { Building } from '../objects/Building';
import { Character } from '../objects/Character';
import { Numpad } from '../objects/Numpad';
import { HintButton } from '../objects/HintButton';
import { calculateBonusBricks } from '../scoring/bricks';
import type { Question } from '../../types';
import { useGameStore } from '../../stores/game';

const ENCOURAGEMENT_PHRASES = [
  'Amazing!', 'Great job!', 'You got it!',
  'Fantastic!', 'Well done!', 'Awesome!',
];

export class Game extends Phaser.Scene {
  private building!: Building;
  private character!: Character;
  private numpad!: Numpad;
  private hintButton!: HintButton;
  private questionText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private questionCountText!: Phaser.GameObjects.Text;

  private questions: Question[] = [];
  private currentQuestionIndex: number = 0;
  private currentQuestion: Question | null = null;
  private attemptCount: number = 0;
  private levelNumber: number = 1;
  private totalBricksThisLevel: number = 0;
  private correctCount: number = 0;
  private questionStartTime: number = 0;

  constructor() {
    super({ key: 'Game' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    const gameState = useGameStore.getState();
    this.levelNumber = gameState.currentLevel;
    this.questions = gameState.currentQuestions;
    this.currentQuestionIndex = 0;
    this.totalBricksThisLevel = 0;
    this.correctCount = 0;

    this.add.image(width / 2, height / 2, 'sky').setDisplaySize(width, height);
    this.add.image(width / 2, height - 40, 'ground').setDisplaySize(width, 80);

    const clouds = this.add.tileSprite(width / 2, 80, width, 120, 'clouds');
    clouds.setAlpha(0.6);
    this.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => { clouds.tilePositionX += 0.3; },
    });

    this.building = new Building(this);
    this.character = new Character(this);

    this.questionText = this.add.text(width / 2, 60, '', {
      fontFamily: 'Arial Black',
      fontSize: '48px',
      color: '#3c0f0f',
      stroke: '#FFF8E1',
      strokeThickness: 4,
    });
    this.questionText.setOrigin(0.5);

    this.feedbackText = this.add.text(width / 2, 120, '', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#06628d',
    });
    this.feedbackText.setOrigin(0.5);
    this.feedbackText.setAlpha(0);

    this.questionCountText = this.add.text(20, 20, '', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#06628d',
    });

    this.numpad = new Numpad(this);
    this.hintButton = new HintButton(this);

    EventBus.on(GameEvents.ANSWER_SUBMITTED, this.handleAnswer, this);
    EventBus.on(GameEvents.HINT_REQUESTED, this.handleHint, this);

    this.showQuestion();
    EventBus.emit(GameEvents.SCENE_READY, this);
  }

  private showQuestion(): void {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.endLevel();
      return;
    }

    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.attemptCount = 0;
    this.questionStartTime = Date.now();

    const q = this.currentQuestion;
    this.questionText.setText(`${q.factorA} \u00D7 ${q.factorB} = ?`);
    this.updateQuestionCounter();

    this.numpad.clear();
    this.numpad.setEnabled(true);
    this.hintButton.reset();

    this.feedbackText.setAlpha(0);
  }

  private handleAnswer = (givenAnswer: number): void => {
    if (!this.currentQuestion) return;

    const q = this.currentQuestion;
    const isCorrect = givenAnswer === q.correctAnswer;
    const responseTimeMs = Date.now() - this.questionStartTime;
    this.attemptCount++;

    const hintLevel = this.hintButton.getHintLevel();
    const bonusBricks = isCorrect ? calculateBonusBricks(hintLevel) : 0;
    const bricksEarned = isCorrect ? q.correctAnswer : 0;

    EventBus.emit(GameEvents.ANSWER_RESULT, {
      factorA: q.factorA,
      factorB: q.factorB,
      correctAnswer: q.correctAnswer,
      givenAnswer,
      isCorrect,
      responseTimeMs,
      hintLevel,
      attemptNumber: this.attemptCount,
      bricksEarned,
      bonusBricks,
    });

    if (isCorrect) {
      this.handleCorrect(q);
    } else {
      this.handleWrong(q);
    }
  };

  private async handleCorrect(question: Question): Promise<void> {
    const hintLevel = this.hintButton.getHintLevel();
    const answerBricks = question.correctAnswer;
    const bonusBricks = calculateBonusBricks(hintLevel);

    this.numpad.showCorrectFlash();
    this.numpad.setEnabled(false);
    this.hintButton.setEnabled(false);

    this.questionText.setText(
      `${question.factorA} \u00D7 ${question.factorB} = ${question.correctAnswer}`
    );

    this.showFeedback('correct');
    this.character.setState('happy');

    await this.building.addRow(answerBricks);

    if (bonusBricks > 0) {
      await this.building.addBonusRow(bonusBricks);
    }

    this.totalBricksThisLevel += answerBricks + bonusBricks;
    this.correctCount++;

    this.character.climbTo(this.building.getTopY());

    EventBus.emit(GameEvents.BRICKS_EARNED, {
      answerBricks,
      bonusBricks,
      totalBricks: this.totalBricksThisLevel,
    });

    this.time.delayedCall(1200, () => {
      this.currentQuestionIndex++;
      this.showQuestion();
    });
  }

  private handleWrong(question: Question): void {
    this.numpad.showWrongFlash();

    if (this.attemptCount === 1) {
      this.showFeedback('tryAgain');
      this.character.reactToWrong();
      this.building.wobble(false);

      this.time.delayedCall(600, () => {
        this.numpad.clear();
        this.numpad.setEnabled(true);
      });
    } else {
      this.showFeedback('showAnswer', question.correctAnswer);
      this.character.reactToWrong();
      this.building.wobble(true);

      this.questionText.setText(
        `${question.factorA} \u00D7 ${question.factorB} = ${question.correctAnswer}`
      );

      this.time.delayedCall(2500, () => {
        this.currentQuestionIndex++;
        this.showQuestion();
      });
    }
  }

  private handleHint = (data: { level: number }): void => {
    EventBus.emit(GameEvents.SHOW_HINT, {
      level: data.level,
      factorA: this.currentQuestion?.factorA,
      factorB: this.currentQuestion?.factorB,
    });
  };

  private showFeedback(
    type: 'correct' | 'tryAgain' | 'showAnswer',
    answer?: number,
  ): void {
    let message: string;
    let color: string;

    switch (type) {
      case 'correct': {
        message = ENCOURAGEMENT_PHRASES[
          Math.floor(Math.random() * ENCOURAGEMENT_PHRASES.length)
        ];
        color = '#4CAF50';
        break;
      }
      case 'tryAgain':
        message = 'Not quite! Try again.';
        color = '#e46b43';
        break;
      case 'showAnswer':
        message = `The answer is ${answer}.`;
        color = '#06628d';
        break;
    }

    this.feedbackText.setText(message);
    this.feedbackText.setColor(color);
    this.feedbackText.setAlpha(0);

    this.tweens.add({
      targets: this.feedbackText,
      alpha: 1,
      y: this.feedbackText.y - 5,
      duration: 200,
      yoyo: false,
      ease: 'Sine.easeOut',
    });
  }

  private updateQuestionCounter(): void {
    this.questionCountText.setText(
      `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`
    );
  }

  private endLevel(): void {
    this.building.addRoofDecoration();
    this.character.celebrate();

    const accuracy = this.questions.length > 0
      ? this.correctCount / this.questions.length
      : 0;

    this.time.delayedCall(2000, () => {
      this.scene.start('LevelComplete', {
        levelNumber: this.levelNumber,
        totalBricks: this.totalBricksThisLevel,
        correctCount: this.correctCount,
        totalQuestions: this.questions.length,
        accuracy,
      });
    });

    EventBus.emit(GameEvents.LEVEL_COMPLETE, {
      levelNumber: this.levelNumber,
      totalBricks: this.totalBricksThisLevel,
      accuracy,
    });
  }

  shutdown(): void {
    EventBus.off(GameEvents.ANSWER_SUBMITTED, this.handleAnswer, this);
    EventBus.off(GameEvents.HINT_REQUESTED, this.handleHint, this);

    this.building.destroy();
    this.character.destroy();
    this.numpad.destroy();
    this.hintButton.destroy();
  }
}
