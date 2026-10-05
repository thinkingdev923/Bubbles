# 🎮 Bubbles

**Bubbles** is a browser-based interactive bubble-popping game built with **vanilla JavaScript, ES modules, HTML5 Canvas, and browser APIs**.

The game uses a custom real-time rendering and physics loop to simulate falling bubbles, collisions, popping effects, particles, touch/mouse interactions, scoring, lives, levels, tutorials, audio feedback, and animated UI elements.

The project is designed around small, focused JavaScript modules rather than a large framework. Game systems such as rendering, physics, input handling, level management, scoring, audio, animation, and visual effects are separated into individual modules.

---

## ✨ Features

* Interactive bubble-popping gameplay
* HTML5 Canvas-based rendering
* Real-time animation loop
* Mouse, touch, and pointer-event support
* Multi-pointer input handling
* Falling bubble physics
* Gravity and terminal velocity
* Bubble-to-bubble collision detection
* Collision response and bouncing
* Tap-to-pop interaction
* Slingshot-style interaction
* Hold/blast interaction
* Particle-based bubble explosion effects
* Ripple effects for missed taps
* Firework effects
* Combo scoring
* Lives system
* Level progression
* Tutorial system
* Level countdowns
* Level interstitial screens
* Game-over state
* Audio feedback and procedural sound sequencing
* Level preview through URL parameters
* Custom level data encoding/decoding
* Share-image generation
* Responsive Canvas sizing
* Camera shake effects
* Animated text and UI transitions
* Modular ES6 architecture

---

# 🏗️ Technical Architecture

The application is implemented as a **client-side game engine** running entirely inside the browser.

There is no application server required for the core gameplay.

The high-level runtime architecture is:

```text
┌───────────────────────────────────────────────┐
│                 Browser                       │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │            HTML / Canvas UI             │  │
│  └────────────────────┬────────────────────┘  │
│                       │                       │
│                       ▼                       │
│  ┌─────────────────────────────────────────┐  │
│  │              index.js                   │  │
│  │         Game/Application Loop           │  │
│  └───────────────┬─────────────────────────┘  │
│                  │                            │
│       ┌──────────┼───────────┬───────────┐    │
│       ▼          ▼           ▼           ▼    │
│    Levels      Input       Physics      Score │
│       │          │           │           │    │
│       ▼          ▼           ▼           ▼    │
│    Ball.js   Pointer.js   Particle.js  Store  │
│       │                      │                │
│       └──────────┬───────────┘                │
│                  ▼                            │
│          Canvas Rendering                     │
│                  │                            │
│                  ▼                            │
│          Visual / Audio Effects               │
└───────────────────────────────────────────────┘
```

The main orchestration layer is `index.js`. It creates the Canvas manager and initializes the audio, life, level, score, tutorial, pointer, interstitial, and sharing systems.

---

# 🧩 Core Technologies

| Technology                     | Purpose                          |
| ------------------------------ | -------------------------------- |
| JavaScript                     | Core application and game logic  |
| ES Modules                     | Modular dependency management    |
| HTML5 Canvas                   | Real-time 2D rendering           |
| Canvas 2D API                  | Drawing game objects and effects |
| Pointer Events API             | Mouse/touch/stylus interaction   |
| Web Audio / browser audio APIs | Game sound effects               |
| Browser URL APIs               | Level preview parameters         |
| CSS                            | Page-level presentation          |
| HTML                           | Application shell                |

The repository does not require a frontend framework such as React or Vue for the game engine.

---

# 📁 Project Structure

The main source files are organized around individual game responsibilities.

```text
Bubbles/
│
├── index.html
├── index.css
├── index.js
│
├── activePointer.js
├── audio.js
├── ball.js
├── canvas.js
├── colors.js
├── constants.js
├── easings.js
├── firework.js
├── grid.js
├── helpers.js
├── holdBlast.js
├── interstitialButton.js
├── level.js
├── levelData.js
├── lifeManager.js
├── particle.js
├── ripple.js
├── scoreDisplay.js
├── scoreStore.js
├── shareImage.js
├── slingshot.js
├── spring.js
├── textBlock.js
├── textRotate.js
├── trajectory.js
├── tutorial.js
│
├── builder/
├── images/
├── sounds/
│
├── notes.md
└── README.md
```

