export const generateCanvas = ({ width, height, attachNode }) => {
  const element = document.createElement("canvas");
  const context = element.getContext("2d");

  element.style.width = width + "px";
  element.style.height = height + "px";

  const scale = window.devicePixelRatio;
  element.width = Math.floor(width * scale);
  element.height = Math.floor(height * scale);
  context.scale(scale, scale);

  document.querySelector(attachNode).appendChild(element);

  return [context, width, height, element];
};

export const animate = (drawFunc) => {
  let previousTimestamp = false;

  const drawFuncContainer = (timestamp) => {
    const deltaTime = previousTimestamp
      ? timestamp - previousTimestamp
      : performance.now() - timestamp;
    drawFunc(deltaTime);
    window.requestAnimationFrame(drawFuncContainer);
    previousTimestamp = timestamp;
  };

  window.requestAnimationFrame(drawFuncContainer);
};

export const progress = (start, end, current) =>
  (current - start) / (end - start);

export const clampedProgress = (start, end, current) =>
  Math.max(0, Math.min(1, (current - start) / (end - start)));

export const transition = (start, end, progress, easingFunc) => {
  const easedProgress = easingFunc ? easingFunc(progress) : progress;
  return start + Math.sign(end - start) * Math.abs(end - start) * easedProgress;
};

export const degToRag = (degree) => (degree * Math.PI) / 180;

export const randomBool = (probability = 0.5) => Math.random() >= probability;

export const randomBetween = (min, max) => Math.random() * (max - min) + min;

export const findBallAtPoint = (balls, { x, y }) => {
  return balls.find((ball) => {
    if (!ball.isPopped()) {
      const dx = x - ball.getPosition().x;
      const dy = y - ball.getPosition().y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < ball.getRadius();
    }
  });
};
