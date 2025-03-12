import { makeBall } from "./ball.js";
import { randomColor } from "./colors.js";
import { randomBetween } from "./helpers.js";

export const makeFirework = (canvasManager, audioManager) => {
  const baseBall = makeBall(
    canvasManager,
    {
      startPosition: {
        x: randomBetween(0, canvasManager.getWidth()),
        y: canvasManager.getHeight(),
      },
      startVelocity: { x: randomBetween(-1, 1), y: randomBetween(-8, -10) },
      radius: randomBetween(6, 14),
      fill: randomColor(),
      delay: randomBetween(0, 1200),
    },
    () => {},
    () => {}
  );

  const draw = (deltaTime) => {
    if (!baseBall.isPopped() && baseBall.getVelocity().y > 1) {
      // Give fireworks pops a downwards trajectory
      baseBall.pop({ x: 0, y: 2 });
      audioManager.playSequentialPluck();
    }

    baseBall.draw(deltaTime);
  };

  return { draw };
};
