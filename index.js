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
let level;
let ballsPopped;
let ballsMissed;
let balls;
let ripples;
let gameOver;

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

restartGame();
animate((deltaTime) => {
  CTX.clearRect(0, 0, canvasWidth, canvasHeight);

  if (gameOver) {
    CTX.save();
    CTX.translate(canvasWidth / 2, canvasHeight / 2);
    CTX.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
    CTX.fillStyle = "#fff";
    CTX.textAlign = "center";
    CTX.fillText(`Final Level: ${level}`, 0, -32);
    CTX.fillText(`Total Popped: ${ballsPopped}`, 0, 0);
    CTX.fillText(`Total Missed: ${ballsMissed}`, 0, 32);
    CTX.restore();
  } else {
    getBallsInPlay().forEach((ballA) => {
      ballA.update(deltaTime);
      getBallsInPlay().forEach((ballB) => {
        if (ballA !== ballB) {
          const collision = checkBallCollision(ballA, ballB);
          if (collision[0]) {
            adjustBallPositions(ballA, ballB, collision[1]);
            resolveBallCollision(ballA, ballB);
          }
        }
      });
    });

    CTX.save();
    CTX.font = "500 24px -apple-system, BlinkMacSystemFont, sans-serif";
    CTX.fillStyle = "#fff";
    CTX.fillText(`Level: ${level}`, 8, 32);
    CTX.translate(canvasWidth - 8, 0);
    CTX.textAlign = "right";
    CTX.fillText(`Score: ${ballsPopped - ballsMissed}`, 0, 32);
    CTX.restore();
  }

  ripples.forEach((r) => r.draw());
  balls.forEach((b) => b.draw(deltaTime));
});

function setLevel(passedLevel) {
  level = passedLevel;
  balls = makeRandomBalls(level); // level number == number of balls
  ripples = [];
}

const onLevelEnd = () => {
  setLevel(level + 1);
};

const onGameEnd = () => {
  gameOver = true;
};

function restartGame() {
  gameOver = false;
  ballsPopped = 0;
  ballsMissed = 0;
  setLevel(1);
}

function onPop() {
  ballsPopped++;

  if (getBallsInPlay() <= 0) {
    onLevelEnd();
  }
}

function onMiss() {
  ballsMissed++;

  if (ballsPopped - ballsMissed < 0) {
    onGameEnd();
  } else if (getBallsInPlay() <= 0) {
    onLevelEnd();
  }
}

function makeRandomBalls(num) {
  return new Array(num).fill().map(() =>
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
}

function getBallsInPlay() {
  return balls.filter((b) => !b.isPopped() && !b.isGone());
}
