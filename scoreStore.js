import { levels, countLevelBalls } from "./levelData.js";
import { progress } from "./helpers.js";

export const makeScoreStore = (levelManager) => {
  // MAP STRUCTURE EXAMPLE
  // We store discrete actions that we can flexibly sum, score, etc. later
  //
  // new Map([
  //   [
  //     "taps",
  //     [
  //       { timestamp: 1234, level: 1, position: { x: 42, y: 56 }, popped: 0, fill: false },
  //       { timestamp: 1234, level: 1, position: { x: 40, y: 52 }, popped: 1, fill: '#000000' },
  //       { timestamp: 1234, level: 2, position: { x: 42, y: 60 }, popped: 0, fill: false}
  //     ],
  //   ],
  //   [
  //     "slingshots",
  //     [
  //       { timestamp: 1234, level: 1, position: { x: 42, y: 56 }, velocity: { x: 0, y: 0 }, popped: 3 },
  //       { timestamp: 1234, level: 1, position: { x: 42, y: 56 }, velocity: { x: 0, y: 0 }, popped: 2 }
  //     ],
  //   ],
  //   [
  //     "blasts",
  //     [
  //       { timestamp: 1234, level: 1, position: { x: 42, y: 56 }, power: 123, popped: 2 },
  //       { timestamp: 1234, level: 1, position: { x: 42, y: 56 }, power: 123, popped: 3 }
  //     ],
  //   ],
  //   [
  //     "missedBubbles",
  //     [
  //       { timestamp: 1234, level: 1, popped: 0 },
  //       { timestamp: 1234, level: 2, popped: 0 },
  //       { timestamp: 1234, level: 2, popped: 0 },
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

  const recordTap = (position, popped, fill = false) => {
    store.set("taps", [
      ...store.get("taps"),
      {
        timestamp: Date.now(),
        level: levelManager.getLevel(),
        position,
        popped,
        fill,
      },
    ]);
  };

  const recordSlingshot = (position, velocity, popped) => {
    const timestamp = Date.now();

    store.set("slingshots", [
      ...store.get("slingshots"),
      {
        timestamp,
        level: levelManager.getLevel(),
        position: { ...position },
        velocity: { ...velocity },
        popped,
      },
    ]);

    return timestamp;
  };

  const updateSlingshot = (timestamp, popped) => {
    const slingshotIndex = store
      .get("slingshots")
      .findIndex((i) => i.timestamp === timestamp);

    const slingshotsCopy = [...store.get("slingshots")];

    slingshotsCopy[slingshotIndex].popped = popped;

    store.set("slingshots", slingshotsCopy);
  };

  const recordBlast = (position, power, popped) => {
    const timestamp = Date.now();

    store.set("blasts", [
      ...store.get("blasts"),
      {
        timestamp,
        level: levelManager.getLevel(),
        position,
        power,
        popped,
      },
    ]);

    return timestamp;
  };

  const updateBlast = (timestamp, popped) => {
    const blastIndex = store
      .get("blasts")
      .findIndex((i) => i.timestamp === timestamp);

    const blastsCopy = [...store.get("blasts")];

    blastsCopy[blastIndex].popped = popped;

    store.set("blasts", blastsCopy);
  };

  const recordMiss = () =>
    store.set("missedBubbles", [
      ...store.get("missedBubbles"),
      { timestamp: Date.now(), level: levelManager.getLevel(), popped: 0 },
    ]);

  const hasPoppedKey = (name) => store.get(name).some((o) => "popped" in o);

  const sumCategoryLevelEvents = (category, passedLevel = null) => {
    let filteredEvents;

    if (passedLevel) {
      filteredEvents = store
        .get(category)
        .filter(({ level }) => level === passedLevel);
    } else {
      filteredEvents = store.get(category);
    }

    return hasPoppedKey(category)
      ? {
          data: filteredEvents,
          num: filteredEvents.length,
          numPopped: filteredEvents.reduce(
            (acc, { popped }) => acc + popped,
            0
          ),
        }
      : { num: filteredEvents.length };
  };

  const sumPopped = (passedLevel = null) => {
    let totalPopped = 0;

    store.forEach((category) => {
      if (passedLevel) {
        category
          .filter(({ level }) => level === passedLevel)
          .forEach(({ popped }) => (totalPopped += popped));
      } else {
        category.forEach(({ popped }) => (totalPopped += popped));
      }
    });

    return totalPopped;
  };

  const recentCombos = (level) => {
    const recentTimeframeInMS = 2400;

    return [
      ...store
        .get("slingshots")
        .filter(
          (s) =>
            s.level === level &&
            s.popped > 1 &&
            Date.now() - s.timestamp < recentTimeframeInMS
        ),
      ...store
        .get("blasts")
        .filter(
          (b) =>
            b.level === level &&
            b.popped > 1 &&
            Date.now() - b.timestamp < recentTimeframeInMS
        ),
    ];
  };

  const levelScoreNumber = (passedLevel) => {
    // Fetching ball count via level number doens't work for preview. Need to figure
    // out a way to read level data directly
    const levelData = levels[passedLevel - 1];
    const numBubbles = countLevelBalls(levelData);
    const numMoves =
      store.get("taps").filter((t) => t.level === passedLevel).length +
      store.get("slingshots").filter((s) => s.level === passedLevel).length +
      store.get("blasts").filter((b) => b.level === passedLevel).length;

    const numMissed =
      store.get("missedBubbles").filter((m) => m.level === passedLevel).length +
      1;

    const maxPossiblePoppedPerMove = 15;
    const mostEfficientNumMoves = Math.min(
      numBubbles,
      maxPossiblePoppedPerMove
    );
    const score = Math.round(
      progress(0, mostEfficientNumMoves, numBubbles / numMoves - numMissed) *
        100
    );

    return score;
  };

  const getTaps = (passedLevel = null) => [
    ...store
      .get("taps")
      .filter((s) => (passedLevel ? s.level === passedLevel : true)),
  ];

  const getSlingshots = (passedLevel = null) => [
    ...store
      .get("slingshots")
      .filter((s) => (passedLevel ? s.level === passedLevel : true)),
  ];

  const getBlasts = (passedLevel = null) => [
    ...store
      .get("blasts")
      .filter((b) => (passedLevel ? b.level === passedLevel : true)),
  ];

  return {
    recordTap,
    recordSlingshot,
    updateSlingshot,
    recordBlast,
    updateBlast,
    recordMiss,
    sumCategoryLevelEvents,
    sumPopped,
    recentCombos,
    levelScoreNumber,
    getTaps,
    getSlingshots,
    getBlasts,
    reset,
  };
};
