const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Fixed dimensions for canvas
const canvasWidth = canvas.width-90;
const canvasHeight = canvas.height-350;

// Variables
const frameCount = 20; // Total number of sprite frames
let currentFrame = 0; // Current frame index
let runnerX = -100; // Runner's starting X position
let runnerY = canvasHeight - 150; // Runner's Y position
let speed = 0.6; // Runner's speed
let bgX = 0; // Background scrolling position
const bgScrollSpeed = 1.5; // Adjust this to slow down scrolling
const animationSpeed = 120; // Milliseconds per frame
let lastTime = 0; // Timestamp of the last frame
const gravity = 0.4;

// Preload assets
const background = new Image();
background.src = "assets/field.png";

const sprites = [];
const spriteLoadPromises = [];
for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = `assets/Run (${i}).png`;
    sprites.push(img);

    // Track the load event for each sprite
    spriteLoadPromises.push(
        new Promise((resolve) => {
            img.onload = resolve;
        })
    );
}

const jumpFrames = [];
for (let i = 1; i <= 30; i++) {
    const img = new Image();
    img.src = `assets/Jump (${i}).png`;
    jumpFrames.push(img);
}

let isJumping = false;
let jumpFrameIndex = 0;
let velocityY = 0;


function jump() {
    if (!isJumping) {
        isJumping = true;
        if (velocityY === 0) velocityY = -14; // jump strength for a higher jump
    }
}


// Listen for jump input
document.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "ArrowUp") {
        jump();
    }
});

/*
// Background music
const backgroundMusic = new Audio("assets/lofi-velvet-lazy-day.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

// Attempt to play background music immediately
document.addEventListener("DOMContentLoaded", () => {
    backgroundMusic.play().catch((error) => {
        console.warn("Autoplay blocked. Retrying playback...");
        retryMusicPlayback();
    });
});

// Retry music playback
function retryMusicPlayback() {
    const interval = setInterval(() => {
        backgroundMusic.play()
            .then(() => {
                clearInterval(interval);
            })
            .catch(() => {
                console.warn("Retrying music playback...");
            });
    }, 1000);
}*/

// Draw the background to fit the canvas
function drawBackground() {
    bgX -= bgScrollSpeed;

    // Draw the first instance of the background
    ctx.drawImage(background, bgX, 80, canvasWidth + 1, canvasHeight);
    
    // Draw the second instance for seamless scrolling
    ctx.drawImage(background, bgX + canvasWidth, 80, canvasWidth + 1, canvasHeight);
     
    // Wrap around to avoid gaps
     if (bgX <= -canvasWidth) {
        bgX = 0; // Reset position for seamless scrolling
    }
}

class Flower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.image = new Image();
        this.image.src = "assets/flower.png";
        this.collected = false;
    }

    update() {
        this.x -= bgScrollSpeed; // Move with the background

        if (this.x + this.width < 0) {
            this.collected = true; // Remove if off-screen
        }
    }

    draw(ctx) {
        if (!this.collected) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}

const flowers = [];
const flowerSpawnRate = 2000; // Spawn every 2 seconds

function spawnFlower() {
    let x = canvas.width + Math.random() * 200; // Spawn off-screen
    let y = runnerY - 50 - Math.random() * 100; // Random height

    flowers.push(new Flower(x, y));
}

// Spawn flowers periodically
setInterval(spawnFlower, flowerSpawnRate);



let collectedFlowers = 0;

function checkCollision(flower) {
    if (
        runnerX < flower.x + flower.width &&
        runnerX + 90 > flower.x &&
        runnerY < flower.y + flower.height &&
        runnerY + 90 > flower.y
    ) {
        flower.collected = true;
        collectedFlowers++;
    }
}



// Animation loop
function animate(timestamp) {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    drawBackground();

    // Jump physics
    if (isJumping) {
        runnerY += velocityY;
        velocityY += gravity;

        if (runnerY >= canvasHeight - 150) { // Ensure correct landing position
            runnerY = canvasHeight - 150;
            isJumping = false;
            jumpFrameIndex = 0;
            velocityY = 0;
        }
    }

    // Update frame for running animation
    if (!isJumping) {
        currentFrame = (currentFrame + 1) % frameCount; // Cycle through running frames
    }

    // Draw the player (jumping or running)
    if (isJumping) {
        ctx.drawImage(jumpFrames[Math.min(jumpFrameIndex, jumpFrames.length - 1)], runnerX, runnerY, 90, 90);
        if (jumpFrameIndex < 29) jumpFrameIndex++;
    } else {
        ctx.drawImage(sprites[currentFrame], runnerX, runnerY, 90, 90);
    }

    // Move the runner forward
    runnerX += speed;
    if (runnerX > canvasWidth) {
        runnerX = -100; // Reset position if off-screen
    }

    // Update & Draw Flowers
    for (const flower of flowers) {
        flower.update();
        flower.draw(ctx);
        checkCollision(flower);
    }

    // Draw HUD
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Flowers: ${collectedFlowers}`, 40, canvasHeight - 40);

    requestAnimationFrame(animate);
}



// Start the animation after assets are loaded
Promise.all([
    new Promise((resolve) => (background.onload = resolve)),
    ...spriteLoadPromises,
    ...jumpFrames.map(img => new Promise((resolve) => img.onload = resolve)) // Ensure jump sprites load
]).then(() => {
    console.log("All assets loaded. Starting animation...");
    animate(0); // Start the animation
});

