// Game Constants
const GRAVITY = 0.6;
const JUMP_POWER = 15;
const MOVE_SPEED = 5;
const PLATFORM_COUNT = 8;
const COIN_COUNT = 5;
const CLOUD_COUNT = 5;
const BIRD_COUNT = 3;
const STAR_COUNT = 8;
const MIN_PLATFORM_WIDTH = 80;
const MAX_PLATFORM_WIDTH = 180;
const DEBUG_MODE = false; // Debug mode off by default
const SHOW_DEBUG_PANEL = false; // Control debug panel visibility separately

// Game Variables
let player;
let platforms = [];
let coins = [];
let clouds = [];
let birds = [];
let stars = [];
let goal;
let score = 0;
let isGameOver = false;
let isLevelComplete = false;
let playerVelocityY = 0;
let playerVelocityX = 0;
let playerFacing = 'right';
let isJumping = false;
let isOnPlatform = false;
let gameWorldWidth = 2000; // Increased game world width
let gameWorldHeight = window.innerHeight;
let viewportX = 0;

// DOM Elements
const gameWorld = document.getElementById('game-world');
const scoreDisplay = document.getElementById('score');
const gameMessage = document.getElementById('game-message');
const messageContent = document.getElementById('message-content');

// Debug Element
let debugPanel;

// Debug Functions
function debugLog(message) {
    if (!DEBUG_MODE) return;
    
    console.log(message);
    
    if (!SHOW_DEBUG_PANEL) return;
    
    if (!debugPanel) {
        debugPanel = document.createElement('div');
        debugPanel.id = 'debug-panel';
        debugPanel.style.position = 'fixed';
        debugPanel.style.left = '10px';
        debugPanel.style.bottom = '10px';
        debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        debugPanel.style.color = 'white';
        debugPanel.style.padding = '10px';
        debugPanel.style.borderRadius = '5px';
        debugPanel.style.fontFamily = 'monospace';
        debugPanel.style.fontSize = '12px';
        debugPanel.style.maxHeight = '200px';
        debugPanel.style.overflowY = 'auto';
        debugPanel.style.zIndex = '1000';
        document.body.appendChild(debugPanel);
    }
    
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    debugPanel.appendChild(logEntry);
    
    // Keep only the last 10 messages
    while (debugPanel.childNodes.length > 10) {
        debugPanel.removeChild(debugPanel.firstChild);
    }
    
    // Auto-scroll to bottom
    debugPanel.scrollTop = debugPanel.scrollHeight;
}

function updateDebugInfo() {
    if (!DEBUG_MODE) return;
    
    const playerX = parseInt(player.style.left);
    const playerY = parseInt(player.style.bottom);
    
    const debugInfo = document.createElement('div');
    debugInfo.style.position = 'fixed';
    debugInfo.style.right = '10px';
    debugInfo.style.top = '10px';
    debugInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugInfo.style.color = 'white';
    debugInfo.style.padding = '10px';
    debugInfo.style.borderRadius = '5px';
    debugInfo.style.fontFamily = 'monospace';
    debugInfo.style.fontSize = '12px';
    debugInfo.style.zIndex = '1000';
    debugInfo.id = 'debug-info';
    
    debugInfo.innerHTML = `
        Player X: ${playerX}<br>
        Player Y: ${playerY}<br>
        Velocity X: ${playerVelocityX}<br>
        Velocity Y: ${playerVelocityY}<br>
        On Platform: ${isOnPlatform}<br>
        Jumping: ${isJumping}<br>
        Platform Count: ${platforms.length}
    `;
    
    const existingDebugInfo = document.getElementById('debug-info');
    if (existingDebugInfo) {
        document.body.replaceChild(debugInfo, existingDebugInfo);
    } else {
        document.body.appendChild(debugInfo);
    }
}

function toggleDebugPanel() {
    window.SHOW_DEBUG_PANEL = !window.SHOW_DEBUG_PANEL;
    
    if (!window.SHOW_DEBUG_PANEL && debugPanel) {
        document.body.removeChild(debugPanel);
        debugPanel = null;
    }
    
    console.log(`Debug panel ${window.SHOW_DEBUG_PANEL ? 'shown' : 'hidden'}`);
}

