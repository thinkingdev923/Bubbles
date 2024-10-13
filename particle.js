import { GRAVITY, INTERVAL } from "./constants.js";

export const makeParticle = (
  canvasManager,
  {
    radius,
    startPosition,
    startVelocity,
    gravity = GRAVITY,
    terminalVelocity = 12,
    onRightCollision = () => {},
    onBottomCollision = () => {},
    onLeftCollision = () => {},
    onTopCollision = () => {},
  }
) => {
  const particleStart = Date.now();
  let position = { ...startPosition };
  let velocity = { ...startVelocity };
  let gone = false;

  const kill = () => (gone = true);

  const update = (deltaTime) => {
    if (!gone) {
      const deltaTimeMultiplier = deltaTime / INTERVAL;
      position.x += deltaTimeMultiplier * velocity.x;
      position.y += Math.min(
        deltaTimeMultiplier * velocity.y,
        terminalVelocity
      );
      velocity.y += deltaTimeMultiplier * gravity;

      if (position.x > canvasManager.getWidth() - radius) {
        onRightCollision(position, velocity);
      } else if (position.y > canvasManager.getHeight() + radius) {
        onBottomCollision(position, velocity);
      } else if (position.x < radius) {
        onLeftCollision(position, velocity);
      } else if (position.y < radius) {
        onTopCollision(position, velocity);
      }
    }
  };

  return {
    update,
    getStart: () => particleStart,
    getDuration: () => Date.now() - particleStart,
    getPosition: () => position,
    getRadius: () => radius,
    getVelocity: () => velocity,
    setPosition: (p) => (position = p),
    setVelocity: (c) => (velocity = c),
    kill,
    isGone: () => gone,
  };
};
