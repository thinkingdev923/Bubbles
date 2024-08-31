import {
  animate,
  generateCanvas,
  randomBetween,
  findBallAtPoint,
} from "./helpers.js";
import {
  makeBall,
  checkBallCollision,
  adjustBallPositions,
  resolveBallCollision,
} from "./ball.js";

const [CTX, canvasWidth, canvasHeight] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: "#canvas",
});
const colors = ["#e79fae", "#da4b34", "#f5c347", "#8bcbf3", "#fbfbf8"];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];
const ballNaxSize = 90;
const ballMinSize = 44;
const ballRadius = Math.max(
  ballMinSize,
  Math.min(ballNaxSize, canvasWidth / 10)
);

const makeNBalls = (num) =>
  new Array(num).fill().map(() =>
    makeBall(CTX, canvasWidth, canvasHeight, {
      startPosition: {
        x: randomBetween(canvasWidth / 8, canvasWidth - canvasWidth / 8),
        y: randomBetween(canvasHeight / 8, canvasHeight - canvasHeight / 8),
      },
      startVelocity: {
        x: randomBetween(-6, 6),
        y: randomBetween(-6, -2),
      },
      radius: ballRadius,
      fill: getRandomColor(),
    })
  );

const makeBallAtPoint = ({ x, y }) =>
  makeBall(CTX, canvasWidth, canvasHeight, {
    startPosition: { x: x, y: y },
    startVelocity: { x: 0, y: 0 },
    radius: ballRadius,
    fill: getRandomColor(),
  });

const getValidBalls = () => balls.filter((b) => !b.isPopped());

let balls = makeNBalls(10);

document.addEventListener("click", ({ clientX: x, clientY: y }) => {
  const collidingBall = findBallAtPoint(balls, { x, y });

  if (collidingBall) {
    collidingBall.pop();
  } else {
    balls.push(makeBallAtPoint({ x, y }));
  }
});

document.addEventListener(
  "touchstart",
  (e) => {
    for (let index = 0; index < e.touches.length; index++) {
      const collidingBall = findBallAtPoint(balls, {
        x: e.touches[index].clientX,
        y: e.touches[index].clientY,
      });

      if (collidingBall) {
        collidingBall.pop();
      } else {
        balls.push(
          makeBallAtPoint({
            x: e.touches[index].clientX,
            y: e.touches[index].clientY,
          })
        );
      }
    }

    e.preventDefault();
  },
  { passive: false }
);

document.addEventListener("touchmove", (e) => e.preventDefault(), {
  passive: false,
});

animate((deltaTime) => {
  CTX.clearRect(0, 0, canvasWidth, canvasHeight);

  if (getValidBalls().length > 0) {
    getValidBalls().forEach((ballA) => {
      ballA.update(deltaTime);
      getValidBalls().forEach((ballB) => {
        if (ballA !== ballB) {
          const collision = checkBallCollision(ballA, ballB);
          if (collision[0]) {
            adjustBallPositions(ballA, ballB, collision[1]);
            resolveBallCollision(ballA, ballB);
          }
        }
      });
    });

    balls.forEach((b) => b.draw(deltaTime, 1));
  }
});
