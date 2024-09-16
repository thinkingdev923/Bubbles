import { makeRowHTML, makeLevelLinkHTML } from "./makeHTML.js";
import { GRAVITY } from "../constants.js";
import { randomColor } from "../colors.js";
import {
  levels as gameLevels,
  makeLevelBall,
  makeLevelEmptyCell,
  makeLevelEmptyRow,
} from "../levelData.js";

let currentlyDisplayedData = {
  name: "LEVEL NAME",
  gravity: GRAVITY,
  balls: [[0, 0, 0, 0, 0, 0]],
};

const levelDataEl = document.querySelector("#levelData");
const layoutNameEl = document.querySelector("#layout-name");
const layoutGravityEl = document.querySelector("#layout-gravity");
const layoutPreviewEl = document.querySelector("#layout-preview");
const addRowEl = document.querySelector("#addRow");
const copyToClipboardEl = document.querySelector("#copyToClipboard");
const openPreviewEl = document.querySelector("#openPreview");
let selectedBallEl;
let selectedBallRow;
let selectedBallCell;

const populateListOfLevels = () => {
  levelDataEl.innerHTML = "";
  gameLevels.forEach((level, levelIndex) => {
    levelDataEl.appendChild(
      makeLevelLinkHTML(level, levelIndex, currentlyDisplayedData)
    );
  });
};

const updateName = (newName) => (currentlyDisplayedData.name = newName);

const updateGravity = (newGrav) => (currentlyDisplayedData.gravity = newGrav);

const drawLevel = () => {
  layoutNameEl.value = currentlyDisplayedData.name;
  layoutGravityEl.value = currentlyDisplayedData.gravity;

  layoutPreviewEl.innerHTML = "";
  const newNodes = [];
  currentlyDisplayedData.balls.forEach((row, rowIndex) =>
    newNodes.push(makeRowHTML(row, rowIndex))
  );
  newNodes.forEach((levelNode) => {
    layoutPreviewEl.appendChild(levelNode);
  });
};

const fillCell = (rowIndex, cellIndex, content) => {
  currentlyDisplayedData.balls[rowIndex][cellIndex] = content;
};

const selectCell = (row, cell) => {
  selectedBallEl = document.querySelector(
    `.preview-cell-ball[data-row-index="${row}"][data-cell-index="${cell}"]`
  );
  selectedBallRow = selectedBallEl.getAttribute("data-row-index");
  selectedBallCell = selectedBallEl.getAttribute("data-cell-index");
  selectedBallEl.classList.add("preview-cell-ball--selected");
};

const clearSelection = () => {
  selectedBallEl = false;
  selectedBallRow = false;
  selectedBallCell = false;
};

const deleteRow = (rowIndex) => {
  if (rowIndex === selectedBallRow) clearSelection();

  currentlyDisplayedData.balls.splice(rowIndex, 1);
};

const addRow = () => {
  currentlyDisplayedData.balls = [makeLevelEmptyRow()].concat(
    currentlyDisplayedData.balls
  );
  drawLevel();
  if (selectedBallRow && selectedBallCell)
    selectCell(parseInt(selectedBallRow) + 1, selectedBallCell);
};

const copyJSON = () =>
  navigator.clipboard.writeText(`${JSON.stringify(currentlyDisplayedData)},`);

layoutNameEl.addEventListener("change", (e) => {
  updateName(e.target.value);
  e.preventDefault();
});

layoutGravityEl.addEventListener("change", (e) => {
  updateGravity(e.target.value);
  e.preventDefault();
});

addRowEl.addEventListener("click", addRow);

copyToClipboardEl.addEventListener("click", copyJSON);

openPreviewEl.addEventListener("click", () => {
  const newHref = window.location.href.replace("/builder/", "");
  window.open(
    `${newHref}?level=${encodeURIComponent(
      JSON.stringify(currentlyDisplayedData)
    )}`
  );
});

document.addEventListener("keydown", (e) => {
  const { shiftKey, ctrlKey, key, repeat } = e;

  if (document.activeElement.tagName === "INPUT") return false;

  // Action keyboard shortcuts
  if (!repeat && !shiftKey && !ctrlKey && key === "r") {
    addRow();
    addRowEl.classList.add("actionsTop-button--active");
  } else if (!repeat && key === "c") {
    copyJSON();
    copyToClipboardEl.classList.add("actionsBottom-button--active");
  }

  // Selected ball actions
  else if (selectedBallRow && selectedBallCell) {
    const ball =
      currentlyDisplayedData.balls[selectedBallRow][selectedBallCell];
    const cellIndexInt = parseInt(selectedBallCell);

    // Adjust values
    if (key === "Backspace") {
      fillCell(selectedBallRow, selectedBallCell, makeLevelEmptyCell());
      clearSelection();
    }
    if (key === "ArrowUp") ball.velocity.y--;
    if (key === "ArrowRight") ball.velocity.x++;
    if (key === "ArrowDown") ball.velocity.y++;
    if (key === "ArrowLeft") ball.velocity.x--;
    if (key === "Tab") {
      if (shiftKey) {
        const prevBallCellIndex = currentlyDisplayedData.balls[
          selectedBallRow
        ].findLastIndex((c, i) => i < cellIndexInt && !!c);
        if (prevBallCellIndex !== -1) {
          drawLevel();
          selectCell(selectedBallRow, prevBallCellIndex);
        }
      } else {
        const nextBallCellIndex = currentlyDisplayedData.balls[
          selectedBallRow
        ].findIndex((c, i) => i > cellIndexInt && !!c);
        if (nextBallCellIndex !== -1) {
          drawLevel();
          selectCell(selectedBallRow, nextBallCellIndex);
        }
      }
    }

    // Reset selection on escape or backspace
    if (key === "Escape" || key === "Backspace") {
      drawLevel();
    }

    // Except on actions that change the selection, redraw + reselect
    if (key !== "Escape" && key !== "Backspace" && key !== "Tab") {
      drawLevel();
      selectCell(selectedBallRow, selectedBallCell);
    }

    // Prevent arrow key scrolling or tab-selecting the browser URL input
    if (
      key === "Tab" ||
      key === "ArrowUp" ||
      key === "ArrowRight" ||
      key === "ArrowDown" ||
      key === "ArrowLeft"
    ) {
      e.preventDefault();
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
      makeLevelBall({ x: 0, y: 0 }, randomColor())
    );
    drawLevel();
    selectCell(
      clickedEl.getAttribute("data-row-index"),
      clickedEl.getAttribute("data-cell-index")
    );
  } else if (elIsBall) {
    drawLevel();
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
    clearSelection();
    drawLevel();
    populateListOfLevels();
  }
});

drawLevel();
populateListOfLevels();
