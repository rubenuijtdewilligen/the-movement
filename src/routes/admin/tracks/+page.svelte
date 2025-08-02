<script>
  import { onMount } from 'svelte';

  const startYear = 2025;
  let currentYear = new Date().getFullYear();
  let maxYear = currentYear + 1;

  let years = [];
  let months = [
    { name: 'january', value: '01' },
    { name: 'february', value: '02' },
    { name: 'march', value: '03' },
    { name: 'april', value: '04' },
    { name: 'may', value: '05' },
    { name: 'june', value: '06' },
    { name: 'july', value: '07' },
    { name: 'august', value: '08' },
    { name: 'september', value: '09' },
    { name: 'october', value: '10' },
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

<h1 class="text-3xl font-bold my-3">Manage tracks</h1>

<h1 class="text-xl font-bold my-3">Open specific month</h1>

<div class="flex gap-2 items-center">
  <label>
    <select bind:value={selectedMonth} class="select">
      <option value="" disabled selected>Select month</option>
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

  <a href={`/admin/tracks/${selectedDate}`} class="btn btn-primary">Open</a>
</div>

<h1 class="text-xl font-bold my-3">Search by title or artist</h1>

<form
  on:submit|preventDefault={() => {
    window.location.href = `/admin/tracks/search?query=${searchQuery}`;
  }}
  class="flex gap-2 items-center"
>
  <input
    type="text"
    placeholder="Search by title or artist"
    class="input input-bordered w-full max-w-xs"
    bind:value={searchQuery}
  />
  <button type="submit" class="btn btn-primary">Search</button>
</form>
