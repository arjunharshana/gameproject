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
const cloudImage = new Image();

const pipeImage = new Image();
const pipeImageSmall = new Image();

pipeImage.src = "assets/pipe.png";
pipeImageSmall.src = "assets/pipeSmall.png";

marioWalk1.src = "assets/marioWalk1.png";
marioWalk2.src = "assets/marioWalk2.png";
marioWalk1Left.src = "assets/marioWalk1Left.png";
marioWalk2Left.src = "assets/marioWalk2Left.png";
blockImage.src = "assets/tile.png";
cloudImage.src = "assets/clouds.png";
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

class Barrier {
  constructor({ x, y, width, height, image }) {
    this.width = width;
    this.height = height;
    this.image = image;

    this.position = { x, y: this.snapToSurface(x, this.width, this.height) };
  }

  snapToSurface(x, width, height) {
    let bestY = null;

    for (let platform of platforms) {
      const withinX =
        x + width > platform.position.x &&
        x < platform.position.x + platform.width;

      if (withinX) {
        const candidateY = platform.position.y - height;
        if (bestY === null || candidateY < bestY) {
          bestY = candidateY;
        }
      }
    }

    return bestY !== null ? bestY : canvas.height - height - 80;
  }

  draw() {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
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
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
  update() {
    this.draw();
  }
}

let player = new Player();
let platforms = [];
let barriers = [];
let clouds = [];
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

  barriers = [
    new Barrier({ x: 700, width: 60, height: 120, image: pipeImage }),
    new Barrier({ x: 950, width: 60, height: 80, image: pipeImageSmall }),
    new Barrier({ x: 1340, width: 60, height: 120, image: pipeImage }),
    new Barrier({ x: 1700, width: 60, height: 80, image: pipeImageSmall }),
    new Barrier({ x: 2100, width: 60, height: 120, image: pipeImage }),
    new Barrier({ x: 2600, width: 60, height: 80, image: pipeImageSmall }),
  ];

  clouds = [
    new Cloud({ x: 200, y: 50, image: cloudImage, speed: -0.2 }),
    new Cloud({ x: 500, y: 80, image: cloudImage, speed: -0.1 }),
    new Cloud({ x: 850, y: 40, image: cloudImage, speed: -0.3 }),
    new Cloud({ x: 1300, y: 70, image: cloudImage, speed: -0.2 }),
    new Cloud({ x: 1700, y: 60, image: cloudImage, speed: -0.15 }),
    new Cloud({ x: 2200, y: 90, image: cloudImage, speed: -0.25 }),
    new Cloud({ x: 2800, y: 50, image: cloudImage, speed: -0.2 }),
  ];
  updateUI();

  keys.left.pressed = false;
  keys.right.pressed = false;
}

function updateUI() {
  score = Math.floor(scrollOffset / 80);
  scoreBoard.innerText = `Score: ${score}`;
  livesBoard.innerText = `Lives: ${lives}`;
}

//barrier collision
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

  if (gameState === "playing") {
    clouds.forEach((cloud) => {
      cloud.draw();
    });
    platforms.forEach((platform) => {
      platform.draw();
    });

    barriers.forEach((barrier) => {
      barrier.draw();
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

        clouds.forEach((cloud) => {
          cloud.position.x -= 1.5;
        });

        //scroll barriers
        barriers.forEach((barrier) => {
          barrier.position.x -= 3;
        });
      } else if (keys.left.pressed && scrollOffset > 0) {
        scrollOffset -= 3;
        platforms.forEach((platform) => {
          platform.position.x += 3;
        });

        barriers.forEach((barrier) => {
          barrier.position.x += 3;
        });

        clouds.forEach((cloud) => {
          cloud.position.x -= 1.5;
        });
      }
    }

    updateUI();

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

    barriers.forEach((barrier) => {
      checkBarrierCollision(barrier);
    });

    if (scrollOffset > 3200) {
      console.log("You win!");
      gameState = "menu";
      menu.style.display = "flex";
      startBtn.style.display = "none";
      restartBtn.style.display = "block";
    }

    if (player.position.y > canvas.height) {
      lives--;
      if (lives <= 0) {
        gameState = "menu";
        menu.style.display = "flex";
        startBtn.style.display = "none";
        restartBtn.style.display = "block";
      } else {
        init();
      }
      //updateUI();
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
