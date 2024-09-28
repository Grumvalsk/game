const gameState = {
  score: 0,
  jump: false,
  isMovingRight: false,
  bugsPassed: [],
  gameStarted: false,
  initialMessageShown: false,
  player: null,
  cursors: null,
  button: null,
  scoreText: null,
  bugs: null,
  bugGenEvent: null,
  gameOverText: null,
  restartText: null,
  background: null,
  backgroundVelocity: 1,
  isBackgroundMoving: true,
  selectedCharacter: 'player',
  backgroundMusic: null // Aggiungi il riferimento alla musica
};

function preload() {
  this.load.image('bug1', 'assets/bug_1.png');
  this.load.image('bug2', 'assets/bug_2.png');
  this.load.image('bug3', 'assets/bug_3.png');
  this.load.image('pitta', 'assets/pitta.jpg')
  this.load.image('platform', 'assets/platform.png');
  this.load.image('giulia', 'assets/personaggio.PNG');
  this.load.image('background', 'assets/sky.jpg');
  this.load.image('button', 'assets/button.png');

  // Caricamento del file audio
  this.load.audio('backgroundMusic', 'assets/suoni/love-anthem-no-1-128-ytshorts.savetube.me.mp3');
}

function create() {
  gameState.background = this.add.tileSprite(225, 250, 450, 500, 'background').setOrigin(0.5, 0.5);
  gameState.background.setScale(1);

  // Aggiungi la musica di sottofondo
  gameState.backgroundMusic = this.sound.add('backgroundMusic', {
    loop: true, // Cicla la musica continuamente
    volume: 0.5
  });

  // Messaggio iniziale
  const startText = this.add.text(225, 250, 'Inizia a giocare', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
  const scegliPersonaggio = this.add.text(225, 300, 'Scegli il personaggio', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
  const settings = this.add.text(225, 350, 'Settings', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);

  // Quando si clicca su "Scegli il personaggio"
  scegliPersonaggio.setInteractive().on('pointerdown', () => {
    startText.setVisible(false);
    scegliPersonaggio.setVisible(false);
    settings.setVisible(false);

    // Mostra la selezione del personaggio
    showCharacterSelection(this);
  });

  // Creazione del giocatore
  gameState.player = this.physics.add.sprite(200, 0, gameState.selectedCharacter).setScale(0.05).setVisible(false);
  gameState.player.setCollideWorldBounds(true);
  // gameState.player.setBounce(0.9); // Rimbalzo per il salto

  const platforms = this.physics.add.staticGroup();
  platforms.create(225, 480, 'platform');

  // Collisione tra il giocatore e le piattaforme
  this.physics.add.collider(gameState.player, platforms, () => {
    if (gameState.player.body.touching.down) {
      gameState.player.setVelocityY(0); // Ferma il movimento verticale
    }
  });

  this.physics.add.collider(gameState.player, platforms);

  // Cursors
  gameState.cursors = this.input.keyboard.createCursorKeys();

  // Pulsanti per dispositivi mobili
  gameState.button = this.add.sprite(50, 450, 'button').setInteractive().setAlpha(0.10).setScale(0.03);
  gameState.button.setVisible(false); // Nascondi il pulsante all'inizio

  // Gestione eventi pulsanti
  gameState.button.on('pointerdown', () => { gameState.jump = true; });
  gameState.button.on('pointerup', () => { gameState.jump = false; });

  // Creazione del gruppo dei bug
  gameState.bugs = this.physics.add.group({
    allowGravity: false,
  });

  // Collider per game over
  this.physics.add.collider(gameState.player, gameState.bugs, () => {
    gameState.isBackgroundMoving = false;

    this.physics.pause();
    gameState.background.tilePositionX = 0;
    gameState.gameOverText = this.add.text(189, 250, 'Game Over', { fontSize: '15px', fill: '#000000' });
    gameState.restartText = this.add.text(152, 270, 'Click to Restart', { fontSize: '15px', fill: '#000000' });

    // Ferma la musica
    gameState.backgroundMusic.stop();

    // Mostra il pulsante
    gameState.button.setVisible(true);

    gameState.restartText.setInteractive().on('pointerdown', () => {
      resetGameState(this);
      startGame(this);
    });
  });

  gameState.bugGenEvent = this.time.addEvent({
    delay: 1500,
    callback: bugGen,
    callbackScope: this,
    loop: true,
  });

  gameState.scoreText = this.add.text(195, 485, 'Score: 0', { fontSize: '15px', fill: '#000000' });
}

function showCharacterSelection(scene) {
  const selectionText = scene.add.text(225, 200, 'Scegli il tuo personaggio', { fontSize: '20px', fill: '#fff' }).setOrigin(0.5);
  const characters = ['giulia', 'pitta'];
  let currentCharacterIndex = 0;

  // Sprite del personaggio selezionato
  const characterSprite = scene.add.sprite(225, 300, characters[currentCharacterIndex]).setScale(0.5).setInteractive();

  // Pulsanti Next e Previous per il carosello
  const nextButton = scene.add.text(325, 400, 'Next', { fontSize: '20px', fill: '#fff' }).setInteractive();
  const prevButton = scene.add.text(125, 400, 'Previous', { fontSize: '20px', fill: '#fff' }).setInteractive();

  // Funzione per aggiornare il personaggio mostrato
  function updateCharacter() {
    characterSprite.setTexture(characters[currentCharacterIndex]);
  }

  // Gestione degli eventi dei pulsanti
  nextButton.on('pointerdown', () => {
    currentCharacterIndex = (currentCharacterIndex + 1) % characters.length;
    updateCharacter();
  });

  prevButton.on('pointerdown', () => {
    currentCharacterIndex = (currentCharacterIndex - 1 + characters.length) % characters.length;
    updateCharacter();
  });

  // Inizio del gioco cliccando sul personaggio selezionato
  characterSprite.on('pointerdown', () => {
    console.log('Personaggio selezionato:', characters[currentCharacterIndex]);
    gameState.selectedCharacter = characters[currentCharacterIndex]; 
    selectionText.setVisible(false);
    characterSprite.setVisible(false);
    nextButton.setVisible(false);
    prevButton.setVisible(false);

    startGame(scene); // Avvia il gioco
  });
}

function bugGen() {
  if (!gameState.gameStarted) return;

  const platformY = 480;
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

  // Muovi lo sfondo da destra a sinistra solo se è attivo
  if (gameState.isBackgroundMoving) {
    gameState.background.tilePositionX += gameState.backgroundVelocity;
  }

  // Controlla i movimenti del player
  if (gameState.cursors.space.isDown || gameState.jump) {
    gameState.player.setVelocityY(-160); // Movimento a sinistra
    gameState.player.setFlipX(true); // Girare il personaggio a sinistra
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
  gameState.background.tilePositionX += gameState.backgroundVelocity;
  gameState.gameStarted = true;
  gameState.player.setVisible(true);
  
  // Posiziona il giocatore sopra la piattaforma
  gameState.player.setPosition(200, 455); // Assicurati che 455 sia la giusta Y della piattaforma
  gameState.player.setVelocityY(0); // Ferma il movimento verticale iniziale

  gameState.button.setVisible(true);
  gameState.isBackgroundMoving = true;

  // Mostra il personaggio selezionato
  scene.add.existing(gameState.player);
  gameState.player.setTexture(gameState.selectedCharacter);

  if (gameState.gameOverText) {
    gameState.gameOverText.destroy();
  }
  if (gameState.restartText) {
    gameState.restartText.destroy();
  }

  // Avvia la musica di sottofondo
  gameState.backgroundMusic.play();

  scene.physics.resume();
}



function resetGameState(scene) {
  gameState.score = 0;
  gameState.jump = false;
  gameState.isMovingRight = false;
  gameState.bugsPassed = [];
  gameState.gameStarted = false;
  gameState.isBackgroundMoving = true;

  gameState.player.setPosition(200, 455).setVisible(false);
  gameState.player.setTexture(gameState.selectedCharacter); // Ripristina il personaggio selezionato

  gameState.scoreText.setText('Score: 0');
  gameState.bugs.clear(true, true); // Rimuovi tutti i bug
  gameState.background.tilePositionX = 0; // Ripristina la posizione dello sfondo
}


const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 500,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT, // Adatta il gioco alle dimensioni del contenitore
    autoCenter: Phaser.Scale.CENTER_BOTH // Centra il contenuto
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
