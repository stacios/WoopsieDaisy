const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Fixed dimensions for canvas
const canvasWidth = canvas.width-30;
const canvasHeight = canvas.height-350;

// Variables
const frameCount = 20; // Total number of sprite frames
let currentFrame = 0; // Current frame index
let runnerX = -100; // Runner's starting X position
let runnerY = canvasHeight - 100; // Runner's Y position
let speed = 0.7; // Runner's speed
let bgX = 0; // Background scrolling position
const bgScrollSpeed = 1.5; // Adjust this to slow down scrolling
const animationSpeed = 120; // Milliseconds per frame
let lastTime = 0; // Timestamp of the last frame
const gravity = 0.4;


let frameDelay = 0; // Counter for frame delay
const maxFrameDelay = 3; // Adjust to slow down frame transitions

//high score
let highScore = 0;

function updateHighScore() {
    if (collectedFlowers > highScore) {
        highScore = collectedFlowers;
        localStorage.setItem("highScore", highScore); // Save score
    }
}

// Load high score on game start
if (localStorage.getItem("highScore")) {
    highScore = parseInt(localStorage.getItem("highScore"));
}



//hud
const flowerIcon = new Image();
flowerIcon.src = "assets/flower.png"; // Flower icon

function drawHUD() {
    ctx.fillStyle = "white";
    ctx.font = "24px Arial";

    ctx.textAlign = "center";
    ctx.fillText("SPACE = JUMP", canvasWidth / 2, canvasHeight - 500);


    ctx.drawImage(flowerIcon, 40, canvasHeight - 40, 30, 30); // Flower icon
    ctx.fillText(`x ${collectedFlowers}`, 100, canvasHeight - 15); // Show score
    ctx.fillText(`High Score: ${highScore}`, canvasWidth - 180, canvasHeight - 25);

}


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

/*
function jump() {
    if (!isJumping) {
        isJumping = true;
        if (velocityY === 0) velocityY = -14; // jump strength for a higher jump
    }
}*/

let canDoubleJump = false;

function jump() {
    if (!isJumping) {
        isJumping = true;
        velocityY = -16; // First jump
        canDoubleJump = true; // Allows second jump
    } else if (canDoubleJump) {
        velocityY = -14; // Second jump is slightly weaker
        canDoubleJump = false; // Only allow one double jump per air time
    }
}



// Listen for jump input
document.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "ArrowUp") {
        jump();
    }
});

