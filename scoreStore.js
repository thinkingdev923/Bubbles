export const makeScoreStore = (levelManager) => {
  // MAP STRUCTURE EXAMPLE
  // We store discrete actions that we can flexibly sum, score, etc. later
  //
  // new Map([
  //   [
  //     "taps",
  //     [
  //       { level: 1, position: { x: 42, y: 56 }, popped: 0 },
  //       { level: 1, position: { x: 40, y: 52 }, popped: 1 },
  //       { level: 2, position: { x: 120, y: 500 }, popped: 0 },
  //     ],
  //   ],
  //   [
  //     "slingshots",
  //     [
  //       {
  //         level: 1,
  //         position: { x: 42, y: 56 },
  //         velocity: { x: 0, y: 0 },
  //         popped: 3,
  //       },
  //       {
  //         level: 1,
  //         position: { x: 42, y: 56 },
  //         velocity: { x: 0, y: 0 },
  //         popped: 3,
  //       },
  //     ],
  //   ],
  //   [
  //     "blasts",
  //     [
  //       {
  //         level: 1,
  //         position: { x: 42, y: 56 },
  //         power: 123,
  //         popped: 3,
  //       },
  //       {
  //         level: 1,
  //         position: { x: 42, y: 56 },
  //         power: 123,
  //         popped: 3,
  //       },
  //     ],
  //   ],
  //   [
  //     "missedBubbles",
  //     [
  //       { level: 1, popped: 0 },
  //       { level: 2, popped: 0 },
  //       { level: 2, popped: 0 },
  //     ],
  //   ],
  // ]);

  let store;

  const reset = () =>
    (store = new Map([
      ["taps", []],
      ["slingshots", []],
      ["blasts", []],
      ["missedBubbles", []],
    ]));
  reset();

  const recordTap = (position, popped) => {
    store.set("taps", [
      ...store.get("taps"),
      {
        level: levelManager.getLevel(),
        position,
        popped,
      },
    ]);
  };

  const recordSlingshot = (position, velocity, popped) =>
    store.set("slingshots", [
      ...store.get("slingshots"),
      {
        level: levelManager.getLevel(),
        position,
        velocity,
        popped,
      },
    ]);

  const recordBlast = (position, power, popped) =>
    store.set("blasts", [
      ...store.get("blasts"),
      {
        level: levelManager.getLevel(),
        position,
        power,
        popped,
      },
    ]);

  const recordMiss = () =>
    store.set("missedBubbles", [
      ...store.get("missedBubbles"),
      {
        level: levelManager.getLevel(),
        popped: 0,
      },
    ]);

  const sumAll = (name) => {
    const keyData = store.get(name);

    return {
      num: keyData.length,
      numPopped: keyData.reduce((acc, { popped }) => acc + popped, 0),
    };
  };

  const sumCurrentLevel = (name) => {
    const keyData = store
      .get(name)
      .filter(({ level }) => level === levelManager.getLevel());

    return {
      num: keyData.length,
      numPopped: keyData.reduce((acc, { popped }) => acc + popped, 0),
    };
  };

  return {
    recordTap,
    recordSlingshot,
    recordBlast,
    recordMiss,
    sumAll,
    sumCurrentLevel,
    get: store.get,
    reset,
  };
};
