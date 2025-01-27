const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Images
const girlSprite = new Image();
const fieldBackground = new Image();

girlSprite.src = "girl_running_sprite.png"; // Path to your sprite sheet
fieldBackground.src = "field_background.png"; // Path to your field background

// Variables for animation
let frameIndex = 0; // Current frame of the sprite
const frameCount = 6; // Number of frames in the sprite sheet
const frameWidth = 100; // Width of each frame in the sprite sheet
const frameHeight = 120; // Height of each frame
let girlX = -frameWidth; // Starting position off-screen (left)

// Animation speed
const fps = 12; // Frames per second
const speed = 2; // Pixels moved per frame

// Draw frame function
function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw background (repeat for scrolling effect if needed)
    ctx.drawImage(fieldBackground, 0, 0, canvas.width, canvas.height);

    // Draw girl
    ctx.drawImage(
        girlSprite,
        frameIndex * frameWidth, // Source X
        0, // Source Y
        frameWidth, frameHeight, // Source Width/Height
        girlX, canvas.height - frameHeight, // Destination X/Y
        frameWidth, frameHeight // Destination Width/Height
    );

    // Update position and frame
    girlX += speed;
    frameIndex = (frameIndex + 1) % frameCount;

    // Loop the animation
    if (girlX > canvas.width) girlX = -frameWidth;

    setTimeout(() => requestAnimationFrame(drawFrame), 1000 / fps);
}

// Start animation once assets are loaded
girlSprite.onload = () => {
    fieldBackground.onload = () => {
        drawFrame();
    };
};
