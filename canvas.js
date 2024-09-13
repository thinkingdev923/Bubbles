export const makeCanvasManager = ({
  initialWidth,
  initialHeight,
  attachNode,
}) => {
  let width = initialWidth;
  let height = initialHeight;
  const element = document.createElement("canvas");
  const context = element.getContext("2d");
  const scale = window.devicePixelRatio;

  const setCanvasSize = () => {
    element.style.width = width + "px";
    element.style.height = height + "px";
    element.width = Math.floor(width * scale);
    element.height = Math.floor(height * scale);
    context.scale(scale, scale);
  };

  setCanvasSize();

  document.querySelector(attachNode).appendChild(element);

  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    setCanvasSize();
  });

  return {
    getContext: () => context,
    getWidth: () => width,
    getHeight: () => height,
    getScaleFactor: () => scale,
  };
};
