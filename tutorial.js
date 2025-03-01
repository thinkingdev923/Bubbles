import {
  BUBBLE_RADIUS,
  FONT_WEIGHT_BOLD,
  FONT,
  FONT_WEIGHT_NORMAL,
} from "./constants.js";
import { red, white, turquoise, yellow } from "./colors.js";
import { makeBall } from "./ball.js";
import { clampedProgress, transition } from "./helpers.js";
import { easeOutQuart } from "./easings.js";

export const makeTutorialManager = (
  canvasManager,
  onTutorialStart,
  onAdvance,
  onCompletion
) => {
  const CTX = canvasManager.getContext();
  const tutorialSteps = getTutorialBallData(canvasManager);
  const successMessageDuration = 2000;
  let tutorialComplete = !!localStorage.getItem("bubblesTutorialComplete");
  let tutorialCompletedThisSession = false;
  let tutorialStep = 1;
  let stepStarted = Date.now();
  let holdingSlingshot = false;
  let holdingBlast = false;

  const showTutorial = () => {
    stepStarted = Date.now();
    onTutorialStart();
  };

  const advance = () => {
    tutorialStep++;

    if (tutorialStep > tutorialSteps.length) {
      tutorialComplete = true;
      tutorialCompletedThisSession = true;
      localStorage.setItem("bubblesTutorialComplete", true);
      onCompletion();
    } else {
      stepStarted = Date.now();
      onAdvance();
    }
  };

  const canMakeTap = () => tutorialStep === 1;

  const canMakeBlast = () => tutorialStep === 3;

  const canMakeSlingshot = () => tutorialStep === 5;

  const logTriggerOutput = (_) => {
    holdingSlingshot = false;
    holdingBlast = false;
  };

  const previewingBlast = (startPosition, pointerStart) => {
    // TODO get power and determine if it'll pop all bubbles
    holdingBlast = true;
  };

  const previewingSlingshot = (startPosition, currentPosition) => {
    // TODO get angle and determine if it'll strike all bubbles
    holdingSlingshot = true;
  };

  const generateBalls = (onPop, onMiss) =>
    tutorialSteps
      .find((t) => t.step === tutorialStep)
      .balls.map(({ position: { x, y }, fill }) =>
        makeBall(
          canvasManager,
          {
            startPosition: { x, y },
            startVelocity: { x: 0, y: 0 },
            radius: BUBBLE_RADIUS,
            fill,
            gravity: 0,
          },
          onPop,
          onMiss
        )
      );

  const drawTopLabel = () => {
    CTX.save();
    CTX.font = `${FONT_WEIGHT_BOLD} 14px ${FONT}`;
    CTX.fillStyle = yellow;
    CTX.letterSpacing = "1px";
    CTX.textAlign = "center";
    CTX.translate(canvasManager.getWidth() / 2, 24);
    CTX.fillText("TUTORIAL", 0, 0);
    CTX.restore();
  };

  const drawDownwardsArrow = () => {
    const endPointTransition = transition(
      canvasManager.getHeight() / 2 - canvasManager.getHeight() / 4 + 16,
      canvasManager.getHeight() / 2 - BUBBLE_RADIUS - 28,
      clampedProgress(0, 1600, Date.now() - stepStarted),
      easeOutQuart
    );
    CTX.save();
    CTX.beginPath();
    CTX.moveTo(
      0,
      canvasManager.getHeight() / 2 - canvasManager.getHeight() / 4 + 16
    );
    CTX.lineTo(0, endPointTransition);
    CTX.lineTo(8, endPointTransition);
    CTX.lineTo(0, endPointTransition + 12);
    CTX.lineTo(-8, endPointTransition);
    CTX.lineTo(0, endPointTransition);
    CTX.closePath();
    CTX.stroke();
    CTX.restore();
  };

  const drawUpwardsArrow = () => {
    const endPointTransition = transition(
      canvasManager.getHeight() / 2 + canvasManager.getHeight() / 4 - 28,
      canvasManager.getHeight() / 2 + BUBBLE_RADIUS + 28,
      clampedProgress(0, 1600, Date.now() - stepStarted),
      easeOutQuart
    );

    CTX.save();
    CTX.beginPath();
    CTX.moveTo(
      0,
      canvasManager.getHeight() / 2 + canvasManager.getHeight() / 4 - 28
    );
    CTX.lineTo(0, endPointTransition);
    CTX.lineTo(8, endPointTransition);
    CTX.lineTo(0, endPointTransition - 12);
    CTX.lineTo(-8, endPointTransition);
    CTX.lineTo(0, endPointTransition);
    CTX.closePath();
    CTX.stroke();
    CTX.restore();
  };

  const draw = () => {
    drawTopLabel();

    CTX.save();
    CTX.translate(canvasManager.getWidth() / 2, 0);
    CTX.fillStyle = white;
    CTX.strokeStyle = white;
    CTX.lineWidth = 2;
    CTX.font = `${FONT_WEIGHT_NORMAL} 24px ${FONT}`;
    CTX.textAlign = "center";

    if (tutorialStep === 1) {
      CTX.fillText(
        "Pop this",
        0,
        canvasManager.getHeight() / 2 - canvasManager.getHeight() / 4
      );

      drawDownwardsArrow();
    } else if (tutorialStep === 2) {
      if (Date.now() - stepStarted > successMessageDuration) {
        advance();
      } else {
        CTX.fillText("Nice!", 0, canvasManager.getHeight() / 2 + 10);
      }
    } else if (tutorialStep === 3) {
      CTX.fillText(
        holdingBlast ? "Now let go!" : "Hold down",
        0,
        canvasManager.getHeight() / 2 - canvasManager.getHeight() / 4
      );

      drawDownwardsArrow();

      CTX.fillStyle = "rgba(0, 0, 0, .6)";
      CTX.beginPath();
      CTX.arc(0, canvasManager.getHeight() / 2, BUBBLE_RADIUS, 0, Math.PI * 2);
      CTX.closePath();
      CTX.fill();
    } else if (tutorialStep === 4) {
      if (Date.now() - stepStarted > successMessageDuration) {
        advance();
      } else {
        CTX.fillText("Awesome!", 0, canvasManager.getHeight() / 2 + 10);
      }
    } else if (tutorialStep === 5) {
      CTX.fillText(
        holdingSlingshot ? "Let go!" : "Drag down",
        0,
        canvasManager.getHeight() / 2 + canvasManager.getHeight() / 4
      );

      if (!holdingSlingshot) drawUpwardsArrow();

      CTX.fillStyle = "rgba(0, 0, 0, .6)";
      CTX.beginPath();
      CTX.arc(0, canvasManager.getHeight() / 2, BUBBLE_RADIUS, 0, Math.PI * 2);
      CTX.closePath();
      CTX.fill();
    }
    CTX.restore();
  };

  return {
    isTutorialComplete: () => tutorialComplete,
    isTutorialCompletedThisSession: () => tutorialCompletedThisSession,
    showTutorial,
    advance,
    canMakeTap,
    canMakeBlast,
    canMakeSlingshot,
    logTriggerOutput,
    previewingBlast,
    previewingSlingshot,
    generateBalls,
    draw,
  };
};

