const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

// Queue assets
ASSET_MANAGER.queueDownload("./assets/field.png");
for (let i = 1; i <= 20; i++) {
    ASSET_MANAGER.queueDownload(`./assets/Run (${i}).png`);
}
ASSET_MANAGER.queueDownload("./assets/lofi-velvet-lazy-day.mp3");

// Define the Runner class
class Runner {
    constructor(game, x, y, speed) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.bgX = 0;

        // Load animation frames from AssetManager
        this.frames = [];
        for (let i = 1; i <= 20; i++) {
            this.frames.push(ASSET_MANAGER.getAsset(`./assets/Run (${i}).png`));
        }

        this.animator = new Animator(this.frames, 0.1); // Animation frame delay
    }

    update() {
        this.animator.update(this.game.clockTick);

        // Move the runner and background
        this.x += this.speed;
        if (this.x > this.game.ctx.canvas.width) {
            this.x = -100; // Reset runner position
        }

        this.bgX -= 1;
        if (this.bgX <= -this.game.ctx.canvas.width) {
            this.bgX = 0;
        }
    }

    draw(ctx) {
        // Draw the background
        const bg = ASSET_MANAGER.getAsset("./assets/field.png");
        ctx.drawImage(bg, this.bgX, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(bg, this.bgX + ctx.canvas.width, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw the runner
        this.animator.draw(ctx, this.x, this.y, 100, 100);
    }
}

// Animator class for handling sprite animation
class Animator {
    constructor(frames, frameDuration) {
        this.frames = frames;
        this.frameDuration = frameDuration; // Delay between frames
        this.elapsedTime = 0;
        this.currentFrame = 0;
    }

    update(tick) {
        this.elapsedTime += tick;
        if (this.elapsedTime >= this.frameDuration) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.elapsedTime = 0;
        }
    }

    draw(ctx, x, y, width, height) {
        ctx.drawImage(this.frames[this.currentFrame], x, y, width, height);
    }
}

// Start the game after all assets are loaded
ASSET_MANAGER.downloadAll(() => {
    console.log("All assets downloaded!");

    const canvas = document.getElementById("gameWorld");
    const ctx = canvas.getContext("2d");

    gameEngine.init(ctx);

    // Add the Runner entity
    const runner = new Runner(gameEngine, -100, canvas.height - 150, 2);
    gameEngine.addEntity(runner);

    gameEngine.start();
});

