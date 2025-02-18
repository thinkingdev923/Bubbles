export const makeGrid = (
  canvasManager,
  items,
  {
    itemWidth,
    itemHeight,
    edgeMargin = 32,
    spaceBetweenH = 8,
    spaceBetweenV = 12,
  }
) => {
  const CTX = canvasManager.getContext();
  const gridWidth = canvasManager.getWidth() - edgeMargin * 2;
  const itemsPerRow = Math.floor(
    (gridWidth + spaceBetweenH) / (itemWidth + spaceBetweenH)
  );
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const gridHeight = (itemHeight + spaceBetweenV) * totalRows - spaceBetweenV;

  const drawItems = (drawFunc) => {
    items.forEach((item, index) => {
      CTX.save();

      const colIndex = index % itemsPerRow;
      const rowIndex = Math.floor(index / itemsPerRow);

      CTX.translate(
        edgeMargin + itemWidth * colIndex + spaceBetweenH * colIndex,
        itemHeight * rowIndex + spaceBetweenV * rowIndex
      );

      drawFunc(item);

      CTX.restore();
    });
  };

  return {
    drawItems,
    getHeight: () => gridHeight,
  };
};
