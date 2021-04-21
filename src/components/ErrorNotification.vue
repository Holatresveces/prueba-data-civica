<template>
  <div class="alert alert-danger" role="alert" v-show="!!message">
    {{ message }}
  </div>
</template>
<script>
export default {
  name: "ErrorNotification",
  props: {
    message: String,
  },
};
</script>
