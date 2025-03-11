import { clampedProgress, transition } from "./helpers.js";
import { easeInOutSine } from "./easings.js";

export const drawTextRotate = (
  canvasManager,
  animationStart,
  previousValue,
  newValue
) => {
  const CTX = canvasManager.getContext();
  const animationProgress = clampedProgress(
    0,
    180,
    Date.now() - animationStart
  );
  const travelDistance = 20;
  const blurAmount = 8;

  CTX.save();
  CTX.translate(
    0,
    transition(0, -travelDistance, animationProgress, easeInOutSine)
  );
  CTX.globalAlpha = transition(1, 0, animationProgress, easeInOutSine);
  CTX.filter = `blur(${transition(
    0,
    blurAmount,
    animationProgress,
    easeInOutSine
  )}px)`;
  CTX.fillText(previousValue, 0, 0);
  CTX.restore();

  CTX.save();
  CTX.translate(
    0,
    transition(travelDistance, 0, animationProgress, easeInOutSine)
  );
  CTX.globalAlpha = transition(0, 1, animationProgress, easeInOutSine);
  CTX.filter = `blur(${transition(
    blurAmount,
    0,
    animationProgress,
    easeInOutSine
  )}px)`;
  CTX.fillText(newValue, 0, 0);
  CTX.restore();
};
