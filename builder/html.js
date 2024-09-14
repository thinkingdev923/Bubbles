export const makeCellHTML = (cellData, rowIndex, cellIndex) => {
  const cell = document.createElement("div");
  cell.classList.add("preview-cell");

  if (cellData) {
    const ball = document.createElement("div");
    ball.classList.add("preview-cell-ball");
    ball.setAttribute("style", `background-color: ${cellData.color}`);
    ball.setAttribute("data-row-index", rowIndex);
    ball.setAttribute("data-cell-index", cellIndex);

    const velocity = document.createElement("div");
    velocity.classList.add("preview-cell-velocity");

    const vX = document.createElement("div");
    vX.classList.add("preview-cell-velocity-x");
    vX.innerText = cellData.velocity.x;

    const vY = document.createElement("div");
    vY.classList.add("preview-cell-velocity-y");
    vY.innerText = cellData.velocity.y;

    velocity.appendChild(vX);
    velocity.appendChild(vY);

    cell.appendChild(ball);
    cell.appendChild(velocity);
  } else {
    cell.classList.add("preview-cell--empty");
  }

  cell.setAttribute("data-row-index", rowIndex);
  cell.setAttribute("data-cell-index", cellIndex);

  return cell;
};

export const makeRowHTML = (rowData, rowIndex) => {
  const row = document.createElement("div");
  row.classList.add("preview-row");

  const cells = [];
  rowData.forEach((cellData, cellIndex) =>
    cells.push(makeCellHTML(cellData, rowIndex, cellIndex))
  );

  const actions = document.createElement("div");
  actions.classList.add("preview-row-actions");

  const deleteAction = document.createElement("div");
  deleteAction.classList.add("preview-row-actions-delete");
  deleteAction.setAttribute("data-row-index", rowIndex);

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

export const makeGravityHTML = (gravity) => {
  const row = document.createElement("div");
  row.classList.add("layout-gravity");
  row.innerText = gravity;

  return row;
};
