try {
  importScripts("/gpu-browser.min.js");
  console.log("GPU script loaded successfully");
} catch (e) {
  console.error("Failed to load GPU script", e);
}

const gpu = new GPU({ mode: "gpu" });

const simulateGamesGPU = gpu
  .createKernel(function (throwsPerGame: number) {
    let snakeEyeFails = 0;
    let lowPointFails = 0;
    let runsSnakeEye = 0;
    let runsLowPoint = 0;
    let points = 0;
    let snakeEyeFail = false;

    for (let j = 0; j < throwsPerGame; j++) {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;

      if (dice1 === 1 && dice2 === 1) {
        snakeEyeFail = true;
      }

      points += dice1 + dice2;
    }

    if (snakeEyeFail) {
      snakeEyeFails += 1;
    }

    if (points < 100 && !snakeEyeFail) {
      lowPointFails += 1;
    }

    runsSnakeEye += 1;
    if (!snakeEyeFail) {
      runsLowPoint += 1;
    }

    return [snakeEyeFails, lowPointFails, runsSnakeEye, runsLowPoint];
  })
  .setOutput([100000]) // Run 100k games in parallel
  .setPipeline(true);

// Worker state
let simulations: any[] = [];
let running = false;

self.onmessage = (e) => {
  const { action } = e.data;

  if (action === "start") {
    simulations = e.data.simulations;
    running = true;
    runSimulations();
    sendUpdates();
  } else if (action === "stop") {
    running = false;
  }
};

const runSimulations = () => {
  if (!running) return;

  try {
    for (let i = 0; i < simulations.length; i++) {
      const simulation = simulations[i];

      const gpuResult = simulateGamesGPU(simulation.throws);

      const result = gpuResult.toArray() as [number, number, number, number][];

      // Aggregate results for all 100k simulations
      let aggregatedSnakeEyeFails = 0;
      let aggregatedLowPointFails = 0;
      let aggregatedRunsSnakeEye = 0;
      let aggregatedRunsLowPoint = 0;

      for (let j = 0; j < result.length; j++) {
        aggregatedSnakeEyeFails += result[j][0];
        aggregatedLowPointFails += result[j][1];
        aggregatedRunsSnakeEye += result[j][2];
        aggregatedRunsLowPoint += result[j][3];
      }

      simulations[i] = {
        ...simulation,
        snakeEyeFails: simulation.snakeEyeFails + aggregatedSnakeEyeFails,
        lowPointFails: simulation.lowPointFails + aggregatedLowPointFails,
        runs: {
          snakeEye: simulation.runs.snakeEye + aggregatedRunsSnakeEye,
          lowPoint: simulation.runs.lowPoint + aggregatedRunsLowPoint,
        },
      };
    }

    setTimeout(runSimulations, 10);
  } catch (error) {
    const err = error as Error;
    console.error("Error during GPU simulation:", err.message);
    self.postMessage({ error: err.message });
    return;
  }
};

const sendUpdates = () => {
  if (!running) return;

  self.postMessage({ simulations });

  setTimeout(sendUpdates, 500);
};
