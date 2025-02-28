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
  const successMessageDuration = 2400;
  let hasSeenTutorial = !!localStorage.getItem("bubblesTutorialComplete");
  let tutorialShowing = false;
  let tutorialStep = 1;
  let tutorialCompletedThisSession = false;
  let stepStarted = Date.now();
  let holdingSlingshot = false;
  let holdingBlast = false;

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

  const shouldShowTutorial = () =>
    !hasSeenTutorial && levelManager.getLevel() === 1;

  const isTutorialShowing = () => tutorialShowing;

  const showTutorial = () => {
    tutorialShowing = true;
    stepStarted = Date.now();
    onTutorialStart();
  };

  const advance = () => {
    // TODO: before updating the tutorial step,
    // show confirmation text and then next step after a timer

    tutorialStep++;

    if (tutorialStep > tutorialSteps.length) {
      tutorialCompletedThisSession = true;
      hasSeenTutorial = true;
      tutorialShowing = false;
      localStorage.setItem("bubblesTutorialComplete", true);
      onCompletion();
    } else {
      stepStarted = Date.now();
      onAdvance();
    }
  };

  const logTap = ({ x, y }, popped) => {
    // If currently showing step 1, and tap missed:
    //     update text shown for step 1
    //
    // If currently showing > step 1, and any tap:
    //     update text shown to hint about using slingshot or blast
  };

  const logTriggerOutput = (output) => {
    holdingSlingshot = false;
    holdingBlast = false;
  };

  const previewingSlingshot = () => {
    holdingSlingshot = true;
    // Update text to "Aim here"
    //
    // Figure out where user is currently aiming
  };

  const previewingBlast = () => {
    holdingBlast = true;
    // Update text to "Now let go" after a second
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
    CTX.save();
    CTX.beginPath();
    CTX.moveTo(
      0,
      canvasManager.getHeight() / 2 - canvasManager.getHeight() / 4 + 16
    );
    CTX.lineTo(0, canvasManager.getHeight() / 2 - BUBBLE_RADIUS - 28);
    CTX.lineTo(8, canvasManager.getHeight() / 2 - BUBBLE_RADIUS - 28);
    CTX.lineTo(0, canvasManager.getHeight() / 2 - BUBBLE_RADIUS - 16);
    CTX.lineTo(-8, canvasManager.getHeight() / 2 - BUBBLE_RADIUS - 28);
    CTX.lineTo(0, canvasManager.getHeight() / 2 - BUBBLE_RADIUS - 28);
    CTX.closePath();
    CTX.stroke();
    CTX.restore();
  };

  const drawUpwardsArrow = () => {
    CTX.save();
    CTX.beginPath();
    CTX.moveTo(
      0,
      canvasManager.getHeight() / 2 + canvasManager.getHeight() / 4 - 24
    );
    CTX.lineTo(0, canvasManager.getHeight() / 2 + BUBBLE_RADIUS + 28);
    CTX.lineTo(8, canvasManager.getHeight() / 2 + BUBBLE_RADIUS + 28);
    CTX.lineTo(0, canvasManager.getHeight() / 2 + BUBBLE_RADIUS + 16);
    CTX.lineTo(-8, canvasManager.getHeight() / 2 + BUBBLE_RADIUS + 28);
    CTX.lineTo(0, canvasManager.getHeight() / 2 + BUBBLE_RADIUS + 28);
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
        CTX.fillText("Awesome blast!", 0, canvasManager.getHeight() / 2 + 10);
      }
    } else if (tutorialStep === 5) {
      CTX.fillText(
        holdingSlingshot ? "Let go!" : "Hold and drag",
        0,
        canvasManager.getHeight() / 2 + canvasManager.getHeight() / 4
      );

      drawUpwardsArrow();

      CTX.fillStyle = "rgba(0, 0, 0, .6)";
      CTX.beginPath();
      CTX.arc(0, canvasManager.getHeight() / 2, BUBBLE_RADIUS, 0, Math.PI * 2);
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
    logTap,
    logTriggerOutput,
    previewingSlingshot,
    previewingBlast,
    generateBalls,
    draw,
  };
};
