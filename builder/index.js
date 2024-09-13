import { makeRowHTML } from "./html.js";

const levelData = [
  {
    name: "LEVEL 1",
    gravity: 0.05,
    balls: [[0, { x: 2, y: 1 }, 0, 0, 0, 0]],
  },
  {
    name: "LEVEL 2",
    gravity: 0.07,
    balls: [
      [0, { x: 0, y: 1 }, 0, { x: 0, y: 1 }, 0, { x: 0, y: 1 }],
      [{ x: 0, y: 1 }, 0, { x: 0, y: 1 }, 0, { x: 0, y: 1 }, 0],
      [0, { x: 0, y: 1 }, 0, { x: 0, y: 1 }, 0, { x: 0, y: 1 }],
    ],
  },
];

const levelNodes = [];

levelData[1].balls.forEach((row) => {
  levelNodes.push(makeRowHTML(row));
});

levelNodes.forEach((levelNode) => {
  document.querySelector("#layout-preview").appendChild(levelNode);
});
