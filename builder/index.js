import { makeGravityHTML, makeRowHTML } from "./html.js";
import { GRAVITY } from "../constants.js";
import { randomColor } from "../colors.js";

let levelData = {
  name: "LEVEL NAME",
  gravity: GRAVITY,
  balls: [[0, 0, 0, 0, 0, 0]],
};

const layoutPreviewEl = document.querySelector("#layout-preview");
const addRowEl = document.querySelector("#addRow");
const copyToClipboardEl = document.querySelector("#copyToClipboard");

const drawLevel = ({ gravity, balls }) => {
  layoutPreviewEl.innerHTML = "";

  const newNodes = [];

  balls.forEach((row, rowIndex) => newNodes.push(makeRowHTML(row, rowIndex)));

  newNodes.forEach((levelNode) => {
    layoutPreviewEl.appendChild(levelNode);
  });

  const gravityInfo = makeGravityHTML(gravity);
  layoutPreviewEl.appendChild(gravityInfo);
};

const makeEmptyRow = () => {
  return [0, 0, 0, 0, 0, 0];
};

const makeRandomBallData = () => ({
  velocity: { x: 0, y: 0 },
  color: randomColor(),
});

const fillCell = (rowIndex, cellIndex, content) => {
  levelData.balls[rowIndex][cellIndex] = content;
};

const deleteRow = (rowIndex) => {
  levelData.balls.splice(rowIndex, 1);
};

const addRow = () => {
  levelData.balls = [makeEmptyRow()].concat(levelData.balls);
  drawLevel(levelData);
};

const copyRow = () => navigator.clipboard.writeText(JSON.stringify(levelData));

addRowEl.addEventListener("click", addRow);
copyToClipboardEl.addEventListener("click", copyRow);
document.addEventListener("keydown", ({ key, repeat }) => {
  if (!repeat) {
    if (key === "r") {
      addRow();
      addRowEl.classList.add("actionsTop-button--active");
    }
    if (key === "c") {
      copyRow();
      copyToClipboardEl.classList.add("actionsBottom-button--active");
    }
  }
});

document.addEventListener("keyup", ({ key }) => {
  if (key === "r") addRowEl.classList.remove("actionsTop-button--active");
  if (key === "c")
    copyToClipboardEl.classList.remove("actionsBottom-button--active");
});

document.addEventListener("click", ({ target }) => {
  const clickedEl = target.closest("div");
  const elIsEmptyCell = clickedEl.classList.contains("preview-cell--empty");
  const elIsBall = clickedEl.classList.contains("preview-cell-ball");
  const elIsDelete = clickedEl.classList.contains("preview-row-actions-delete");

  if (elIsEmptyCell) {
    fillCell(
      clickedEl.getAttribute("data-row-index"),
      clickedEl.getAttribute("data-cell-index"),
      makeRandomBallData()
    );
    drawLevel(levelData);
  } else if (elIsBall) {
    fillCell(
      clickedEl.getAttribute("data-row-index"),
      clickedEl.getAttribute("data-cell-index"),
      0
    );
    drawLevel(levelData);
  } else if (elIsDelete) {
    deleteRow(clickedEl.getAttribute("data-row-index"));
    drawLevel(levelData);
  }
});

drawLevel(levelData);
