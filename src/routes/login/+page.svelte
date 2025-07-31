<div class="flex h-full w-full flex-col items-center">
  <h2 class="text-base-content mt-2 text-center text-3xl font-bold tracking-tight">
    Inloggen als artiest
  </h2>
  <form action="?/login" method="POST" class="flex w-full flex-col items-center space-y-2 pt-4">
    <div class="form-control w-full max-w-md">
      <label for="email" class="label pb-1 font-medium">
        <span class="label-text">E-mailadres</span>
      </label>
      <input type="email" name="email" class="input input-bordered w-full max-w-md" />
    </div>
    <div class="form-control w-full max-w-md">
      <label for="password" class="label pb-1 font-medium">
        <span class="label-text">Wachtwoord</span>
      </label>
      <input type="password" name="password" class="input input-bordered w-full max-w-md" />
    </div>
    <div class="w-full max-w-md pt-2">
      <button type="submit" class="btn btn-primary font-introrust w-full">Inloggen</button>
    </div>
  </form>
</div>
