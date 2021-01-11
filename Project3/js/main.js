// We will use `strict mode`, which helps us by having the browser catch many common JS mistakes
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
"use strict";
const app = new PIXI.Application({
    width: 800,
    height: 700
    
    //sceneWidth.x = 600;
});
//document.body.appendChild(app.view);
document.getElementById("gameView").appendChild(app.view);
// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height;	
// if(app.view.width > )
// pre-load the images
app.loader.
    add([
        //"images/crosshair1.png",
        "images/gameBackground.png",
        "images/timeSphere.png"
    ]);
app.loader.onProgress.add(e => { console.log(`progress=${e.progress}`) });
app.loader.onComplete.add(setup);
app.loader.load();


// aliases
let stage;
//time variables
let timer; //the active countdown timer
let time; //placeholder to keep real time updates for a timer
let timeDown = 60;
// game variables
let startScene, gameScene, gameOverScene;
let scoreLabel, timerLabel, commentLabel, gameOverScoreLabel, highScoreLabel;
let arrowSound, impactSound, levelSound;
let splitters = [];
let circles = [];
let timeSpheres = [];
let gameBackground = PIXI.Sprite.fromImage('images/gameBackground.png');
let score = 0;
let levelNum = 1;
let paused = true;

//high score tracker variables
let highScore;
let storedHighScore;
let scorePrefix;

//creates the labels and buttons used throughout the game scene
function createLabelsAndButtons(){
   gameScene.addChild(gameBackground);
   //gameOverScene.addChild(gameBackground);

    let buttonStyle = new PIXI.TextStyle({
        fill: 0xF00fff,
        fontSize: 48,
        fontFamily: "Consolas"
    });
    //1 - set up 'startScene'
    //1A - make the top start label
    let startLabel1 = new PIXI.Text("Target ☉ Practice!");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xF0f0f0,
        fontSize: 60,
        fontFamily: 'Helvetica',
        stroke: 0xF00fff,
        strokeThickness: 6
    });
    startLabel1.x = sceneWidth/2 - 250;
    startLabel1.y = 120;
    startScene.addChild(startLabel1);
   // startScene.

    //1B = make the middle start label
    let startLabel2 = new PIXI.Text("TEST Y☉UR AIM!");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xF0f0f0,
        fontSize: 52,
        fontFamily: "Consolas",
        fontStyle: "BOLD",
        stroke: 0xF00fff,
        strokeThickness: 5
    });
    startLabel2.x = sceneWidth/2 -210;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);

    let instructionsLabel = new PIXI.Text("See below for the \n How To Play : )");
    instructionsLabel.style = new PIXI.TextStyle({
        fill: 0xF00ffF,
        fontSize: 30,
        fontFamily: "Consolas",
        fontStyle: "ITALIC",
        //stroke: 0xf00fff,
        
    });
    instructionsLabel.x = sceneWidth/2 - 160;
    instructionsLabel.y = 400;
    startScene.addChild(instructionsLabel);
      //1c - make the start game button
      let startButton = new PIXI.Text("Enter the game!");
      startButton.style = buttonStyle;
      startButton.x = sceneWidth/2 - 200;
      startButton.y = sceneHeight - 100;
      startButton.interactive = true;
      startButton.buttonMode = true;
      startButton.on("pointerup", startGame);
      startButton.on('pointerover',e=>e.target.alpha = 0.7); //concise arrow function with no brackets
      startButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); //ditto
      startScene.addChild(startButton);

    //2 - set up 'gameScene'
    let textStyle = new PIXI.TextStyle({
        fill: 0xF0f0f0,
        fontSize: 18,
        fontFamily: "Consolas",
        stroke: 0xF00fff,
        strokeThickness: 4
    });
    //2a - make score label
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    //2c = make timer label
    timerLabel = new PIXI.Text();
    timerLabel.style = textStyle;
    timerLabel.x = sceneWidth / 2;
    gameScene.addChild(timerLabel);
    // 3 - set up `gameOverScene`

// 3A - make game over text
let gameOverStyle = new PIXI.TextStyle({
    fill: 0XF0F0F0,
    fontSize: 32,
    fontFamily: "Consolas",
    stroke: 0xF00FFF,
    strokeThickness: 6
});
gameOverScoreLabel = new PIXI.Text();
gameOverScoreLabel.style = gameOverStyle;
gameOverScoreLabel.x = sceneWidth/2 - 150;
gameOverScoreLabel.y = sceneHeight/2;
gameOverScene.addChild(gameOverScoreLabel);

