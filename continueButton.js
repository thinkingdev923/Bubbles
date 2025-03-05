import { easeOutExpo, easeOutQuart } from "./easings.js";
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
    stiffness: 80,
    damping: 8,
    mass: 1,
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
    const introProgress1 = clampedProgress(0, 800, msElapsed - delay);
    const introProgress2 = clampedProgress(0, 1200, msElapsed - delay);
    const fadeIn = transition(0, 1, introProgress1, easeOutQuart);
    const animateUp = transition(12, 0, introProgress1, easeOutQuart);
    const animateScaleX = transition(0.8, 1, introProgress1, easeOutExpo);
    const animateScaleY = transition(0.9, 1, introProgress1, easeOutExpo);
    const rotateIn = transition(Math.PI / 12, 0, introProgress2, easeOutQuart);
    const clipInRadius = transition(
      0,
      buttonWidth / 2 + 24,
      introProgress2,
      easeOutQuart
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
    CTX.scale(animateScaleX, animateScaleY);
    CTX.scale(hoverShapeScale, hoverShapeScale);
    CTX.stroke(buttonPath);

    // Draw fill as a circular wipe
    CTX.save();
    CTX.clip(buttonPath);
    CTX.fillStyle = buttonColor;
    CTX.beginPath();
    CTX.arc(0, 0, clipInRadius, 0, Math.PI * 2);
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
