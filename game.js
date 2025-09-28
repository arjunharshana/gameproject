const canvas = document.getElementById('game-canvas');
const ctx =canvas.getContext('2d');

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

        
        if (this.position.y + this.height + this.velocity.y < canvas.height) {
            this.velocity.y += gravity;
        }
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

let player = new Player();
let Platform =[];
let key={
    right:{pressed:false},
    left:{pressed:false}
}

let scrollOffet = 0;

function inti(isReset=false){
    if(isReset){
lives = 3;
score=0;
 }

player = new Player();
scrollOffet = 0 ;
Platform =[
    new Platform({ x: 0, y: 500, width: 500, height: 80 }),
    new Platform({ x: 580, y: 500, width: 500, height: 80 }),
    new Platform({ x: 1200, y: 400, width: 200, height: 30 }),
    new Platform({ x: 1600, y: 300, width: 200, height: 30 }),
    new Platform({ x: 2000, y: 200, width: 150, height: 30 }),
    new Platform({ x: 2500, y: 400, width: 300, height: 30 }),
    new Platform({ x: 3000, y: 500, width: 800, height: 80 }),
]
updateUI();

}

function updateUI() {
    scoreBoard.innerText = `Score: ${score}`;
    livesBoard.innerText = `Lives: ${lives}`;
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    platforms.forEach(platform => {
        platform.draw();
    });

    if (gameState === 'playing') {
        player.update();
        
        if (keys.right.pressed) {
            score += 1; 
            updateUI();
        }

        if (keys.right.pressed && player.position.x < 400) {
            player.velocity.x = 5;
        } else if ((keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
            player.velocity.x = -5;
        } else {
            player.velocity.x = 0;
            if (keys.right.pressed) {
                scrollOffset += 5;
                platforms.forEach(platform => { platform.position.x -= 5; });
            } else if (keys.left.pressed && scrollOffset > 0) {
                scrollOffset -= 5;
                platforms.forEach(platform => { platform.position.x += 5; });
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

        if (scrollOffset > 3200) {
            console.log('You win!');
            gameState = 'menu';
            menu.style.display = 'flex';
            startBtn.style.display = 'none';
            restartBtn.style.display = 'block';
        }
        
        if (player.position.y > canvas.height) {
            console.log('You lose a life!');
            lives--;
            if (lives <= 0) {
                console.log('Game Over!');
                gameState = 'menu';
                menu.style.display = 'flex';
                startBtn.style.display = 'none';
                restartBtn.style.display = 'block';
            } else {
                init(); 
            }
            updateUI();
        }
    }
}

window.addEventListener('keydown', ({ keyCode }) => {
    if (gameState !== 'playing') return;
    switch (keyCode) {
        case 65: keys.left.pressed = true; break;
        case 68: keys.right.pressed = true; break;
        case 87: if(player.jumps < 2) { player.velocity.y = -12; player.jumps++; } break;
    }
});
window.addEventListener('keyup', ({ keyCode }) => {
    if (gameState !== 'playing') return;
    switch (keyCode) {
        case 65: keys.left.pressed = false; break;
        case 68: keys.right.pressed = false; break;
    }
});

function startGame() {
    menu.style.display = 'none';
    init(true); 
    gameState = 'playing';
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);


init();
animate();



