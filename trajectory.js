export const drawTrajectory = (
  canvasManager,
  currentPosition,
  currentVelocity,
  gravity
) => {
  const CTX = canvasManager.getContext();
  // Iterate on ballistic properties until hitting the ground, and push these
  // points into an array to draw later
  const generateTrajectoryPoints = () => {
    let projectedXPosition = currentPosition.x;
    let projectedYPosition = currentPosition.y;
    let projectedYVelocity = currentVelocity.y;
    const segments = [];

    while (
      projectedYPosition <= canvasManager.getHeight() + 100 &&
      projectedXPosition <= canvasManager.getWidth() + 100 &&
      projectedXPosition >= -100
    ) {
      segments.push({ x: projectedXPosition, y: projectedYPosition });

      projectedYPosition += projectedYVelocity;
      projectedXPosition += currentVelocity.x;
      projectedYVelocity += gravity;
    }

    return segments;
  };

  const segments = generateTrajectoryPoints();

  if (segments.length > 10) {
    const gradientLength = Math.floor(segments.length / 4);

    CTX.save();
    CTX.globalAlpha = 0.1;
    segments.forEach(({ x, y }, index) => {
      if (segments.length > index + 1) {
        const nextSegment = segments[index + 1];
        CTX.beginPath();
        CTX.moveTo(x, y);
        CTX.lineTo(nextSegment.x, nextSegment.y);
        CTX.lineWidth = 88;
        CTX.strokeStyle = `rgba(255, 255, 255, ${index / gradientLength})`;
        CTX.stroke();
      }
    });
    CTX.restore();

    CTX.save();
    CTX.globalAlpha = 0.6;
    segments.forEach(({ x, y }, index) => {
      if (segments.length > index + 1) {
        const nextSegment = segments[index + 1];
        CTX.beginPath();
        CTX.moveTo(x, y);
        CTX.lineTo(nextSegment.x, nextSegment.y);
        CTX.lineWidth = 1;
        CTX.strokeStyle = `rgba(255, 255, 255, ${index / gradientLength})`;
        CTX.stroke();
      }
    });
    CTX.restore();
  }
};
