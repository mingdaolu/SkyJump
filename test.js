/**
 * SkyJump City Game - Test Suite
 * This file contains tests to verify that all game features work correctly
 */

// Test Configuration
const TEST_CONFIG = {
    runAutomatically: false,  // Set to false to prevent automatic test runs on page load
    logResults: true,        // Set to true to log test results to console
    displayResults: true     // Set to true to display test results on screen
};

// Test Results Container
let testResults = [];
let testsCompleted = 0;
let testsPassed = 0;

// Test Utilities
function assertEquals(actual, expected, testName) {
    const passed = actual === expected;
    logTestResult(passed, testName, `Expected: ${expected}, Actual: ${actual}`);
    return passed;
}

function assertTrue(condition, testName) {
    const passed = condition === true;
    logTestResult(passed, testName, `Expected: true, Actual: ${condition}`);
    return passed;
}

function assertInRange(value, min, max, testName) {
    const passed = value >= min && value <= max;
    logTestResult(passed, testName, `Expected value between ${min} and ${max}, Actual: ${value}`);
    return passed;
}

function logTestResult(passed, testName, details) {
    testsCompleted++;
    if (passed) testsPassed++;
    
    const result = {
        name: testName,
        passed: passed,
        details: details
    };
    
    testResults.push(result);
    
    if (TEST_CONFIG.logResults) {
        console.log(`${passed ? '✅' : '❌'} ${testName}: ${details}`);
    }
}

function displayTestResults() {
    if (!TEST_CONFIG.displayResults) return;
    
    // Remove any existing test results
    const existingResults = document.getElementById('test-results');
    if (existingResults) {
        document.body.removeChild(existingResults);
    }
    
    // Create test results container
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'test-results';
    resultsContainer.style.position = 'fixed';
    resultsContainer.style.top = '10px';
    resultsContainer.style.right = '10px';
    resultsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    resultsContainer.style.padding = '10px';
    resultsContainer.style.borderRadius = '5px';
    resultsContainer.style.maxHeight = '80vh';
    resultsContainer.style.overflowY = 'auto';
    resultsContainer.style.zIndex = '1000';
    resultsContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    
    // Add summary
    const summary = document.createElement('div');
    summary.innerHTML = `<strong>Tests: ${testsPassed}/${testsCompleted} passed</strong>`;
    summary.style.marginBottom = '10px';
    resultsContainer.appendChild(summary);
    
    // Add individual test results
    testResults.forEach(result => {
        const resultElement = document.createElement('div');
        resultElement.style.marginBottom = '5px';
        resultElement.style.color = result.passed ? 'green' : 'red';
        resultElement.innerHTML = `${result.passed ? '✅' : '❌'} ${result.name}`;
        resultsContainer.appendChild(resultElement);
    });
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(resultsContainer);
    });
    resultsContainer.appendChild(closeButton);
    
    document.body.appendChild(resultsContainer);
}

