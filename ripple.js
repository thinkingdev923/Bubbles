import { easeOutCirc, easeInCubic } from "./easings.js";
import { progress, transition } from "./helpers.js";
import { red } from "./colors.js";

export const makeRipple = (canvasManager, startPosition) => {
  const CTX = canvasManager.getContext();
  const rippleDuration = 800;
  const rippleStart = Date.now();
  let position = { ...startPosition };
  let gone = false;

  const draw = () => {
    if (!gone) {
      const timeSinceRipple = Date.now() - rippleStart;
      if (timeSinceRipple > rippleDuration) gone = true;

      const animationProgress = progress(0, rippleDuration, timeSinceRipple);
      const opacityTransition = transition(
        1,
        0,
        animationProgress,
        easeInCubic
      );
      const scaleTransition = transition(
        0,
        2.5,
        animationProgress,
        easeOutCirc
      );
      const lineWidthTransition = transition(
        8,
        0,
        animationProgress,
        easeOutCirc
      );

      CTX.save();
      CTX.strokeStyle = red;
      CTX.globalAlpha = opacityTransition;
      CTX.lineWidth = lineWidthTransition;
      CTX.translate(position.x, position.y);
      CTX.scale(scaleTransition, scaleTransition);
      CTX.beginPath();
      CTX.arc(0, 0, 22, 0, 2 * Math.PI);
      CTX.closePath();
      CTX.stroke();
      CTX.restore();
    }
  };

  return {
    draw,
  };
};
