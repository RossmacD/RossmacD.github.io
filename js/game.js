//Ca 1: Game
//Ross MacDonald  - N00171147 
//
// Create a new scene
let gameScene = new Phaser.Scene('Game');
// set the configuration of the game
var config = {
    type: Phaser.AUTO, // Phaser will use WebGL if available, if not it will use Canvas
    //Set Window Size
    width: 1280,
    height: 720,
    //Load Order of the main funtions
    scene: gameScene,
    //scene: menuScene,
    //Physics Initiallised
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                y: 500
            }
        }
    }

};

// create a new game, pass the configuration
var game = new Phaser.Game(config);

//Intialise global variables
let isPressed = false;
let upIsPressed = false;
let isRestarting = false;
var bg;
var currentPlayerY;
var groundGroup;
var enemyMaxY = 1300;
var enemyMinY = -50;
var scoreText;
var restartText;
var finalScore = 0;
var closeMenu;
var openMenu;
var isMuted = false;


//Load Assets:
gameScene.preload = function () {
    // load images
    this.load.image('backgroundColor', 'assets/images/background/bg_1.png');
    this.load.image('downArrow', 'assets/images/downArrow.png');
    this.load.image('background', 'assets/images/background/bg_4.png');
    //Loads Sprite Sheet and sets frame size
    this.load.spritesheet('player', 'assets/images/playerColored.png', {
        frameWidth: 600,
        frameHeight: 1028
    });
    this.load.image('rightArrow', 'assets/images/rightArrow.png');
    this.load.image('upArrow', 'assets/images/upArrow.png');
    this.load.image('platform', 'assets/images/cloud-platform2.png');
    this.load.image('sulty', 'assets/images/ulty.png');
    this.load.image('menuBg', 'assets/images/background/menuBG.png');
    this.load.image('gameOverBg', 'assets/images/background/gameOver.png');
    this.load.image('helpImage', 'assets/images/background/helpimage.png');
    this.load.audio('jump', 'assets/Sound/Jump.mp3');
};

