const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreBoard = document.getElementById("score-board");
const livesBoard = document.getElementById("lives-board");
const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let gameState = "menu";
let score = 0;
let lives = 3;

const marioWalk1 = new Image();
const marioWalk2 = new Image();
const marioWalk1Left = new Image();
const marioWalk2Left = new Image();
const blockImage = new Image();

marioWalk1.src = "assets/marioWalk1.png";
marioWalk2.src = "assets/marioWalk2.png";
marioWalk1Left.src = "assets/marioWalk1Left.png";
marioWalk2Left.src = "assets/marioWalk2Left.png";
blockImage.src = "assets/tile.png";
const gravity = 0.5;

class Player {
  constructor() {
    this.position = { x: 100, y: 100 };
    this.velocity = { x: 0, y: 0 };
    this.width = 40;
    this.height = 40;
    this.jumps = 0;

    // Animation control
    this.currentFrame = 0;
    this.frameCounter = 0;
    this.onGround = false;
    this.facingRight = true;
  }

  draw() {
    let sprite;

    if (!this.onGround) {
      sprite = this.facing === "right" ? marioWalk2 : marioWalk2Left;
    } else if (keys.right.pressed) {
      sprite = this.currentFrame === 0 ? marioWalk1 : marioWalk2;
    } else if (keys.left.pressed) {
      sprite = this.currentFrame === 0 ? marioWalk1Left : marioWalk2Left;
    } else {
      sprite = this.facing === "right" ? marioWalk1 : marioWalk1Left;
    }

    ctx.drawImage(
      sprite,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.frameCounter++;

    if ((keys.right.pressed || keys.left.pressed) && this.frameCounter > 10) {
      this.currentFrame = (this.currentFrame + 1) % 2;
      this.frameCounter = 0;
    }

    if (this.velocity.x > 0) {
      this.facing = "right";
    } else if (this.velocity.x < 0) {
      this.facing = "left";
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.velocity.y += gravity;

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
        ctx.drawImage(
          blockImage,
          this.position.x + i,
          this.position.y + j,
          Math.min(tileSize, this.width - i),
          Math.min(tileSize, this.height - j)
        );
      }
    }
  }
}

let player = new Player();
let platforms = [];
let keys = {
  right: { pressed: false },
  left: { pressed: false },
};

let scrollOffset = 0;

function init(isReset = false) {
  if (isReset) {
    lives = 3;
    score = 0;
  }

  player = new Player();
  scrollOffset = 0;
  platforms = [
    new Platform({ x: 0, y: 320, width: 480, height: 80 }),
    new Platform({ x: 560, y: 320, width: 480, height: 80 }),
    new Platform({ x: 1200, y: 240, width: 200, height: 40 }),
    new Platform({ x: 1600, y: 200, width: 200, height: 40 }),
    new Platform({ x: 2000, y: 160, width: 160, height: 40 }),
    new Platform({ x: 2400, y: 240, width: 320, height: 40 }),
    new Platform({ x: 2880, y: 320, width: 800, height: 80 }),
  ];
  updateUI();

  keys.left.pressed = false;
  keys.right.pressed = false;
}

function updateUI() {
  score = Math.floor(scrollOffset / 10);
  scoreBoard.innerText = `Score: ${score}`;
  livesBoard.innerText = `Lives: ${lives}`;
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameState === "playing") {
    platforms.forEach((platform) => {
      platform.draw();
    });
  }

  if (gameState === "playing") {
    player.update();

    // if (keys.right.pressed) {
    //     score += 1;
    //     updateUI();
    // }

    if (keys.right.pressed && player.position.x < 400) {
      player.velocity.x = 3;
    } else if (
      (keys.left.pressed && player.position.x > 100) ||
      (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
    ) {
      player.velocity.x = -3;
    } else {
      player.velocity.x = 0;
      if (keys.right.pressed) {
        scrollOffset += 3;
        platforms.forEach((platform) => {
          platform.position.x -= 3;
        });
      } else if (keys.left.pressed && scrollOffset > 0) {
        scrollOffset -= 3;
        platforms.forEach((platform) => {
          platform.position.x += 3;
        });
      }
    }

    player.onGround = false;
    platforms.forEach((platform) => {
      if (
        player.position.y + player.height <= platform.position.y &&
        player.position.y + player.height + player.velocity.y >=
          platform.position.y &&
        player.position.x + player.width >= platform.position.x &&
        player.position.x <= platform.position.x + platform.width
      ) {
        player.velocity.y = 0;
        player.jumps = 0;
        player.onGround = true;
      }
    });

    if (scrollOffset > 3200) {
      console.log("You win!");
      gameState = "menu";
      menu.style.display = "flex";
      startBtn.style.display = "none";
      restartBtn.style.display = "block";
    }

    if (player.position.y > canvas.height) {
      console.log("You lose a life!");
      lives--;
      if (lives <= 0) {
        console.log("Game Over!");
        gameState = "menu";
        menu.style.display = "flex";
        startBtn.style.display = "none";
        restartBtn.style.display = "block";
      } else {
        init();
      }
      updateUI();
    }
  }
}

window.addEventListener("keydown", (event) => {
  if (gameState !== "playing") return;
  switch (event.key) {
    case "a":
    case "ArrowLeft":
      keys.left.pressed = true;
      break;
    case "d":
    case "ArrowRight":
      keys.right.pressed = true;
      break;
    case "w":
    case "ArrowUp":
    case " ":
      if (player.jumps < 1) {
        player.velocity.y = -15;
        player.jumps++;
      }
      break;
  }
});
window.addEventListener("keyup", (event) => {
  if (gameState !== "playing") return;
  switch (event.key) {
    case "a":
    case "ArrowLeft":
      keys.left.pressed = false;
      break;
    case "d":
    case "ArrowRight":
      keys.right.pressed = false;
      break;
  }
});

function startGame() {
  menu.style.display = "none";
  init(true);
  gameState = "playing";
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

init();
animate();