highScoreLabel = new PIXI.Text();
highScoreLabel.style = gameOverStyle;
highScoreLabel.x = sceneWidth/2 - 150;
highScoreLabel.y = sceneHeight/2 + 50;
gameOverScene.addChild(highScoreLabel);

 commentLabel = new PIXI.Text();
 commentLabel.style = new PIXI.TextStyle({
     fill: 0xF0f0f0,
     fontSize: 30,
     fontFamily: "Consolas",
     stroke: 0xF00fff,
     strokeThickness: 0
 });
 commentLabel.x = sceneWidth/2 - 200;
 commentLabel.y = sceneHeight/2 + 150;
 gameOverScene.addChild(commentLabel);
increaseScoreBy(0); //this allows the user to see their final score

let gameOverText = new PIXI.Text("Time's Up! Let's see how you did..");
textStyle = new PIXI.TextStyle({
	fill: 0xF0f0f0,
	fontSize: 34,
	fontFamily: "Consolas",
	stroke: 0xF00fff,
	strokeThickness: 6
});
gameOverText.style = textStyle;
gameOverText.x = 100;
gameOverText.y = sceneHeight/2 - 160;
gameOverScene.addChild(gameOverText);

//make "play again?" button
let playAgainButton = new PIXI.Text("Play Again?");
playAgainButton.style = buttonStyle;
playAgainButton.x = sceneWidth/2 - 150;
playAgainButton.y = sceneHeight - 100;
playAgainButton.interactive = true;
playAgainButton.buttonMode = true;
playAgainButton.on("pointerup",startGame); // startGame is a function reference
playAgainButton.on('pointerover',e=>e.target.alpha = 0.7); // concise arrow function with no brackets
playAgainButton.on('pointerout',e=>e.currentTarget.alpha = 1.0); // ditto
gameOverScene.addChild(playAgainButton);
}
//function to make the score increase x amount of points
function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score ${score}`;
}
//function that manipulates objects based on the time remaining
function timeRemaining(time){
    //move circle implementation to the timeRemaining function so that we can monitor when they start moving
    //the red 
    for(let c of circles){
        //make the circles move faster at each new level
        if(timeDown <=50){
            //once the time has passed 50 seconds, all circles will begin to move, this encourages speed and accuracy
            c.move(dt);
        }
        if(timeDown <= 30){
            c.move(dt * 1.5);
        }
        if(timeDown <= 10){
            c.move(dt *2);
        }
        //if(levelNum<=2 && timeDown <=30) c.move(dt);
        if(levelNum>=3 && timeDown <=50) c.move(dt); //don't make the circles any faster, clicking is difficult as it already is
       // if()
        //c.move(dt);
        if(c.x <= c.radius || c.x >=sceneWidth-c.radius){
            c.reflectX();
            c.move(dt);
        }
        if(c.y <= c.radius || c.y >= sceneHeight-c.radius){
            c.reflectY();
            c.move(dt);
        }
    }
    timeDown -= time;
    timerLabel.text =  `Time Left: ${Math.round(timeDown,2)}`;
}
//this function will attatch to the timeIncrease sphere to give the player a little extra time :)
function timeExtension(){
    clearInterval(timer);
    timeDown= 60;
    timer = setTimeout(endGame, 60000);
}
//changes current display to game over scene
function endGame(){
    startScene.visible = false;
    gameOverScene.visible = true;
    gameScene.visible = false;
    end();
}

//changes current display to start game scene, and sets up level 1
function startGame(){
    startScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;
    levelNum =1;
    score = 0;
    increaseScoreBy(0);
    timeDown = 60;
    timer = setTimeout(endGame, 60000);
    loadLevel();
}

//pre-game set up of all scenes and sounds
function setup() {

    //make highscore storage 
    scorePrefix = "lga7192-";
    highScore = scorePrefix + "highScore";
    storedHighScore = localStorage.getItem(storedHighScore);

    stage = app.stage;
	//Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);
	//Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);
	//Create the `gameOver` scene and make it invisible
    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);
	//Create labels for all 3 scenes
	createLabelsAndButtons();

	//Load Sounds
    arrowSound = new Howl({
        src: ['sounds/shoot.wav']
    });
    impactSound = new Howl({
        src: ['sounds/impact.wav']
    });
    levelSound = new Howl({
        src: ['sounds/levelUp.wav']
    });
	// #8 - Start update loop
	app.ticker.add(gameLoop);
}
//loads all necessary items per level generation
function loadLevel(){
    createCircles(levelNum);
    if(levelNum>=2){
        createSplitter(levelNum / 2);
    }
    if(levelNum == 1){
        createTimeSphere();
    }
    paused = false;
}
//creates the base line targets
function createCircles(numCircles){
    
    for(let i=0; i<numCircles;i++){
        let c = new Circle(Math.random() * 10 + 20,0xFFFF00);
        c.interactive = true;
        //c.buttonMode = true;
        //c.on("pointerup", killTarget);
        c.on("pointerdown",killTarget);
        c.x = Math.random() * (sceneWidth - 50) + 25;
        c.y = Math.random() * (sceneHeight - 400) + 25;
        circles.push(c);
        gameScene.addChild(c);
    }
}
//creates the time increasing objects found in the lower left of the game field
function createTimeSphere(){
    for(let i = 0; i < 3; i ++){
        let t = new TimeSphere(Math.random() * 10 + 20);
        t.interactive = true;
        t.on("pointerdown", reverseTime);
        t.x = 20 * i +20;
        t.y = sceneHeight - 40;
        timeSpheres.push(t);
        gameScene.addChild(t);
    }
}
//function to create a splitter object that breaks into the smaller targets
function createSplitter(numSplitters){
    for(let j = 0; j < numSplitters;j++){
        let s = new SplitterSphere(25,0xFF00fff);
        s.interactive = true;
        s.on("pointerdown", killSplitter);
        s.x = Math.random() * (sceneWidth -50 ) + 25;
        s.y = Math.random() * (sceneWidth - 400) + 25;
        splitters.push(s);
        gameScene.addChild(s);
    }
}
//function to remove the general yellow targets from the scene
function killTarget(){
 
    this.isAlive = false;
    gameScene.removeChild(this);

    impactSound.play(); //every target hit makes a twang sound! nice!!
    increaseScoreBy(1); //every dead circle brings a point to the player
}
//function to remove the splitterSpheres(purple guys)
function killSplitter(){
    this.isAlive = false;
    gameScene.removeChild(this);
    impactSound.play();
    increaseScoreBy(1);
    createCircles(2);
}
//simple function to give the player more time in the game
function reverseTime(){
    this.isAlive = false;
    gameScene.removeChild(this);
    levelSound.play();
    timeExtension();
}
// #1 - Calculate "delta time"
//this is kept outside to allow other funtions to utilize it, e.g the timeSpheres
let dt = 1/app.ticker.FPS;
if(dt > 1/12) dt = 1/12;
//this function runs the core functionality of the game
function gameLoop(){
	 if (paused) return;
    //#1.5 timeCountDown
    timeRemaining(dt);

	// #6 - Now do some clean up
    //get rid of dead circles
    circles = circles.filter(c=>c.isAlive);
    splitters = splitters.filter(s=>s.isAlive);
	timeSpheres = timeSpheres.filter(t=>t.isAlive);
    // #8 - Load next level
    if(circles.length == 0 && splitters.length == 0 && timeSpheres.length <=3){
        levelNum ++;        
        loadLevel();
        levelSound.play(); //this way you know you've levelled up!
      
    }
}
//ends the game, cleans up the scenes, and displays the user the end results(score, high score, replay button, etc)
function end(){
    paused = true;
    //clear out level
    circles.forEach(c=>gameScene.removeChild(c)); //concise arrow function with no brackets and no return
    splitters.forEach(s=>gameScene.removeChild(s));
    timeSpheres.forEach(t=>gameScene.removeChild(t));
    //reset the length of each array to make sure there is no rogue child
    circles.length = 0;
    splitters.length = 0;
    timeSpheres.length = 0;
   //add some "encouraging words" that change based on specific score values
   //mainly ones that hold value 
    gameOverScoreLabel.text = `Final Score: ${score}`;
    if(score < 1) commentLabel.text = "I guess they went afk...";
    if(score >=5 && score <= 10) commentLabel.text = "You did your best..";
    if(score >=20 && score <= 30) commentLabel.text = "   Nice shootin Tex!"
    if(score >=30 && score <= 60) commentLabel.text = '"Now try and beat my score of 106"\n-The Creator';
    if(score == 106) commentLabel.text = "'Hey, that's my High Score!'\n-The Creator";
    if(score > 106) commentLabel.text = '  *Gasp* "You beat my score!"\n-The Creator';
   //else commentLabel.text = "wowee zowee look at that score!";

    //set new HighScore if it beats the old record
    if(score > storedHighScore){
        storedHighScore = score;
        localStorage.setItem(highScore, score);
    }
    highScoreLabel.text = `High Score: ${Math.round(localStorage.getItem(highScore))}`;
    gameOverScene.visible = true;
    gameScene.visible = false;

}