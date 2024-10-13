import { GRAVITY } from "./constants.js";
import { makeParticle } from "./particle.js";
import {
  progress,
  transition,
  randomBetween,
  clampedProgress,
} from "./helpers.js";
import { easeOutCubic } from "./easings.js";
import { getGradient } from "./colors.js";
import { makeOffscreenCanvas } from "./canvas.js";

export const makeBall = (
  canvasManager,
  {
    startPosition,
    startVelocity,
    radius,
    fill,
    gravity = GRAVITY,
    delay = 0,
    terminalVelocity = 12,
  },
  onPop,
  onMiss
) => {
  const CTX = canvasManager.getContext();
  const popAnimationDurationMax = 2400;
  const popAnimationDuration = randomBetween(1200, popAnimationDurationMax);
  let popped = false;
  let poppedTime = false;
  let poppedParticles = [];
  let gone = false;

  const baseParticle = makeParticle(canvasManager, {
    radius,
    startPosition,
    startVelocity,
    gravity,
    terminalVelocity,
    onRightCollision,
    onBottomCollision,
    onLeftCollision,
  });

  const preRenderImage = (() => {
    const preRenderCanvas = makeOffscreenCanvas({
      width: radius * 2,
      height: radius * 2,
    });
    const preRenderContext = preRenderCanvas.getContext();
    preRenderContext.fillStyle = getGradient(canvasManager, fill, radius);
    preRenderContext.beginPath();
    preRenderContext.arc(radius, radius, radius, 0, 2 * Math.PI);
    preRenderContext.closePath();
    preRenderContext.fill();
    return preRenderCanvas.getBitmap();
  })();

  const shouldRender = () => !gone && baseParticle.getDuration() > delay;

  function onRightCollision(position, velocity) {
    position.x = canvasManager.getWidth() - radius;
    velocity.x *= -0.7;
  }

  function onBottomCollision() {
    gone = true;
    if (!popped) onMiss();
  }

  function onLeftCollision(position, velocity) {
    position.x = radius;
    velocity.x *= -0.7;
  }

  const pop = (popperVelocity = false) => {
    const transferringVelocity = popperVelocity
      ? popperVelocity
      : baseParticle.getVelocity();
    const numberOfPopPieces = Math.round(randomBetween(10, 80));
    popped = true;
    poppedTime = Date.now();

    // A popped ball is composed of many tiny ball objects. The first frame after
    // the pop, we want them to cluster together to form a shape that still looks
    // mostly like the ball, and then we want each of them to explode outwards.
    // This is accomplished by creating a ring of small to medium sized balls around
    // the outer edge, and also a cluster of larger balls in a smaller ring close to
    // the center of the popped ball. They all move outwards at different speeds.
    const outerParticles = new Array(numberOfPopPieces).fill().map(() => {
      const randomAngle = Math.random() * Math.PI * 2;
      const minSize = 2;
      const maxSize = 8;
      const innerMargin = 12;
      const randomSize = randomBetween(minSize, maxSize);
      const randomSpeedMultiplier = transition(
        10,
        1.2,
        progress(1, maxSize, randomSize)
      );

      return makeParticle(canvasManager, {
        radius: randomSize,
        startPosition: {
          x:
            baseParticle.getPosition().x +
            Math.cos(randomAngle) * (radius - innerMargin),
          y:
            baseParticle.getPosition().y +
            Math.sin(randomAngle) * (radius - innerMargin),
        },
        // Popped pieces retain some of the velocity of the parent ball, but
        // mostly go straight out from the center of the ball at the given
        // randomAngle
        startVelocity: {
          x: transferringVelocity.x / 6 + Math.cos(randomAngle),
          y:
            transferringVelocity.y / 6 +
            Math.sin(randomAngle) * randomSpeedMultiplier,
        },
        gravity,
        terminalVelocity: 90,
      });
    });

    const innerParticles = new Array(Math.round(numberOfPopPieces / 2))
      .fill()
      .map(() => {
        const randomAngle = Math.random() * Math.PI * 2;
        const minSize = 6;
        const maxSize = 14;
        const innerMargin = 22;
        const randomSize = randomBetween(minSize, maxSize);
        const randomSpeedMultiplier = transition(
          12,
          3,
          progress(1, maxSize, randomSize)
        );

        return makeParticle(canvasManager, {
          radius: randomSize,
          startPosition: {
            x:
              baseParticle.getPosition().x +
              Math.cos(randomAngle) * (radius - innerMargin),
            y:
              baseParticle.getPosition().y +
              Math.sin(randomAngle) * (radius - innerMargin),
          },
          startVelocity: {
            x:
              transferringVelocity.x / 3 +
              Math.cos(randomAngle) * randomSpeedMultiplier,
            y:
              transferringVelocity.y / 3 +
              Math.sin(randomAngle) * randomSpeedMultiplier,
          },
          gravity,
          terminalVelocity: 90,
        });
      });

    poppedParticles = outerParticles.concat(innerParticles);

    onPop();
  };

  const draw = (deltaTime) => {
    if (popped) {
      const timeSincePopped = Date.now() - poppedTime;
      if (timeSincePopped > popAnimationDurationMax) {
        poppedParticles = [];
        gone = true;
      } else {
        poppedParticles.forEach((p) => {
          p.update(deltaTime);
          const scale = transition(
            1,
            0,
            clampedProgress(0, popAnimationDuration, timeSincePopped),
            easeOutCubic
          );

          CTX.save();
          CTX.translate(p.getPosition().x, p.getPosition().y);
          CTX.scale(scale, scale);
          CTX.drawImage(
            preRenderImage,
            -p.getRadius(),
            -p.getRadius(),
            p.getRadius() * 4,
            p.getRadius() * 4
          );
          CTX.restore();
        });
      }
    } else if (shouldRender()) {
      CTX.save();
      CTX.translate(baseParticle.getPosition().x, baseParticle.getPosition().y);
      CTX.drawImage(preRenderImage, -radius, -radius);
      CTX.restore();
    }
  };

  return {
    update: baseParticle.update,
    getPosition: baseParticle.getPosition,
    getVelocity: baseParticle.getVelocity,
    getRadius: baseParticle.getRadius,
    setPosition: baseParticle.setPosition,
    setVelocity: baseParticle.setVelocity,
    draw,
    pop,
    isPopped: () => popped,
    isRemaining: () => !popped && !gone,
    shouldRender,
    isPopping: () => popped && !gone,
  };
};

