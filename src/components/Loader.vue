<template>
  <div class="loader">
    <div class="text">Cargando datos...</div>
  </div>
</template>

<script>
export default {
  name: "Loader",
};
</script>

<style>
.loader {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.8;
  width: 100%;
  height: 100%;
  background: white;
  display: flex;
}

.text {
  margin: auto;
}
</style>
