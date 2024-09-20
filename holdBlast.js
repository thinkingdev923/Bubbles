import { clampedProgress, transition } from "./helpers.js";
import { easeOutCubic, easeOutSine } from "./easings.js";
import { red } from "./colors.js";
import { BLAST_HOLD_THRESHOLD } from "./constants.js";

const holdMaxDuration = 2000;

export const drawHoldBlastPreview = (
  canvasManager,
  { x, y },
  blastHoldStart
) => {
  const CTX = canvasManager.getContext();

  const scaleProgress = clampedProgress(
    BLAST_HOLD_THRESHOLD,
    holdMaxDuration,
    Date.now() - blastHoldStart
  );
  const previewSize = transition(0, 140, scaleProgress, easeOutSine);

  CTX.save();
  CTX.fillStyle = red;
  CTX.globalAlpha = 0.2;
  CTX.translate(x, y);
  CTX.beginPath();
  CTX.arc(0, 0, previewSize, 0, 2 * Math.PI);
  CTX.closePath();
  CTX.fill();
  CTX.restore();
};

export const makeHoldBlast = (canvasManager, { x, y }, holdDuration) => {
  const CTX = canvasManager.getContext();
  const blastStart = Date.now();
  const blastDuration = 400;
  const startSize = transition(
    0,
    140,
    clampedProgress(BLAST_HOLD_THRESHOLD, holdMaxDuration, holdDuration),
    easeOutSine
  );
  let gone = false;

  const getBlastProgress = () =>
    clampedProgress(0, blastDuration, Date.now() - blastStart);

  const getRadius = () =>
    transition(startSize, startSize * 2, getBlastProgress(), easeOutCubic);

  const draw = () => {
    if (!gone) {
      if (Date.now() - blastStart > blastDuration) gone = true;

      CTX.save();

      CTX.strokeStyle = red;
      CTX.lineWidth = transition(14, 2, getBlastProgress(), easeOutCubic);
      CTX.globalAlpha = transition(1, 0, getBlastProgress(), easeOutCubic);
      CTX.translate(x, y);
      CTX.beginPath();
      CTX.arc(0, 0, getRadius(), 0, 2 * Math.PI);
      CTX.closePath();
      CTX.stroke();
      CTX.restore();
    }
  };

  // getRadius and getPosition have to match the methods on ball.js so we can
  // run checkBallCollision() on blasts
  return {
    draw,
    getRadius,
    getPosition: () => ({ x, y }),
    isGone: () => gone,
  };
};
