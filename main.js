import Phaser from 'phaser';

class WelcomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WelcomeScene' });
        this.selectedDifficulty = 'normal'; // Default difficulty
    }

    preload() {
    }

    create() {
        this.add.text(640, 200, 'Welcome to Pong!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5, 0.5);
        this.add.text(640, 300, 'Select Difficulty:', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5, 0.5);

        const easyButton = this.add.text(640, 400, 'Easy', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.selectedDifficulty = 'easy';
                this.startGame();
            });

        const normalButton = this.add.text(640, 460, 'Normal', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.selectedDifficulty = 'normal';
                this.startGame();
            });

        const hardButton = this.add.text(640, 520, 'Hard', { fontSize: '32px', fill: '#fff' })
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.selectedDifficulty = 'hard';
                this.startGame();
            });
    }

    startGame() {
        this.scene.start('GameScene', { difficulty: this.selectedDifficulty });
    }

    update() {
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.leftPaddle = null;
        this.rightPaddle = null;
        this.ball = null;
        this.cursors = null;
        this.scoreText = null;
        this.scoreMessageText = null;
        this.leftScore = 0;
        this.rightScore = 0;
        this.initialBallSpeed = 400; // Store the initial speed
        this.ballSpeed = this.initialBallSpeed; // Start with the initial speed
        this.gameOver = false;
        this.speedIncrement = 20; // Amount to increase speed with each hit
        this.difficulty = 'normal'; // Default difficulty
    }

    init(data) {
        this.difficulty = data.difficulty; // Receive the selected difficulty
    }

    preload() {
        this.load.image('ball', 'public/images/ball.png');
    }

    create() {
        this.leftPaddle = this.physics.add.sprite(50, 360).setImmovable();
        this.leftPaddle.body.setSize(20, 100);
        this.leftPaddle.setVisible(false);

        this.rightPaddle = this.physics.add.sprite(1230, 360).setImmovable();
        this.rightPaddle.body.setSize(20, 100);
        this.rightPaddle.setVisible(false);

        this.ball = this.physics.add.sprite(640, 360, 'ball').setOrigin(0.5, 0.5);
        this.ball.setDisplaySize(20, 20);
        this.resetBall();
        this.ball.setBounce(1);

        this.scoreText = this.add.text(640, 50, '0 : 0', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5, 0.5);
        this.scoreMessageText = this.add.text(640, 360, '', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5, 0.5).setVisible(false);

        this.physics.add.collider(this.ball, this.leftPaddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.rightPaddle, this.hitPaddle, null, this);

        const topBorder = this.add.graphics();
        topBorder.fillStyle(0x000000, 1);
        topBorder.fillRect(0, 0, 1280, 20);

        const bottomBorder = this.add.graphics();
        bottomBorder.fillStyle(0x000000, 1);
        bottomBorder.fillRect(0, 700, 1280, 20);

        const topCollisionBorder = this.physics.add.staticGroup();
        const bottomCollisionBorder = this.physics.add.staticGroup();

        topCollisionBorder.create(640, 10, null).setSize(1280, 20).setVisible(false);
        bottomCollisionBorder.create(640, 730, null).setSize(1280, 20).setVisible(false);

        this.physics.add.collider(this.ball, topCollisionBorder);
        this.physics.add.collider(this.ball, bottomCollisionBorder, this.hitBottomBorder, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.paddleGraphics = this.add.graphics();

        const lineGraphics = this.add.graphics();
        lineGraphics.lineStyle(2, 0xffffff, 1);
        const lineHeight = this.game.config.height;
        const centerX = this.game.config.width / 2;

        for (let y = 0; y < lineHeight; y += 10) {
            if (y % 20 === 0) {
                lineGraphics.lineBetween(centerX, y, centerX, y + 10);
            }
        }
    }

    update() {
        if (this.gameOver) {
            return;
        }

        this.paddleGraphics.clear();

        if (this.cursors.up.isDown && this.leftPaddle.y > 70) {
            this.leftPaddle.setVelocityY(-400);
        } else if (this.cursors.down.isDown && this.leftPaddle.y < 650) {
            this.leftPaddle.setVelocityY(400);
        } else {
            this.leftPaddle.setVelocityY(0);
        }

        const targetY = this.ball.y;
        const paddleSpeed = this.getPaddleSpeed(); // Get paddle speed based on difficulty

        if (this.rightPaddle.y < targetY - 10 && this.rightPaddle.y < 650) {
            this.rightPaddle.setVelocityY(paddleSpeed);
        } else if (this.rightPaddle.y > targetY + 10 && this.rightPaddle.y > 70) {
            this.rightPaddle.setVelocityY(-paddleSpeed);
        } else {
            this.rightPaddle.setVelocityY(0);
        }

        if (this.ball.x < 0) {
            this.rightScore += 1;
            this.displayScoreMessage('Player 1 scored!');
            this.checkGameOver();
            this.resetBall();
        } else if (this.ball.x > 1280) {
            this.leftScore += 1;
            this.displayScoreMessage('Player 2 scored!');
            this.checkGameOver();
            this.resetBall();
        }

        this.scoreText.setText(`${this.leftScore}  ${this.rightScore}`);

        this.paddleGraphics.fillStyle(0xffffff, 1);
        this.paddleGraphics.fillRect(this.leftPaddle.x - 10, this.leftPaddle.y - 50, 20, 100);
        this.paddleGraphics.fillRect(this.rightPaddle.x - 10, this.rightPaddle.y - 50, 20, 100);
    }

    getPaddleSpeed() {
        switch (this.difficulty) {
            case 'easy':
                return 150; // Slow speed for easy
            case 'normal':
                return 300; // Normal speed
            case 'hard':
                return 450; // Fast speed for hard
            default:
                return 300; // Default to normal
        }
    }

    hitPaddle(ball, paddle) {
        const diff = ball.y - paddle.y;
        const normalizedDiff = diff / (paddle.height / 2);
        const angleAdjustment = 0.5;
        ball.setVelocityY(normalizedDiff * this.ballSpeed * angleAdjustment);

        // Increase ball speed with each hit
        this.ballSpeed += this.speedIncrement;

        if (paddle === this.leftPaddle) {
            ball.setVelocityX(this.ballSpeed);
        } else {
            ball.setVelocityX(-this.ballSpeed);
        }
    }

    resetBall() {
        this.ball.setPosition(640, 360);
        this.ballSpeed = this.initialBallSpeed; // Reset ball speed to initial value
        this.ball.setVelocity(this.ballSpeed * (Math.random() < 0.5 ? 1 : -1), this.ballSpeed * (Math.random() < 0.5 ? 1 : -1));
    }

    resetGame() {
        this.leftScore = 0;
        this.rightScore = 0;
        this.gameOver = false;
        this.resetBall();
        this.ball.setVisible(true);
        this.scoreText.setText('0 : 0');
        this.scoreMessageText.setVisible(false);
        this.leftPaddle.setPosition(50, 360);
        this.rightPaddle.setPosition(1230, 360);
    }

    checkGameOver() {
        if (this.leftScore >= 5 || this.rightScore >= 5) {
            this.gameOver = true;
            const winner = this.leftScore >= 5 ? 'Player 1' : 'Player 2';
            this.displayScoreMessage(`${winner} wins!`);
            this.ball.setVisible(false);
            this.time.delayedCall(2000, () => {
                this.resetGame();
                this.scene.start('WelcomeScene');
            });
        }
    }

    displayScoreMessage(message) {
        this.scoreMessageText.setText(message).setVisible(true);

        // Hide the score message after 1 second
        this.time.delayedCall(1000, () => {
            this.scoreMessageText.setVisible(false);
        });
    }

    hitBottomBorder(ball) {
        if (ball.y > 700 - ball.displayHeight / 2) {
            ball.setY(700 - ball.displayHeight / 2);
        }
        ball.setVelocityY(-Math.abs(ball.body.velocity.y));
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [WelcomeScene, GameScene],
    scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
