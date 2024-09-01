# Gameplay:
- Balls don't ricochet off top or bottom, only sides
- Every level drops a set number of balls from the top of the screen over a time period of [ball count] seconds
- Balls are dropped from above the screen
- After every level we show an screen w/ the next level number and a countdown

# Rules:
- We keep track of level and of "ball count"
- For every ball tapped, ball count increases
- For every ball that passes the bottom of the screen, ball count decreases
- Once all balls in a round have either been tapped or passed the bottom, the level increases
- If ball count goes negative, game over
- If all balls in a round pass the bottom of the screen, game over
- When the game is over, we show a score screen w/ share and restart
  - If the game is over on the first round, we just restart

# Instructions:
- Progressive disclosure. First instruction is "click/tap the ball to increase your score" with a countdown
- After first round where a ball passed the bottom: "if a ball passes the bottom your score decreases"
- If they get to <=0: "If your score hits 0 the game is over"
- If they miss all the balls "missing all the balls ends the game"

# Interaction ideas:
- Missed balls animate to the score tracker at the bottom of the screen
- Clicking a ball: ball shrinks, then expands rapidly; subtracted ball shape within that ball expands, until finally we trigger the current "pop" effect when the rendered ball is just a stroke
- Holding mouse down: triggers a growing circle, releasing triggers a blast ripple that's bigger if you held down longer, pops lots of balls
- Clicking and dragging: draws a line from origin to current mouse position; under mouse we show a circle that gets smaller the further you get from the origin (with min size). The longer the drag distance, the faster it travels
  - Once below a certain speed it no longer pops anything
- Big touch with your thumb pad: just like holding your finger down