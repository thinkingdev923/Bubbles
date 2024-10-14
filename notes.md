# TODO:

- De-OP the slingshot
  - There's a limit to how many bubbles a slingshot can pop
  - Faster slingshots pop more bubbles
  - Slow slingshots pop nothing
  - Once a slingshot is used up it pops

- De-OP blasts
  - Blasts trigger automatically when they reach max size, like a grenade

- Better blast effects
  - Blasts apply a velocity to blasted balls. Direction of velocity is determined by angle from center of blast to center of popped ball.

- Refactors
  - Any way to prevent index.js from calling update after a bubble is gone? So we don't have to track a "gone" state within the closure?
    - Can ball call update within its own draw function?
  - Apply particle to slingshots and blasts
  - Pre-render balls of each color on load and store in colors.js