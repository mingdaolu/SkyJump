# SkyJump City - A Multi-Level Platformer Game

A fun, kid-friendly platformer game where players jump between floating platforms, collect coins, and reach the goal flag across multiple levels with increasing difficulty.

## 🎮 Game Overview

SkyJump City is a web-based platformer game designed for kids around 10 years old. The game features:

- Two distinct levels with progressive difficulty
- Colorful, cartoon-style graphics with SVG-based visuals
- Simple controls for easy gameplay
- Randomly generated floating platforms to jump between
- Collectible coins to increase score
- A goal flag to complete each level
- Level progression system with unlockable levels
- Game restart if the player falls

### Level 1: Beginner Skies
- Daytime setting with bright blue sky
- Static platforms for easier navigation
- Basic coin collection
- Decorative elements like sun, clouds, and birds

### Level 2: Night Jump
- Night-time setting with purple sky and stars
- Moving platforms (horizontal and vertical)
- Obstacles (red spikes) that bounce the player
- Power-ups (blue stars) that grant super jump ability
- Double points for coin collection
- More challenging platform spacing

## 🕹️ How to Play

### Basic Controls
- Use the **Left Arrow (←)** and **Right Arrow (→)** keys to move
- Press **Spacebar** to jump
- Collect coins for a higher score (double points in Level 2)
- Reach the flag to complete the level
- Don't fall off the platforms!
- When game over, press **Spacebar** or **Enter** to restart

### Level Progression
- Complete Level 1 to unlock Level 2
- Click the "Go to Level 2" button after completing Level 1
- You can return to Level 1 from Level 2 at any time

### Special Features in Level 2
- **Moving Platforms**: Some platforms move horizontally or vertically
- **Obstacles**: Red spike triangles will bounce you away if touched
- **Power-ups**: Collect blue stars for temporary super jump ability (15% higher jumps)
- **Adaptive Difficulty**: Level 2 has a slightly higher jump power (5% increase)

## 🚀 Running the Game

You can run the game in two ways:

### Local File Method
Simply open the `index.html` file in any modern web browser to start playing Level 1. No server setup required!

### Local Server Method (Recommended)
For the best experience, especially with level transitions:

1. Start a local server in the game directory:
   ```bash
   python -m http.server
   ```
   or
   ```bash
   python3 -m http.server
   ```

2. Open your browser and navigate to:
   - Level 1: http://localhost:8000/index.html
   - Level 2: http://localhost:8000/level2.html

This method ensures all assets load correctly and level transitions work smoothly.

## 🔧 Developer Tools

The game includes several hidden developer tools that can be accessed with keyboard shortcuts:

- Press **D** to toggle debug mode (shows player position and state)
- Press **L** to toggle debug log panel (shows detailed game events)
- Press **T** to toggle test controls panel
- Press **R** to manually reset the game

## 🧪 Testing

The game includes a comprehensive test suite to verify all functionality:

1. Click the "Run Tests" button in the bottom-right corner (or press T to show it)
2. View test results in the popup panel
3. Tests verify platform generation, collision detection, player movement, and more

## 👨‍💻 Technical Details

### Technologies Used
The game is built using:
- HTML5
- CSS3 (with animations and SVG graphics)
- Vanilla JavaScript (no frameworks)

### Project Structure
- `index.html` - Level 1 game page
- `level2.html` - Level 2 game page
- `script.js` - Level 1 game logic
- `level2-script.js` - Level 2 game logic
- `style.css` - Main game styling
- `level2-style.css` - Level 2 specific styling
- `test.js` - Test suite for game functionality

### Implementation Features
- **Physics Engine**: Custom gravity and collision detection
- **Procedural Generation**: Random platform layouts that are different each game
- **State Management**: Game state tracking for level progression
- **Responsive Design**: Adapts to different screen sizes
- **Animation Effects**: CSS and SVG animations for visual polish
- **Testing Framework**: Built-in test suite for quality assurance
- Vanilla JavaScript (no external libraries)
- Responsive design that fits any browser window

## 🎨 Design Features

- Kid-friendly cartoon graphics with gradient colors
- Animated player character with jumping effects
- Glowing coins with bounce animations
- Waving goal flag
- Decorative elements (sun, clouds, birds, stars)
- Smooth camera scrolling that follows the player
- Responsive design for different screen sizes

## 🛠️ Recent Improvements

- Fixed platform collision detection to prevent falling through platforms
- Added proper game over detection when player falls
- Improved player starting position
- Enhanced random platform generation to ensure jumpable distances
- Added debug tools for development and testing
- Ensured the game fits the full browser window
- Repositioned instructions for better visibility
- Added comprehensive test suite

## 🔮 Future Enhancements

- Additional levels with increasing difficulty
- Sound effects and background music
- Mobile touch controls
- More collectible items and obstacles
- Character customization

Enjoy playing SkyJump City!
