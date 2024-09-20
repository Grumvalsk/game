// Definire gameState prima di usarlo
const gameState = {
  score: 0,
  isMovingLeft: false,  // Flag per il movimento a sinistra
  isMovingRight: false  // Flag per il movimento a destra
};

function preload() {
  this.load.image('bug1', 'assets/bug_1.png');
  this.load.image('bug2', 'assets/bug_2.png');
  this.load.image('bug3', 'assets/bug_3.png');
  this.load.image('platform', 'assets/platform.png');
  this.load.image('player', 'assets/codey.png');
  this.load.image('leftButton', 'assets/sinistra.png');  // Verifica il nome del file
  this.load.image('rightButton', 'assets/destra.png'); // Verifica il nome del file
}

function create() {
  // Player
  gameState.player = this.physics.add.sprite(320, 300, 'player').setScale(.5);
  const platforms = this.physics.add.staticGroup();
  platforms.create(225, 510, 'platform');
  

  gameState.player.setCollideWorldBounds(true);
  this.physics.add.collider(gameState.player, platforms);

  // Cursors
  gameState.cursors = this.input.keyboard.createCursorKeys();

  // Pulsanti per dispositivi mobili
  gameState.leftButton = this.add.sprite(50, 450, 'leftButton').setInteractive().setAlpha(0.5).setScale(0.1);
  gameState.rightButton = this.add.sprite(400, 450, 'rightButton').setInteractive().setAlpha(0.5).setScale(0.1);

  // Velocità costante per il movimento
  const playerSpeed = 160;

  gameState.leftButton.on('pointerdown', () => {
    gameState.isMovingLeft = true;
  });

  gameState.leftButton.on('pointerup', () => {
    gameState.isMovingLeft = false;
  });

  gameState.rightButton.on('pointerdown', () => {
    gameState.isMovingRight = true;
  });

  gameState.rightButton.on('pointerup', () => {
    gameState.isMovingRight = false;
  });

  // Nemici
  const bugs = this.physics.add.group();

  this.physics.add.collider(bugs, platforms, function(bug) {
    bug.destroy();
    gameState.score += 10;
    gameState.scoreText.setText(`Score: ${gameState.score}`);
  });

  function bugGen() {
    let xCoord = Math.random() * 450;
    bugs.create(xCoord, 10, 'bug1');
    bugs.create(xCoord, 11, 'bug2');
  }

  const bugGenLoop = this.time.addEvent({
    delay: 150,
    callback: bugGen,
    callbackScope: this,
    loop: true
  });

  gameState.scoreText = this.add.text(195, 485, 'Score: 0', { fontSize: '15px', fill: '#000000' });

  this.physics.add.collider(gameState.player, bugs, () => {
    bugGenLoop.destroy();
    this.physics.pause();
    this.add.text(189, 250, 'Game Over', { 
        fontSize: '15px',
        fill: '#000000'
    });
    this.add.text(152, 270, 'Click to Restart', { 
        fontSize: '15px',
        fill: '#000000'
    });
    this.input.on('pointerup', () => {
      gameState.score = 0;
      this.scene.restart();
    });
  });
}

function update() {
  // Far muovere il personaggio con la tastiera
  if (gameState.cursors.left.isDown || gameState.isMovingLeft) {
    gameState.player.setVelocityX(-160);
  } else if (gameState.cursors.right.isDown || gameState.isMovingRight) {
    gameState.player.setVelocityX(160);
  } else {
    gameState.player.setVelocityX(0);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 450,  // Larghezza originale del gioco
  height: 500,  // Altezza originale del gioco
  backgroundColor: "b9eaff",
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 200
      },
      enableBody: true,
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,  // Scala il gioco per adattarsi mantenendo le proporzioni
    autoCenter: Phaser.Scale.CENTER_BOTH  // Centra il gioco su entrambi gli assi
  },
  scene: {
    preload,
    create,
    update
  }
}

const game = new Phaser.Game(config);
