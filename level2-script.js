// Game Constants
const GRAVITY = 0.5; // Reduced gravity for easier jumping
const JUMP_POWER = 15.75; // 5% higher jump power than level 1 (15 * 1.05 = 15.75)
const MOVE_SPEED = 6; // Faster movement speed
const PLATFORM_COUNT = 15; // More platforms for more landing spots
const COIN_COUNT = 10; // More coins for more rewards
const CLOUD_COUNT = 5;
const BIRD_COUNT = 3;
const STAR_COUNT = 15; // More stars for night sky
const MIN_PLATFORM_WIDTH = 100; // Wider platforms for easier landing
const MAX_PLATFORM_WIDTH = 200; // Wider maximum platform width
const OBSTACLE_COUNT = 3; // Fewer obstacles
const POWER_UP_COUNT = 5; // More power-ups to help the player
const MOVING_PLATFORM_CHANCE = 0.25; // Reduced chance for platforms to move
const DEBUG_MODE = false; // Debug mode off by default
const SHOW_DEBUG_PANEL = false; // Control debug panel visibility separately

// Game Variables
let player;
let platforms = [];
let coins = [];
let clouds = [];
let birds = [];
let stars = [];
let obstacles = []; // New: obstacles array
let powerUps = []; // New: power-ups array
let goal;
let score = 0;
let isGameOver = false;
let isLevelComplete = false;
let playerVelocityY = 0;
let playerVelocityX = 0;
let playerFacing = 'right';
let isJumping = false;
let isOnPlatform = false;
let hasSuperJump = false; // New: power-up effect
let superJumpTimeLeft = 0; // New: power-up duration
let gameWorldWidth = 2500; // Increased game world width for level 2
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
        Super Jump: ${hasSuperJump ? superJumpTimeLeft + 's' : 'No'}<br>
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
    obstacles = [];
    powerUps = [];
    score = 0;
    isGameOver = false;
    isLevelComplete = false;
    playerVelocityY = 0;
    playerVelocityX = 0;
    playerFacing = 'right';
    isJumping = false;
    isOnPlatform = false;
    hasSuperJump = false;
    superJumpTimeLeft = 0;
    viewportX = 0;
    scoreDisplay.textContent = '0';
    gameMessage.style.display = 'none';
    
    debugLog("Initializing game...");
    
    // Update game world dimensions based on window size
    gameWorldHeight = window.innerHeight;
    gameWorldWidth = Math.max(2500, window.innerWidth * 2.5); // Make sure game world is larger for level 2
    
    debugLog(`Game world dimensions: ${gameWorldWidth}x${gameWorldHeight}`);
    
    // Create moon (instead of sun for level 2)
    const moon = document.createElement('div');
    moon.className = 'moon';
    gameWorld.appendChild(moon);
    
    // Create starting platform (always in the same position for player to start on)
    const startingPlatformY = 100; // Higher starting platform for level 2
    const startingPlatformHeight = 20; // Platform height is 20px
    createPlatform(0, startingPlatformY, 300); // Wider starting platform for level 2
    
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
    
    // Generate obstacles (new for level 2)
    generateRandomObstacles();
    
    // Generate power-ups (new for level 2)
    generateRandomPowerUps();
    
    // Create goal at a random position near the end
    createRandomGoal();
    
    // Create stars (more for level 2 night sky)
    for (let i = 0; i < STAR_COUNT; i++) {
        createStar(
            Math.random() * gameWorldWidth,
            Math.random() * 400 + 50
        );
    }
    
    // Create clouds (fewer for night sky)
    for (let i = 0; i < CLOUD_COUNT; i++) {
        createCloud(
            Math.random() * gameWorldWidth,
            Math.random() * (gameWorldHeight - 100) + 300,
            Math.random() * 0.5 + 0.5
        );
    }
    
    // Create birds for the background
    for (let i = 0; i < BIRD_COUNT; i++) {
        createBird(
            Math.random() * gameWorldWidth,
            Math.random() * 300 + 200
        );
    }
    
    debugLog(`Game initialization complete. Created ${platforms.length} platforms, ${coins.length} coins, ${obstacles.length} obstacles, ${powerUps.length} power-ups.`);
    
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
    // Define parameters for jumpable distances - easier for level 2
    const minHorizontalGap = 60;  // Smaller minimum gap for easier jumps
    const maxHorizontalGap = 140; // Smaller maximum gap for easier jumps
    const maxVerticalGap = 80;    // Smaller vertical gap for easier jumps
    
    let lastX = 300; // Start after the initial platform (wider gap to ensure first platform is visible)
    let lastY = 100;  // Start at the same height as initial platform (matching our new starting platform height)
    
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
            verticalChange = Math.random() * 90 + 30; // Higher jumps for level 2
        } else if (verticalDirection === -1) {
            // Going down - can go lower with no jump limitations
            verticalChange = Math.random() * 120 + 30;
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
        const coinY = platform.y + 40 + Math.random() * 80; // 40-120px above platform for level 2
        
        createCoin(coinX, coinY);
    }
}