// Sound Effects (placeholder functions)
function playSound(soundName) {
    // In a real game, this would play actual sounds
    console.log(`Playing sound: ${soundName}`);
}

// Initialize Game
function initGame() {
    // Reset game state
    gameWorld.innerHTML = '';
    platforms = [];
    coins = [];
    clouds = [];
    birds = [];
    stars = [];
    score = 0;
    isGameOver = false;
    isLevelComplete = false;
    playerVelocityY = 0;
    playerVelocityX = 0;
    playerFacing = 'right';
    isJumping = false;
    isOnPlatform = false;
    viewportX = 0;
    scoreDisplay.textContent = '0';
    gameMessage.style.display = 'none';
    
    debugLog("Initializing game...");
    
    // Update game world dimensions based on window size
    gameWorldHeight = window.innerHeight;
    gameWorldWidth = Math.max(2000, window.innerWidth * 2); // Make sure game world is at least twice the window width
    
    debugLog(`Game world dimensions: ${gameWorldWidth}x${gameWorldHeight}`);
    
    // Create sun
    const sun = document.createElement('div');
    sun.className = 'sun';
    gameWorld.appendChild(sun);
    
    // Create starting platform (always in the same position for player to start on)
    const startingPlatformY = 50;
    const startingPlatformHeight = 20; // Platform height is 20px
    createPlatform(0, startingPlatformY, 150);
    
    debugLog(`Created starting platform at Y=${startingPlatformY}, height=${startingPlatformHeight}`);
    
    // Create player on the starting platform - position player EXACTLY on top
    player = document.createElement('div');
    player.className = 'player face-right';
    player.style.left = '50px';
    
    // Important: Position player exactly on top of the starting platform
    player.style.bottom = `${startingPlatformY}px`;
    gameWorld.appendChild(player);
    
    debugLog(`Created player at X=50, Y=${startingPlatformY}`);
    
    // Set initial platform state
    isOnPlatform = true;
    isJumping = false;
    
    debugLog(`Initial states: isOnPlatform=${isOnPlatform}, isJumping=${isJumping}`);
    
    // Generate random platforms
    generateRandomPlatforms();
    
    // Generate random coins
    generateRandomCoins();
    
    // Create goal at a random position near the end
    createRandomGoal();
    
    // Create clouds
    for (let i = 0; i < CLOUD_COUNT; i++) {
        createCloud(
            Math.random() * gameWorldWidth,
            Math.random() * (gameWorldHeight - 100) + 300,
            Math.random() * 0.5 + 0.5
        );
    }
    
    // Create birds
    for (let i = 0; i < BIRD_COUNT; i++) {
        createBird(
            Math.random() * gameWorldWidth,
            Math.random() * 300 + 200
        );
    }
    
    // Create stars
    for (let i = 0; i < STAR_COUNT; i++) {
        createStar(
            Math.random() * gameWorldWidth,
            Math.random() * 200 + 50
        );
    }
    
    debugLog(`Game initialization complete. Created ${platforms.length} platforms, ${coins.length} coins.`);
    
    // Start game loop
    requestAnimationFrame(gameLoop);
    
    // Expose variables for testing after initialization
    window.player = player;
    window.platforms = platforms;
    window.isOnPlatform = isOnPlatform;
    window.playerVelocityY = playerVelocityY;
}

