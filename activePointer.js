import { drawHoldBlastPreview, makeHoldBlast } from "./holdBlast.js";
import { BLAST_HOLD_THRESHOLD, SLINGSHOT_MOVE_THRESHOLD } from "./constants.js";
import { makeSlingshot } from "./slingshot.js";

export const makeActivePointer = (
  canvasManager,
  pointerId,
  startPosition,
  onTrigger
) => {
  const CTX = canvasManager.getContext();
  const pointerStart = Date.now();
  let currentPosition = { ...startPosition };
  let hitSlingshotDistanceThresholdInTime = false;

  const setPosition = ({ x, y }) => {
    currentPosition = { x, y };

    if (
      Date.now() - pointerStart <= BLAST_HOLD_THRESHOLD &&
      getDistance() > SLINGSHOT_MOVE_THRESHOLD
    ) {
      hitSlingshotDistanceThresholdInTime = true;
    }
  };

  const getDistance = () =>
    Math.hypot(
      startPosition.x - currentPosition.x,
      startPosition.y - currentPosition.y
    );

  const isSlingshot = () => hitSlingshotDistanceThresholdInTime;

  const isHoldBlast = () =>
    Date.now() - pointerStart > BLAST_HOLD_THRESHOLD &&
    !hitSlingshotDistanceThresholdInTime;

  const trigger = () => {
    if (isSlingshot()) {
      onTrigger(makeSlingshot(canvasManager, startPosition, currentPosition));
    } else if (isHoldBlast()) {
      onTrigger(
        makeHoldBlast(canvasManager, startPosition, Date.now() - pointerStart)
      );
    }
  };

  const draw = () => {
    if (isSlingshot()) {
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
    } else if (isHoldBlast()) {
      // TODO: Move this preview into this closure. But how to ensure the
      //       preview size matches the triggered blast size? Is it actually
      //       best to keep these things together?
      drawHoldBlastPreview(canvasManager, startPosition, pointerStart);
    }
  };

  return {
    getId: () => pointerId,
    setPosition,
    trigger,
    draw,
  };
};
