import { progress, transition } from "./helpers.js";
import { INTERVAL, GRAVITY } from "./constants.js";

const getHeadingInRads = (a, b) => Math.atan2(a.y - b.y, a.x - b.x);

const getVelocity = (speed, headingInRads) => ({
  x: speed * Math.cos(headingInRads),
  y: speed * Math.sin(headingInRads),
});

export const drawSlingshotPreview = (
  canvasManager,
  startPosition,
  currentPosition
) => {
  const CTX = canvasManager.getContext();
  CTX.save();
  CTX.fillStyle = "red";
  CTX.strokeStyle = "red";
  CTX.lineWidth = 4;
  CTX.beginPath();
  CTX.moveTo(startPosition.x, startPosition.y);
  CTX.lineTo(currentPosition.x, currentPosition.y);
  CTX.closePath();
  CTX.stroke();
  CTX.fillRect(startPosition.x - 10, startPosition.y - 10, 20, 20);
  CTX.fillRect(startPosition.x - 10, startPosition.y - 10, 20, 20);
  CTX.fillRect(currentPosition.x - 10, currentPosition.y - 10, 20, 20);
  CTX.restore();
};

export const makeSlingshot = (canvasManager, startPosition, endPosition) => {
  const CTX = canvasManager.getContext();
  const distance = Math.hypot(
    startPosition.x - endPosition.x,
    startPosition.y - endPosition.y
  );
  const radius = transition(60, 10, progress(0, 600, distance));
  const velocity = getVelocity(
    distance / 10,
    getHeadingInRads(startPosition, endPosition)
  );

  let position = { ...startPosition };
  let gone = false;

  const update = (deltaTime) => {
    const deltaTimeMultiplier = deltaTime / INTERVAL;
    position.x += deltaTimeMultiplier * velocity.x;
    position.y += deltaTimeMultiplier * velocity.y;
    velocity.y += deltaTimeMultiplier * GRAVITY;

    if (
      position.x > canvasManager.getWidth() - radius ||
      position.y > canvasManager.getHeight() + radius ||
      position.x < radius ||
      position.y < radius
    ) {
      gone = true;
    }
  };

  const draw = (deltaTime) => {
    if (!gone) {
      update(deltaTime);

      CTX.save();
      CTX.fillStyle = "green";
      CTX.translate(position.x, position.y);
      CTX.beginPath();
      CTX.arc(0, 0, radius, 0, 2 * Math.PI);
      CTX.closePath();
      CTX.fill();
      CTX.restore();
    }
  };

  // getRadius and getPosition have to match the methods on ball.js so we can
  // run checkBallCollision() on slingshots
  return {
    draw,
    getRadius: () => radius,
    getPosition: () => position,
    isGone: () => gone,
    causesShake: () => false,
  };
};
