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

const fillCell = (rowIndex, cellIndex, content) => {
  levelData.balls[rowIndex][cellIndex] = content;
};

const deleteRow = (rowIndex) => {
  levelData.balls.splice(rowIndex, 1);
};

const elIsEmptyCell = (el) => el.classList.contains("preview-cell--empty");
const elIsBall = (el) => el.classList.contains("preview-cell-ball");
const elIsDelete = (el) => el.classList.contains("preview-row-actions-delete");

document.querySelector("#addRow").addEventListener("click", () => {
  levelData.balls = [makeEmptyRow()].concat(levelData.balls);
  drawLevel(levelData);
});

document.addEventListener("click", ({ target }) => {
  const clickedEl = target.closest("div");

  if (elIsEmptyCell(clickedEl)) {
    fillCell(
      clickedEl.getAttribute("data-row-index"),
      clickedEl.getAttribute("data-cell-index"),
      { x: 0, y: 0 }
    );
    drawLevel(levelData);
  } else if (elIsBall(clickedEl)) {
    fillCell(
      clickedEl.getAttribute("data-row-index"),
      clickedEl.getAttribute("data-cell-index"),
      0
    );
    drawLevel(levelData);
  } else if (elIsDelete(clickedEl)) {
    deleteRow(clickedEl.getAttribute("data-row-index"));
    drawLevel(levelData);
  }
});

drawLevel(levelData);
