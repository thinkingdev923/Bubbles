import {
  BUBBLE_RADIUS,
  FONT_WEIGHT_BOLD,
  FONT,
  FONT_WEIGHT_NORMAL,
} from "./constants.js";
import { red, white, turquoise, yellow } from "./colors.js";
import { makeBall } from "./ball.js";

export const makeTutorialManager = (
  canvasManager,
  levelManager,
  onTutorialStart,
  onAdvance,
  onCompletion
) => {
  const CTX = canvasManager.getContext();
  const hasSeenTutorial = !!localStorage.getItem("bubblesTutorialComplete");
  let tutorialShowing = false;
  let tutorialStep = 1;
  let tutorialCompletedThisSession = false;

  const tutorialSteps = [
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
    {
      step: 2,
      balls: [
        {
          position: {
            x: canvasManager.getWidth() / 2 - BUBBLE_RADIUS * 2,
            y: canvasManager.getHeight() / 2 - BUBBLE_RADIUS * 3,
          },
          fill: yellow,
        },
        {
          position: {
            x: canvasManager.getWidth() / 2 + BUBBLE_RADIUS * 3,
            y: canvasManager.getHeight() / 2 - BUBBLE_RADIUS * 2,
          },
          fill: turquoise,
        },
        {
          position: {
            x: canvasManager.getWidth() / 2 - BUBBLE_RADIUS * 3,
            y: canvasManager.getHeight() / 2 + BUBBLE_RADIUS * 2,
          },
          fill: red,
        },
        {
          position: {
            x: canvasManager.getWidth() / 2 + BUBBLE_RADIUS * 2,
            y: canvasManager.getHeight() / 2 + BUBBLE_RADIUS * 4,
          },
          fill: white,
        },
      ],
    },
    {
      step: 3,
      balls: [
        {
          position: {
            x: canvasManager.getWidth() / 2,
            y: (BUBBLE_RADIUS + 8) * 5,
          },
          fill: yellow,
        },
        {
          position: {
            x: canvasManager.getWidth() / 2,
            y: (BUBBLE_RADIUS + 8) * 3,
          },
          fill: red,
        },
        {
          position: {
            x: canvasManager.getWidth() / 2,
            y: BUBBLE_RADIUS + 8,
          },
          fill: turquoise,
        },
      ],
    },
  ];

  const shouldShowTutorial = () =>
    !hasSeenTutorial && levelManager.getLevel() === 1;

  const isTutorialShowing = () => tutorialShowing;

  const showTutorial = () => {
    tutorialShowing = true;
    onTutorialStart();
  };

  const advance = () => {
    tutorialStep++;

    if (tutorialStep > tutorialSteps.length) {
      localStorage.setItem("bubblesTutorialComplete", "true");
      tutorialCompletedThisSession = true;
      onCompletion();
    } else {
      onAdvance();
    }
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

  const draw = () => {
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

      CTX.beginPath();
      CTX.moveTo(
        0,
        canvasManager.getHeight() / 2 - canvasManager.getHeight() / 4 + 16
      );
      CTX.lineTo(0, canvasManager.getHeight() / 2 - BUBBLE_RADIUS - 16);
      CTX.closePath();
      CTX.stroke();
    } else if (tutorialStep === 2) {
      CTX.fillText(
        "Hold down",
        0,
        canvasManager.getHeight() / 2 - canvasManager.getHeight() / 4
      );

      CTX.beginPath();
      CTX.moveTo(
        0,
        canvasManager.getHeight() / 2 - canvasManager.getHeight() / 4 + 16
      );
      CTX.lineTo(0, canvasManager.getHeight() / 2 - BUBBLE_RADIUS - 16);
      CTX.closePath();
      CTX.stroke();

      CTX.fillStyle = "#000";
      CTX.beginPath();
      CTX.ellipse(
        0,
        canvasManager.getHeight() / 2,
        BUBBLE_RADIUS,
        BUBBLE_RADIUS * 1.1,
        0,
        0,
        Math.PI * 2
      );
      CTX.closePath();
      CTX.fill();
    } else if (tutorialStep === 3) {
      CTX.fillText(
        "Hold and drag",
        0,
        canvasManager.getHeight() / 2 + canvasManager.getHeight() / 4
      );

      CTX.beginPath();
      CTX.moveTo(
        0,
        canvasManager.getHeight() / 2 + canvasManager.getHeight() / 4 - 24
      );
      CTX.lineTo(0, canvasManager.getHeight() / 2 + BUBBLE_RADIUS + 16);
      CTX.closePath();
      CTX.stroke();

      CTX.fillStyle = "#000";
      CTX.beginPath();
      CTX.ellipse(
        0,
        canvasManager.getHeight() / 2,
        BUBBLE_RADIUS,
        BUBBLE_RADIUS * 1.1,
        0,
        0,
        Math.PI * 2
      );
      CTX.closePath();
      CTX.fill();
    }
    CTX.restore();
  };

  return {
    shouldShowTutorial,
    isTutorialShowing,
    isTutorialCompletedThisSession: () => tutorialCompletedThisSession,
    showTutorial,
    advance,
    generateBalls,
    draw,
  };
};
