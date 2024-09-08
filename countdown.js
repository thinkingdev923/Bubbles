import { clampedProgress, transition } from "./helpers.js";
import { yellow, turquoise, pink } from "./colors.js";
import { FONT, FONT_WEIGHT_NORMAL } from "./constants.js";

export const makeCountdown = (CTX, numSeconds, callback) => {
  const countDownStart = Date.now();

  const getSecondsRemaining = () => {
    const timeElapsed = Date.now() - countDownStart;
    const msRemaining = numSeconds * 1000 - timeElapsed;
    return Math.max(0, Math.floor(msRemaining / 1000));
  };

  const draw = () => {
    const radius = 64;
    const timeElapsed = Date.now() - countDownStart;
    const secondsRemaining = getSecondsRemaining();
    const color =
      secondsRemaining < 2 ? pink : secondsRemaining < 3 ? turquoise : yellow;

    if (timeElapsed > numSeconds * 1000) callback();

    const countdownProgress = clampedProgress(
      0,
      numSeconds * 1000,
      timeElapsed
    );
    const arcAngleTransition = transition(
      0,
      2 * Math.PI - 0.00001,
      countdownProgress
    );

    CTX.save();
    CTX.fillStyle = color;
    CTX.lineWidth = 8;
    CTX.font = `${FONT_WEIGHT_NORMAL} 80px ${FONT}`;
    CTX.textAlign = "center";
    CTX.textBaseline = "middle";
    CTX.fillText(secondsRemaining, 0, 0);

    CTX.strokeStyle = `rgba(255, 255, 255, .2)`;
    CTX.beginPath();
    CTX.arc(0, 0, radius, 0, 2 * Math.PI);
    CTX.closePath();
    CTX.stroke();

    CTX.strokeStyle = color;
    CTX.rotate(-Math.PI / 2);
    CTX.beginPath();
    CTX.arc(0, 0, radius, 0, arcAngleTransition, true);
    CTX.stroke();
    CTX.restore();
  };

  return {
    draw,
    getSecondsRemaining,
  };
};
