const canvas = document.getElementById('game-canvas');
const ctx =canvas.getContext('2d');
const scoreBoard = document.getElementById('score-board');
const livesBoard = document.getElementById('lives-board');
const menu = document.getElementById('menu');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const messageBoard = document.getElementById('message-board');
let isRespawning = false; 
let cloudImage;
let enemyImage;


let gameState = 'menu';
        let score = 0;
        let lives = 3;

const gravity = 0.5;

class Player {
    constructor() {
        
        this.position = { x: 100, y: 100 };
        
        this.velocity = { x: 0, y: 0 };
       
        this.width = 40;
        this.height = 40;
      
        this.jumps = 0; 
    }

    
    draw() {
        ctx.fillStyle = '#E53935'; 
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    
    update() {
        this.draw(); 
        
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        
        this.velocity.y += gravity;
    }
}


class Platform {
    constructor({ x, y, width, height }) {
        this.position = { x, y };
        this.width = width;
        this.height = height;
    }

   
    draw() {
        ctx.fillStyle = '#6D4C41'; 
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
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
        this.draw();
        this.position.x += this.speed; 
    }
}


class Enemy {
    constructor({ x, y, image }) {
        this.position = { x, y };
        this.velocity = { x: 1, y: 0 }; 
        this.image = image;
        this.width = 50;  
        this.height = 50; 

        this.patrolLimit = 100; 
        this.walkDistance = 0;
    }

    draw() {
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.walkDistance++;

        
        if (this.walkDistance > this.patrolLimit) {
            this.velocity.x *= -1; 
            this.walkDistance = 0;
        }
    }
}

let clouds = [];
let enemies = []; 


function loadAssets() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const totalAssets = 2; 

        cloudImage = new Image();
        cloudImage.src = './images/clouds.png';
        cloudImage.onload = () => {
            loadedCount++;
            if (loadedCount === totalAssets) resolve();
        };

        enemyImage = new Image();
        enemyImage.src = './images/enemy.png'; 
        enemyImage.onload = () => {
            loadedCount++;
            if (loadedCount === totalAssets) resolve();
        };
    });
}




let player = new Player();
let platforms =[];
let keys={
    right:{pressed:false},
    left:{pressed:false}
}

let scrollOffset = 0;

function init(isReset=false){
    if(isReset){
lives = 3;
score=0;
 }

 keys.right.pressed = false;
 keys.left.pressed = false;


player = new Player();
scrollOffset = 0 ;
platforms =[
    new Platform({ x: 0, y: 320, width: 500, height: 80 }),
    new Platform({ x: 580, y: 320, width: 500, height: 80 }),
    new Platform({ x: 1200, y: 250, width: 200, height: 30 }),
    new Platform({ x: 1600, y: 200, width: 200, height: 30 }),
    new Platform({ x: 2000, y: 150, width: 150, height: 30 }),
    new Platform({ x: 2500, y: 250, width: 300, height: 30 }),
    new Platform({ x: 3000, y: 320, width: 800, height: 80 }),
]

clouds = [
    new Cloud({ x: 200, y: 40, image: cloudImage, speed: 0.1 }),
    new Cloud({ x: 500, y: 70, image: cloudImage, speed: 0.1 }),
    new Cloud({ x: 800, y: 40, image: cloudImage, speed: 0.1 })
];

function init(isReset = false) {
    
    enemies = [
        new Enemy({ x: 600, y: 270, image: enemyImage }), 
        new Enemy({ x: 1620, y: 150, image: enemyImage }), 
        new Enemy({ x: 2550, y: 200, image: enemyImage })  ]
}

}

