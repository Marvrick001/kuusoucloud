const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let gameStarted = false;
let gameOver = false;
let score = 0;
let pipes = [];
let player;
let background, startScreen, characterImg, pipeImg;
let clickSound, pointSound, loseSound;

function loadAssets() {
  background = new Image();
  background.src = "assets/background.png";

  startScreen = new Image();
  startScreen.src = "assets/start_screen.png";

  characterImg = new Image();
  characterImg.src = "assets/character.png";

  pipeImg = new Image();
  pipeImg.src = "assets/pipe.png";

  clickSound = new Audio("sounds/click.wav");
  pointSound = new Audio("sounds/point.wav");
  loseSound = new Audio("sounds/lose.wav");
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.velocity = 0;
    this.gravity = 0.25;
  }

  jump() {
    this.velocity = -6.5;
    clickSound.play();
  }

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;

    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
    if (this.y > HEIGHT - this.height) {
      this.y = HEIGHT - this.height;
      this.velocity = 0;
    }
  }

  draw() {
    ctx.drawImage(characterImg, this.x, this.y, this.width, this.height);
  }

  getRect() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

class Pipe {
  constructor(x) {
    this.x = x;
    this.width = 50;
    this.gap = Math.floor(Math.random() * 60) + 160;

    const maxTop = HEIGHT - this.gap - 100;
    this.topHeight = Math.floor(Math.random() * maxTop) + 50;

    this.bottomY = this.topHeight + this.gap;
    this.speed = 2.5;
    this.passed = false;
  }

  update() {
    this.x -= this.speed;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.topHeight / 2);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -this.width / 2, -this.topHeight / 2, this.width, this.topHeight);
    ctx.restore();

    ctx.drawImage(pipeImg, this.x, this.bottomY, this.width, HEIGHT - this.bottomY);
  }

  collidesWith(playerRect) {
    const topRect = { x: this.x, y: 0, width: this.width, height: this.topHeight };
    const bottomRect = { x: this.x, y: this.bottomY, width: this.width, height: HEIGHT - this.bottomY };
    return rectsOverlap(playerRect, topRect) || rectsOverlap(playerRect, bottomRect);
  }
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function resetGame() {
  score = 0;
  pipes = [new Pipe(WIDTH + 200)];
  player = new Player(50, 300);
  gameOver = false;
}

function drawStartScreen() {
  ctx.drawImage(startScreen, 0, 0, WIDTH, HEIGHT);
}

function drawBackground() {
  ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#fff";
  ctx.font = "48px Arial";
  ctx.fillText("Game Over", WIDTH / 2 - 120, HEIGHT / 2 - 40);
  ctx.font = "24px Arial";
  ctx.fillText("Final Score: " + score, WIDTH / 2 - 80, HEIGHT / 2);
  ctx.fillText("Click to Retry", WIDTH / 2 - 80, HEIGHT / 2 + 40);
}

function updateGame() {
  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  if (gameOver) {
    drawGameOver();
    return;
  }

  drawBackground();
  player.update();
  player.draw();

  for (let pipe of pipes) {
    pipe.update();
    pipe.draw();

    if (pipe.collidesWith(player.getRect())) {
      loseSound.play();
      gameOver = true;
    }

    if (!pipe.passed && pipe.x + pipe.width < player.x) {
      pipe.passed = true;
      score++;
      pointSound.play();

      if (score >= 1000) {
        resetGame();
      }
    }
  }

  if (pipes[pipes.length - 1].x < WIDTH - 200) {
    pipes.push(new Pipe(WIDTH + 100));
  }

  drawScore();
}

canvas.addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
    resetGame();
  } else if (gameOver) {
    resetGame();
  } else {
    player.jump();
  }
});

function gameLoop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  updateGame();
  requestAnimationFrame(gameLoop);
}

loadAssets();
resetGame();
gameLoop();