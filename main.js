const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Fixed dimensions for canvas
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Variables
const frameCount = 20; // Total number of sprite frames
let currentFrame = 0; // Current frame index
let runnerX = -100; // Runner's starting X position
const runnerY = canvasHeight - 150; // Runner's Y position
let speed = 1; // Runner's speed
let bgX = 0; // Background scrolling position
const bgScrollSpeed = 0.5; // Adjust this to slow down scrolling
const animationSpeed = 120; // Milliseconds per frame
let lastTime = 0; // Timestamp of the last frame

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
}

// Draw the background to fit the canvas
function drawBackground() {
    // Draw the first instance of the background
    ctx.drawImage(background, bgX, 0, canvasWidth + 1, canvasHeight);
    
    // Draw the second instance for seamless scrolling
    ctx.drawImage(background, bgX + canvasWidth, 0, canvasWidth + 1, canvasHeight);
     
    // Wrap around to avoid gaps
     if (bgX <= -canvasWidth) {
        bgX = 0; // Reset position for seamless scrolling
    }
}

// Animation loop
function animate(timestamp) {
    ctx.imageSmoothingEnabled = false; // Enable high-quality rendering
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw the background
    drawBackground();

    // Scroll the background more slowly
    //bgX -= bgScrollSpeed; // Slower scrolling speed

    bgX -= bgScrollSpeed;
    //bgX = Math.round(bgX);

 
    if (bgX <= -canvasWidth) {
        bgX = 0; // Reset background position for seamless scrolling
    }

    // Calculate elapsed time for smoother frame updates
    const elapsedTime = timestamp - lastTime;
    if (elapsedTime > animationSpeed) {
        currentFrame = (currentFrame + 1) % frameCount; // Update the frame
        lastTime = timestamp; // Reset the timestamp
    }

    // Draw the runner
    ctx.drawImage(sprites[currentFrame], runnerX, runnerY, 120, 120);

    // Update runner's position
    runnerX += speed;
    if (runnerX > canvasWidth) {
        runnerX = -100; // Reset position when off-screen
    }

    // Request the next animation frame
    requestAnimationFrame(animate);
}

// Start the animation after assets are loaded
Promise.all([
    new Promise((resolve) => (background.onload = resolve)),
    ...spriteLoadPromises
]).then(() => {
    console.log("All assets loaded. Starting animation...");
    animate(0); // Start the animation
});