export const checkBallCollision = (ballA, ballB) => {
  const rSum = ballA.getRadius() + ballB.getRadius();
  const dx = ballB.getPosition().x - ballA.getPosition().x;
  const dy = ballB.getPosition().y - ballA.getPosition().y;
  return [rSum * rSum > dx * dx + dy * dy, rSum - Math.sqrt(dx * dx + dy * dy)];
};

export const resolveBallCollision = (ballA, ballB) => {
  const relativeVelocity = {
    x: ballB.getVelocity().x - ballA.getVelocity().x,
    y: ballB.getVelocity().y - ballA.getVelocity().y,
  };

  const norm = {
    x: ballB.getPosition().x - ballA.getPosition().x,
    y: ballB.getPosition().y - ballA.getPosition().y,
  };
  const mag = Math.sqrt(norm.x * norm.x + norm.y * norm.y);
  norm.x /= mag;
  norm.y /= mag;

  const velocityAlongNorm =
    relativeVelocity.x * norm.x + relativeVelocity.y * norm.y;

  if (velocityAlongNorm > 0) return;

  const bounce = 0.7;
  let j = -(1 + bounce) * velocityAlongNorm;
  j /= 1 / ballA.getRadius() + 1 / ballB.getRadius();
  const impulse = { x: j * norm.x, y: j * norm.y };

  ballA.setVelocity({
    x: ballA.getVelocity().x - (1 / ballA.getRadius()) * impulse.x,
    y: ballA.getVelocity().y - (1 / ballA.getRadius()) * impulse.y,
  });

  ballB.setVelocity({
    x: ballB.getVelocity().x + (1 / ballB.getRadius()) * impulse.x,
    y: ballB.getVelocity().y + (1 / ballB.getRadius()) * impulse.y,
  });
};

export const adjustBallPositions = (ballA, ballB, depth) => {
  const percent = 0.2;
  const slop = 0.01;
  let correctionNum =
    (Math.max(depth - slop, 0) /
      (1 / ballA.getRadius() + 1 / ballB.getRadius())) *
    percent;

  const norm = {
    x: ballB.getPosition().x - ballA.getPosition().x,
    y: ballB.getPosition().y - ballA.getPosition().y,
  };
  const mag = Math.sqrt(norm.x * norm.x + norm.y * norm.y);
  norm.x /= mag;
  norm.y /= mag;

  const correction = { x: correctionNum * norm.x, y: correctionNum * norm.y };

  ballA.setPosition({
    x: ballA.getPosition().x - (1 / ballA.getRadius()) * correction.x,
    y: ballA.getPosition().y - (1 / ballA.getRadius()) * correction.y,
  });
  ballB.setPosition({
    x: ballB.getPosition().x + (1 / ballB.getRadius()) * correction.x,
    y: ballB.getPosition().y + (1 / ballB.getRadius()) * correction.y,
  });
};
