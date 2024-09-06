export const makeCountdown = (numSeconds, callback) => {
  const countDownStart = Date.now();

  setTimeout(callback, numSeconds * 1000);

  const getSecondsRemaining = () => {
    const timeElapsed = Date.now() - countDownStart;
    const msRemaining = numSeconds * 1000 - timeElapsed;
    return Math.max(0, Math.floor(msRemaining / 1000));
  };

  return {
    getSecondsRemaining,
  };
};
