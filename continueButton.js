import { easeOutQuart } from "./easings.js";
import { clampedProgress, transition } from "./helpers.js";
import { FONT, FONT_WEIGHT_NORMAL } from "./constants.js";
import { randomColor, background } from "./colors.js";

export const makeContinueButtonManager = (canvasManager) => {
  const CTX = canvasManager.getContext();
  const buttonPath = new Path2D();
  const buttonWidth = 260;
  const buttonHeight = 80;
  const lifeIndicatorClearanceOffset = 65;
  const margin = 27;
  let isHovering;
  let withinDelay;
  let buttonColor = randomColor();

  const applyButtonTransforms = () => {
    CTX.translate(
      canvasManager.getWidth() / 2,
      canvasManager.getHeight() -
        lifeIndicatorClearanceOffset -
        margin -
        buttonHeight / 2
    );
  };

  buttonPath.roundRect(
    -buttonWidth / 2,
    -buttonHeight / 2,
    buttonWidth,
    buttonHeight,
    12
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

  const handleHover = (coordinates, callbackMouseOver, callbackMouseOut) => {
    if (!isHovering && pointInButton(coordinates)) {
      isHovering = true;
      document.body.classList.add("buttonHover");
      callbackMouseOver();
    } else if (isHovering && !pointInButton(coordinates)) {
      isHovering = false;
      document.body.classList.remove("buttonHover");
      callbackMouseOut();
    }
  };

  const handleClick = (coordinates, callback) => {
    if (withinDelay && pointInButton(coordinates)) {
      isHovering = false;
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

    CTX.save();
    applyButtonTransforms();
    CTX.strokeStyle = buttonColor;
    CTX.lineWidth = 4;
    CTX.globalAlpha = fadeIn;
    CTX.translate(0, animateUp);
    CTX.rotate(rotateIn);
    CTX.scale(animateScale, animateScale);
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
    CTX.font = `${FONT_WEIGHT_NORMAL} 24px ${FONT}`;
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
