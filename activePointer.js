import { BLAST_HOLD_THRESHOLD, SLINGSHOT_MOVE_THRESHOLD } from "./constants.js";
import { drawHoldBlastPreview, makeHoldBlast } from "./holdBlast.js";
import { drawSlingshotPreview, makeSlingshot } from "./slingshot.js";

export const makeActivePointer = (
  canvasManager,
  audioManager,
  scoreStore,
  tutorialManager,
  pointerId,
  startPosition,
  onTrigger,
  defaultPointerAction
) => {
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

  const slingshotAllowed = () =>
    tutorialManager.isTutorialComplete() ||
    (!tutorialManager.isTutorialComplete() &&
      tutorialManager.canMakeSlingshot());

  const blastAllowed = () =>
    tutorialManager.isTutorialComplete() ||
    (!tutorialManager.isTutorialComplete() && tutorialManager.canMakeBlast());

  const tapAllowed = () =>
    tutorialManager.isTutorialComplete() ||
    (!tutorialManager.isTutorialComplete() && tutorialManager.canMakeTap());

  const trigger = () => {
    if (isSlingshot() && slingshotAllowed()) {
      onTrigger(
        makeSlingshot(canvasManager, scoreStore, startPosition, currentPosition)
      );
      audioManager.playMiss();
    } else if (isHoldBlast() && blastAllowed()) {
      onTrigger(
        makeHoldBlast(
          canvasManager,
          scoreStore,
          startPosition,
          Date.now() - pointerStart
        )
      );
      audioManager.playImpact();
    } else if (tapAllowed()) {
      defaultPointerAction(startPosition);
    }
  };

  const draw = () => {
    if (isSlingshot() && slingshotAllowed()) {
      drawSlingshotPreview(
        canvasManager,
        startPosition,
        currentPosition,
        !tutorialManager.isTutorialComplete()
      );
      tutorialManager.previewingSlingshot(startPosition, currentPosition);
    } else if (isHoldBlast() && blastAllowed()) {
      drawHoldBlastPreview(canvasManager, startPosition, pointerStart);
      tutorialManager.previewingBlast(startPosition, pointerStart);
    }
  };

  return {
    getId: () => pointerId,
    setPosition,
    trigger,
    draw,
    getDuration: () => Date.now() - pointerStart,
    isSlingshot,
    isHoldBlast,
  };
};
