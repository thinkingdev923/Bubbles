import { clampedProgress, transition } from "./helpers.js";
import { easeInOutSine } from "./easings.js";

export const drawTextRotate = (
  canvasManager,
  animationStart,
  previousValue,
  newValue
) => {
  const CTX = canvasManager.getContext();
  const levelAnimationProgress = clampedProgress(
    0,
    160,
    Date.now() - animationStart
  );
  const travelDistance = 20;
  const blurAmount = 8;

  CTX.save();
  CTX.translate(
    0,
    transition(0, -travelDistance, levelAnimationProgress, easeInOutSine)
  );
  CTX.globalAlpha = transition(1, 0, levelAnimationProgress, easeInOutSine);
  CTX.filter = `blur(${transition(
    0,
    blurAmount,
    levelAnimationProgress,
    easeInOutSine
  )}px)`;
  CTX.fillText(previousValue, 0, 0);
  CTX.restore();

  CTX.save();
  CTX.translate(
    0,
    transition(travelDistance, 0, levelAnimationProgress, easeInOutSine)
  );
  CTX.globalAlpha = transition(0, 1, levelAnimationProgress, easeInOutSine);
  CTX.filter = `blur(${transition(
    blurAmount,
    0,
    levelAnimationProgress,
    easeInOutSine
  )}px)`;
  CTX.fillText(newValue, 0, 0);
  CTX.restore();
};
