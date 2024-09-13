import { makeCellHTML, makeGravityHTML, makeRowHTML } from "./html.js";
import { GRAVITY } from "../constants.js";

let levelData = {
  name: "LEVEL NAME",
  gravity: GRAVITY,
  balls: [[0, 0, 0, 0, 0, 0]],
};

const drawLevel = ({ gravity, balls }) => {
  const rootNode = document.querySelector("#layout-preview");
  rootNode.innerHTML = "";

  const newNodes = [];

  balls.forEach((row, rowIndex) => newNodes.push(makeRowHTML(row, rowIndex)));

  newNodes.forEach((levelNode) => {
    document.querySelector("#layout-preview").appendChild(levelNode);
  });

  const gravityInfo = makeGravityHTML(gravity);
  document.querySelector("#layout-preview").appendChild(gravityInfo);
};

const makeEmptyRow = () => {
  return [0, 0, 0, 0, 0, 0];
};

const fillCell = (rowIndex, cellIndex) => {
  levelData.balls[rowIndex][cellIndex] = { x: 0, y: 0 };
};

document.querySelector("#addRow").addEventListener("click", () => {
  levelData.balls = [makeEmptyRow()].concat(levelData.balls);
  drawLevel(levelData);
});

document.addEventListener("click", ({ target }) => {
  if (target.classList.contains("preview-cell--empty")) {
    fillCell(
      target.getAttribute("data-row-index"),
      target.getAttribute("data-cell-index")
    );
    drawLevel(levelData);
  }
});

drawLevel(levelData);
