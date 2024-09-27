import { drawHoldBlastPreview, makeHoldBlast } from "./holdBlast.js";
import { BLAST_HOLD_THRESHOLD, SLINGSHOT_MOVE_THRESHOLD } from "./constants.js";

export const makeActivePointer = (
  canvasManager,
  pointerId,
  startPosition,
  onTrigger
) => {
  const CTX = canvasManager.getContext();
  const start = Date.now();
  let currentPosition = { ...startPosition };
  let hitSlingshotDistanceThresholdInTime = false;

  const setPosition = ({ x, y }) => {
    currentPosition = { x, y };

    console.log(
      `${
        Date.now() - start
      } <= ${BLAST_HOLD_THRESHOLD} && ${getDistance()} > ${SLINGSHOT_MOVE_THRESHOLD}`
    );
    if (
      Date.now() - start <= BLAST_HOLD_THRESHOLD &&
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
    Date.now() - start > BLAST_HOLD_THRESHOLD &&
    !hitSlingshotDistanceThresholdInTime;

  const trigger = () => {
    if (isSlingshot()) {
      console.log("slingshot");
    } else if (isHoldBlast()) {
      onTrigger(
        makeHoldBlast(canvasManager, startPosition, Date.now() - start)
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
      // TODO: move this preview into this closure
      // TODO: show slingshot previews here too
      drawHoldBlastPreview(canvasManager, startPosition, start);
    }
  };

  return {
    getId: () => pointerId,
    setPosition,
    trigger,
    draw,
  };
};
