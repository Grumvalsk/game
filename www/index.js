const gameState = {
  score: 0,
  isMovingLeft: false,
  isMovingRight: false,
  bugsPassed: [],
  gameStarted: false,
  initialMessageShown: false,
  player: null,
  cursors: null,
  leftButton: null,
  rightButton: null,
  scoreText: null,
  bugs: null,
  bugGenEvent: null,
  gameOverText: null,
  restartText: null,
};

function preload() {
  this.load.image('bug1', 'assets/bug_1.png');
  this.load.image('bug2', 'assets/bug_2.png');
  this.load.image('bug3', 'assets/bug_3.png');
  this.load.image('platform', 'assets/platform.png');
  this.load.image('player', 'assets/codey.png');
  this.load.image('leftButton', 'assets/sinistra.png');
  this.load.image('rightButton', 'assets/destra.png');
}

function create() {
  // Messaggio di avvio
  if (!gameState.initialMessageShown) {
    const startText = this.add.text(225, 200, 'Clicca per iniziare', { fontSize: '20px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive();

      const scegliPersonaggio = this.add.text(225, 250, 'Scegli il personaggio', { fontSize: '20px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive(); 

      const settings = this.add.text(225, 300, 'Impostazioni', { fontSize: '20px', fill: '#fff' })
      .setOrigin(0.5)
      .setInteractive();

    startText.on('pointerdown', () => {
      startGame(this);
      startText.setVisible(false);
      scegliPersonaggio.setVisible(false);
      settings.setVisible(false);
      gameState.initialMessageShown = true;
    });
  }

  // Crea il player
  gameState.player = this.physics.add.sprite(200, 450, 'player').setScale(0.5).setVisible(false); // Riposizionato vicino alla piattaforma
  const platforms = this.physics.add.staticGroup();
  platforms.create(225, 510, 'platform');

  gameState.player.setCollideWorldBounds(true);
  this.physics.add.collider(gameState.player, platforms);

  // Cursors
  gameState.cursors = this.input.keyboard.createCursorKeys();

  // Pulsanti per dispositivi mobili
  gameState.leftButton = this.add.sprite(50, 450, 'leftButton').setInteractive().setAlpha(0.5).setScale(0.1);
  gameState.rightButton = this.add.sprite(400, 450, 'rightButton').setInteractive().setAlpha(0.5).setScale(0.1);

  // Gestione eventi pulsanti
  gameState.leftButton.on('pointerdown', () => { gameState.isMovingLeft = true; });
  gameState.leftButton.on('pointerup', () => { gameState.isMovingLeft = false; });
  gameState.rightButton.on('pointerdown', () => { gameState.isMovingRight = true; });
  gameState.rightButton.on('pointerup', () => { gameState.isMovingRight = false; });

  // Crea il gruppo dei bug
  gameState.bugs = this.physics.add.group({
    allowGravity: false,
  });

  // Collider per game over
  this.physics.add.collider(gameState.player, gameState.bugs, () => {
    this.physics.pause();
    gameState.gameOverText = this.add.text(189, 250, 'Game Over', { fontSize: '15px', fill: '#000000' });
    gameState.restartText = this.add.text(152, 270, 'Click to Restart', { fontSize: '15px', fill: '#000000' });

    // Mostra i pulsanti
    gameState.leftButton.setVisible(true);
    gameState.rightButton.setVisible(true);

    gameState.restartText.setInteractive().on('pointerdown', () => {
      resetGameState(this);
      startGame(this);
    });
  });

  // Funzione per generare i bug


  gameState.bugGenEvent = this.time.addEvent({
    delay: 1500,
    callback: bugGen,
    callbackScope: this,
    loop: true,
  });

  gameState.scoreText = this.add.text(195, 485, 'Score: 0', { fontSize: '15px', fill: '#000000' });
}

function bugGen() {
  if (!gameState.gameStarted) return;

  const platformY = 510;
  const yCoord = platformY - 60;
  const bugX = 450;

  const bug = gameState.bugs.create(bugX, yCoord, 'bug1');
  bug.setVelocityX(-200);
  bug.checkWorldBounds = true;
  bug.outOfBoundsKill = true;

  gameState.bugsPassed.push(bug);
}

function update() {
  if (!gameState.gameStarted) return;

  if (gameState.cursors.left.isDown || gameState.isMovingLeft) {
    gameState.player.setVelocityX(-160);
  } else if (gameState.cursors.right.isDown || gameState.isMovingRight) {
    gameState.player.setVelocityX(160);
  } else {
    gameState.player.setVelocityX(0);
  }

  gameState.bugsPassed.forEach((bug, index) => {
    if (bug.x < gameState.player.x) {
      gameState.score += 10;
      gameState.scoreText.setText(`Score: ${gameState.score}`);
      gameState.bugsPassed.splice(index, 1);
    }
  });
}

function startGame(scene) {
  gameState.gameStarted = true;
  gameState.player.setVisible(true);
  gameState.leftButton.setVisible(true);
  gameState.rightButton.setVisible(true);

  if (gameState.gameOverText) {
    gameState.gameOverText.destroy(); // Rimuove il testo "Game Over"
  }
  if (gameState.restartText) {
    gameState.restartText.destroy(); // Rimuove il testo "Click to Restart"
  }

  scene.physics.resume(); // Assicura che la fisica riparta
}

function resetGameState(scene) {
  gameState.score = 0;
  gameState.isMovingLeft = false;
  gameState.isMovingRight = false;
  gameState.bugsPassed = [];
  gameState.gameStarted = false;

  // Riposiziona il player alla piattaforma
  gameState.player.setPosition(200, 450).setVisible(false); 

  gameState.scoreText.setText('Score: 0');
  gameState.bugs.clear(true, true);

  // Riavvia la generazione dei bug
  if (gameState.bugGenEvent) {
    gameState.bugGenEvent.remove(); // Rimuovi l'evento esistente
  }

  gameState.bugGenEvent = scene.time.addEvent({
    delay: 1500,
    callback: () => bugGen.call(scene),
    loop: true
  });
}

const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 500,
  backgroundColor: "b9eaff",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
      enableBody: true,
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);
