export const drawGuides = (CTX, canvasWidth, canvasHeight) => {
  const columnNumber = 16;
  const rowNumber = 12;
  const majorGuideDivisor = 4;

  CTX.save();

  for (let colIndex = 1; colIndex < columnNumber; colIndex++) {
    CTX.fillStyle =
      colIndex % majorGuideDivisor ? "rgba(255, 0, 0, .2)" : "red";

    CTX.fillRect((canvasWidth / columnNumber) * colIndex, 0, 1, canvasHeight);
  }

  CTX.restore();

  CTX.save();

  for (let rowIndex = 1; rowIndex < rowNumber; rowIndex++) {
    CTX.fillStyle =
      rowIndex % majorGuideDivisor ? "rgba(255, 0, 0, .2)" : "red";

    CTX.fillRect(0, (canvasHeight / rowNumber) * rowIndex, canvasWidth, 1);
  }
  CTX.restore();
};
