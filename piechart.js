import { transition } from "./helpers.js";

export const drawPieChart = (CTX, data, radius, lineWidth = 12) => {
  CTX.save();
  CTX.lineWidth = lineWidth;
  CTX.strokeStyle = `rgba(255, 255, 255, .2)`;
  CTX.beginPath();
  CTX.arc(0, 0, radius, 0, 2 * Math.PI);
  CTX.closePath();
  CTX.stroke();
  CTX.restore();

  const seriesWidth = lineWidth / data.length;

  data.forEach(({ progress, color }, index) => {
    CTX.save();
    CTX.lineWidth = seriesWidth;
    CTX.strokeStyle = color;
    CTX.rotate(-Math.PI / 2);
    CTX.beginPath();
    CTX.arc(
      0,
      0,
      radius - seriesWidth * index,
      0,
      transition(0, 2 * Math.PI - 0.00001, progress)
    );
    CTX.stroke();
    CTX.restore();
  });
};
