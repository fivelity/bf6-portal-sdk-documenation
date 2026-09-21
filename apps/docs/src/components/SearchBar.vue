<template>
  <div class="search-container">
    <button class="search-btn" type="button" @click="openPalette" aria-label="Search symbols">
      <span>Search symbols</span>
      <span class="kbd">/</span>
    </button>
  </div>
</template>

<script setup>
function openPalette() {
  const input = document.getElementById('palette-input');
  if (input) input.focus();
}
</script>

<style scoped>
.search-container {
  padding: 16px 22px 10px;
}
.search-btn {
  margin-top: 0;
}
</style>
