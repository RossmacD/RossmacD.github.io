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
var isMuted=false;


//Load Assets:
gameScene.preload = function () {
    // load images
    //this.load.image('background', 'assets/1280w/Artboard1BG.png');
    this.load.image('backgroundColor', 'assets/background/bg_1.png');
    this.load.image('downArrow', 'assets/downArrow.png');
    this.load.image('background', 'assets/background/bg_4.png');
    //Loads Sprite Sheet and sets frame size
    this.load.spritesheet('player', 'assets/1800w/playerColored.png', {
        frameWidth: 600,
        frameHeight: 1028
    });
    this.load.image('enemy', 'assets/dragon.png');
    this.load.image('treasure', 'assets/treasure.png');
    this.load.image('rightArrow', 'assets/images.png');
    this.load.image('upArrow', 'assets/upimage.png');
    this.load.image('platform', 'assets/cloud-platform.png');
    this.load.image('sulty', 'assets/ulty.png');
    this.load.image('menuBg', 'assets/background/menuBG.png');
    this.load.image('gameOverBg', 'assets/background/gameOver.png');
    this.load.image('helpImage', 'assets/helpimage.png');
    this.load.audio('jump', 'assets/Sound/Jump.mp3');
};

//Create function runs once on start or restart
gameScene.create = function () {
    console.log(game);
    game.canvas.id="myGame";
    finalScore = 0;
    //Camera Settings
    this.cameras.main.setViewport(0, 0, 1280, 720);
    //this.cameras.main.setBounds(0, 0, 2920, 2080);
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
    //add down arrows
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
    //Set Player Phys properties - (unused currently)
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    //Make the camera follow the player
    this.cameras.main.startFollow(this.player);
    // Player is alive
    this.isPlayerAlive = true;

    //Add one platform with physics
    /*groundGroup = this.physics.add.staticGroup();
    groundGroup.create(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 500, 'platform');*/

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

    //Load Sulty Group
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

    //sultGroup.body.setAllowGravity(false);

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



    //RandomisePlatforms
    /*let groundGroupChild = groundGroup.getChildren();
    let platx = 0;
    for (let i = 1; i < 300; i++) {
        let randint=Math.random() * 1200 + 800;
        groundGroupChild[i].x = platx + (randint);
        groundGroupChild[i].setSize(384,96,-(platx+randint),0)
        console.log(groundGroupChild[i]);
        
    }*/


    scoreText = this.add.text(16, 16, 'score: 0', {
        fontSize: '32px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    
    jumpSound= this.sound.add('jump');

    gameOverBg = this.add.image(0, 0, 'gameOverBg');
    //Sets the gradient to follow the camera
    gameOverBg.setScrollFactor(0);
    //Sets origin of the gradient
    gameOverBg.setOrigin(0, 0);
    gameOverBg.visible = false;

    this.restartText = this.add.text(game.config.width / 2, game.config.height / 2 + 25, 'RESTART', {
        font: '32px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    this.restartText.setOrigin(0.5);
    this.restartText.setInteractive();
    this.restartText.on('pointerup', function () {
        //gameScene.scene.restart();//doesnt work********
        console.log("Restart");
        isRestarting = true;

    });
    this.restartText.visible = false;

    this.enterMenuText = this.add.text(game.config.width / 2, game.config.height / 2 + 100, 'RETURN TO MENU', {
        font: '32px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    this.enterMenuText.setOrigin(0.5);
    this.enterMenuText.setInteractive();
    this.enterMenuText.on('pointerup', function () {
        //gameScene.scene.restart();//doesnt work********
        console.log("Restart");
        openMenu = true;

    });
    this.enterMenuText.visible = false;


    menuBG = this.add.image(0, 0, 'menuBg');
    //Sets the gradient to follow the camera
    menuBG.setScrollFactor(0);
    //Sets origin of the gradient
    menuBG.setOrigin(0, 0);
    this.startText = this.add.text(game.config.width / 2 - 270, game.config.height / 2, '> Start', {
        font: '55px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    this.startText.setOrigin(0.5);
    this.startText.setInteractive();
    this.startText.on('pointerup', function () {
        closeMenu = true;
        
    });
    
    this.muteText = this.add.text(game.config.width / 2 - 270, game.config.height / 2+80, '> Mute', {
        font: '55px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    this.muteText.setOrigin(0.5);
    this.muteText.setInteractive();
    this.muteText.on('pointerup', function () {
        if(!isMuted){isMuted = true;}else{isMuted=false;}
    });
    this.helpText = this.add.text(game.config.width / 2 - 270, game.config.height / 2+160, '> Help', {
        font: '55px Arial',
        fill: '#fff'
    }).setScrollFactor(0);
    this.helpText.setOrigin(0.5);
    this.helpText.setInteractive();
    this.helpText.on('pointerup', function () {
        
    });
    
    
    

    // 08 : reset camera effects. Not sure if this is needed
    this.cameras.main.resetFX();
};


//Update function runs continously
gameScene.update = function () {
    if (isRestarting) {
        isRestarting = false;
        this.scene.restart();
        return;
    }
    if (closeMenu) {
        this.startText.visible = false;
        this.muteText.visible = false;
        menuBG.visible = false;
    }
    if (openMenu) {
        openMenu = false;
        closeMenu=false;
        this.startText.visible = true;
        this.muteText.visible = true;
        menuBG.visible = true;
        this.scene.restart();
        return;
    }
    if(isMuted){
        this.muteText.setText('> Muted');
    }else{
        this.muteText.setText('> Mute');
    }
    
    
    //this.
    //    this.restartText.on('pointerdown', function (pointer) {
    //        console.log("Restart2");
    //        gameScene.scene.restart();
    //        return;
    //    }, this);
    //Move BG based on the player y from initial point
    //If player has fallen off the background will stop moving
    if (this.player.y < 720) {
        bg.tilePositionY = -(555 - this.player.y);
    } else if (this.player.y > 500) {
        this.isPlayerAlive = false;
    }
    //Check if player is touching the ground
    let onGround = this.player.body.touching.down;

    //console.log("isPlayerAlive: ", this.isPlayerAlive);

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



        //this.scene.restart();
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
        if(!isMuted){
        jumpSound.play();
    }
    }
    if (!isPressed && !upIsPressed) {
        this.player.anims.play('default');
    }


    let signs = signGroup.getChildren();
    let numSigns = signs.length;
    for (let i = 0; i < numSigns; i++) {
        if (this.player.x > signs[i].x) {
            signs[i].visible = false;

        }
    }


    let enemies = sultGroup.getChildren();
    let numEnemies = enemies.length;
    //console.log(enemies[1].y +" : "+ enemies[1].speed);
    for (let i = 0; i < numEnemies; i++) {

        // move enemies
        enemies[i].setVelocity(0);
        enemies[i].y += enemies[i].speed * (1 + i / 10);

        //console.log(enemyMaxY);
        //if (enemies[i].y >= enemyMaxY) {
        //console.log(":weeeeeeeeee");}



        // reverse movement if reached the edges
        if (enemies[i].y >= enemyMaxY && enemies[i].speed > 0) {
            //console.log(":weeeeeeeeee");
            enemies[i].speed *= -1;
        } else if (enemies[i].y <= enemyMinY && enemies[i].speed < 0) {
            enemies[i].speed *= -1;
        }

        //SultChildCode
        //let sultChild = sultGroup.getChildren();
        /*for (let i = 0; i < 40; i++) {
            if (sultChild[i].body.touching.up) {
                this.player.setVelocityY(-200);
            }else{
                //this.isPlayerAlive=false;
                //this.gameOver();
            }
        }*/


        /*let groundGroup=groundGroup.getChildren();
        for(let i=0;i<5;i++){
            console.log(groundGroup[i].x);
        }*/
        scoreText.setText('Score: ' + (this.player.x - 640));
    }
}

gameScene.enemyHit = function () {
    //let sultChild = sultGroup.getChildren();
    //for (let i = 0; i < 40; i++) {
    //if (sultChild[i].body.touching.up) {
    //this.player.setVelocityY(-200);
    //} else {
    this.isPlayerAlive = false;
    //}
    //}
}

// broken game over function
gameScene.restartGame = function () {
    //Fade Camera and reset
    //this.cameras.main.fade(500);
    //this.cameras.main.on('camerafadeoutcomplete', function () {
    //    this.scene.restart();
    //}, this);
    gameOverBg.visible = true;
    this.restartText.visible = true;
    this.enterMenuText.visible = true;
    if (this.player.x - 640 > finalScore) {
        finalScore = this.player.x - 640;
    }
    this.player.y = 550;
    this.player.x = game.config.width / 2;
    this.player.setVelocityY(0);

};

gameScene.gameOver = function () {
    this.restartGame();

}




/*
menuScene.preload = function () {
    this.load.image('menuBg', 'assets/background/menuBG.png');
    console.log("runningpreload");
}

menuScene.create = function () {
        console.log("create");
    menuBG = this.add.image(0, 0, 'gameOverBg');
    //Sets the gradient to follow the camera
    menuBG.setScrollFactor(0);
    //Sets origin of the gradient
    menuBG.setOrigin(0, 0);
}*/