The repository currently contains hundreds of commits and the game logic is split across these specialized modules.

---

# 🎯 Application Entry Point

## `index.html`

`index.html` provides the browser document and Canvas mounting point used by the game.

The JavaScript application is loaded from the HTML page and operates directly against the Canvas element.

---

# 🧠 Main Game Controller

## `index.js`

`index.js` is the primary orchestration module.

It imports and initializes the major game systems:

```text
Canvas
Audio
Lives
Levels
Score
Tutorial
Pointer input
Interstitial UI
Share image
Level data
Particles
Visual effects
```

The game state is coordinated through the main animation loop.

Important runtime state includes:

* Active pointers
* Current bubbles
* Previous-level bubbles
* Ripple effects
* Fireworks
* Pointer-triggered effects
* Interstitial timers

The game is reset through a centralized `resetGame()` function, which resets gameplay state, lives, level state, tutorial state, audio sequencing, and score.

---

# 🎨 Canvas Rendering

## `canvas.js`

The Canvas manager abstracts the HTML5 Canvas element and its 2D rendering context.

The game obtains the rendering context once and uses it throughout the runtime:

```js
const CTX = canvasManager.getContext();
```

Rendering is performed continuously through the application's animation loop.

The Canvas is also initialized using the current browser viewport dimensions, with a configured maximum width.

---

# 🔄 Game Loop

The game uses a continuous animation loop rather than DOM-driven rendering.

Conceptually:

```text
Browser Animation Frame
        │
        ▼
Calculate delta time
        │
        ▼
Clear / paint background
        │
        ▼
Process timed interactions
        │
        ▼
Detect collisions
        │
        ▼
Update game objects
        │
        ▼
Render UI
        │
        ▼
Render bubbles
        │
        ▼
Render particles/effects
        │
        ▼
Render pointer effects
        │
        ▼
Render combo messages
        │
        ▼
Next animation frame
```

The main loop receives `deltaTime`, which is passed to animated game objects so their visual state can progress based on elapsed time.

---

# 🎈 Bubble System

## `ball.js`

The bubble implementation is one of the primary gameplay systems.

Each bubble is created with properties such as:

```text
Start position
Start velocity
Radius
Color/fill
Gravity
Spawn delay
Terminal velocity
```

A bubble internally uses a particle implementation for its physical movement.

The bubble tracks states such as:

```text
In play
Popped
Missed
Popping
Inside viewport
```

The bubble also responds to Canvas boundaries.

For example, when it reaches the left or right boundary, its horizontal velocity is reversed with damping. When it passes below the playable area, it is marked as missed and notifies the game controller.

---

# 💥 Bubble Pop Physics

Popping is implemented as a particle explosion rather than simply removing the bubble.

When a bubble is popped:

1. The original bubble enters the popped state.
2. A randomized number of particles is generated.
3. Outer particles are distributed around the bubble.
4. Inner particles are generated closer to the center.
5. Existing bubble velocity is partially transferred to the particles.
6. Particles receive radial velocities.
7. Additional spark particles are created.
8. The particles are animated independently.

This produces a visually rich explosion while retaining some physical continuity from the original bubble.

The implementation dynamically generates approximately **10–80 outer particles**, plus a second inner-particle group, with randomized sizes, directions, and velocity multipliers.

---

# ⚙️ Particle Physics

## `particle.js`

The particle system provides the lower-level physics behavior used by bubbles and visual effects.

Responsibilities include:

* Position updates
* Velocity updates
* Gravity
* Terminal velocity
* Boundary callbacks
* Collision support
* Particle movement
* Particle lifecycle

The main game controller uses the particle collision utilities to resolve collisions between active bubbles and interactive effects.

---

# 💫 Collision Detection

