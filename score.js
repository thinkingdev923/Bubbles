import { drawPieChart } from "./piechart.js";
import { yellow, red } from "./colors.js";
import { clampedProgress, transition } from "./helpers.js";
import { FONT, FONT_WEIGHT_NORMAL } from "./constants.js";
import { easeOutQuart } from "./easings.js";

export const drawScore = (canvasManager, clicks, popped, missed, msElapsed) => {
  const CTX = canvasManager.getContext();
  const sizeOfPieChart =
    Math.min(canvasManager.getWidth(), canvasManager.getHeight()) / 2;
  const pieChartLineWidth = 12;
  const sizeOfBallCount = 64;
  const bottomLegendOffset = 8;

  CTX.save();
  CTX.translate(
    canvasManager.getWidth() / 2,
    canvasManager.getHeight() / 2 - sizeOfBallCount / 2
  );

  CTX.save();
  CTX.translate(0, -sizeOfBallCount / 5);
  drawBallCount(
    CTX,
    clicks,
    clicks > 1 ? `taps` : `tap`,
    "rgba(255, 255, 255, .2)"
  );
  CTX.restore();

  drawPieChart(
    CTX,
    [
      {
        progress: clampedProgress(
          0,
          clicks,
          transition(
            0,
            popped,
            clampedProgress(0, 800, msElapsed),
            easeOutQuart
          )
        ),
        color: yellow,
      },
    ],
    sizeOfPieChart / 2,
    pieChartLineWidth
  );

  CTX.save();
  CTX.translate(
    -sizeOfPieChart / 2 - bottomLegendOffset,
    sizeOfPieChart / 2 + bottomLegendOffset
  );
  drawBallCount(CTX, popped, "popped", yellow);
  CTX.restore();

  CTX.save();
  CTX.translate(
    sizeOfPieChart / 2 + bottomLegendOffset,
    sizeOfPieChart / 2 + bottomLegendOffset
  );
  drawBallCount(CTX, missed, "missed", red);
  CTX.restore();

  CTX.restore();
};

function drawBallCount(CTX, count, verb, color) {
  CTX.save();
  CTX.fillStyle = color;
  CTX.beginPath();
  CTX.arc(0, 0, 18, 0, 2 * Math.PI);
  CTX.closePath();
  CTX.fill();

  CTX.translate(0, 36);
  CTX.fillStyle = `rgba(255, 255, 255, 1)`;
  CTX.font = `${FONT_WEIGHT_NORMAL} 18px ${FONT}`;
  CTX.textAlign = "center";
  CTX.textBaseline = "middle";
  CTX.fillText(`${count} ${verb}`, 0, 0);

  CTX.restore();
}
