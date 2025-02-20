import { easeInOutSine, easeOutQuart } from "./easings.js";
import { clampedProgress, transition } from "./helpers.js";
import { FONT, FONT_WEIGHT_BOLD } from "./constants.js";
import { randomColor, background } from "./colors.js";

export const makeContinueButtonManager = (canvasManager) => {
  const CTX = canvasManager.getContext();
  const buttonPath = new Path2D();
  const buttonWidth = 256;
  const buttonHeight = 72;
  const margin = 32;
  let isHovering;
  let hoverStart;
  let hoverEnd;
  let withinDelay;
  let buttonColor = randomColor();

  const applyButtonTransforms = () => {
    CTX.translate(
      canvasManager.getWidth() / 2,
      canvasManager.getHeight() - margin - buttonHeight / 2
    );
  };

  buttonPath.roundRect(
    -buttonWidth / 2,
    -buttonHeight / 2,
    buttonWidth,
    buttonHeight,
    16
  );

  const pointInButton = ({ x, y }) => {
    CTX.save();
    applyButtonTransforms();
    const pointInPath = CTX.isPointInPath(
      buttonPath,
      x * canvasManager.getScaleFactor(),
      y * canvasManager.getScaleFactor()
    );
    CTX.restore();

    return pointInPath;
  };

  const handleHover = (coordinates) => {
    if (!isHovering && pointInButton(coordinates)) {
      isHovering = true;
      hoverStart = Date.now();
      hoverEnd = false;
      document.body.classList.add("buttonHover");
    } else if (isHovering && !pointInButton(coordinates)) {
      isHovering = false;
      hoverStart = false;
      hoverEnd = Date.now();
      document.body.classList.remove("buttonHover");
    }
  };

  const handleClick = (coordinates, callback) => {
    if (withinDelay && pointInButton(coordinates)) {
      isHovering = false;
      hoverStart = false;
      hoverEnd = Date.now();
      document.body.classList.remove("buttonHover");
      callback();
    } else {
      // As a side effect of tapping but missing the button, change
      // its color to draw attention
      buttonColor = randomColor();
    }
  };

  const draw = (msElapsed, delay, text = "Continue") => {
    withinDelay = msElapsed - delay > 0;
    const introProgress = clampedProgress(0, 1000, msElapsed - delay);
    const wipeProgress = clampedProgress(0, 450, msElapsed - delay);
    const fadeIn = transition(0, 1, introProgress, easeOutQuart);
    const animateUp = transition(12, 0, introProgress, easeOutQuart);
    const animateScale = transition(0.9, 1, introProgress, easeOutQuart);
    const rotateIn = transition(Math.PI / 12, 0, introProgress, easeOutQuart);
    const buttonBackgroundWipe = transition(
      0,
      2 * Math.PI - 0.00001,
      wipeProgress
    );

    const mouseOverProgress = clampedProgress(0, 200, Date.now() - hoverStart);
    const mouseOutProgress = clampedProgress(0, 200, Date.now() - hoverEnd);
    const hoverShapeGrow = transition(
      1,
      1.03,
      mouseOverProgress,
      easeInOutSine
    );
    const hoverShapeShrink = transition(
      1.03,
      1,
      mouseOutProgress,
      easeInOutSine
    );
    const hoverTextGrow = transition(1, 1.06, mouseOverProgress, easeInOutSine);
    const hoverTextMove = transition(0, -1, mouseOverProgress, easeInOutSine);
    const hoverTextShrink = transition(
      1.06,
      1,
      mouseOutProgress,
      easeInOutSine
    );
    const hoverTextMoveBack = transition(
      -1,
      0,
      mouseOutProgress,
      easeInOutSine
    );

    CTX.save();
    applyButtonTransforms();
    CTX.strokeStyle = buttonColor;
    CTX.lineWidth = 4;
    CTX.globalAlpha = fadeIn;
    CTX.translate(0, animateUp);
    CTX.rotate(rotateIn);
    CTX.scale(animateScale, animateScale);
    if (isHovering) {
      CTX.scale(hoverShapeGrow, hoverShapeGrow);
    } else {
      CTX.scale(hoverShapeShrink, hoverShapeShrink);
    }
    CTX.stroke(buttonPath);
    CTX.clip(buttonPath);

    // Draw fill as a circular wipe
    CTX.save();
    CTX.fillStyle = buttonColor;
    CTX.rotate(-Math.PI / 2);
    CTX.beginPath();
    CTX.arc(0, 0, buttonWidth / 2 + 12, 0, buttonBackgroundWipe);
    CTX.fill();
    CTX.restore();

    // Rotate text in addition to button
    CTX.rotate(rotateIn);
    if (isHovering) {
      CTX.scale(hoverTextGrow, hoverTextGrow);
      CTX.translate(0, hoverTextMove);
    } else {
      CTX.scale(hoverTextShrink, hoverTextShrink);
      CTX.translate(0, hoverTextMoveBack);
    }
    CTX.font = `${FONT_WEIGHT_BOLD} 24px ${FONT}`;
    CTX.fillStyle = background;
    CTX.textAlign = "center";
    CTX.textBaseline = "middle";
    CTX.fillText(text, 0, 0);
    CTX.restore();
  };

  return {
    draw,
    handleClick,
    handleHover,
  };
};
