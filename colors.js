const makeGradient = (
  canvasManager,
  radius,
  centerColor,
  middleColor,
  outerColor
) => {
  const CTX = canvasManager.getContext();
  const gradient = CTX.createRadialGradient(
    -Math.round(radius / 4),
    -Math.round(radius / 4),
    radius / 8,
    0,
    0,
    radius
  );
  gradient.addColorStop(0, centerColor);
  gradient.addColorStop(0.5, middleColor);
  gradient.addColorStop(1, outerColor);

  return gradient;
};

export const pink = "#EA98AA";
export const red = "#DF432A";
export const yellow = "#F4BF2A";
export const turquoise = "#79CAEC";
export const white = "#FCF6E8";

const pinkGradient = (canvasManager, radius) =>
  makeGradient(canvasManager, radius, "#FFB7C7", pink, "#E2627E");
const redGradient = (canvasManager, radius) =>
  makeGradient(canvasManager, radius, "#E44D35", red, "#AE250F");
const yellowGradient = (canvasManager, radius) =>
  makeGradient(canvasManager, radius, "#FFCF49", yellow, "#C39513");
const turquoiseGradient = (canvasManager, radius) =>
  makeGradient(canvasManager, radius, "#98E0FE", turquoise, "#51B3DC");
const whiteGradient = (canvasManager, radius) =>
  makeGradient(canvasManager, radius, "#FFFFFF", white, "#E4D9C1");

export const medblue = "#4555A5";
export const green = "#92C262";
export const purple = "#B565A9";
export const orange = "#F38121";
export const teal = "#51BFA4";

export const background = "#2D2D74";

const colors = [pink, red, yellow, turquoise, white];
const gradients = [
  { sourceColor: pink, gradientFunc: pinkGradient },
  { sourceColor: red, gradientFunc: redGradient },
  { sourceColor: yellow, gradientFunc: yellowGradient },
  { sourceColor: turquoise, gradientFunc: turquoiseGradient },
  { sourceColor: white, gradientFunc: whiteGradient },
];
const colorNames = ["pink", "red", "yellow", "turquoise", "white"];

export const randomColor = () =>
  colors[Math.floor(Math.random() * colors.length)];

export const getGradient = (canvasManager, sourceColor, radius) =>
  gradients
    .find((g) => g.sourceColor === sourceColor)
    .gradientFunc(canvasManager, radius);

export const randomColorName = () =>
  colorNames[Math.floor(Math.random() * colorNames.length)];