//Create function runs once on start or restart
gameScene.create = function () {
    //Reset Score
    finalScore = 0;
    //Camera Settings (Possibly redundant)
    this.cameras.main.setViewport(0, 0, 1280, 720);
    //Add BG gradient and moon
    bgColor = this.add.image(0, 0, 'backgroundColor');
    //Sets the gradient to follow the camera
    bgColor.setScrollFactor(0);
    //Sets origin of the gradient
    bgColor.setOrigin(0, 0);
    //Add Background as Tilesprite
    bg = this.add.tileSprite(0, 0, 1280, 1829, 'background');
    // change the origin to the top-left corner
    bg.setOrigin(0, 0);
    //Have the background follow the camera
    bg.setScrollFactor(0);

    //add down arrows in an array
    signGroup = this.add.group({
        key: 'downArrow',
        repeat: 40,
        setXY: {
            x: this.sys.game.config.width / 2 + 1000,
            y: this.sys.game.config.height / 2 + 200,
            stepX: 1000,
            stepY: 0
        }
    });

    //Create the player
    this.player = this.physics.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 100, 'player');
    //Initialise position
    this.player.y = 555;
    currentPlayerY = 555;
    //Create Player Animations
    this.anims.create({
        key: 'board',
        frames: [{
            key: 'player',
            frame: 1
        }],
        frameRate: 20
    });
    this.anims.create({
        key: 'jump',
        frames: [{
            key: 'player',
            frame: 2
        }],
        frameRate: 20
    });
    this.anims.create({
        key: 'default',
        frames: [{
            key: 'player',
            frame: 0
        }],
        frameRate: 20
    });
    // Resize Player
    this.player.setScale(0.5);
    //Make the camera follow the player
    this.cameras.main.startFollow(this.player);
    // Player is alive
    this.isPlayerAlive = true;

    //Sets up array of platforms
    groundGroup = this.physics.add.staticGroup({
        key: 'platform',
        repeat: 40,
        setXY: {
            x: this.sys.game.config.width / 2,
            y: this.sys.game.config.height / 2 + 500,
            stepX: 1000,
            stepY: 0
        }
    });

    //Set up enemy(Sult) array
    sultGroup = this.physics.add.group({
        key: 'sulty',
        repeat: 40,
        setXY: {
            x: this.sys.game.config.width / 2 + 1500,
            y: this.sys.game.config.height / 2 + 500,
            stepX: 1000,
            stepY: 0
        }
    });


    //Adds the collider to between the player and platforms
    this.physics.add.collider(this.player, groundGroup);
    this.physics.add.overlap(this.player, sultGroup, gameScene.enemyHit, null, this);

    //Create Control Buttons
    this.rightArrow = this.add.sprite(1055, 495, 'rightArrow').setInteractive();
    this.upArrow = this.add.sprite(825, 495, 'upArrow').setInteractive();
    //Have the Buttons follow the camera
    this.rightArrow.setScrollFactor(0);
    this.upArrow.setScrollFactor(0);
    //Set Scale and origins for buttons
    this.rightArrow.setOrigin(0);
    this.upArrow.setOrigin(0);
    this.rightArrow.setScale(0.5);
    this.upArrow.setScale(0.5);

    //checks if right arrow sprite is clicked
    this.rightArrow.on('pointerdown', function (pointer) {
        isPressed = true;
    }, this);
    //Check if up arrow sprite is clicked
    this.upArrow.on('pointerdown', function (pointer) {
        upIsPressed = true;
    }, this);

    Phaser.Actions.Call(sultGroup.getChildren(), function (enemy) {
        enemy.speed = Math.random() * 8 + 6;
    }, this);

    //Add score text
    scoreText = this.add.text(16, 16, 'score: 0', {
        fontSize: '32px Arial',
        fill: '#fff'
    }).setScrollFactor(0);

    //add jump sound
    jumpSound = this.sound.add('jump');

    //add gameover screen, set position and hide
    gameOverBg = this.add.image(0, 0, 'gameOverBg');
    //Sets the gradient to follow the camera
    gameOverBg.setScrollFactor(0);
    //Sets origin of the gradient
    gameOverBg.setOrigin(0, 0);
    gameOverBg.visible = false;

    //add gameover option for restarting
    this.restartText = this.add.text(game.config.width / 2, game.config.height / 2 + 25, 'RESTART', {
        font: '32px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    this.restartText.setOrigin(0.5);
    this.restartText.setInteractive();
    this.restartText.on('pointerup', function () {
        //change isRestarting boolean, this will restart when update fucntion reads this
        console.log("Restart");
        isRestarting = true;
    });
    this.restartText.visible = false;

    //add option for main menu on the gameoverscreen
    this.enterMenuText = this.add.text(game.config.width / 2, game.config.height / 2 + 100, 'RETURN TO MENU', {
        font: '32px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    this.enterMenuText.setOrigin(0.5);
    this.enterMenuText.setInteractive();
    this.enterMenuText.on('pointerup', function () {
        console.log("Restart");
        //change open menu boolean, this will open menu when update fucntion reads this
        openMenu = true;
    });
    this.enterMenuText.visible = false;

    //add menu bg and set position
    menuBG = this.add.image(0, 0, 'menuBg');
    menuBG.setScrollFactor(0);
    menuBG.setOrigin(0, 0);
    // Add start option to menu
    this.startText = this.add.text(game.config.width / 2 - 270, game.config.height / 2, '> Start', {
        font: '55px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    this.startText.setOrigin(0.5);
    this.startText.setInteractive();
    this.startText.on('pointerup', function () {
        closeMenu = true;
    });

    //Add mute option to menu
    this.muteText = this.add.text(game.config.width / 2 - 270, game.config.height / 2 + 80, '> Mute', {
        font: '55px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    this.muteText.setOrigin(0.5);
    this.muteText.setInteractive();
    this.muteText.on('pointerup', function () {
        //Changes whether the game is muted, is read by update function
        if (!isMuted) {
            isMuted = true;
        } else {
            isMuted = false;
        }
    });

    //Add help option to menu
    this.helpText = this.add.text(game.config.width / 2 - 270, game.config.height / 2 + 160, '> Help', {
        font: '55px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    this.helpText.setOrigin(0.5);
    this.helpText.setInteractive();
    //Initialise help image and hide
    helpBG = this.add.image(0, 0, 'helpImage').setInteractive();
    helpBG.visible = false;
    helpBG.setScrollFactor(0);
    helpBG.setOrigin(0, 0);
    this.helpText.on('pointerup', function () {
        //Shows the help image and closes on click
        helpBG.visible = true;
        helpBG.on('pointerup', function () {
            helpBG.visible = false;
        });
    });

    //Reset camera effects. Not sure if this is needed
    this.cameras.main.resetFX();
};


//Update function runs continously
gameScene.update = function () {
    //Checks if the level should restart
    if (isRestarting) {
        isRestarting = false;
        this.scene.restart();
        return;
    }
    //Checks if menu should be closed, hides all menu items if so
    if (closeMenu) {
        this.startText.visible = false;
        this.helpText.visible = false;
        this.muteText.visible = false;
        menuBG.visible = false;
    }
    //Checks if menu should be opened, shows all menu items if so
    if (openMenu) {
        openMenu = false;
        closeMenu = false;
        this.startText.visible = true;
        this.helpText.visible = true;
        this.muteText.visible = true;
        menuBG.visible = true;
        this.scene.restart();
        return;
    }
    //Switches the text on the mute button if it changes
    if (isMuted) {
        this.muteText.setText('> Muted');
    } else {
        this.muteText.setText('> Mute');
    }

    //Move BG based on the player y from initial point
    //If player has fallen off the background will stop moving
    if (this.player.y < 720) {
        bg.tilePositionY = -(555 - this.player.y);
    } else if (this.player.y > 800) {
        this.isPlayerAlive = false;
    }
    //Check if player is touching the ground
    let onGround = this.player.body.touching.down;

    //Check for game over
    if (!this.isPlayerAlive) {
        this.gameOver();
        let gameOverText = this.add.text(game.config.width / 2, game.config.height / 2 - 50, finalScore, {
            fontSize: '55px',
            fill: '#fff'
        });
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);
        gameOverText.setDepth(1);
        return;
    }


    //Checks if mouse is down
    if (!this.input.activePointer.isDown) {
        //Reset the variables on mouse release
        isPressed = false;
        upIsPressed = false;
    }

    //Movement Code:
    if (isPressed) {
        //Change Animation
        this.player.anims.play('board');
        // player walks
        this.player.x = this.player.x + 15;
        //Moves the background along the X
        bg.tilePositionX += 15;
    }
    if (onGround && (upIsPressed)) {
        //Change to jump Animation
        this.player.anims.play('jump');
        //Jump
        this.player.setVelocityY(-550);
        if (!isMuted) {
            jumpSound.play();
        }
    }
    //Sets animation to deafault if nothing is pressed
    if (!isPressed && !upIsPressed) {
        this.player.anims.play('default');
    }

    //Initialises the signs that point to cloud
    let signs = signGroup.getChildren();
    let numSigns = signs.length;
    for (let i = 0; i < numSigns; i++) {
        if (this.player.x > signs[i].x) {
            signs[i].visible = false;

        }
    }

    //Set Enemy behaviour
    let enemies = sultGroup.getChildren();
    let numEnemies = enemies.length;
    for (let i = 0; i < numEnemies; i++) {
        // move enemies
        enemies[i].setVelocity(0);
        //Increase enemy speed based on which enemy they are
        enemies[i].y += enemies[i].speed * (1 + i / 10);
        // reverse movement if reached the edges
        if (enemies[i].y >= enemyMaxY && enemies[i].speed > 0) {
            enemies[i].speed *= -1;
        } else if (enemies[i].y <= enemyMinY && enemies[i].speed < 0) {
            enemies[i].speed *= -1;
        }
    }
    //update the score
    scoreText.setText('Score: ' + (this.player.x - 640));
}

gameScene.enemyHit = function () {
    this.isPlayerAlive = false;
}

gameScene.gameOver = function () {
    gameOverBg.visible = true;
    this.restartText.visible = true;
    this.enterMenuText.visible = true;
    //Sets the final score
    if (this.player.x - 640 > finalScore) {
        finalScore = this.player.x - 640;
    }
    //Return the player to original position to stop physics/player somehow accidently getting a higher score
    this.player.y = 550;
    this.player.x = game.config.width / 2;
    this.player.setVelocityY(0);
}