// Generate Random Obstacles (new for level 2)
function generateRandomObstacles() {
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
        // Choose a random platform (excluding the first one and last one)
        const platformIndex = Math.floor(Math.random() * (platforms.length - 2)) + 1;
        const platform = platforms[platformIndex];
        
        // Position obstacle on the platform
        const obstacleX = platform.x + Math.random() * (platform.width - 40);
        const obstacleY = platform.y + 20; // Place on top of platform
        
        createObstacle(obstacleX, obstacleY);
    }
}

// Generate Random Power-Ups (new for level 2)
function generateRandomPowerUps() {
    for (let i = 0; i < POWER_UP_COUNT; i++) {
        // Choose a random platform (excluding the first one and last one)
        const platformIndex = Math.floor(Math.random() * (platforms.length - 2)) + 1;
        const platform = platforms[platformIndex];
        
        // Position power-up above the platform
        const powerUpX = platform.x + Math.random() * (platform.width - 30);
        const powerUpY = platform.y + 60 + Math.random() * 80; // 60-140px above platform
        
        createPowerUp(powerUpX, powerUpY);
    }
}

// Create Goal at fixed position at the end
function createRandomGoal() {
    // Find the last platform to determine where the level ends
    let maxX = 0;
    let endPlatform = null;
    
    // Find the platform with the highest X position (furthest right)
    for (const platform of platforms) {
        const platformEndX = platform.x + platform.width;
        if (platformEndX > maxX) {
            maxX = platformEndX;
            endPlatform = platform;
        }
    }
    
    // Create a dedicated platform for the flag if needed
    if (!endPlatform) {
        console.error('No platforms found for goal placement');
        return;
    }
    
    // Create a special platform at the very end for the flag
    const flagPlatformX = maxX + 200; // Place it 200px after the last platform
    const flagPlatformY = endPlatform.y; // Same height as the last platform
    const flagPlatformWidth = 150;
    
    // Create the flag platform
    createPlatform(flagPlatformX, flagPlatformY, flagPlatformWidth);
    
    // Create the goal flag on this platform
    goal = document.createElement('div');
    goal.className = 'goal';
    goal.style.left = `${flagPlatformX + flagPlatformWidth/2 - 25}px`; // Center on flag platform
    goal.style.bottom = `${flagPlatformY + 80}px`; // Position above platform
    goal.style.zIndex = '50'; // Ensure flag appears above other elements
    gameWorld.appendChild(goal);
    
    // Make the flag extra visible
    goal.style.transform = 'scale(1.5)'; // Make the flag 50% larger
    
    // Log goal creation for debugging
    console.log(`Goal created at X=${flagPlatformX + flagPlatformWidth/2 - 25}, Y=${flagPlatformY + 80}`);
    console.log(`Flag platform created at X=${flagPlatformX}, Y=${flagPlatformY}, Width=${flagPlatformWidth}`);
}

