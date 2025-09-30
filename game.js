const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("score-board");
const livesBoard = document.getElementById("lives-board");
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const messageBoard = document.getElementById("message-board");

let gameState = "menu";
let score = 0;
let lives = 3;
let scrollOffset = 0;
let isRespawning = false;


const marioWalk1 = new Image();
const marioWalk2 = new Image();
const marioWalk1Left = new Image();
const marioWalk2Left = new Image();
const blockImage = new Image();
const pipeImage = new Image();
const pipeImageSmall = new Image();
let cloudImage = new Image();
let enemyImage = new Image();

marioWalk1.src = "assets/marioWalk1.png";
marioWalk2.src = "assets/marioWalk2.png";
marioWalk1Left.src = "assets/marioWalk1Left.png";
marioWalk2Left.src = "assets/marioWalk2Left.png";
blockImage.src = "assets/tile.png";
pipeImage.src = "assets/pipe.png";
pipeImageSmall.src = "assets/pipeSmall.png";
cloudImage.src = "assets/clouds.png";
enemyImage.src = "assets/enemy.png";

const gravity = 0.6;
const playerSpeed = 5;
const scrollSpeed = 5;

let player;
let platforms = [];
let barriers = [];
let clouds = [];
let enemies = [];
let keys = {
    right: { pressed: false },
    left: { pressed: false },
};



class Player {
    constructor() {
        this.position = { x: 100, y: 100 };
        this.velocity = { x: 0, y: 0 };
        this.width = 40;
        this.height = 40;
        this.jumps = 0;
        this.currentFrame = 0;
        this.frameCounter = 0;
        this.onGround = false;
        this.facing = "right";
    }

    draw() {
        let sprite;
        if (this.facing === "right") {
            if (!this.onGround) sprite = marioWalk2;
            else if (keys.right.pressed) sprite = this.currentFrame === 0 ? marioWalk1 : marioWalk2;
            else sprite = marioWalk1;
        } else {
            if (!this.onGround) sprite = marioWalk2Left;
            else if (keys.left.pressed) sprite = this.currentFrame === 0 ? marioWalk1Left : marioWalk2Left;
            else sprite = marioWalk1Left;
        }
        ctx.drawImage(sprite, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        if (keys.right.pressed) this.facing = "right";
        if (keys.left.pressed) this.facing = "left";

        this.frameCounter++;
        if ((keys.right.pressed || keys.left.pressed) && this.onGround && this.frameCounter > 10) {
            this.currentFrame = (this.currentFrame + 1) % 2;
            this.frameCounter = 0;
        }

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y < canvas.height) {
            this.velocity.y += gravity;
        }
        this.draw();
    }
}

class Platform {
    constructor({ x, y, width, height }) {
        this.position = { x, y };
        this.width = width;
        this.height = height;
    }

    draw() {
        const tileSize = 40;
        for (let i = 0; i < this.width; i += tileSize) {
            for (let j = 0; j < this.height; j += tileSize) {
                ctx.drawImage(blockImage, this.position.x + i, this.position.y + j, Math.min(tileSize, this.width - i), Math.min(tileSize, this.height - j));
            }
        }
    }
}

class Cloud {
    constructor({ x, y, image, speed }) {
        this.position = { x, y };
        this.image = image;
        this.speed = speed;
        this.width = 150;
        this.height = 80;
    }
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
    update() {
        this.position.x -= this.speed; 
        this.draw();
    }
}

class Enemy {
    constructor({ x, y, image }) {
        this.position = { x, y };
        this.velocity = { x: 1, y: 0 };
        this.image = image;
        this.width = 40;
        this.height = 40;
        this.patrolLimit = 100;
        this.walkDistance = 0;
    }
    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
    update() {
        this.position.x += this.velocity.x;
        this.walkDistance++;
        if (this.walkDistance > this.patrolLimit) {
            this.velocity.x *= -1;
            this.walkDistance = 0;
        }
        this.draw();
    }
}


class Barrier {
    constructor({ x, width, height, image }) {
        this.width = width;
        this.height = height;
        this.image = image;
       
        this.position = { x, y: this.snapToSurface(x, width, height) };
    }

    snapToSurface(x, width, height) {
        let bestY = canvas.height; 
        for (let platform of platforms) {
            const platformEndX = platform.position.x + platform.width;
            const barrierEndX = x + width;

            
            if (x < platformEndX && barrierEndX > platform.position.x) {
                const candidateY = platform.position.y - height;
                if (candidateY < bestY) {
                    bestY = candidateY;
                }
            }
        }
        return bestY;
    }

    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }
}


function init(isRestart = false) {
    if (isRestart) {
        lives = 3;
        score = 0;
    }
    keys.right.pressed = false;
    keys.left.pressed = false;
    scrollOffset = 0;
    player = new Player();

     
    platforms = [
        new Platform({ x: 0, y: 320, width: 500, height: 80 }),
        new Platform({ x: 580, y: 320, width: 500, height: 80 }),
        new Platform({ x: 1200, y: 250, width: 200, height: 30 }),
        new Platform({ x: 1600, y: 200, width: 200, height: 30 }),
        new Platform({ x: 2000, y: 150, width: 150, height: 30 }),
        new Platform({ x: 2500, y: 250, width: 300, height: 30 }),
        new Platform({ x: 3000, y: 320, width: 800, height: 80 }),
    ];

    barriers = [
        new Barrier({ x: 700, width: 60, height: 120, image: pipeImage }),
        new Barrier({ x: 950, width: 60, height: 80, image: pipeImageSmall }),
        new Barrier({ x: 1340, width: 60, height: 120, image: pipeImage }),
        new Barrier({ x: 1700, width: 60, height: 80, image: pipeImageSmall }),
    ];

    clouds = [
        new Cloud({ x: 200, y: 50, image: cloudImage, speed: 0.2 }),
        new Cloud({ x: 500, y: 80, image: cloudImage, speed: 0.1 }),
        new Cloud({ x: 850, y: 40, image: cloudImage, speed: 0.3 }),
    ];

    enemies = [
        new Enemy({ x: 600, y: 280, image: enemyImage }),
        new Enemy({ x: 1620, y: 160, image: enemyImage }),
        new Enemy({ x: 2550, y: 210, image: enemyImage }),
    ];
    updateUI();
}