// Generate Random Platforms
function generateRandomPlatforms() {
    // Define parameters for jumpable distances
    const minHorizontalGap = 80;  // Minimum gap between platforms
    const maxHorizontalGap = 180; // Maximum gap (based on player jump distance)
    const maxVerticalGap = 120;   // Maximum vertical gap player can jump
    
    let lastX = 150; // Start after the initial platform
    let lastY = 50;  // Start at the same height as initial platform
    
    for (let i = 0; i < PLATFORM_COUNT; i++) {
        // Calculate new position with appropriate gaps
        // For higher platforms, use smaller horizontal gaps
        // For platforms at same height or lower, can use larger gaps
        
        // Randomly determine if this platform should be higher or lower or same level
        let verticalDirection;
        const randomValue = Math.random();
        if (randomValue < 0.4) {
            verticalDirection = 1; // Higher
        } else if (randomValue < 0.8) {
            verticalDirection = -1; // Lower
        } else {
            verticalDirection = 0; // Same level
        }
        
        // Calculate vertical change based on direction
        let verticalChange;
        if (verticalDirection === 1) {
            // Going up - limit the height increase to what player can jump
            verticalChange = Math.random() * 80 + 20;
        } else if (verticalDirection === -1) {
            // Going down - can go lower with no jump limitations
            verticalChange = Math.random() * 100 + 20;
        } else {
            // Same level
            verticalChange = 0;
        }
        
        // Calculate horizontal gap based on vertical direction
        let horizontalGap;
        if (verticalDirection === 1) {
            // Going up - need smaller horizontal gap for jump to be possible
            horizontalGap = Math.random() * (maxHorizontalGap - minHorizontalGap) * 0.7 + minHorizontalGap;
        } else if (verticalDirection === 0) {
            // Same level - medium horizontal gap
            horizontalGap = Math.random() * (maxHorizontalGap - minHorizontalGap) * 0.85 + minHorizontalGap;
        } else {
            // Going down - can have larger horizontal gap
            horizontalGap = Math.random() * (maxHorizontalGap - minHorizontalGap) + minHorizontalGap;
        }
        
        // Ensure the platform is within reasonable height bounds
        let newY = lastY + (verticalDirection * verticalChange);
        newY = Math.max(50, Math.min(gameWorldHeight - 200, newY));
        
        // Calculate new X position
        const newX = lastX + horizontalGap;
        
        // Randomize platform width
        const width = Math.random() * (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH) + MIN_PLATFORM_WIDTH;
        
        // Create the platform
        createPlatform(newX, newY, width);
        
        // Update last positions
        lastX = newX + width;
        lastY = newY;
    }
}

// Generate Random Coins
function generateRandomCoins() {
    // Place coins above platforms or in jump paths
    for (let i = 0; i < COIN_COUNT; i++) {
        // Choose a random platform (excluding the first one)
        const platformIndex = Math.floor(Math.random() * (platforms.length - 1)) + 1;
        const platform = platforms[platformIndex];
        
        // Position coin above the platform
        const coinX = platform.x + Math.random() * (platform.width - 30);
        const coinY = platform.y + 40 + Math.random() * 60; // 40-100px above platform
        
        createCoin(coinX, coinY);
    }
}

// Create Random Goal
function createRandomGoal() {
    // Place goal near the end of the level
    const lastPlatform = platforms[platforms.length - 1];
    
    goal = document.createElement('div');
    goal.className = 'goal';
    goal.style.left = `${lastPlatform.x + lastPlatform.width/2 - 25}px`; // Center on last platform
    goal.style.bottom = `${lastPlatform.y + 80}px`; // Position above platform to make it more visible
    gameWorld.appendChild(goal);
}

// Create Platform
function createPlatform(x, y, width) {
    const platform = document.createElement('div');
    platform.className = 'platform';
    platform.style.left = `${x}px`;
    platform.style.bottom = `${y}px`;
    platform.style.width = `${width}px`;
    gameWorld.appendChild(platform);
    
    platforms.push({
        element: platform,
        x: x,
        y: y,
        width: width,
        height: 20
    });
}

// Create Coin
function createCoin(x, y) {
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.style.left = `${x}px`;
    coin.style.bottom = `${y}px`;
    gameWorld.appendChild(coin);
    coins.push({
        element: coin,
        x: x,
        y: y,
        width: 30,
        height: 30,
        collected: false
    });
}

// Create Cloud
function createCloud(x, y, scale) {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    cloud.style.left = `${x}px`;
    cloud.style.top = `${y}px`;
    cloud.style.transform = `scale(${scale})`;
    gameWorld.appendChild(cloud);
    clouds.push(cloud);
}

// Create Bird
function createBird(x, y) {
    const bird = document.createElement('div');
    bird.className = 'bird';
    bird.style.left = `${x}px`;
    bird.style.top = `${y}px`;
    bird.style.animationDelay = `${Math.random() * 5}s`;
    gameWorld.appendChild(bird);
    birds.push(bird);
}

// Create Star
function createStar(x, y) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    gameWorld.appendChild(star);
    stars.push(star);
}

