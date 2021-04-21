<template>
  <div class="loader">
    <div class="overlay"></div>
    <div class="spinner">
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status"></div>
      </div>
      <div class="text">Obteniendo datos...</div>
    </div>
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
}

.overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
