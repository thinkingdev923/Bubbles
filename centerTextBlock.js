export const centerTextBlock = (CTX, canvasWidth, canvasHeight, lines) => {
  const lineHeight = 32;
  CTX.save();
  CTX.translate(canvasWidth / 2, canvasHeight / 2);
  CTX.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
  CTX.fillStyle = "#fff";
  CTX.textAlign = "center";
  lines.forEach((line, index) => {
    CTX.fillText(
      line,
      0,
      (index + 1) * lineHeight - (lines.length / 2) * lineHeight
    );
  });
  CTX.restore();
};
