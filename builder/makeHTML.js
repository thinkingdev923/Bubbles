export const makeLevelLinkHTML = (levelData, levelIndex, currentLevelData) => {
  const level = document.createElement("div");
  level.classList.add("levelData-level");
  if (levelData.name === currentLevelData.name)
    level.classList.add("levelData-level--selected");
  level.setAttribute("data-level-index", levelIndex);

  const indexNum = document.createElement("div");
  indexNum.classList.add("levelData-level-index");
  indexNum.setAttribute("data-level-index", levelIndex);
  indexNum.innerText = levelIndex;

  const levelName = document.createElement("div");
  levelName.classList.add("levelData-level-name");
  levelName.setAttribute("data-level-index", levelIndex);
  levelName.innerText = levelData.name;

  level.appendChild(indexNum);
  level.appendChild(levelName);

  return level;
};

export const makeNameHTML = (name) => {
  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("maxlength", "40");
  input.setAttribute("data-input-for", "name");
  input.value = name;

  return input;
};

export const makeGravityHTML = (gravity) => {
  const input = document.createElement("input");
  input.setAttribute("type", "range");
  input.setAttribute("min", ".02");
  input.setAttribute("max", ".1");
  input.setAttribute("step", ".01");
  input.setAttribute("data-input-for", "gravity");
  input.value = gravity;

  return input;
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
    if (!!cellData.velocity.x)
      vX.classList.add(
        cellData.velocity.x < 0
          ? "preview-cell-velocity-x--left"
          : "preview-cell-velocity-x--right"
      );
    vX.innerText = cellData.velocity.x;

    const vY = document.createElement("div");
    vY.classList.add("preview-cell-velocity-y");
    if (!!cellData.velocity.y)
      vY.classList.add(
        cellData.velocity.y < 0
          ? "preview-cell-velocity-y--up"
          : "preview-cell-velocity-y--down"
      );
    vY.innerText = cellData.velocity.y;

    velocity.appendChild(vX);
    velocity.appendChild(vY);

    cell.appendChild(ball);
    cell.appendChild(velocity);
  } else {
    cell.classList.add("preview-cell--empty");

    const plusImg = document.createElement("img");
    plusImg.setAttribute("src", "../images/plus.svg");

    cell.appendChild(plusImg);
  }

  cell.setAttribute("data-row-index", rowIndex);
  cell.setAttribute("data-cell-index", cellIndex);

  return cell;
};