Collision processing is centralized in `index.js` but implemented using helpers from `particle.js`.

The collision system handles two major categories:

### Bubble-to-bubble

```text
Bubble A
   ↕
Collision detection
   ↕
Bubble B
```

When two bubbles collide:

1. Collision is detected.
2. Their positions are adjusted.
3. Collision response is calculated.
4. Their velocities are updated.

### Bubble-to-interaction

Interactive effects such as blasts and slingshots can collide with bubbles.

When a collision occurs, the bubble is popped using the velocity of the triggering object.

The game also triggers sequential audio feedback after successful collisions.

---

# 🖱️ Input System

The application uses the browser's **Pointer Events API**.

Supported events include:

```text
pointerdown
pointermove
pointerup
pointercancel
```

This provides a unified interaction model for:

* Mouse
* Touch
* Pen/stylus
* Multiple simultaneous pointers

Each active pointer is represented by an `activePointer` object.

The pointer lifecycle is roughly:

```text
pointerdown
    │
    ▼
Create ActivePointer
    │
    ▼
Track movement
    │
    ▼
Determine interaction type
    │
    ├── Tap
    ├── Slingshot
    └── Hold Blast
    │
    ▼
Trigger game action
    │
    ▼
pointerup / pointercancel
```

Pointer capture is used where supported so interactions remain associated with the Canvas while the pointer moves.

---

# 👆 Tap Interaction

A normal tap attempts to find a bubble at the interaction point.

The game checks both the initial pointer position and the final pointer position.

This prevents a fast-moving bubble from making an interaction feel unresponsive.

If a bubble is found:

```text
Record successful tap
       ↓
Pop bubble
       ↓
Increase score
       ↓
Play sound
```

If no bubble is found:

```text
Record miss
       ↓
Create ripple
       ↓
Play miss sound
       ↓
Potentially subtract life
```

This logic is implemented in `handleGameClick()` inside `index.js`.

---

# 🏹 Slingshot Interaction

## `slingshot.js`

The slingshot interaction provides a gesture-based way of interacting with bubbles.

It uses pointer movement and trajectory information to calculate the resulting interaction.

Related modules include:

* `slingshot.js`
* `trajectory.js`
* `spring.js`
* `activePointer.js`

This separates gesture calculation from the central game loop.

---

# 💥 Hold Blast

## `holdBlast.js`

The game supports a hold-based interaction.

When a pointer is held for a defined duration, the system can convert the interaction into a blast.

The main game controller monitors active hold pointers and automatically triggers those that exceed the configured maximum blast duration.

---

# 🎮 Level Management

## `level.js`

The level manager controls the game's progression state.

Responsibilities include:

* Current level
* Level transitions
* Interstitial screens
* Game-over state
* Level countdown
* Last-level detection
* First-level miss handling
* Level advancement

A typical level lifecycle is:

```text
Load Level
    │
    ▼
Countdown
    │
    ▼
Spawn Bubbles
    │
    ▼
Player Interaction
    │
    ├── Pop all bubbles
    │       │
    │       ▼
    │   Level complete
    │
    └── Miss bubbles
            │
            ▼
        Lose life
            │
            ▼
       Continue / Game Over
```

The level manager also controls the interstitial messages shown between gameplay states.

---

# 🗺️ Level Data

## `levelData.js`

Level configuration is separated from the level runtime logic.

This allows level definitions to describe bubble configurations independently from the systems responsible for executing the level.

The main application obtains level data from the level manager and converts it into active bubble objects.

The same system also provides level decoding used for custom level previews.

---

# 🔗 Custom Level Preview

The game supports previewing encoded level data through a URL parameter.

The application reads:

```text
?level=<encoded-level>
```

The parameter is decoded and validated before being used.

The flow is:

```text
URL
 │
 ▼
URLSearchParams
 │
 ▼
Decode level data
 │
 ▼
Validate decoded structure
 │
 ▼
Create preview mode
 │
 ▼
Display preview metadata
 │
 ▼
Play custom level
```

