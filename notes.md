# Rules:
- You start with 10 lives
- Every level a predefined set of balls drop from the top of the screen
- Every ball that you miss reduces your lives by 1
- Once in a while a "life" ball will appear but traveling very fast, and tapping it will gain you an extra life
- Once all balls in a round have either been tapped or passed the bottom, the level increases
- If lives goes to zero, game over
- When the game is over, we show a score screen w/ share and restart

# Interaction ideas:
- Missed balls animate to the score tracker at the bottom of the screen
- Clicking a ball: ball shrinks, then expands rapidly; subtracted ball shape within that ball expands, until finally we trigger the current "pop" effect when the rendered ball is just a stroke
- Clicking and dragging: draws a line from origin to current mouse position; under mouse we show a circle that gets smaller the further you get from the origin (with min size). The longer the drag distance, the faster it travels
  - Once below a certain speed it no longer pops anything
- Big touch with your thumb pad: just like holding your finger down