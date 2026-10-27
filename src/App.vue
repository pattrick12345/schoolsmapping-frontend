<template>
  <div class="app-shell">
  <header>
  <nav>
  <RouterLink to="/">Home</RouterLink>
  <RouterLink to="/schools">Schools</RouterLink>
  </nav>
  </header>
  <RouterView />
  </div>
</template>
<style>
  body {
  margin: 0;
  font-family: Arial, sans-serif;
  }
  .app-shell {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 40px;
  }
  nav {
  display: flex;
  gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid #ccc;
  }
  .page {
  padding-top: 20px;
  }
</style>