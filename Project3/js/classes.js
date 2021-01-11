//class for the common target
class Circle extends PIXI.Graphics{
    constructor(radius, color=0xFF0000, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
        //variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }
    reflectX(){
        this.fwd.x *= -1;
        
    }
    reflectY(){
        this.fwd.y *= -1;
    }
}
//make a power up object that destroys all objects on the field
class TimeSphere extends PIXI.Sprite{
    constructor(){
        super(app.loader.resources["images/timeSphere.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(0.4);
        this.x = 20;
        this.y = 20;
        this.rotation = 0;
        this.isAlive = true;
    }
}
//make it so that clicking the square creates four circles that move like the others. Square will act the same as a circle, but move faster and will break into 4 circles on being clicked
class SplitterSphere extends PIXI.Graphics{
    constructor(radius, color=0xF00fff, x=0, y=0){
        super();
        this.beginFill(color);
        this.drawCircle(0,0,radius);
        this.endFill();
        this.x = x;
        this.y = y;
        this.radius = radius;
      //  this.fwd = getRandomUnitVector();
        //this.speed = 50;
        this.isAlive = true;
    }
    //splitterSphere will not move to reduce unneccessary complexity for the player
  
}
//class to generate the game scene background
class Background extends PIXI.Sprite{
    constructor(x=0, y=0){
        super(app.loader.resources["images/gameBackground.png"].texture);
        this.anchor.set(.5,.5);
        this.scale.set(1);
        this.x = 440;
        this.y = 265;
        this.rotation = 0;
    }
}