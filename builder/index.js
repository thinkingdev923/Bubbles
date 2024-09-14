import { makeGravityHTML, makeRowHTML, makeLevelLinkHTML } from "./html.js";
import { GRAVITY } from "../constants.js";
import { randomColor } from "../colors.js";
import { levels as gameLevels } from "../levelData.js";

let currentlyDisplayedData = {
  name: "LEVEL NAME",
  gravity: GRAVITY,
  balls: [[0, 0, 0, 0, 0, 0]],
};

const levelDataEl = document.querySelector("#levelData");
const layoutPreviewEl = document.querySelector("#layout-preview");
const addRowEl = document.querySelector("#addRow");
const copyToClipboardEl = document.querySelector("#copyToClipboard");

const populateLevelData = () => {
  gameLevels.forEach((level, levelIndex) => {
    levelDataEl.appendChild(makeLevelLinkHTML(level, levelIndex));
  });
};

const drawLevel = () => {
  const gravity = currentlyDisplayedData.gravity;
  const balls = currentlyDisplayedData.balls;
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
  currentlyDisplayedData.balls[rowIndex][cellIndex] = content;
};

const deleteRow = (rowIndex) => {
  currentlyDisplayedData.balls.splice(rowIndex, 1);
};

const addRow = () => {
  currentlyDisplayedData.balls = [makeEmptyRow()].concat(
    currentlyDisplayedData.balls
  );
  drawLevel();
};

const copyRow = () =>
  navigator.clipboard.writeText(JSON.stringify(currentlyDisplayedData));

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
  const elIsLevel = clickedEl.hasAttribute("data-level-index");

  if (elIsEmptyCell) {
    fillCell(
      clickedEl.getAttribute("data-row-index"),
      clickedEl.getAttribute("data-cell-index"),
      makeRandomBallData()
    );
    drawLevel();
  } else if (elIsBall) {
    fillCell(
      clickedEl.getAttribute("data-row-index"),
      clickedEl.getAttribute("data-cell-index"),
      0
    );
    drawLevel();
  } else if (elIsDelete) {
    deleteRow(clickedEl.getAttribute("data-row-index"));
    drawLevel();
  } else if (elIsLevel) {
    currentlyDisplayedData =
      gameLevels[clickedEl.getAttribute("data-level-index")];
    drawLevel();
  }
});

let dragTargetBallOrigin;
let dragTargetBallRow;
let dragTargetBallCell;
const handleBallDrag = ({ clientX, clientY }) => {
  const ball =
    currentlyDisplayedData.balls[dragTargetBallRow][dragTargetBallCell];
  const movementXAdjusted = -(dragTargetBallOrigin.x - clientX) / 10;
  const movementYAdjusted = -(dragTargetBallOrigin.y - clientY) / 10;
  ball.velocity = {
    x: Math.round(movementXAdjusted * 10) / 10,
    y: Math.round(movementYAdjusted * 10) / 10,
  };
  drawLevel();
};

document.addEventListener("mousedown", ({ target, clientX, clientY }) => {
  const clickedEl = target.closest("div");
  const elIsBall = clickedEl.classList.contains("preview-cell-ball");

  if (elIsBall) {
    dragTargetBallOrigin = { x: clientX, y: clientY };
    dragTargetBallRow = clickedEl.getAttribute("data-row-index");
    dragTargetBallCell = clickedEl.getAttribute("data-cell-index");
    document.addEventListener("mousemove", handleBallDrag);
  }
});

document.addEventListener("mouseup", () => {
  dragTargetBallOrigin = null;
  dragTargetBallRow = null;
  dragTargetBallCell = null;
  document.removeEventListener("mousemove", handleBallDrag);
});

drawLevel();
populateLevelData();