// Create Platform
function createPlatform(x, y, width) {
    const platform = document.createElement('div');
    platform.className = 'platform';
    
    // For level 2, some platforms move
    if (Math.random() < MOVING_PLATFORM_CHANCE) {
        if (Math.random() < 0.5) {
            platform.classList.add('moving-horizontal');
        } else {
            platform.classList.add('moving-vertical');
        }
    }
    
    platform.style.left = `${x}px`;
    platform.style.bottom = `${y}px`;
    platform.style.width = `${width}px`;
    gameWorld.appendChild(platform);
    
    const platformObj = {
        element: platform,
        x: x,
        y: y,
        width: width,
        height: 20,
        isMoving: platform.classList.contains('moving-horizontal') || platform.classList.contains('moving-vertical'),
        movementType: platform.classList.contains('moving-horizontal') ? 'horizontal' : 
                      platform.classList.contains('moving-vertical') ? 'vertical' : null
    };
    
    platforms.push(platformObj);
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

// Create Obstacle (new for level 2)
function createObstacle(x, y) {
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    obstacle.style.left = `${x}px`;
    obstacle.style.bottom = `${y}px`;
    gameWorld.appendChild(obstacle);
    obstacles.push({
        element: obstacle,
        x: x,
        y: y,
        width: 40,
        height: 40
    });
}

// Create Power-Up (new for level 2)
function createPowerUp(x, y) {
    const powerUp = document.createElement('div');
    powerUp.className = 'power-up';
    powerUp.style.left = `${x}px`;
    powerUp.style.bottom = `${y}px`;
    gameWorld.appendChild(powerUp);
    powerUps.push({
        element: powerUp,
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
    
    // For level 2, use a different color scheme for night birds
    bird.style.filter = `hue-rotate(${Math.random() * 60 + 180}deg) brightness(1.5)`;
    
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
    
    // Safety timer to prevent falling through platform at start
    if (safetyStartTimer < 10) {
        safetyStartTimer++;
        playerVelocityY = 0; // No gravity for first few frames
        isOnPlatform = true;
    } else {
        // Apply gravity after safety period
        playerVelocityY -= GRAVITY;
    }
    
    // Apply super jump power-up effect if active
    if (hasSuperJump) {
        // Reduce timer
        superJumpTimeLeft -= 1/60; // Assuming 60fps
        
        if (superJumpTimeLeft <= 0) {
            hasSuperJump = false;
            player.style.filter = ''; // Remove glow effect
            debugLog('Super jump power-up expired');
        }
    }
    
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
        debugLog(`Player position: X=${playerX}, Y=${playerY}, VelocityY=${playerVelocityY.toFixed(2)}, OnPlatform=${isOnPlatform}, Jumping=${isJumping}, SuperJump=${hasSuperJump}`);
    }
    
    // Update exposed variables for testing
    window.playerVelocityY = playerVelocityY;
}

// Check if player is still on any platform (called every frame)
function checkPlayerStillOnPlatform() {
    // Skip if player is jumping or already falling
    if (isJumping || playerVelocityY < 0) return;
    
    const playerX = parseInt(player.style.left);
    const playerY = parseInt(player.style.bottom);
    const playerWidth = 50;
    
    // Check if player is still on any platform
    let stillOnPlatform = false;
    
    for (const platform of platforms) {
        // For moving platforms, use their current position
        const platformX = platform.isMoving && platform.movementType === 'horizontal' ? 
                         platform.currentX : platform.x;
        const platformY = platform.isMoving && platform.movementType === 'vertical' ? 
                         platform.currentY : platform.y;
        
        // Check horizontal overlap
        const horizontalOverlap = playerX + playerWidth > platformX && playerX < platformX + platform.width;
        
        // Check if player is on top of platform
        const onTopOfPlatform = Math.abs(playerY - platformY) <= 5;
        
        if (horizontalOverlap && onTopOfPlatform) {
            stillOnPlatform = true;
            
            // If player wasn't on a platform before, update their position
            if (!isOnPlatform) {
                player.style.bottom = `${platformY}px`;
                playerVelocityY = 0;
            }
            
            isOnPlatform = true;
            break;
        }
    }
    
    // If player is not on any platform, start falling
    if (!stillOnPlatform) {
        isOnPlatform = false;
        
        // Only reset velocity if we're not already falling
        if (playerVelocityY >= 0) {
            playerVelocityY = 0; // Start falling from rest
        }
        
        if (DEBUG_MODE && isOnPlatform) {
            debugLog('Player no longer on any platform - starting to fall');
        }
    }
}

// Game Loop
function gameLoop() {
    // Check for game over condition first - player is below screen
    const playerY = parseInt(player.style.bottom);
    // Only check for game over after safety period and give more space
    if (playerY <= -200 && !isGameOver && safetyStartTimer >= 10) {
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
    
    // Update moving platforms
    updateMovingPlatforms();
    
    // Continuously check if player is still on any platform
    checkPlayerStillOnPlatform();
    
    // Check collisions (platform check must come before other checks)
    checkPlatformCollisions();
    checkCoinCollisions();
    checkObstacleCollisions(); // New for level 2
    checkPowerUpCollisions(); // New for level 2
    checkGoalCollision();
    
    // Update viewport
    updateViewport();
    
    // Update power-up effects
    updatePowerUpEffects();
    
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

// Update Moving Platforms (new for level 2)
function updateMovingPlatforms() {
    platforms.forEach(platform => {
        if (!platform.isMoving) return;
        
        // Get current position from the DOM element
        const currentTransform = platform.element.style.transform || '';
        let currentX = 0;
        let currentY = 0;
        
        // Extract current translation values if they exist
        const translateMatch = currentTransform.match(/translateX\((\d+)px\)/) || 
                              currentTransform.match(/translateY\((\d+)px\)/);
        
        // Store previous position to check if player needs to move with platform
        const prevX = platform.currentX || platform.x;
        const prevY = platform.currentY || platform.y;
        
        if (platform.movementType === 'horizontal') {
            // Update platform's position in the game state
            // We don't need to manually update the DOM element as CSS animation handles that
            // But we need to update our collision detection coordinates
            
            // Calculate approximate position based on time
            const time = Date.now() / 1000; // Current time in seconds
            const cycle = time % 8; // 8 seconds for a complete cycle (4s each way)
            const normalizedPosition = cycle < 4 ? cycle / 4 : 2 - (cycle / 4); // 0 to 1 to 0
            const offset = normalizedPosition * 100; // 0 to 100px
            
            // Update platform's x position in our game state
            platform.currentX = platform.x + offset;
            
            // If player is on this platform, move them with it
            if (isOnPlatform) {
                const playerX = parseInt(player.style.left);
                const playerY = parseInt(player.style.bottom);
                const playerWidth = 50;
                
                // Check if player is on this specific platform
                if (playerX + playerWidth > prevX && 
                    playerX < prevX + platform.width &&
                    Math.abs(playerY - prevY) <= 5) {
                    
                    // Move player with platform
                    const deltaX = platform.currentX - prevX;
                    player.style.left = `${playerX + deltaX}px`;
                }
            }
        } 
        else if (platform.movementType === 'vertical') {
            // Calculate approximate position for vertical movement
            const time = Date.now() / 1000;
            const cycle = time % 6; // 6 seconds for a complete cycle (3s each way)
            const normalizedPosition = cycle < 3 ? cycle / 3 : 2 - (cycle / 3); // 0 to 1 to 0
            const offset = normalizedPosition * 50; // 0 to 50px
            
            // Update platform's y position in our game state
            platform.currentY = platform.y + offset;
            
            // If player is on this platform, move them with it
            if (isOnPlatform) {
                const playerX = parseInt(player.style.left);
                const playerY = parseInt(player.style.bottom);
                const playerWidth = 50;
                
                // Check if player is on this specific platform
                if (playerX + playerWidth > prevX && 
                    playerX < prevX + platform.width &&
                    Math.abs(playerY - prevY) <= 5) {
                    
                    // Move player with platform
                    const deltaY = platform.currentY - prevY;
                    player.style.bottom = `${playerY + deltaY}px`;
                }
            }
        }
    });
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
        // For moving platforms, use their current position
        const platformX = platform.isMoving && platform.movementType === 'horizontal' ? 
                         platform.currentX : platform.x;
        const platformY = platform.isMoving && platform.movementType === 'vertical' ? 
                         platform.currentY : platform.y;
        
        // Check horizontal overlap
        const horizontalOverlap = playerX + playerWidth > platformX && playerX < platformX + platform.width;
        
        // Check if player is on top of platform (with a small margin)
        const onTopOfPlatform = Math.abs(playerY - platformY) <= 2;
        
        if (horizontalOverlap && onTopOfPlatform) { 
            // Keep player on platform
            player.style.bottom = `${platformY}px`;
            playerVelocityY = 0;
            isJumping = false;
            isOnPlatform = true;
            platform.playerIsOn = true; // Mark this platform as the one player is on
            
            // Mark all other platforms as not having the player on them
            platforms.forEach(p => {
                if (p !== platform) {
                    p.playerIsOn = false;
                }
            });
            
            if (DEBUG_MODE) {
                debugLog(`Player maintained on platform at Y=${platformY}`);
            }
            
            // Update exposed variable for testing
            window.isOnPlatform = true;
            return; // Exit early, no need to check other platforms
        } else if (platform.playerIsOn) {
            // Player was on this platform but is no longer on it
            platform.playerIsOn = false;
            
            // Check if player is still within horizontal bounds but not on top
            if (horizontalOverlap && playerY > platformY && playerY < platformY + 30) {
                // Do nothing, normal collision will handle this
            } else {
                // Player has moved off the platform horizontally or vertically
                // Make sure they start falling if not already on another platform
                if (isOnPlatform && !isJumping) {
                    isOnPlatform = false;
                    if (playerVelocityY >= 0) {
                        playerVelocityY = 0; // Start falling from rest
                    }
                    
                    if (DEBUG_MODE) {
                        debugLog(`Player moved off platform at X=${platformX}, Y=${platformY}`);
                    }
                }
            }
        }
    }
    
    // If player is not already on a platform, check for new collisions
    platforms.forEach(platform => {
        // For moving platforms, use their current position
        const platformX = platform.isMoving && platform.movementType === 'horizontal' ? 
                         platform.currentX : platform.x;
        const platformY = platform.isMoving && platform.movementType === 'vertical' ? 
                         platform.currentY : platform.y;
        
        // Check if player is within horizontal bounds of the platform
        const horizontalCollision = 
            playerX + playerWidth > platformX && 
            playerX < platformX + platform.width;
        
        // Check if player is at the right height to land on the platform
        // Only consider landing if player is above the platform and falling down onto it
        const verticalCollision = 
            playerY > platformY - 5 && // Player is slightly above platform
            playerY < platformY + 15 && // Not too far above
            playerVelocityY <= 0; // Player is falling
        
        if (horizontalCollision && verticalCollision) {
            // If this platform is higher than previously found platforms, use this one
            if (platformY > highestPlatformY) {
                highestPlatformY = platformY;
                collidingPlatform = platform;
                onPlatform = true;
                
                // Mark this platform as the one player will be on
                platform.playerIsOn = true;
                
                // Mark all other platforms as not having the player on them
                platforms.forEach(p => {
                    if (p !== platform) {
                        p.playerIsOn = false;
                    }
                });
                
                if (DEBUG_MODE) {
                    debugLog(`Platform collision detected: Platform at X=${platformX}, Y=${platformY}, Width=${platform.width}`);
                }
            }
        }
    });
    
    // If player is on a platform, position them on top of the highest one
    if (onPlatform && collidingPlatform) {
        // For moving platforms, use their current position
        const platformY = collidingPlatform.isMoving && collidingPlatform.movementType === 'vertical' ? 
                         collidingPlatform.currentY : collidingPlatform.y;
        
        player.style.bottom = `${platformY}px`;
        playerVelocityY = 0;
        isJumping = false;
        
        if (DEBUG_MODE && !isOnPlatform) {
            debugLog(`Player landed on platform at Y=${platformY}`);
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
            score += 2; // Double points in level 2
            scoreDisplay.textContent = score;
            
            // Play coin sound
            playSound('coin');
        }
    });
}

// Check Obstacle Collisions (new for level 2)
function checkObstacleCollisions() {
    const playerX = parseInt(player.style.left);
    const playerY = parseInt(player.style.bottom);
    const playerWidth = 50;
    const playerHeight = 60;
    
    obstacles.forEach(obstacle => {
        // Calculate actual obstacle position (they might be on moving platforms)
        let obstacleX = obstacle.x;
        let obstacleY = obstacle.y;
        
        // Store if this obstacle was already hit to prevent multiple bounces
        if (!obstacle.hasOwnProperty('wasHit')) {
            obstacle.wasHit = false;
        }
        
        // Reset hit status if player is far enough away
        if (obstacle.wasHit) {
            const distanceX = Math.abs((playerX + playerWidth/2) - (obstacleX + obstacle.width/2));
            const distanceY = Math.abs((playerY + playerHeight/2) - (obstacleY + obstacle.height/2));
            if (distanceX > 100 || distanceY > 100) {
                obstacle.wasHit = false;
            }
        }
        
        // Check collision
        if (!obstacle.wasHit && 
            playerX + playerWidth > obstacleX &&
            playerX < obstacleX + obstacle.width &&
            playerY + playerHeight > obstacleY &&
            playerY < obstacleY + obstacle.height) {
            
            // Mark as hit to prevent multiple bounces
            obstacle.wasHit = true;
            
            // Player hit an obstacle - bounce them back and up a bit, but less aggressively
            playerVelocityY = Math.max(playerVelocityY, 8); // Gentler bounce up
            
            // Bounce left or right depending on which side they hit from, but less aggressively
            if (playerX + playerWidth/2 < obstacleX + obstacle.width/2) {
                playerVelocityX = -5; // Gentler bounce left
            } else {
                playerVelocityX = 5; // Gentler bounce right
            }
            
            // Add a visual feedback
            player.style.filter = 'brightness(2) hue-rotate(320deg)';
            setTimeout(() => {
                player.style.filter = '';
            }, 300);
            
            // Play hit sound
            playSound('hit');
            
            if (DEBUG_MODE) {
                debugLog(`Player hit obstacle at X=${obstacleX}, Y=${obstacleY}`);
            }
        }
    });
}

// Check Power-Up Collisions (new for level 2)
function checkPowerUpCollisions() {
    const playerX = parseInt(player.style.left);
    const playerY = parseInt(player.style.bottom);
    const playerWidth = 50;
    const playerHeight = 60;
    
    powerUps.forEach(powerUp => {
        if (!powerUp.collected &&
            playerX + playerWidth > powerUp.x &&
            playerX < powerUp.x + powerUp.width &&
            playerY + playerHeight > powerUp.y &&
            playerY < powerUp.y + powerUp.height) {
            
            // Collect power-up
            powerUp.collected = true;
            powerUp.element.style.display = 'none';
            
            // Apply super jump power-up
            hasSuperJump = true;
            superJumpTimeLeft = 10; // 10 seconds of super jump (doubled duration)
            
            // Add visual effect to player
            player.style.filter = 'drop-shadow(0 0 10px cyan)';
            
            // Play power-up sound
            playSound('powerup');
            
            debugLog('Power-up collected: Super Jump activated for 5 seconds');
        }
    });
}

// Update Power-Up Effects (new for level 2)
function updatePowerUpEffects() {
    // Nothing to do if no power-ups are active
    if (!hasSuperJump) return;
    
    // Super jump effect - already handled in updatePlayerPosition
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
        messageContent.textContent = 'Level 2 Complete! ';
        gameMessage.style.display = 'block';
        
        // Show both the restart button and level 1 button
        const restartButton = document.getElementById('restart-button');
        if (restartButton) restartButton.style.display = 'inline-block';
        
        const level1Button = document.getElementById('level1-button');
        if (level1Button) level1Button.style.display = 'inline-block';
        
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
        // Super jump if power-up is active
        if (hasSuperJump) {
            playerVelocityY = JUMP_POWER * 1.15; // 15% higher jump boost
            debugLog('Super jump activated!');
        } else {
            playerVelocityY = JUMP_POWER;
        }
        
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

// Add event listener for the restart button
document.getElementById('restart-button').addEventListener('click', () => {
    initGame();
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

// Function to check if game is over
window.checkGameOver = function() {
    // Get player position
    const playerY = parseInt(player.style.bottom);
    
    // Check if player is below the screen
    if (playerY <= -200 && !isGameOver) {
        isGameOver = true;
        messageContent.textContent = 'Game Over! Try Again';
        gameMessage.style.display = 'block';
        
        return true;
    }
    return false;
};

// Expose functions and variables for testing
window.initGame = initGame;
window.checkCoinCollisions = checkCoinCollisions;
window.checkPlatformCollisions = checkPlatformCollisions;
window.checkGoalCollision = checkGoalCollision;
window.checkObstacleCollisions = checkObstacleCollisions;
window.checkPowerUpCollisions = checkPowerUpCollisions;
window.player = player;
window.platforms = platforms;
window.isOnPlatform = isOnPlatform;
window.playerVelocityY = playerVelocityY;
window.isGameOver = isGameOver;
window.isLevelComplete = isLevelComplete;
window.goal = goal;

// Add a safety delay to ensure player doesn't fall through platform at start
let safetyStartTimer = 0;

// Initialize the game
initGame();