If valid preview data exists, the browser document title and Open Graph metadata are dynamically updated to reflect the custom level name.

This makes the application capable of sharing or previewing custom levels without requiring a backend service.

---

# ❤️ Life Management

## `lifeManager.js`

The life manager maintains the player's remaining lives.

A missed bubble can cause a life to be removed.

When the player reaches zero lives:

```text
Lives = 0
   ↓
Game End
   ↓
Lose sound
   ↓
Game-over state
```

The life system is reset when starting a new game.

---

# 🏆 Scoring System

## `scoreStore.js`

The score store is responsible for maintaining gameplay scoring information.

It records:

* Successful taps
* Missed interactions
* Bubble counts
* Combo information
* Positions associated with scoring events

The game records successful taps with the current pointer position and bubble color/fill information.

Combo messages are then rendered above the gameplay area using animated transitions.

---

# 📊 Score Display

## `scoreDisplay.js`

The score display provides the visual representation of the player's current score and related game statistics.

It is coordinated with:

```text
Score Store
Level Manager
Canvas Manager
```

This keeps score calculation separate from score presentation.

---

# 🎓 Tutorial System

## `tutorial.js`

The tutorial system provides the initial player onboarding experience.

The application determines whether the tutorial has been completed and changes the initial game flow accordingly.

The tutorial can:

* Generate tutorial bubbles
* Display instructional messages
* Wait for player interaction
* Advance through tutorial steps
* Reset the game when required

After tutorial completion, the normal level progression system takes over.

---

# 🔊 Audio System

## `audio.js`

Audio is managed independently from the main gameplay logic.

The game uses audio feedback for events such as:

* Bubble popping
* Misses
* Level transitions
* Fireworks
* Losing
* Sequential bubble interactions

The audio manager also maintains a pluck sequence and is initialized after user interaction to comply with browser restrictions around automatic audio playback.

Audio assets are stored under:

```text
sounds/
```

---

# 🎆 Visual Effects

The game contains several dedicated visual-effect modules.

### `ripple.js`

Creates a visual ripple after a missed interaction.

### `firework.js`

Creates celebratory fireworks, particularly around major game transitions.

### `particle.js`

Provides the low-level particle behavior used by bubble explosions and other effects.

### `spring.js`

Provides spring-style interpolation for animated UI and game effects.

### `easings.js`

Contains easing functions used to create smooth animation transitions.

### `textBlock.js`

Handles animated text rendering.

### `textRotate.js`

Provides text rotation behavior.

---

# 📸 Share Image Generation

## `shareImage.js`

The game includes a share-image manager that integrates with the score and level systems.

It is used on interstitial and end-game screens and is updated when the player's game state changes.

The intended flow is:

```text
Game Result
    │
    ▼
Score Store
    │
    ▼
Level Manager
    │
    ▼
Share Image Manager
    │
    ▼
Generated share representation
```

---

# 📐 Grid / Layout Utilities

## `grid.js`

The grid module provides grid-related calculations used by the game or its supporting systems.

The project keeps these calculations separate rather than embedding layout logic throughout the rendering code.

---

# 🎨 Color System

## `colors.js`

The color module centralizes color-related functionality.

It is also responsible for creating gradient bitmap representations used by bubble rendering.

Bubble appearance is therefore separated from the lower-level physics implementation.

---

# 🧮 Utility and Math Layer

## `helpers.js`

The helper module contains reusable game calculations.

Examples include:

* Random value generation
* Progress calculations
* Interpolation
* Position bounding
* Ball lookup
* Angle calculations
* Animation helpers

This avoids duplicating common mathematical operations throughout the game.

---

# ⏱️ Animation and Timing

The application is heavily animation-driven.

Rather than relying on CSS animations for gameplay objects, the game calculates visual states inside the Canvas rendering loop.

The animation architecture uses:

```text
deltaTime
   +
progress functions
   +
easing functions
   +
spring interpolation
   +
Canvas transformations
```

This allows game objects to have precise control over position, scale, rotation, opacity, and lifecycle.

---