// Background music
const backgroundMusic = new Audio("assets/lofi-velvet-lazy-day.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

// Try playing immediately when the document loads
document.addEventListener("DOMContentLoaded", () => {
    playMusic();
});

// Function to play music and handle autoplay restrictions
function playMusic() {
    backgroundMusic.play().catch(() => {
        console.warn("Autoplay blocked. Waiting for user interaction...");
        
        // Listen for the first user interaction, then play
        document.addEventListener("click", playOnInteraction, { once: true });
        document.addEventListener("keydown", playOnInteraction, { once: true });
    });
}

// Play music once the user interacts with the page
function playOnInteraction() {
    backgroundMusic.play();
    document.removeEventListener("click", playOnInteraction);
    document.removeEventListener("keydown", playOnInteraction);
}



/*
// Background music
const backgroundMusic = new Audio("assets/lofi-velvet-lazy-day.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;

// Start music as soon as it loads
backgroundMusic.addEventListener("canplaythrough", () => {
    backgroundMusic.play().catch(error => {
        console.warn("Autoplay blocked. Trying again...");
        setTimeout(() => backgroundMusic.play(), 1000); // Retry after 1 second
    });
}); 

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


const collectSound = new Audio("assets/collect.mp3"); // Load sound

function checkCollision(flower) {
    if (!flower.collected &&
        runnerX < flower.x + flower.width &&
        runnerX + 90 > flower.x &&
        runnerY < flower.y + flower.height &&
        runnerY + 90 > flower.y) {
        
        flower.collected = true;
        collectedFlowers++;
        updateHighScore();
        collectSound.play(); // Play sound effect
    }
}


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
        this.width = 60;
        this.height = 60;
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

/*function spawnFlower() {
    let x, y;
    let maxAttempts = 10; // Prevent infinite loops
    let overlap = false;

    do {
        x = canvas.width + Math.random() * 200; // Spawn off-screen
        y = runnerY - 50 - Math.random() * 100; // Random height
        overlap = flowers.some(flower =>
            Math.abs(flower.x - x) < 40 && Math.abs(flower.y - y) < 40 // Minimum spacing of 40px
        );
        maxAttempts--;
    } while (overlap && maxAttempts > 0);

    flowers.push(new Flower(x, y));
}*/

function spawnFlower() {
    let x, y;
    let maxAttempts = 10;
    let overlap = false;
    let heightLevels = [runnerY - 50, runnerY - 100, runnerY - 150]; // Different heights

    do {
        x = canvas.width + Math.random() * 200;
        y = heightLevels[Math.floor(Math.random() * heightLevels.length)]; // Pick a height
        overlap = flowers.some(flower =>
            Math.abs(flower.x - x) < 60 && Math.abs(flower.y - y) < 60 // Increased spacing
        );
        maxAttempts--;
    } while (overlap && maxAttempts > 0);

    flowers.push(new Flower(x, y));
}



// Spawn flowers periodically
setInterval(spawnFlower, flowerSpawnRate);

let collectedFlowers = 0;

function checkCollision(flower) {
    if (!flower.collected &&
        runnerX < flower.x + flower.width &&
        runnerX + 130 > flower.x &&  
        runnerY < flower.y + flower.height &&
        runnerY + 130 > flower.y) {

        flower.collected = true;
        collectedFlowers++; 
        updateHighScore();
        collectSound.play();

        // Flash effect
        //ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        //ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        //setTimeout(() => { ctx.clearRect(0, 0, canvasWidth, canvasHeight); }, 100);
    }
}


/*function checkCollision(flower) {
    if (
        !flower.collected &&  // Ensures a flower is only counted once
        runnerX < flower.x + flower.width &&
        runnerX + 90 > flower.x &&
        runnerY < flower.y + flower.height &&
        runnerY + 90 > flower.y
    ) {
        flower.collected = true; // Marks the flower as collected immediately
        collectedFlowers++; // Adds only one point per flower
    }
}*/

// Animation loop
function animate(timestamp) {
    ctx.imageSmoothingEnabled = true; 
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    drawBackground();

    // Jump physics
    if (isJumping) {
        runnerY += velocityY;
        velocityY += gravity;

        if (runnerY >= canvasHeight - 100) { // Ensure correct landing position
            runnerY = canvasHeight - 100;
            isJumping = false;
            jumpFrameIndex = 0;
            velocityY = 0;
        }
    }

    // Update frame for running animation
    if (!isJumping) {
        //currentFrame = (currentFrame + 1) % frameCount; // Cycle through running frames
            // Update frame (delayed to slow animation)
        frameDelay++;
        if (frameDelay >= maxFrameDelay) {
            currentFrame = (currentFrame + 1) % frameCount;
            frameDelay = 0;
        }

    }

    // Set a scale factor to make the girl larger
    const girlWidth = 110;  // Increased from 90 to 150
    const girlHeight = 110; // Increased from 90 to 150

    // Draw the player (jumping or running)
    if (isJumping) {
        ctx.drawImage(jumpFrames[Math.min(jumpFrameIndex, jumpFrames.length - 1)], 
                    runnerX, runnerY, girlWidth, girlHeight);
        if (jumpFrameIndex < 29) jumpFrameIndex++;
    } else {
        ctx.drawImage(sprites[currentFrame], 
                    runnerX, runnerY, girlWidth, girlHeight);
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

    drawHUD();
    // Draw HUD
    //ctx.fillStyle = "white";
    //ctx.font = "20px Arial";
    //ctx.fillText(`Flowers: ${collectedFlowers}`, 40, canvasHeight - 40);

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

