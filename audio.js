export const makeAudioManager = () => {
  let hasInitialized = false;
  let audioCTX;
  let pluck1Buffer;
  let pluck2Buffer;
  let pluck3Buffer;
  let pluck4Buffer;
  let pluck5Buffer;
  let pluck6Buffer;
  let missBuffer;

  async function _loadFile(context, filePath) {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  const _initialize = (e) => {
    if (!hasInitialized) {
      hasInitialized = true;
      audioCTX = new AudioContext();
      pluck1Buffer = _loadFile(audioCTX, "./sounds/pluck1.mp3");
      pluck2Buffer = _loadFile(audioCTX, "./sounds/pluck2.mp3");
      pluck3Buffer = _loadFile(audioCTX, "./sounds/pluck3.mp3");
      pluck4Buffer = _loadFile(audioCTX, "./sounds/pluck4.mp3");
      pluck5Buffer = _loadFile(audioCTX, "./sounds/pluck5.mp3");
      pluck6Buffer = _loadFile(audioCTX, "./sounds/pluck6.mp3");
      missBuffer = _loadFile(audioCTX, "./sounds/miss.mp3");
    }
  };

  document.addEventListener("touchend", _initialize, { once: true });
  document.addEventListener(
    "click",
    ({ isTrusted }) => {
      if (isTrusted) _initialize();
    },
    { once: true }
  );

  async function _playTrack(audioBuffer, loop = true) {
    const playBuffer = (buffer) => {
      const trackSource = new AudioBufferSourceNode(audioCTX, {
        buffer: buffer,
        loop: loop,
      });
      trackSource.connect(audioCTX.destination);
      trackSource.start();
      return trackSource;
    };

    if (hasInitialized) {
      return Promise.all([audioCTX.resume(), audioBuffer]).then((e) =>
        playBuffer(e[1])
      );
    } else {
      return Promise.all([_initialize(), audioBuffer]).then((e) =>
        playBuffer(e[1])
      );
    }
  }

  const playRandomPluck = () => {
    _playTrack(
      [
        pluck1Buffer,
        pluck2Buffer,
        pluck3Buffer,
        pluck4Buffer,
        pluck5Buffer,
        pluck6Buffer,
      ][Math.floor(Math.random() * 6)],
      false
    );
  };

  const playMiss = () => {
    _playTrack(missBuffer, false);
  };

  return {
    playRandomPluck,
    playMiss,
  };
};
