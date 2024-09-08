<script lang="ts">
  import Result from "$lib/components/Result.svelte";
  import { onMount } from "svelte";
  import createWorker from "$lib/worker/createSimulationWorker";

  let simulations = Array.from({ length: 15 }, (_, index) => ({
    throws: 10 + index,
    runs: {
      snakeEye: 0,
      lowPoint: 0,
    },
    snakeEyeFails: 0,
    lowPointFails: 0,
  }));

  let worker: Worker;
  let startTime: number;
  let runsPerSecond = 0;

  const formatNumber = (value: number) => {
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(3).replace(/\.0$/, "") + "B";
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(2).replace(/\.0$/, "") + "M";
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
      return value.toString();
    }
  };

  const calculateRunsPerSecond = (runs: number) => {
    const currentTime = Date.now();
    const elapsedTimeInSeconds = (currentTime - startTime) / 1000;
    return (runsPerSecond = runs / elapsedTimeInSeconds);
  };

  onMount(() => {
    startTime = Date.now();
    worker = createWorker();

    // Start the worker simulation
    worker.postMessage({ action: "start", simulations });

    worker.onmessage = (e) => {
      if (e.data.simulations) {
        simulations = [...e.data.simulations];
      }
    };

    return () => {
      worker.postMessage({ action: "stop" });
      worker.terminate();
    };
  });

  $: runsPerSecond = calculateRunsPerSecond(simulations[0].runs.snakeEye);
</script>

<h1>Runs {formatNumber(simulations[0].runs.snakeEye)}</h1>
<h2>Runs per second: {formatNumber(runsPerSecond)}</h2>
{#each simulations as simulation}
  <Result {simulation} />
{/each}

<style>
  h1 {
    font-size: 4rem;
    margin: 0;
  }

  h2 {
    font-size: 2rem;
    margin: 0 0 2rem;
  }

  @media (min-width: 50rem) {
    h1 {
      font-size: 6rem;
    }
    h2 {
      font-size: 3rem;
    }
  }
</style>
