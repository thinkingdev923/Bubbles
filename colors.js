export const pink = "#e79fae";
export const red = "#da4b34";
export const yellow = "#f5c347";
export const turquoise = "#8bcbf3";
export const white = "#fbfbf8";

export const colors = [pink, red, yellow, turquoise, white];

export const randomColor = () =>
  colors[Math.floor(Math.random() * colors.length)];
