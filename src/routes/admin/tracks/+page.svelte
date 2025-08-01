<script>
  import { onMount } from 'svelte';

  const startYear = 2025;
  let currentYear = new Date().getFullYear();
  let maxYear = currentYear + 1;

  let years = [];
  let months = [
    { name: 'januari', value: '01' },
    { name: 'februari', value: '02' },
    { name: 'maart', value: '03' },
    { name: 'april', value: '04' },
    { name: 'mei', value: '05' },
    { name: 'juni', value: '06' },
    { name: 'juli', value: '07' },
    { name: 'augustus', value: '08' },
    { name: 'september', value: '09' },
    { name: 'oktober', value: '10' },
    { name: 'november', value: '11' },
    { name: 'december', value: '12' }
  ];

  let selectedYear = currentYear;
  let selectedMonth = String(new Date().getMonth() + 1).padStart(2, '0');

  onMount(() => {
    years = Array.from({ length: maxYear - startYear + 1 }, (_, i) => startYear + i);
  });

  $: selectedDate = selectedYear && selectedMonth ? `${selectedYear}-${selectedMonth}` : '';

  let searchQuery = '';
</script>

<h1 class="text-3xl font-bold my-3">Tracks beheren</h1>

<h1 class="text-xl font-bold my-3">Specifieke maand openen</h1>

<div class="flex gap-2 items-center">
  <label>
    <select bind:value={selectedMonth} class="select">
      <option value="" disabled selected>Kies maand</option>
      {#each months as month}
        <option value={month.value}>{month.name}</option>
      {/each}
    </select>
  </label>

  <label>
    <select bind:value={selectedYear} class="select">
      {#each years as year}
        <option value={year}>{year}</option>
      {/each}
    </select>
  </label>

  <a href={`/admin/tracks/${selectedDate}`} class="btn btn-primary">Openen</a>
</div>

<h1 class="text-xl font-bold my-3">Zoek op titel of artiest</h1>

<form
  on:submit|preventDefault={() => {
    window.location.href = `/admin/tracks/search?query=${searchQuery}`;
  }}
  class="flex gap-2 items-center"
>
  <input
    type="text"
    placeholder="Zoek op titel of artiest"
    class="input input-bordered w-full max-w-xs"
    bind:value={searchQuery}
  />
  <button type="submit" class="btn btn-primary">Zoeken</button>
</form>
