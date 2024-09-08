try {
  importScripts("/gpu-browser.min.js");
  console.log("GPU script loaded successfully");
} catch (e) {
  console.error("Failed to load GPU script", e);
}

const gpu = new GPU({
  mode: "gpu",
});

const simulateGamesGPU = gpu
  .createKernel(function (throwsPerGame: number) {
    let snakeEyeFails = 0;
    let lowPointFails = 0;
    let runsSnakeEye = 0;
    let runsLowPoint = 0;
    let points = 0;
    let snakeEyeFail = 0;

    for (let j = 0; j < throwsPerGame; j += 1) {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;

      snakeEyeFail = snakeEyeFail === 1 ? 1 : (dice1 === 1 ? 1 : 0) * (dice2 === 1 ? 1 : 0);
      points += dice1 + dice2;
    }

    snakeEyeFails += snakeEyeFail;
    lowPointFails += points < 100 && snakeEyeFail === 0 ? 1 : 0;
    runsSnakeEye += 1;
    runsLowPoint += snakeEyeFail === 0 ? 1 : 0;

    return [snakeEyeFails, lowPointFails, runsSnakeEye, runsLowPoint];
  })
  .setOutput([100000]);

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
    for (let i = 0; i < simulations.length; i += 1) {
      const simulation = simulations[i];

      // Execute the kernel with the specific throws per game
      const result = simulateGamesGPU(simulation.throws || 0) as [number, number, number, number][];

      // Aggregate results for all 100k simulations
      let aggregatedSnakeEyeFails = 0;
      let aggregatedLowPointFails = 0;
      let aggregatedRunsSnakeEye = 0;
      let aggregatedRunsLowPoint = 0;

      for (let j = 0; j < result.length; j += 1) {
        aggregatedSnakeEyeFails += result[j][0];
        aggregatedLowPointFails += result[j][1];
        aggregatedRunsSnakeEye += result[j][2];
        aggregatedRunsLowPoint += result[j][3];
      }

      // Update the simulation results with the correct values
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

    setTimeout(runSimulations, 10); // Repeat the simulations after 10ms
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