function getTutorialBallData(canvasManager) {
  return [
    {
      step: 1,
      balls: [
        {
          position: {
            x: canvasManager.getWidth() / 2,
            y: canvasManager.getHeight() / 2,
          },
          fill: red,
        },
      ],
    },
    { step: 2, balls: [] },
    {
      step: 3,
      balls: [
        {
          position: {
            x: canvasManager.getWidth() / 2 - BUBBLE_RADIUS * 2,
            y: canvasManager.getHeight() / 2 - BUBBLE_RADIUS * 2,
          },
          fill: yellow,
        },
        {
          position: {
            x: canvasManager.getWidth() / 2 + BUBBLE_RADIUS * 2.5,
            y: canvasManager.getHeight() / 2 - BUBBLE_RADIUS * 1.2,
          },
          fill: turquoise,
        },
        {
          position: {
            x: canvasManager.getWidth() / 2 - BUBBLE_RADIUS * 2.5,
            y: canvasManager.getHeight() / 2 + BUBBLE_RADIUS * 2,
          },
          fill: red,
        },
        {
          position: {
            x: canvasManager.getWidth() / 2 + BUBBLE_RADIUS * 1.5,
            y: canvasManager.getHeight() / 2 + BUBBLE_RADIUS * 3,
          },
          fill: white,
        },
      ],
    },
    { step: 4, balls: [] },
    {
      step: 5,
      balls: [
        {
          position: {
            x: canvasManager.getWidth() / 2,
            y: BUBBLE_RADIUS * 4 + 16,
          },
          fill: yellow,
        },
        {
          position: {
            x: canvasManager.getWidth() / 2,
            y: BUBBLE_RADIUS * 2 + 8,
          },
          fill: red,
        },
        {
          position: {
            x: canvasManager.getWidth() / 2,
            y: 0,
          },
          fill: turquoise,
        },
      ],
    },
  ];
}
