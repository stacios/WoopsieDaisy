const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Variables
const frameCount = 20; // Total number of sprite frames
let currentFrame = 0; // Current frame index
let runnerX = -100; // Runner's starting X position
const runnerY = canvas.height - 150; // Runner's Y position
let speed = 2; // Runner's speed
let bgX = 0; // Background scrolling position
let frameDelay = 0; // Counter for frame delay
const maxFrameDelay = 3; // Adjust to slow down frame transitions

// Preload assets
const background = new Image();
background.src = "assets/field.png";

const sprites = [];
const spriteLoadPromises = []; // To track when sprites are fully loaded
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
/*
// Load background music
const backgroundMusic = new Audio("assets/lofi-velvet-lazy-day.mp3");
backgroundMusic.loop = true; // Loop the music
backgroundMusic.volume = 0.5; // Set initial volume
 
// Attempt to play background music immediately
document.addEventListener("DOMContentLoaded", () => {
    backgroundMusic.play().catch((error) => {
        console.warn("Autoplay blocked. Attempting user interaction to enable music:", error);

        // Fallback: Play music on first user interaction
        document.addEventListener("click", () => {
            if (backgroundMusic.paused) {
                backgroundMusic.play();
            }
        });
    });
});*/

// Animation loop
function animate() {
    ctx.imageSmoothingEnabled = true; // Enable image smoothing for higher quality
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw scrolling background
    bgX -= 1; // Adjust background speed
    if (bgX <= -canvas.width) bgX = 0;
    ctx.drawImage(background, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(background, bgX + canvas.width, 0, canvas.width, canvas.height);

    // Draw runner
    ctx.drawImage(sprites[currentFrame], runnerX, runnerY, 100, 100);

    // Update frame (delayed to slow animation)
    frameDelay++;
    if (frameDelay >= maxFrameDelay) {
        currentFrame = (currentFrame + 1) % frameCount;
        frameDelay = 0;
    }

    // Update runner's position
    runnerX += speed;
    if (runnerX > canvas.width) {
        runnerX = -100; // Reset runner position when off-screen
    }

    // Request the next frame
    requestAnimationFrame(animate);
}

// Ensure all assets are loaded before starting the animation
Promise.all([
    new Promise((resolve) => (background.onload = resolve)), // Wait for background
    ...spriteLoadPromises, // Wait for all sprites
]).then(() => {
    console.log("All assets loaded. Starting animation...");
    animate();
});

