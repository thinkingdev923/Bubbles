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
import { makeRipple } from "./ripple.js";
import { randomColor } from "./colors.js";

const [CTX, canvasWidth, canvasHeight] = generateCanvas({
  width: window.innerWidth,
  height: window.innerHeight,
  attachNode: "#canvas",
});
let balls;
let ripples;
let level;
let ballsPopped;
let ballsMissed;

const onPop = () => ballsPopped++;
const onMiss = () => ballsMissed++;
const makeRandomBalls = (num) =>
  new Array(num).fill().map(() =>
    makeBall(
      CTX,
      canvasWidth,
      canvasHeight,
      {
        startPosition: {
          x: randomBetween(canvasWidth / 8, canvasWidth - canvasWidth / 8),
          y: randomBetween(-canvasHeight, -44),
        },
        startVelocity: {
          x: randomBetween(-6, 6),
          y: 0,
        },
        radius: 44,
        fill: randomColor(),
      },
      onPop,
      onMiss
    )
  );

const resetGame = () => {
  balls = makeRandomBalls(1);
  ripples = [];
  level = 0;
  ballsPopped = 0;
  ballsMissed = 0;
};

const getUnpoppedBalls = () => balls.filter((b) => !b.isPopped());

document.addEventListener("click", ({ clientX: x, clientY: y }) => {
  const collidingBall = findBallAtPoint(balls, { x, y });

  if (collidingBall) {
    collidingBall.pop();
  } else {
    ripples.push(makeRipple(CTX, { x, y }));
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
        ripples.push(
          makeRipple(CTX, {
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

resetGame();

animate((deltaTime) => {
  CTX.clearRect(0, 0, canvasWidth, canvasHeight);

  if (getUnpoppedBalls().length > 0) {
    getUnpoppedBalls().forEach((ballA) => {
      ballA.update(deltaTime);
      getUnpoppedBalls().forEach((ballB) => {
        if (ballA !== ballB) {
          const collision = checkBallCollision(ballA, ballB);
          if (collision[0]) {
            adjustBallPositions(ballA, ballB, collision[1]);
            resolveBallCollision(ballA, ballB);
          }
        }
      });
    });
  }

  ripples.forEach((r) => r.draw());
  balls.forEach((b) => b.draw(deltaTime));

  CTX.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
  CTX.fillStyle = "#fff";
  CTX.fillText(`Level: ${level}`, 8, 32);
  CTX.fillText(`Score: ${ballsPopped - ballsMissed}`, 8, 64);
});