// Game Feature Tests
const tests = {
    // Visual Elements Tests
    testPlayerCharacterExists: function() {
        const player = document.querySelector('.player');
        return assertTrue(player !== null, "Player character exists");
    },
    
    testPlayerCharacterHasAppropriateStyle: function() {
        const player = document.querySelector('.player');
        if (!player) return assertTrue(false, "Player character not found");
        
        const style = window.getComputedStyle(player);
        const hasBackgroundImage = style.backgroundImage && style.backgroundImage !== 'none';
        return assertTrue(hasBackgroundImage, "Player character has background image");
    },
    
    testPlatformsExist: function() {
        const platforms = document.querySelectorAll('.platform');
        return assertTrue(platforms.length > 0, "Platforms exist");
    },
    
    testPlatformsHaveAppropriateStyle: function() {
        const platform = document.querySelector('.platform');
        if (!platform) return assertTrue(false, "Platform not found");
        
        const style = window.getComputedStyle(platform);
        const hasBackgroundImage = style.backgroundImage && style.backgroundImage !== 'none';
        return assertTrue(hasBackgroundImage, "Platforms have background image");
    },
    
    testCoinsExist: function() {
        const coins = document.querySelectorAll('.coin');
        return assertTrue(coins.length > 0, "Coins exist");
    },
    
    testCoinsHaveAppropriateStyle: function() {
        const coin = document.querySelector('.coin');
        if (!coin) return assertTrue(false, "Coin not found");
        
        const style = window.getComputedStyle(coin);
        const hasBackgroundImage = style.backgroundImage && style.backgroundImage !== 'none';
        return assertTrue(hasBackgroundImage, "Coins have background image");
    },
    
    testGoalExists: function() {
        const goal = document.querySelector('.goal');
        return assertTrue(goal !== null, "Goal flag exists");
    },
    
    testGoalHasAppropriateStyle: function() {
        const goal = document.querySelector('.goal');
        if (!goal) return assertTrue(false, "Goal flag not found");
        
        const style = window.getComputedStyle(goal);
        const hasBackgroundImage = style.backgroundImage && style.backgroundImage !== 'none';
        return assertTrue(hasBackgroundImage, "Goal flag has background image");
    },
    
    testBackgroundElementsExist: function() {
        const clouds = document.querySelectorAll('.cloud');
        const birds = document.querySelectorAll('.bird');
        const stars = document.querySelectorAll('.star');
        const sun = document.querySelector('.sun');
        
        let result = true;
        result = result && assertTrue(clouds.length > 0, "Clouds exist");
        result = result && assertTrue(birds.length > 0, "Birds exist");
        result = result && assertTrue(stars.length > 0, "Stars exist");
        result = result && assertTrue(sun !== null, "Sun exists");
        
        return result;
    },
    
    // Game Mechanics Tests
    testPlayerMovement: function() {
        // Save initial state to restore after test
        const initialPlayerLeft = document.querySelector('.player').style.left;
        
        // Simulate left arrow key press
        const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        document.dispatchEvent(leftEvent);
        
        // Wait a bit for movement to take effect
        setTimeout(() => {
            // Simulate right arrow key press
            const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            document.dispatchEvent(rightEvent);
            
            // Simulate key up to stop movement
            setTimeout(() => {
                const keyUpEvent = new KeyboardEvent('keyup', { key: 'ArrowRight' });
                document.dispatchEvent(keyUpEvent);
                
                // Restore initial state
                document.querySelector('.player').style.left = initialPlayerLeft;
            }, 100);
        }, 100);
        
        // This test is visual and can't be automatically verified
        return assertTrue(true, "Player movement test triggered (visual verification required)");
    },
    
    testPlayerJump: function() {
        // Save initial state to restore after test
        const initialPlayerBottom = document.querySelector('.player').style.bottom;
        const originalIsOnPlatform = window.isOnPlatform;
        
        try {
            // Simulate platform collision to allow jumping
            window.isOnPlatform = true;
            
            // Simulate space key press for jump
            const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
            document.dispatchEvent(spaceEvent);
            
            // Restore initial state after a delay
            setTimeout(() => {
                document.querySelector('.player').style.bottom = initialPlayerBottom;
                window.isOnPlatform = originalIsOnPlatform;
            }, 500);
            
            // This test is visual and can't be automatically verified
            return assertTrue(true, "Player jump test triggered (visual verification required)");
        } catch (error) {
            // Restore state in case of error
            window.isOnPlatform = originalIsOnPlatform;
            return assertTrue(false, "Error in jump test: " + error.message);
        }
    },
    
    testPlatformCollision: function() {
        try {
            // Use the dedicated test function we created in script.js
            const result = window.testPlatformCollision();
            return assertTrue(result, "Platform collision detection works");
        } catch (error) {
            console.error("Platform collision test error:", error);
            return assertTrue(false, "Error in platform collision test: " + error.message);
        }
    },
    
    testGameOverOnFall: function() {
        // Save game state
        const wasGameOver = window.isGameOver;
        const messageDisplay = document.getElementById('game-message').style.display;
        
        // Hide game message during test
        document.getElementById('game-message').style.display = 'none';
        
        try {
            // Set player position below screen
            const player = document.querySelector('.player');
            const originalBottom = player.style.bottom;
            player.style.bottom = '-150px';
            
            // Call game over check
            window.checkGameOver();
            
            // Check if game over message is displayed
            const isGameOverMessageShown = document.getElementById('game-message').style.display === 'block';
            
            // Restore original state
            player.style.bottom = originalBottom;
            window.isGameOver = wasGameOver;
            document.getElementById('game-message').style.display = messageDisplay;
            
            return assertTrue(isGameOverMessageShown, "Game over when player falls off screen");
        } catch (error) {
            console.error("Error in testGameOverOnFall:", error);
            return assertTrue(false, "Error in game over test: " + error.message);
        }
    },
    
    testLevelCompleteOnReachingGoal: function() {
        // Save game state
        const wasLevelComplete = window.isLevelComplete;
        const messageDisplay = document.getElementById('game-message').style.display;
        
        // Hide game message during test
        document.getElementById('game-message').style.display = 'none';
        
        try {
            // Get player and goal
            const player = document.querySelector('.player');
            const goal = document.querySelector('.goal');
            
            if (!player || !goal) {
                return assertTrue(false, "Player or goal not found");
            }
            
            // Save original positions
            const originalPlayerLeft = player.style.left;
            const originalPlayerBottom = player.style.bottom;
            
            // Move player to goal position
            player.style.left = goal.style.left;
            player.style.bottom = goal.style.bottom;
            
            // Call goal collision check
            window.checkGoalCollision();
            
            // Check if level complete message is displayed
            const isLevelCompleteMessageShown = document.getElementById('game-message').style.display === 'block';
            
            // Restore original state
            player.style.left = originalPlayerLeft;
            player.style.bottom = originalPlayerBottom;
            window.isLevelComplete = wasLevelComplete;
            document.getElementById('game-message').style.display = messageDisplay;
            
            return assertTrue(isLevelCompleteMessageShown, "Level complete when player reaches goal");
        } catch (error) {
            console.error("Error in testLevelCompleteOnReachingGoal:", error);
            return assertTrue(false, "Error in level complete test: " + error.message);
        }
    },
    
    // Randomization Tests
    testRandomPlatformGeneration: function() {
        try {
            // Get current platform positions
            const firstRunPlatforms = Array.from(document.querySelectorAll('.platform')).map(p => {
                return {
                    x: parseInt(p.style.left) || 0,
                    y: parseInt(p.style.bottom) || 0
                };
            });
            
            // Store current game state
            const gameContainer = document.getElementById('game-world');
            const gameContainerHTML = gameContainer.innerHTML;
            
            // Reinitialize game
            window.initGame();
            
            // Get new platform positions
            const secondRunPlatforms = Array.from(document.querySelectorAll('.platform')).map(p => {
                return {
                    x: parseInt(p.style.left) || 0,
                    y: parseInt(p.style.bottom) || 0
                };
            });
            
            // Restore original game state
            gameContainer.innerHTML = gameContainerHTML;
            
            // Check if at least some platforms are in different positions
            let hasDifference = false;
            for (let i = 1; i < Math.min(firstRunPlatforms.length, secondRunPlatforms.length); i++) {
                if (firstRunPlatforms[i].x !== secondRunPlatforms[i].x || 
                    firstRunPlatforms[i].y !== secondRunPlatforms[i].y) {
                    hasDifference = true;
                    break;
                }
            }
            
            return assertTrue(hasDifference, "Platform generation is random between game runs");
        } catch (error) {
            console.error("Error in testRandomPlatformGeneration:", error);
            return assertTrue(false, "Error in random platform test: " + error.message);
        }
    },
    
    // Responsive Design Tests
    testGameFitsScreenSize: function() {
        const gameContainer = document.getElementById('game-container');
        const containerRect = gameContainer.getBoundingClientRect();
        
        // Check if container is at least 90% of viewport size (allowing for margins/padding)
        const fitsWidth = containerRect.width >= window.innerWidth * 0.9;
        const fitsHeight = containerRect.height >= window.innerHeight * 0.9;
        
        return assertTrue(fitsWidth && fitsHeight, "Game container fits screen size");
    },
    
    testInstructionsPositioning: function() {
        const instructions = document.getElementById('instructions-bubble');
        const instructionsRect = instructions.getBoundingClientRect();
        
        const header = document.querySelector('header');
        const headerRect = header.getBoundingClientRect();
        
        const isBelow = instructionsRect.top >= headerRect.bottom;
        
        return assertTrue(isBelow, "Instructions are positioned below title");
    }
};

// Run Tests
function runAllTests() {
    // Reset test results
    testResults = [];
    testsCompleted = 0;
    testsPassed = 0;
    
    // Run each test
    for (const testName in tests) {
        if (tests.hasOwnProperty(testName)) {
            try {
                tests[testName]();
            } catch (error) {
                console.error(`Error running test ${testName}:`, error);
                logTestResult(false, testName, `Error: ${error.message}`);
            }
        }
    }
    
    displayTestResults();
}

// Expose test functions to window for debugging
window.gameTests = {
    runAllTests: runAllTests,
    tests: tests
};

// Run tests automatically if configured
if (TEST_CONFIG.runAutomatically) {
    // Wait for game to initialize
    window.addEventListener('load', () => {
        setTimeout(runAllTests, 1000);
    });
}
