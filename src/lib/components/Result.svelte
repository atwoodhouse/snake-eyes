<script lang="ts">
  export let throws: number;
  export let runs: number;
  export let snakeEyeFails: number;
  export let lowPointFails: number;

  $: snakeEyeRisk = snakeEyeFails / runs;
  $: lowPointRisk = lowPointFails / runs;

  $: totalRisk = 1 - (1 - snakeEyeRisk) * (1 - lowPointRisk);
</script>

<div class="container">
  <div>Throws<span>{throws}</span></div>
  <div>Risk of snake eyes<span>{(snakeEyeRisk * 100).toFixed(1)}%</span></div>
  <div>Risk of low points<span>{(lowPointRisk * 100).toFixed(1)}%</span></div>
  <div>Total risk: <span>{(totalRisk * 100).toFixed(1)}%</span></div>
</div>

<style>
  .container {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin-bottom: 2rem;
  }
  span {
    display: block;
    font-size: 2rem;
  }

  @media (min-width: 50rem) {
    span {
      font-size: 4rem;
    }
  }
</style>