// Update Player Position
function updatePlayerPosition() {
    // Get current position
    let playerX = parseInt(player.style.left);
    let playerY = parseInt(player.style.bottom);
    
    // Apply gravity
    playerVelocityY -= GRAVITY;
    
    // Update position based on velocity
    playerX += playerVelocityX;
    playerY += playerVelocityY;
    
    // Check boundaries
    playerX = Math.max(0, Math.min(playerX, gameWorldWidth - 50)); // Allow player to move to the edge of game world
    
    // Don't limit Y position to allow falling below screen for game over detection
    
    // Update player position
    player.style.left = `${playerX}px`;
    player.style.bottom = `${playerY}px`;
    
    // Update player animation state
    if (playerVelocityY > 0) {
        player.classList.add('jumping');
    } else {
        player.classList.remove('jumping');
    }
    
    // Debug log player position and state
    if (DEBUG_MODE && Math.random() < 0.05) { // Only log occasionally to avoid spam
        debugLog(`Player position: X=${playerX}, Y=${playerY}, VelocityY=${playerVelocityY.toFixed(2)}, OnPlatform=${isOnPlatform}, Jumping=${isJumping}`);
    }
    
    // Update exposed variables for testing
    window.playerVelocityY = playerVelocityY;
}

// Game Loop
function gameLoop() {
    // Check for game over condition first - player is below screen
    const playerY = parseInt(player.style.bottom);
    if (playerY <= -100 && !isGameOver) {
        isGameOver = true;
        playerVelocityY = 0;
        playerVelocityX = 0;
        messageContent.textContent = 'Game Over! Try Again ';
        gameMessage.style.display = 'block';
        
        // Play fail sound
        playSound('fail');
        
        if (DEBUG_MODE) {
            debugLog("Game over - player fell off screen");
        }
        
        // Return early to stop further updates
        return;
    }
    
    if (isGameOver || isLevelComplete) {
        // If game is over, don't continue updating
        return;
    }
    
    // Update player position
    updatePlayerPosition();
    
    // Check collisions (platform check must come before other checks)
    checkPlatformCollisions();
    checkCoinCollisions();
    checkGoalCollision();
    
    // Update viewport
    updateViewport();
    
    // Update debug info if debug mode is on
    if (DEBUG_MODE) {
        updateDebugInfo();
    } else {
        // Make sure debug info is removed if debug mode is off
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            document.body.removeChild(debugInfo);
        }
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Check Platform Collisions
function checkPlatformCollisions() {
    const playerX = parseInt(player.style.left);
    const playerY = parseInt(player.style.bottom);
    const playerWidth = 50;
    const playerHeight = 60;
    
    // Track if player is on any platform
    let onPlatform = false;
    
    // Store the highest platform the player is colliding with
    let highestPlatformY = -1;
    let collidingPlatform = null;
    
    // First check if player is exactly on a platform already (to prevent bouncing)
    for (const platform of platforms) {
        if (playerX + playerWidth > platform.x && 
            playerX < platform.x + platform.width &&
            Math.abs(playerY - platform.y) <= 2) { // Player is already on this platform
            
            // Keep player on platform
            player.style.bottom = `${platform.y}px`;
            playerVelocityY = 0;
            isJumping = false;
            isOnPlatform = true;
            
            if (DEBUG_MODE) {
                debugLog(`Player maintained on platform at Y=${platform.y}`);
            }
            
            // Update exposed variable for testing
            window.isOnPlatform = true;
            return; // Exit early, no need to check other platforms
        }
    }
    
    // If player is not already on a platform, check for new collisions
    platforms.forEach(platform => {
        // Check if player is within horizontal bounds of the platform
        const horizontalCollision = 
            playerX + playerWidth > platform.x && 
            playerX < platform.x + platform.width;
        
        // Check if player is at the right height to land on the platform
        // Only consider landing if player is above the platform and falling down onto it
        const verticalCollision = 
            playerY > platform.y - 5 && // Player is slightly above platform
            playerY < platform.y + 15 && // Not too far above
            playerVelocityY <= 0; // Player is falling
        
        if (horizontalCollision && verticalCollision) {
            // If this platform is higher than previously found platforms, use this one
            if (platform.y > highestPlatformY) {
                highestPlatformY = platform.y;
                collidingPlatform = platform;
                onPlatform = true;
                
                if (DEBUG_MODE) {
                    debugLog(`Platform collision detected: Platform at X=${platform.x}, Y=${platform.y}, Width=${platform.width}`);
                }
            }
        }
    });
    
    // If player is on a platform, position them on top of the highest one
    if (onPlatform && collidingPlatform) {
        player.style.bottom = `${collidingPlatform.y}px`;
        playerVelocityY = 0;
        isJumping = false;
        
        if (DEBUG_MODE && !isOnPlatform) {
            debugLog(`Player landed on platform at Y=${collidingPlatform.y}`);
        }
    } else if (isOnPlatform && !onPlatform) {
        // Player just left a platform
        if (DEBUG_MODE) {
            debugLog(`Player left platform. VelocityY=${playerVelocityY.toFixed(2)}`);
        }
    }
    
    // Update platform state
    isOnPlatform = onPlatform;
    
    // If player is falling and not on a platform, they are jumping
    if (playerVelocityY < 0 && !onPlatform) {
        isJumping = true;
    }
    
    // Update exposed variable for testing
    window.isOnPlatform = isOnPlatform;
}

// Check Coin Collisions
function checkCoinCollisions() {
    const playerX = parseInt(player.style.left);
    const playerY = parseInt(player.style.bottom);
    const playerWidth = 50;
    const playerHeight = 60;
    
    coins.forEach(coin => {
        if (!coin.collected &&
            playerX + playerWidth > coin.x &&
            playerX < coin.x + coin.width &&
            playerY + playerHeight > coin.y &&
            playerY < coin.y + coin.height) {
            
            // Collect coin
            coin.collected = true;
            coin.element.style.display = 'none';
            
            // Update score
            score++;
            scoreDisplay.textContent = score;
            
            // Play coin sound
            playSound('coin');
        }
    });
}

// Check Goal Collision
function checkGoalCollision() {
    const playerX = parseInt(player.style.left);
    const playerY = parseInt(player.style.bottom);
    const playerWidth = 50;
    const playerHeight = 60;
    
    const goalX = parseInt(goal.style.left);
    const goalY = parseInt(goal.style.bottom);
    
    if (playerX + playerWidth > goalX &&
        playerX < goalX + 50 &&
        playerY + playerHeight > goalY &&
        playerY < goalY + 80) {
        
        isLevelComplete = true;
        messageContent.textContent = 'Level Complete! ';
        gameMessage.style.display = 'block';
        
        // Play success sound
        playSound('success');
    }
}

// Update Viewport
function updateViewport() {
    const playerX = parseInt(player.style.left);
    
    // Calculate target viewport position (center player horizontally)
    const targetViewportX = playerX - window.innerWidth / 2 + 25;
    
    // Smoothly move viewport towards target position
    viewportX += (targetViewportX - viewportX) * 0.1;
    
    // Clamp viewport to game world boundaries
    viewportX = Math.max(0, Math.min(viewportX, gameWorldWidth - window.innerWidth));
    
    // Apply viewport position
    gameWorld.style.transform = `translateX(-${viewportX}px)`;
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (isGameOver || isLevelComplete) {
        // Allow restart with any key when game is over
        if (e.key === ' ' || e.key === 'Enter') {
            initGame();
            return;
        }
    }
    
    if (e.key === 'ArrowLeft') {
        playerVelocityX = -MOVE_SPEED;
        playerFacing = 'left';
        player.classList.remove('face-right');
        player.classList.add('face-left');
    } else if (e.key === 'ArrowRight') {
        playerVelocityX = MOVE_SPEED;
        playerFacing = 'right';
        player.classList.remove('face-left');
        player.classList.add('face-right');
    } else if (e.key === ' ' && isOnPlatform && !isJumping) {
        playerVelocityY = JUMP_POWER;
        isJumping = true;
        isOnPlatform = false;
        
        debugLog(`Jump initiated: VelocityY=${playerVelocityY}, isJumping=${isJumping}, isOnPlatform=${isOnPlatform}`);
        
        // Play jump sound
        playSound('jump');
    } else if (e.key === 'd') {
        // Toggle debug mode with 'd' key
        window.DEBUG_MODE = !window.DEBUG_MODE;
        console.log(`Debug mode ${window.DEBUG_MODE ? 'enabled' : 'disabled'}`);
        
        if (!window.DEBUG_MODE) {
            // Remove debug elements when disabling
            const debugInfo = document.getElementById('debug-info');
            if (debugInfo) document.body.removeChild(debugInfo);
            
            if (debugPanel) document.body.removeChild(debugPanel);
            debugPanel = null;
        }
    } else if (e.key === 'l') {
        // Toggle debug log panel with 'l' key
        toggleDebugPanel();
    } else if (e.key === 'r') {
        // Reset game with 'r' key for quick testing
        debugLog("Game reset manually");
        initGame();
    } else if (e.key === 't') {
        // Toggle test controls visibility with 't' key
        const testControls = document.getElementById('test-controls');
        if (testControls) {
            testControls.style.display = testControls.style.display === 'none' ? 'block' : 'none';
            debugLog(`Test controls ${testControls.style.display === 'none' ? 'hidden' : 'shown'}`);
        }
        
        // Also hide any test results that might be visible
        const testResults = document.getElementById('test-results');
        if (testResults) {
            document.body.removeChild(testResults);
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' && playerVelocityX < 0) {
        playerVelocityX = 0;
    } else if (e.key === 'ArrowRight' && playerVelocityX > 0) {
        playerVelocityX = 0;
    }
});

// Window resize event
window.addEventListener('resize', () => {
    // Update game world height
    gameWorldHeight = window.innerHeight;
    
    // Update viewport constraints
    updateViewport();
});

// Function to manually test platform collision
window.testPlatformCollision = function() {
    // Create a test platform
    const testPlatform = {
        element: document.createElement('div'),
        x: 100,
        y: 100,
        width: 100,
        height: 20
    };
    
    // Create a test player if it doesn't exist
    let testPlayer;
    if (!player) {
        testPlayer = document.createElement('div');
        testPlayer.className = 'player';
        testPlayer.style.left = '150px';
        testPlayer.style.bottom = '110px';
        document.body.appendChild(testPlayer);
        player = testPlayer;
    }
    
    // Save original values
    const originalPlatforms = platforms ? platforms.slice() : [];
    const originalPlayerX = player.style.left;
    const originalPlayerY = player.style.bottom;
    const originalVelocityY = playerVelocityY;
    const originalIsOnPlatform = isOnPlatform;
    
    try {
        // Set up test conditions
        platforms = [testPlatform];
        player.style.left = '150px';
        player.style.bottom = '110px';
        playerVelocityY = -5; // Moving downward
        isOnPlatform = false;
        window.isOnPlatform = false;
        
        // Run collision detection
        checkPlatformCollisions();
        
        // Get result
        const result = isOnPlatform;
        
        // Restore original values
        platforms = originalPlatforms;
        player.style.left = originalPlayerX;
        player.style.bottom = originalPlayerY;
        playerVelocityY = originalVelocityY;
        isOnPlatform = originalIsOnPlatform;
        window.isOnPlatform = originalIsOnPlatform;
        
        // Clean up test player if we created one
        if (testPlayer) {
            document.body.removeChild(testPlayer);
            player = null;
        }
        
        return result;
    } catch (error) {
        // Clean up in case of error
        platforms = originalPlatforms;
        player.style.left = originalPlayerX;
        player.style.bottom = originalPlayerY;
        playerVelocityY = originalVelocityY;
        isOnPlatform = originalIsOnPlatform;
        window.isOnPlatform = originalIsOnPlatform;
        
        if (testPlayer) {
            document.body.removeChild(testPlayer);
            player = null;
        }
        
        console.error("Test platform collision error:", error);
        return false;
    }
};

// Expose functions and variables for testing
window.initGame = initGame;
window.checkCoinCollisions = checkCoinCollisions;
window.checkPlatformCollisions = checkPlatformCollisions;
window.checkGoalCollision = checkGoalCollision;
window.player = player;
window.platforms = platforms;
window.isOnPlatform = isOnPlatform;
window.playerVelocityY = playerVelocityY;

// Initialize the game
initGame();

// Add event listener to restart game on page refresh
window.addEventListener('beforeunload', () => {
    // This doesn't actually do anything functional,
    // but it's here to indicate that the game will restart on refresh
});

// Add event listener for the restart button
document.getElementById('restart-button').addEventListener('click', () => {
    initGame();
});