function updateUI() {
    score = Math.floor(scrollOffset / 10);
    scoreBoard.innerText = `Score: ${score}`;
    livesBoard.innerText = `Lives: ${lives}`;
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    clouds.forEach(cloud => {
        cloud.update();
        
        if (cloud.position.x > canvas.width) {
            cloud.position.x = -cloud.width;
        }
    });


    platforms.forEach(platform => {
        platform.draw();
    });

    platforms.forEach(platform => {
        platform.draw();
    });

    
    enemies.forEach(enemy => {
        enemy.update();
    });

    if (gameState === 'playing') {
        player.update();
        updateUI();
        

       
if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = 5;
} else if ((keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
    player.velocity.x = -5;
} else {
    player.velocity.x = 0;
    
    
    if (keys.right.pressed) {
        scrollOffset += 5;
        platforms.forEach(platform => { platform.position.x -= 5; });
        enemies.forEach(enemy => { enemy.position.x -= 5; });
    } else if (keys.left.pressed && scrollOffset > 0) {
        scrollOffset -= 5;
        platforms.forEach(platform => { platform.position.x += 5; });
        enemies.forEach(enemy => { enemy.position.x += 5; }); 
    }
}
        platforms.forEach(platform => {
            if (player.position.y + player.height <= platform.position.y &&
                player.position.y + player.height + player.velocity.y >= platform.position.y &&
                player.position.x + player.width >= platform.position.x &&
                player.position.x <= platform.position.x + platform.width) {
                player.velocity.y = 0;
                player.jumps = 0;
            }
        });

        enemies.forEach((enemy, index) => {
            if (
                player.position.x + player.width >= enemy.position.x &&
                player.position.x <= enemy.position.x + enemy.width &&
                player.position.y + player.height >= enemy.position.y &&
                player.position.y <= enemy.position.y + enemy.height
            ) {
                

                
                if (player.velocity.y > 0 && player.position.y + player.height < enemy.position.y + 20) {
                    player.velocity.y = -10; 
                    enemies.splice(index, 1);
                    score += 100; 
                } else {
                   
                    if (!isRespawning) {
                        lives--;
                        isRespawning = true;
                        if (lives <= 0) {
                            
                            gameState = 'menu';
                            messageBoard.innerText = 'Game Over!';
                            messageBoard.style.display = 'block';
                            menu.style.display = 'flex';
                            menu.classList.add('with-message');
                            startBtn.style.display = 'none';
                            restartBtn.style.display = 'block';
                        } else {
                         
                            setTimeout(() => {
                                init();
                                isRespawning = false;
                            }, 1500);
                        }
                    }
                }
            }
        });


        if (scrollOffset > 3200) {
            gameState = 'menu';
            messageBoard.innerText = 'You Win!';
            menu.classList.add('with-message');
            messageBoard.style.display = 'block'; 
            menu.style.display = 'flex';
            startBtn.style.display = 'none';
            restartBtn.style.display = 'block';
        }

        
        if (player.position.y > canvas.height && !isRespawning) {
            isRespawning = true; 
            lives--;
            updateUI(); 

            if (lives <= 0) {
                
                gameState = 'menu';
                messageBoard.innerText = 'Game Over!';
                menu.classList.add('with-message');
                messageBoard.style.display = 'block'; 
                menu.style.display = 'flex';
                startBtn.style.display = 'none';
                restartBtn.style.display = 'block';
            } else {
               
                setTimeout(() => {
                    init(); 
                    isRespawning = false; 
                }, 1500); 
        }
    }
    }
}

window.addEventListener('keydown', (event) => {
    if (gameState !== 'playing') return;
    switch (event.key) {
        case 'a': case 'ArrowLeft': keys.left.pressed = true; break;
        case 'd': case 'ArrowRight': keys.right.pressed = true; break;
        case 'w': case 'ArrowUp': case ' ': if (player.jumps < 2) { player.velocity.y = -15; player.jumps++; } break;
    }
});
window.addEventListener('keyup', (event) => {
    if (gameState !== 'playing') return;
    switch (event.key) {
        case 'a': case 'ArrowLeft': keys.left.pressed = false; break;
        case 'd': case 'ArrowRight': keys.right.pressed = false; break;
    }
});

function startGame() {
    messageBoard.style.display = 'none';
    menu.style.display = 'none';
    menu.classList.remove('with-message');
    init(true); 
    gameState = 'playing';
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);



loadAssets().then(() => {
    init();
    animate();
});

