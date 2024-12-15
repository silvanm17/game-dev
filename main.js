import Phaser from 'phaser';

class WelcomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WelcomeScene' });
        this.selectedDifficulty = 'normal'; // Default difficulty
        this.isPlayerPowerUpActive = false; // For the left paddle (Player 1)
        this.isNPCPowerUpActive = false;   // For the right paddle (NPC)
        this.speedBoostDuration = 10000;  // Duration of the speed boost
        this.powerUpMultiplier = 2;       // Speed multiplier during power-up
        
    }

    preload() {
        this.load.image('logo', 'public/images/logo.png'); // Load logo image
        
    }

    create() {
        this.add.text(640, 200, 'Welcome to Best Educations Pong!', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5, 0.5);
        this.add.text(640, 250, 'Launching You into the Future!', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5, 0.5);
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

        // Add logo image below difficulty buttons
        this.add.image(640, 620, 'logo').setOrigin(0.5, 0.5).setScale(0.05); // Adjust the scale as needed
    }

    startGame() {
        this.scene.start('GameScene', { difficulty: this.selectedDifficulty });
    }

    update() { }
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
        this.powerUp = null;
        this.powerUpSpeed = 100;
        this.isPowerUpActive = false;
        this.speedBoostDuration = 10000;
        this.powerUpMultiplier = 2; // Speed multiplier when power-up is active
    }

    init(data) {
        this.difficulty = data.difficulty; // Receive the selected difficulty
    }

    preload() {
        this.load.image('ball', 'public/images/ball.png');
        this.load.image('power-up', 'public/images/power-up.jpeg');
        this.load.image('power-up2', 'public/images/power-up2.png');

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

        // Power-up setup
        this.powerUp = this.physics.add.sprite(640, -50, 'power-up').setOrigin(0.5, 0.5).setScale(0.5);
        this.powerUp.setVelocity(0, 0); // No movement initially
        this.powerUp.setVisible(false); // Hide the power-up initially

        this.time.delayedCall(2000, () => { // Adjust the delay as needed
            this.powerUp.setVisible(true); // Make the power-up visible
            this.powerUp.setVelocityY(this.powerUpSpeed); // Start the power-up falling
            this.powerUp.setPosition(Phaser.Math.Between(100, 1180), -50); // Position it above the screen
        });


        this.powerUp2 = this.physics.add.sprite(640, -50, 'power-up2').setOrigin(0.5, 0.5).setScale(0.1); // Set the scale to a smaller value (e.g., 0.3)

this.powerUp2.setVelocity(0, 0); // No movement initially
this.powerUp2.setVisible(false); // Hide the power-up initially

this.time.delayedCall(3000, () => { // Adjust the delay as needed
    this.powerUp2.setVisible(true); // Make the power-up visible
    this.powerUp2.setVelocityY(this.powerUpSpeed); // Start the power-up falling
    this.powerUp2.setPosition(Phaser.Math.Between(100, 1180), -50); // Position it above the screen
});

// Power-up 2 collision detection (ball should go through it)
this.physics.add.overlap(this.ball, this.powerUp2, this.collectPowerUp2, null, this);


        // Power-up collision detection (ball should go through it)
        this.physics.add.overlap(this.ball, this.powerUp, this.collectPowerUp, null, this);

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

        const playerPaddleSpeed = this.getPaddleSpeed(); // Get player paddle speed based on difficulty


        if (this.cursors.up.isDown && this.leftPaddle.y > 70) {
            this.leftPaddle.setVelocityY(-this.getPaddleSpeed(true));
        } else if (this.cursors.down.isDown && this.leftPaddle.y < 650) {
            this.leftPaddle.setVelocityY(this.getPaddleSpeed(true));
        } else {
            this.leftPaddle.setVelocityY(0);
        }


        const targetY = this.ball.y;
        
        const paddleSpeed = this.getPaddleSpeed(); // Get paddle speed based on difficulty

        if (this.rightPaddle.y < targetY - 10 && this.rightPaddle.y < 650) {
            this.rightPaddle.setVelocityY(this.getPaddleSpeed(false));
        } else if (this.rightPaddle.y > targetY + 10 && this.rightPaddle.y > 70) {
            this.rightPaddle.setVelocityY(-this.getPaddleSpeed(false));
        } else {
            this.rightPaddle.setVelocityY(0);
        }

        if (this.ball.x < 0) {
            this.rightScore += 1;
            this.displayScoreMessage('Player 2 scored!'); // This is correct for Player 2 scoring
            this.checkGameOver();
            this.resetBall();
        } else if (this.ball.x > 1280) {
            this.leftScore += 1;
            this.displayScoreMessage('Player 1 scored!'); // This is correct for Player 1 scoring
            this.checkGameOver();
            this.resetBall();
        }


        this.scoreText.setText(`${this.leftScore}  ${this.rightScore}`);

        this.paddleGraphics.fillStyle(0xffffff, 1);
        this.paddleGraphics.fillRect(this.leftPaddle.x - 10, this.leftPaddle.y - 50, 20, 100);
        this.paddleGraphics.fillRect(this.rightPaddle.x - 10, this.rightPaddle.y - 50, 20, 100);

        if (this.powerUp.y > 720) {
            this.powerUp.setPosition(Phaser.Math.Between(100, 1180), -50);
            this.powerUp.setVelocity(0, this.powerUpSpeed); // Reset velocity: no horizontal movement
        }
        


    }


    hitPaddle(ball, paddle) {
        this.lastPaddle = paddle; // Ensure this is correctly assigned each time the ball hits a paddle
    
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
    
    collectPowerUp(ball, powerUp) {
        powerUp.setAlpha(0); // Hide the power-up temporarily
    
        // Check which paddle last hit the ball and apply the power-up
        if (this.lastPaddle === this.leftPaddle) {
            this.isPlayerPowerUpActive = true; // Activate the player's power-up
        } else if (this.lastPaddle === this.rightPaddle) {
            this.isNPCPowerUpActive = true; // Activate the NPC's power-up
        }
    
        // Set a timer to deactivate the power-up after the specified duration
        this.time.delayedCall(this.speedBoostDuration, () => {
            this.isPlayerPowerUpActive = false;
            this.isNPCPowerUpActive = false;
            powerUp.setAlpha(1); // Make the power-up reappear
            // Reposition the power-up above the screen at a random X position
            powerUp.setPosition(Phaser.Math.Between(100, 1180), -50);
            powerUp.setVelocityY(this.powerUpSpeed); // Start falling again
        });
    }
    
    collectPowerUp2(ball, powerUp) {
        powerUp.setAlpha(0); // Hide the power-up temporarily
    
        // Check which paddle last hit the ball and apply the power-up
        if (this.lastPaddle === this.leftPaddle) {
            // Apply the power-up to the NPC (right paddle), make it slower
            this.slowDownPaddle(this.rightPaddle);
        } else if (this.lastPaddle === this.rightPaddle) {
            // Apply the power-up to the player (left paddle), make it slower
            this.slowDownPaddle(this.leftPaddle);
        }
    
        // Set a timer to deactivate the power-up after the specified duration
        this.time.delayedCall(this.speedBoostDuration, () => {
            // Reset paddle speed for both paddles
            this.resetPaddleSpeed(this.leftPaddle);
            this.resetPaddleSpeed(this.rightPaddle);
    
            // Reappear power-up and reset its velocity
            powerUp.setAlpha(1); // Make the power-up reappear
            powerUp.setPosition(Phaser.Math.Between(100, 1180), -50);
            powerUp.setVelocityY(this.powerUpSpeed); // Start falling again
        });

        
    }
    slowDownPaddle(paddle) {
        // Store original speed if not already stored
        if (paddle.getData('originalSpeed') === undefined) {
            paddle.setData('originalSpeed', this.getPaddleSpeed()); // Store original speed if not already stored
        }
    
        paddle.setData('slowedSpeed', paddle.getData('originalSpeed') * 0.5); // Set the slowed speed to 50% of the original speed
    }
    
    resetPaddleSpeed(paddle) {
        // Check if the paddle has a stored original speed
        if (paddle.getData('originalSpeed') !== undefined) {
            // Reset the paddle's speed to its original value
            paddle.setData('slowedSpeed', null); // Remove the slowed speed data
            paddle.setVelocityY(0); // Ensure the paddle stops moving if necessary
        }
    }    

    hitBottomBorder(ball) {
        if (ball.y > 700 - ball.displayHeight / 2) {
            ball.setY(700 - ball.displayHeight / 2);
        }
        ball.setVelocityY(-Math.abs(ball.body.velocity.y));
    }

    getPaddleSpeed(isPlayer = true) {
        const baseSpeed = 250; // Default speed
        const isPowerUpActive = isPlayer ? this.isPlayerPowerUpActive : this.isNPCPowerUpActive;
    
        let speed = isPowerUpActive ? baseSpeed * this.powerUpMultiplier : baseSpeed;
    
        // If the slowed speed is set, use it, otherwise use the base speed
        if (isPlayer && this.leftPaddle.getData('slowedSpeed') !== undefined) {
            speed = this.leftPaddle.getData('slowedSpeed') || speed; // If slowedSpeed is null, use the base speed
        } else if (!isPlayer && this.rightPaddle.getData('slowedSpeed') !== undefined) {
            speed = this.rightPaddle.getData('slowedSpeed') || speed; // If slowedSpeed is null, use the base speed
        }
    
        return speed;
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
