<script lang="ts">
  import Result from "$lib/components/Result.svelte";
  import { onMount, tick } from "svelte";

  let simulations = Array.from({ length: 15 }, (_, index) => ({
    throws: 10 + index,
    runs: 0,
    snakeEyeFails: 0,
    lowPointFails: 0,
  }));
  $: console.log({ simulations });

  const throwDice = () => Math.floor(Math.random() * 6) + 1;

  const playOneGame = (throws: number) => {
    let points = 0;
    let snakeEyeFail = false;

    for (let i = 0; i < throws; i++) {
      const dice1 = throwDice();
      const dice2 = throwDice();

      if (dice1 === 1 && dice2 === 1) {
        snakeEyeFail = true;
      }

      points += dice1 + dice2;
    }

    return {
      snakeEyeFail,
      lowPointFail: points < 100,
    };
  };

  onMount(async () => {
    while (true) {
      simulations.forEach((simulation, index) => {
        const { snakeEyeFail, lowPointFail } = playOneGame(simulation.throws);

        simulations[index] = {
          ...simulations[index],

          snakeEyeFails: snakeEyeFail
            ? simulations[index].snakeEyeFails + 1
            : simulations[index].snakeEyeFails,

          lowPointFails: lowPointFail
            ? simulations[index].lowPointFails + 1
            : simulations[index].lowPointFails,

          runs: simulations[index].runs + 1,
        };
      });
      await tick();
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  });
</script>

<h1>Runs {simulations[0].runs}</h1>
{#each simulations as { throws, runs, snakeEyeFails, lowPointFails }}
  <Result {throws} {runs} {snakeEyeFails} {lowPointFails} />
{/each}

<style>
  h1 {
    font-size: 4rem;
  }

  @media (min-width: 50rem) {
    h1 {
      font-size: 6rem;
    }
  }
</style>