# 📷 Camera Effects

The main rendering layer includes a camera wrapper capable of applying screen shake.

When specific interactions occur, the Canvas is:

1. Translated to its center.
2. Rotated by a randomized amount.
3. Translated back.
4. Offset randomly.
5. Rendered.
6. Restored to the original transformation.

This creates impact feedback without changing the underlying game-object coordinates.

---

# ⌨️ Keyboard Controls

The application also supports keyboard interaction for progressing through interstitial screens.

The following keys are recognized:

```text
Space
Enter
```

This allows players to advance through appropriate game-state screens without using a pointer.

---

# 🔄 Game State Lifecycle

The primary gameplay state can be summarized as:

```text
Application Start
       │
       ▼
Initialize Managers
       │
       ▼
Reset Game
       │
       ▼
Tutorial / Level Intro
       │
       ▼
Spawn Level
       │
       ▼
Game Loop
       │
       ├───────────────┐
       │               │
       ▼               ▼
   Successful       Missed
   interaction      bubble
       │               │
       ▼               ▼
   Pop bubble       Lose life
       │               │
       └───────┬───────┘
               ▼
       Check remaining
          bubbles
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
    Complete           Continue
       │
       ▼
  Interstitial
       │
       ▼
 Next Level
       │
       ▼
 Final Level
       │
       ▼
  Game Complete
```

---

# 🧵 Module Responsibilities

| Module                  | Responsibility                            |
| ----------------------- | ----------------------------------------- |
| `index.js`              | Main application controller and game loop |
| `canvas.js`             | Canvas setup and rendering context        |
| `ball.js`               | Bubble lifecycle and pop behavior         |
| `particle.js`           | Physics and particle behavior             |
| `activePointer.js`      | Pointer interaction state                 |
| `slingshot.js`          | Slingshot gesture                         |
| `holdBlast.js`          | Hold/blast gesture                        |
| `trajectory.js`         | Trajectory calculations                   |
| `level.js`              | Level state and progression               |
| `levelData.js`          | Level definitions and encoding/decoding   |
| `lifeManager.js`        | Player lives                              |
| `scoreStore.js`         | Score and combo state                     |
| `scoreDisplay.js`       | Score rendering                           |
| `tutorial.js`           | Tutorial flow                             |
| `audio.js`              | Audio playback                            |
| `ripple.js`             | Miss/tap ripple effect                    |
| `firework.js`           | Firework effect                           |
| `spring.js`             | Spring-based animation                    |
| `easings.js`            | Animation easing functions                |
| `colors.js`             | Colors and gradients                      |
| `helpers.js`            | Shared calculations and utility functions |
| `constants.js`          | Shared configuration constants            |
| `interstitialButton.js` | Interstitial controls                     |
| `textBlock.js`          | Text rendering                            |
| `textRotate.js`         | Rotating text animation                   |
| `shareImage.js`         | Score/share visual generation             |
| `grid.js`               | Grid/layout calculations                  |

---

# 🚀 Running the Project

Because the application is a browser-based ES-module project, it should be served through a local HTTP server rather than opened directly with `file://`.

For example, using a simple local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Alternatively, any static web server capable of serving ES modules can be used.

---

# 🌐 Deployment

The project can be deployed as a static website because the core game logic executes entirely in the browser.

Possible deployment environments include:

* GitHub Pages
* Netlify
* Vercel static hosting
* Cloudflare Pages
* Nginx
* Apache
* Any static HTTP server

A production deployment only needs to serve the project files with correct MIME types and ES-module support.

---

# 🔐 Security Considerations

Since the application is primarily client-side:

* No server-side authentication is required for the core game.
* No backend database is required for gameplay.
* Level preview data should be treated as untrusted client input.
* Encoded level data should always be validated before use.
* External resources should use HTTPS in production.
* Any future server-side leaderboard or account functionality should validate all score and level data on the server.

Client-side score values should **not** be considered trustworthy if competitive leaderboards are added later, because users can modify browser-side JavaScript.

---

# ⚡ Performance Considerations

