import { randomColorName } from "../colors.js";

export const makeCellHTML = (cellData) => {
  const cell = document.createElement("div");
  cell.classList.add("preview-cell");

  if (cellData) {
    const ball = document.createElement("div");
    ball.classList.add(
      "preview-cell-ball",
      `preview-cell-ball--${randomColorName()}`
    );

    const velocity = document.createElement("div");
    velocity.classList.add("preview-cell-velocity");

    const vX = document.createElement("div");
    vX.classList.add("preview-cell-velocity-x");
    vX.innerText = cellData.x;

    const vY = document.createElement("div");
    vY.classList.add("preview-cell-velocity-y");
    vX.innerText = cellData.y;

    velocity.appendChild(vX);
    velocity.appendChild(vY);

    cell.appendChild(ball);
    cell.appendChild(velocity);
  } else {
    cell.classList.add("preview-cell--empty");
  }

  return cell;
};

export const makeRowHTML = (rowData) => {
  const row = document.createElement("div");
  row.classList.add("preview-row");

  const cells = [];
  rowData.forEach((cellData) => cells.push(makeCellHTML(cellData)));

  const actions = document.createElement("div");
  actions.classList.add("preview-row-actions");

  const deleteAction = document.createElement("div");
  deleteAction.classList.add("preview-row-actions-delete");

  const xImg = document.createElement("img");
  xImg.setAttribute("src", "../images/x.svg");

  deleteAction.appendChild(xImg);
  actions.appendChild(deleteAction);
  cells.forEach((c) => {
    row.appendChild(c);
  });
  row.appendChild(actions);

  return row;
};
