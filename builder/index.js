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
let selectedBallEl;
let selectedBallRow;
let selectedBallCell;

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

const selectCell = (row, cell) => {
  drawLevel();
  selectedBallEl = document.querySelector(
    `.preview-cell-ball[data-row-index="${row}"][data-cell-index="${cell}"]`
  );
  selectedBallRow = selectedBallEl.getAttribute("data-row-index");
  selectedBallCell = selectedBallEl.getAttribute("data-cell-index");
  selectedBallEl.classList.add("preview-cell-ball--selected");
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

document.addEventListener("keydown", (e) => {
  const { shiftKey, key, repeat } = e;

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

  if (selectedBallRow && selectedBallCell) {
    const ball =
      currentlyDisplayedData.balls[selectedBallRow][selectedBallCell];

    if (key === "Backspace") fillCell(selectedBallRow, selectedBallCell, 0);
    if (key === "ArrowUp") ball.velocity.y--;
    if (key === "ArrowRight") ball.velocity.x++;
    if (key === "ArrowDown") ball.velocity.y++;
    if (key === "ArrowLeft") ball.velocity.x--;

    if (shiftKey && key === "Tab" && parseInt(selectedBallCell) > 0) {
      const prevBallCellIndex = currentlyDisplayedData.balls[
        selectedBallRow
      ].findLastIndex((c, i) => i < parseInt(selectedBallCell) && !!c);
      if (prevBallCellIndex >= 0)
        selectCell(selectedBallRow, prevBallCellIndex);
    } else if (
      key === "Tab" &&
      parseInt(selectedBallCell) <
        currentlyDisplayedData.balls[selectedBallRow].length - 1
    ) {
      const nextBallCellIndex = currentlyDisplayedData.balls[
        selectedBallRow
      ].findIndex((c, i) => i > parseInt(selectedBallCell) && !!c);
      if (nextBallCellIndex >= 0)
        selectCell(selectedBallRow, nextBallCellIndex);
    }

    if (key === "Escape") {
      drawLevel();
      selectedBallEl = null;
      selectedBallRow = null;
      selectedBallCell = null;
    } else {
      // Reselect to redraw level + reselect cell
      selectCell(selectedBallRow, selectedBallCell);
    }
  }

  e.preventDefault();
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
    selectCell(
      clickedEl.getAttribute("data-row-index"),
      clickedEl.getAttribute("data-cell-index")
    );
  } else if (elIsBall) {
    selectCell(
      clickedEl.getAttribute("data-row-index"),
      clickedEl.getAttribute("data-cell-index")
    );
  } else if (elIsDelete) {
    deleteRow(clickedEl.getAttribute("data-row-index"));
    drawLevel();
  } else if (elIsLevel) {
    currentlyDisplayedData =
      gameLevels[clickedEl.getAttribute("data-level-index")];
    drawLevel();
  }
});

drawLevel();
populateLevelData();