The application is designed around a Canvas rendering loop rather than creating large numbers of DOM nodes.

Performance-sensitive areas include:

### Collision Detection

Bubble-to-bubble collision checking uses pairwise comparisons:

```text
Bubble A → Bubble B
Bubble A → Bubble C
Bubble A → Bubble D
...
```

As the number of active bubbles increases, this can approach **O(n²)** collision complexity.

For significantly larger levels, a spatial partitioning strategy such as:

* Uniform grid
* Spatial hash
* Quadtree

could reduce unnecessary collision checks.

### Particle Effects

Bubble explosions dynamically create many particles.

Large numbers of simultaneous explosions can increase:

* Object allocation
* Canvas draw operations
* Garbage collection
* Per-frame physics calculations

Potential future optimization could include object pooling for frequently created particles.

### Rendering

Canvas transformations and effects such as camera shake, alpha blending, gradients, and large particle counts should be monitored on lower-powered mobile devices.

---

# 🧪 Debugging

Useful areas to inspect when debugging gameplay include:

```text
index.js
ball.js
particle.js
level.js
activePointer.js
scoreStore.js
```

### Interaction bugs

Start with:

```text
activePointer.js
slingshot.js
holdBlast.js
trajectory.js
index.js
```

### Physics bugs

Start with:

```text
ball.js
particle.js
helpers.js
constants.js
```

### Level progression bugs

Start with:

```text
level.js
levelData.js
index.js
lifeManager.js
```

### Visual effects

Start with:

```text
particle.js
ripple.js
firework.js
spring.js
easings.js
```

### Scoring bugs

Start with:

```text
scoreStore.js
scoreDisplay.js
index.js
```

---

# 🛠️ Development Guidelines

When modifying the game, keep game responsibilities separated.

For example:

### Do

```text
Physics change
→ particle.js / ball.js

Input change
→ activePointer.js / slingshot.js

Level behavior
→ level.js / levelData.js

Scoring behavior
→ scoreStore.js

Visual effect
→ dedicated effect module

Audio behavior
→ audio.js
```

### Avoid

Putting all gameplay behavior into `index.js`.

`index.js` should primarily coordinate systems rather than becoming the implementation location for every feature.

---

# 🔧 Extending the Game

The modular architecture makes it possible to add new mechanics without rewriting the complete game loop.

Potential extensions include:

* New bubble types
* Special bubbles
* Power-ups
* Time-limited levels
* Obstacles
* Moving targets
* Combo multipliers
* Additional gesture mechanics
* New particle effects
* New sound effects
* Procedural levels
* Level editor improvements
* Persistent player profiles
* Online leaderboards
* Multiplayer gameplay
* Analytics
* Mobile-specific optimization

A new gameplay mechanic should ideally be implemented as an independent module and connected to the existing lifecycle through the main controller.

---

# 📌 Important Architectural Note

The current repository is fundamentally a **client-side Canvas game**, despite the previous README describing a React/TypeScript + FastAPI + Redis + PostgreSQL architecture.

The actual repository structure and source code show:

```text
Vanilla JavaScript
        +
ES Modules
        +
HTML5 Canvas
        +
Custom Physics
        +
Browser Pointer Events
        +
Client-side Game State
        +
Audio / Visual Effects
```

The main runtime imports modules such as `canvas.js`, `ball.js`, `particle.js`, `level.js`, `scoreStore.js`, `tutorial.js`, `audio.js`, and other gameplay systems directly from the JavaScript source tree.

Therefore, this README intentionally documents the **implementation that exists in the repository**, rather than describing technologies that are not currently represented in the source tree.

---

# 📄 License

See the repository license file for the applicable licensing terms.

---

# 👨‍💻 Project

**Bubbles**

Repository:

[github.com/thinkingdev923/Bubbles](https://github.com/thinkingdev923/Bubbles?utm_source=chatgpt.com)

The project currently contains the complete browser-side game implementation, including the rendering engine, physics, interaction system, level management, scoring, tutorials, audio, and visual effects.
