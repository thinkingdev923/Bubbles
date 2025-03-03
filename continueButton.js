import { easeInOutSine, easeOutQuart } from "./easings.js";
import { clampedProgress, transition } from "./helpers.js";
import { FONT, FONT_WEIGHT_BOLD } from "./constants.js";
import { randomColor, background } from "./colors.js";
import { makeSpring } from "./spring.js";

export const makeContinueButtonManager = (canvasManager) => {
  const CTX = canvasManager.getContext();
  const buttonPath = new Path2D();
  const buttonHeight = 72;
  const margin = 24;
  const buttonWidth = canvasManager.getWidth() - margin * 2;
  let isHovering;
  let withinDelay;
  let buttonColor = randomColor();

  const hoverSpring = makeSpring(0, {
    stiffness: 90,
    damping: 12,
    mass: 1.2,
    precision: 200,
  });

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
      hoverSpring.setEndValue(100);
      isHovering = true;
      document.body.classList.add("buttonHover");
    } else if (isHovering && !pointInButton(coordinates)) {
      hoverSpring.setEndValue(0);
      isHovering = false;
      document.body.classList.remove("buttonHover");
    }
  };

  const handleClick = (coordinates, callback) => {
    if (withinDelay && pointInButton(coordinates)) {
      hoverSpring.setEndValue(0);
      isHovering = false;
      document.body.classList.remove("buttonHover");
      callback();
    } else {
      // As a side effect of tapping but missing the button, change
      // its color to draw attention
      buttonColor = randomColor();
    }
  };

  const draw = (deltaTime, msElapsed, delay, text = "Continue") => {
    hoverSpring.update(deltaTime);
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

    const hoverShapeScale = transition(
      1,
      1.03,
      hoverSpring.getCurrentValue() / 100
    );
    const hoverTextScale = transition(
      1,
      1.08,
      hoverSpring.getCurrentValue() / 100
    );
    const hoverTextAngle = transition(
      0,
      -Math.PI / 120,
      hoverSpring.getCurrentValue() / 100
    );
    const hoverTextPosition = transition(
      0,
      -1,
      hoverSpring.getCurrentValue() / 100
    );

    CTX.save();
    applyButtonTransforms();
    CTX.strokeStyle = buttonColor;
    CTX.lineWidth = 4;
    CTX.globalAlpha = fadeIn;
    CTX.translate(0, animateUp);
    CTX.rotate(rotateIn);
    CTX.scale(animateScale, animateScale);
    CTX.scale(hoverShapeScale, hoverShapeScale);
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
    CTX.rotate(hoverTextAngle);
    CTX.scale(hoverTextScale, hoverTextScale);
    CTX.translate(0, hoverTextPosition);
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
