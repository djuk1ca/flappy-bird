window.addEventListener("load", function(){

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
canvas.width = 288;
canvas.height = 512;
let gameOver = false;
let pipes = [];
let score = 0;
let gameStart = false;
let bestScore = 0;

class Background {
    constructor(gameWidth, gameHeight){
        this.x = 0;
        this.y = 0;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.image = new Image();
        this.image.src = 'background.png';
        this.base = new Image();
        this.base.src = 'base.png';
        this.baseWidth = 336;
        this.baseHeight = 112;
        this.baseX = 0;
        this.baseY = this.gameHeight - this.baseHeight;
        this.baseSpeed = 1;
        this.fps = 180;
        this.frameInterval = 1000/this.fps;
        this.frameTimer = 0;
        this.baseSpeed = 2;
    }
    draw(context){
        context.drawImage(this.image, this.x, this.y);
    }
    drawBase(context){
        context.drawImage(this.base, this.baseX, this.baseY, this.baseWidth, this.baseHeight);
        context.drawImage(this.base, this.baseX + this.baseWidth, this.baseY, this.baseWidth, this.baseHeight);
    }
    update(deltatime){
        if(this.frameTimer > this.frameInterval){
            this.baseX -= this.baseSpeed;
            this.frameTimer = 0;
            if(this.baseX < 0 - this.baseWidth){
                this.baseX = 0;
            }
        } else {
            this.frameTimer += deltatime;
        }
        if(gameOver) this.baseSpeed = 0; 
    }
    restart(){
        this.baseSpeed = 1.3;
    }
}

class Interface {
    constructor(gameWidth, gameHeight){
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.image = new Image();
        this.image.src = 'message.png';
        this.width = 184;
        this.height = 267;
        this.x = (this.gameWidth - this.width) / 2;
        this.y = (this.gameHeight - this.height) / 2;
        this.gameover = new Image();
        this.gameover.src = 'gameover.png';
        this.gameoverWidth = 192;
        this.gameoverHeight = 42;
        this.gameoverX = (this.gameWidth - this.gameoverWidth) / 2;
        this.gameoverY = this.gameHeight / 4;
        this.stats = new Image();
        this.stats.src = 'stats.png';
        this.statsWidth = 269;
        this.statsHeight = 137;
        this.statsX = (this.gameWidth - this.statsWidth)/2;
        this.statsY = this.gameoverY + this.gameoverHeight + 20;
    }
    drawMessage(context){
        context.drawImage(this.image, this.x, this.y);
    }
    drawGameOver(context){
        context.drawImage(this.gameover, this.gameoverX, this.gameoverY);
        context.drawImage(this.stats, this.statsX, this.statsY, this.statsWidth, this.statsHeight);
        context.font = '12px Flappy Bird';
        context.fillStyle = '#e6bc5c';
        context.fillText("Score: " + score, canvas.width/2 + 2, this.statsY + 40);
        context.fillText("Best Score: " + bestScore, canvas.width/2 + 2, this.statsY + 60);
        context.fillText("Press ENTER!", canvas.width/2 + 2, this.statsY + 120);
    }
}

class Bird extends Background{
    constructor(gameWidth, gameHeight){
        super(gameWidth, gameHeight)
        this.width = 34;
        this.height = 24;
        this.x = this.gameWidth/4;
        this.y = (this.gameHeight-this.baseHeight)/2 - this.height/2;
        this.birdImage = new Image();
        this.birdImage.src = 'bird.png';
        this.frame = 0;
        this.maxFrame = 1;
        this.frameInterval = 100;
        this.weight = 0.08;
        this.vy = 0;
        this.point = new Audio("point.wav");
        this.die = new Audio("die.wav");
        this.hit = new Audio('hit.wav');
        this.collision = false
    }
    draw(context){
        context.drawImage(this.birdImage, 
                          this.frame*this.width, 0, this.width, this.height,
                          this.x, this.y, this.width, this.height);
    }
    update(deltatime){
    // animacija
        if(this.frameTimer > this.frameInterval){
            if(this.frame > this.maxFrame){
                this.frame = 0;
            } else {
                this.frame++;
            }
            this.frameTimer = 0;
        } else {
            this.frameTimer += deltatime;
        }

        
    // detekcija sudaranja
        pipes.forEach(pipe => {
            if( (this.x + this.width > pipe.x && this.y < pipe.y1 && this.x < pipe.x + pipe.width) ||
                (this.x + this.width > pipe.x && this.y + this.height > pipe.y2 && this.x < pipe.x + pipe.width) ||
                (this.y - this.vy < pipe.y1 + pipe.height && this.x + this.width > pipe.x && this.x < pipe.x + pipe.width) ||
                (this.y + this.height - this.vy > pipe.y2 && this.x + this.width > pipe.x && this.x < pipe.x + pipe.width)
                ){
                    gameOver = true;
                    if(!this.collision){
                        this.hit.play();
                        this.die.play();
                        this.collision = true;
                    }
                }     
        });   

    // gravitacija
        this.y += this.vy;
        
        if(!this.onGround()){
            this.vy += this.weight;
        } else {
            this.frame = 0;
            this.vy = 0;
            if(!this.collision){
                this.hit.play();
                this.collision = true;
            }
            
            gameOver = true;
        }
        if(this.y <= 0) {
            gameOver = true;
            this.collision = true;
                this.hit.play();
                this.die.play();
        }
        if(!gameStart) this.vy = 0;

        // dodaj skor
        pipes.forEach(pipe => {
            if(this.x + this.width === pipe.x + pipe.width){
                this.point.play();
                bestScore = Math.max(bestScore, score);
                bird.point.addEventListener("play", addScore);
            }
        });
    }     

    updateDied(deltatime){
        this.y += this.vy;
        if(this.frameTimer > this.frameInterval){
            if(this.frame > this.maxFrame){
                if(!this.onGround()){
                    this.vy += this.weight;
                } else {
                    this.vy = 0;
                }
            this.frameTimer = 0;
            } else {
            this.frameTimer += deltatime;
            }
        
        }
    }
    
    restart(){
        this.y = (this.gameHeight-this.baseHeight)/2 - this.height/2;
        this.collision = false;
    }

    onGround(){
        return this.y > this.gameHeight - this.baseHeight - this.height; 
    }
}

class Pipe extends Background{
    constructor(gameWidth, gameHeight, gap){
        super(gameWidth, gameHeight)
        this.gap = gap;
        this.width = 52;
        this.height = 320;
        this.x = this.gameWidth;
        this.y1 = Math.random() * this.gameHeight/2 - 320;
        this.y2 = this.y1 + this.height + this.gap;
        this.image1 = new Image();
        this.image1.src = 'pipe1.png';
        this.image2 = new Image();
        this.image2.src = 'pipe2.png';
        this.markedForDeletion = false;
        this.fps = 180;
        this.interval = 1000 / this.fps;
        this.timer = 0;
        this.speed = 2;
        this.speedY = 0.5;
        this.angle = 0;
        this.angleTimer = 0;
        
    }
    draw(context){
        context.drawImage(this.image1, this.x, this.y1, this.width, this.height);
        context.drawImage(this.image2, this.x, this.y2, this.width, this.height);
    }
    update(deltatime){
        if(this.timer > this.interval){
            this.x -= this.speed;
            this.timer = 0;
        } else {
            this.timer += deltatime;
        }
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        if(!gameStart) this.speed = 0;
        if(gameOver) this.speed = 0;
    }

    power(deltatime){
        this.y1 += Math.sin(this.angle);
        this.y2 += Math.sin(this.angle);

        if(this.angleTimer > this.interval){
            this.angle += 0.08;
            thfs.angleTimer = 0;
        } else {
            this.angleTimer += deltatime;
        }
    }

    restart(){
        this.speedY = 0;
    }
}


const background = new Background(canvas.width, canvas.height);
const bird = new Bird(canvas.width, canvas.height);
const interface = new Interface(canvas.width, canvas.height);

let pipeTimer = 0;
let pipeInterval = 1500;
let pipeGap = 120;

window.addEventListener("keydown", e => {
    if(e.key == "Enter" && gameOver){
        restartGame();
    }
});

window.addEventListener("click", function() {
    if(!gameOver){
        bird.vy = -3;
        let swing = new Audio("wing.wav");
        swing.play();
    }
    gameStart = true;
});

function addScore(){
    score++;
}

function restartGame(){
    score = 0;
    gameStart = false;
    gameOver = false;
    pipes = [];
    pipeGap = 120;
    pipes.forEach(pipe => {
        pipe.restart();
    })
    bird.restart();
    background.restart();
    interface.drawMessage(ctx);
}

function addPipes(deltatime){
    if(pipeTimer > pipeInterval){
        pipes.push(new Pipe(canvas.width, canvas.height, pipeGap));
        pipeTimer = 0;
    } else {
        pipeTimer += deltatime;
    }
    if(score >= 14){
        pipeGap = 100;
    }
    pipes.forEach(pipe => {
        pipe.draw(ctx);
        pipe.update(deltatime);
        if(score >= 29){
            pipe.power(deltatime);
        }
    })
    pipes = pipes.filter(pipe => !pipe.markedForDeletion);
}

function displayStats(context){
    context.textAlign = 'center';
    context.font = '45px Flappy Bird';
    context.fillStyle = 'black';
    context.fillText(score, canvas.width/2 + 2, 100 + 2);
    context.fillStyle = 'white';
    context.fillText(score, canvas.width/2, 100);
}

let lastTime = 1;
function animate(timestamp){
    const deltatime = timestamp - lastTime;
    lastTime = timestamp;
    background.draw(ctx);
    addPipes(deltatime);
    bird.draw(ctx);
    bird.update(deltatime);
    background.drawBase(ctx);
    background.update(deltatime);
    if(!gameStart) interface.drawMessage(ctx);
    if(!gameOver && gameStart) displayStats(ctx);
    if(gameOver){
        interface.drawGameOver(ctx);
    }
    requestAnimationFrame(animate);
}
animate(0);
function birdDying(timestamp){
    lastTime = 1;
    deltatime = timestamp - lastTime;
    lastTime = timestamp;
    bird.draw(ctx);
    bird.updateDied(deltatime)

    requestAnimationFrame(birdDying)
}
if(gameOver) {
    birdDying();
}

});