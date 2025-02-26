export const makeTutorialManager = (
  canvasManager,
  levelManager,
  onTutorialStart,
  onCompletion
) => {
  const CTX = canvasManager.getContext();
  const hasSeenTutorial = !!localStorage.getItem("bubblesTutorial");
  let tutorialShowing = false;
  let tutorialStep = 1;

  const complete = () => {
    localStorage.setItem("bubblesTutorial", "true");
    onCompletion();
  };

  const shouldShowTutorial = () =>
    !hasSeenTutorial && levelManager.getLevel() === 1;

  const isTutorialShowing = () => tutorialShowing;

  const showTutorial = () => {
    tutorialShowing = true;
    onTutorialStart();
  };

  const advance = () => {
    tutorialStep++;
  };

  const draw = () => {
    CTX.save();

    if (tutorialStep === 1) {
      CTX.translate(
        canvasManager.getWidth() / 2,
        canvasManager.getHeight() / 2
      );
      CTX.fillStyle = "white";
      CTX.fillRect(-100, -100, 200, 200);
    } else if (tutorialStep === 2) {
      CTX.translate(
        canvasManager.getWidth() / 2,
        canvasManager.getHeight() / 2
      );

      CTX.fillStyle = "red";
      CTX.fillRect(-100, -100, 200, 200);
    }
    CTX.restore();
  };

  return { shouldShowTutorial, isTutorialShowing, showTutorial, advance, draw };
};