function updateUI() {
    score = Math.floor(scrollOffset / 10);
    scoreBoard.innerText = `Score: ${score}`;
    livesBoard.innerText = `Lives: ${lives}`;
}

function handleLoseLife() {
    if (isRespawning) return;
    isRespawning = true;
    lives--;
    updateUI();
    if (lives <= 0) {
        handleGameOver("Game Over!");
    } else {
        setTimeout(() => {
            init();
            isRespawning = false;
        }, 1500);
    }
}

function handleGameOver(message) {
    gameState = "menu";
    messageBoard.innerText = message;
    messageBoard.style.display = "block";
    menu.style.display = "flex";
    startBtn.style.display = "none";
    restartBtn.style.display = "block";
}

function startGame() {
    messageBoard.style.display = "none";
    menu.style.display = "none";
    init(true);
    gameState = "playing";
}

function checkBarrierCollision(barrier) {
    // From the left
    if (
      player.position.x + player.width > barrier.position.x &&
      player.position.x < barrier.position.x &&
      player.position.y + player.height > barrier.position.y &&
      player.position.y < barrier.position.y + barrier.height
    ) {
      player.position.x = barrier.position.x - player.width;
      player.velocity.x = 0;
    }
  
    // From the right
    if (
      player.position.x < barrier.position.x + barrier.width &&
      player.position.x + player.width > barrier.position.x + barrier.width &&
      player.position.y + player.height > barrier.position.y &&
      player.position.y < barrier.position.y + barrier.height
    ) {
      player.position.x = barrier.position.x + barrier.width;
      player.velocity.x = 0;
    }
  
    // Standing on top
    if (
      player.position.y + player.height <= barrier.position.y &&
      player.position.y + player.height + player.velocity.y >=
        barrier.position.y &&
      player.position.x + player.width > barrier.position.x &&
      player.position.x < barrier.position.x + barrier.width
    ) {
      player.position.y = barrier.position.y - player.height;
      player.velocity.y = 0;
      player.jumps = 0;
      player.onGround = true;
    }
  }
  

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    clouds.forEach(cloud => cloud.update());
    platforms.forEach(platform => platform.draw());
    barriers.forEach(barrier => barrier.draw());
    enemies.forEach(enemy => enemy.update());

    if (gameState !== 'playing') {
        return;
    }

    player.update();
    updateUI();


    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = playerSpeed;
    } else if ((keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
        player.velocity.x = -playerSpeed;
    } else {
        player.velocity.x = 0;
        if (keys.right.pressed) {
            scrollOffset += scrollSpeed;
            platforms.forEach(p => { p.position.x -= scrollSpeed; });
            barriers.forEach(b => { b.position.x -= scrollSpeed; });
            enemies.forEach(e => { e.position.x -= scrollSpeed; });
        } else if (keys.left.pressed && scrollOffset > 0) {
            scrollOffset -= scrollSpeed;
            platforms.forEach(p => { p.position.x += scrollSpeed; });
            barriers.forEach(b => { b.position.x += scrollSpeed; });
            enemies.forEach(e => { e.position.x += scrollSpeed; });
        }
    }

    
    player.onGround = false;
    platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y && player.position.y + player.height + player.velocity.y >= platform.position.y && player.position.x + player.width >= platform.position.x && player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0;
            player.jumps = 0;
            player.onGround = true;
            player.position.y = platform.position.y - player.height;
        }
    });

    barriers.forEach(barrier => checkBarrierCollision(barrier));

    enemies.forEach((enemy, index) => {
        if (player.position.x + player.width >= enemy.position.x && player.position.x <= enemy.position.x + enemy.width && player.position.y + player.height >= enemy.position.y && player.position.y <= enemy.position.y + enemy.height) {
            if (player.velocity.y > 0 && player.position.y + player.height < enemy.position.y + 20) {
                player.velocity.y = -10;
                enemies.splice(index, 1);
            } else {
                handleLoseLife();
            }
        }
    });

   
    if (scrollOffset > 3200) {
        handleGameOver("You Win!");
    }
    if (player.position.y > canvas.height) {
        handleLoseLife();
    }
}


window.addEventListener('keydown', (event) => {
    if (gameState !== 'playing') return;
    switch (event.key) {
        case 'a':
        case 'ArrowLeft':
            keys.left.pressed = true;
            break;
        case 'd':
        case 'ArrowRight':
            keys.right.pressed = true;
            break;
        case 'w':
        case 'ArrowUp':
        case ' ':
            if (player.jumps < 2) { 
                player.velocity.y = -13;
                player.jumps++;
                player.onGround = false;
            }
            break;
    }
});

window.addEventListener('keyup', (event) => {
    if (gameState !== 'playing') return;
    switch (event.key) {
        case 'a':
        case 'ArrowLeft':
            keys.left.pressed = false;
            break;
        case 'd':
        case 'ArrowRight':
            keys.right.pressed = false;
            break;
    }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);


init();
animate();