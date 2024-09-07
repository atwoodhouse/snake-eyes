<script lang="ts">
  import Result from "$lib/components/Result.svelte";

  let simulations = Array.from({ length: 12 }, (_, index) => ({
    throws: 9 + index,
    snakeEyeRisk: 0,
    lowPointsRisk: 0,
  }));
  $: console.log({ simulations });
</script>

{#each simulations as { throws, snakeEyeRisk, lowPointsRisk }}
  <Result {throws} {snakeEyeRisk} {lowPointsRisk} />
{/each}
