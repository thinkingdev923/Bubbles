export const makeAudioManager = () => {
  let hasInitialized = false;
  let audioCTX;
  let pluck1Buffer;
  let pluck2Buffer;
  let pluck3Buffer;
  let pluck4Buffer;
  let pluck5Buffer;
  let pluck6Buffer;
  let pluck7Buffer;
  let pluck8Buffer;
  let pluck9Buffer;
  let fireworks1Buffer;
  let fireworks2Buffer;
  let missBuffer;
  let loseBuffer;
  let level1Buffer;
  let level2Buffer;
  let silenceAudio;

  async function _loadFile(context, filePath) {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  const initialize = () => {
    if (!hasInitialized) {
      hasInitialized = true;

      // Play silence in a loop in the background on instantiation. Playing some
      // audio continuously with the HTML audio API will allow audio via the Web
      // Audio API to play on the main sound channel in iOS, rather than the
      // ringer channel.
      silenceAudio = new Audio("./sounds/silence.mp3");
      silenceAudio.loop = true;
      silenceAudio.play();

      audioCTX = new AudioContext();
      pluck1Buffer = _loadFile(audioCTX, "./sounds/pluck1.mp3");
      pluck2Buffer = _loadFile(audioCTX, "./sounds/pluck2.mp3");
      pluck3Buffer = _loadFile(audioCTX, "./sounds/pluck3.mp3");
      pluck4Buffer = _loadFile(audioCTX, "./sounds/pluck4.mp3");
      pluck5Buffer = _loadFile(audioCTX, "./sounds/pluck5.mp3");
      pluck6Buffer = _loadFile(audioCTX, "./sounds/pluck6.mp3");
      pluck7Buffer = _loadFile(audioCTX, "./sounds/pluck7.mp3");
      pluck8Buffer = _loadFile(audioCTX, "./sounds/pluck8.mp3");
      pluck9Buffer = _loadFile(audioCTX, "./sounds/pluck9.mp3");
      fireworks1Buffer = _loadFile(audioCTX, "./sounds/fireworks1.mp3");
      fireworks2Buffer = _loadFile(audioCTX, "./sounds/fireworks2.mp3");
      missBuffer = _loadFile(audioCTX, "./sounds/miss.mp3");
      loseBuffer = _loadFile(audioCTX, "./sounds/lose.mp3");
      level1Buffer = _loadFile(audioCTX, "./sounds/level1.mp3");
      level2Buffer = _loadFile(audioCTX, "./sounds/level2.mp3");
    }
  };

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
      return Promise.all([initialize(), audioBuffer]).then((e) =>
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
        pluck7Buffer,
        pluck8Buffer,
        pluck9Buffer,
      ][Math.floor(Math.random() * 9)],
      false
    );
  };

  const playRandomFireworks = () => {
    _playTrack(
      [fireworks1Buffer, fireworks2Buffer][Math.floor(Math.random() * 2)],
      false
    );
  };

  const playMiss = () => {
    _playTrack(missBuffer, false);
  };

  const playRandomLevel = () => {
    _playTrack(
      [level1Buffer, level2Buffer][Math.floor(Math.random() * 2)],
      false
    );
  };

  const playLose = () => {
    _playTrack(loseBuffer, false);
  };

  return {
    initialize,
    playRandomPluck,
    playRandomFireworks,
    playMiss,
    playRandomLevel,
    playLose,
  };
};
