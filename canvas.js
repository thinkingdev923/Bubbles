export const makeCanvasManager = ({ width, height, attachNode }) => {
  const passedWidth = width;
  const passedHeight = height;
  const element = document.createElement("canvas");
  const context = element.getContext("2d");

  element.style.width = width + "px";
  element.style.height = height + "px";

  const scale = window.devicePixelRatio;
  element.width = Math.floor(width * scale);
  element.height = Math.floor(height * scale);
  context.scale(scale, scale);

  document.querySelector(attachNode).appendChild(element);

  return {
    getContext: () => context,
    getWidth: () => passedWidth,
    getHeight: () => passedHeight,
    getScaleFactor: () => scale,
  };
};
