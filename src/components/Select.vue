<template>
  <select
    name=""
    id=""
    :disabled="$attrs.disabled"
    :value="modelValue"
    @change="onChangeInput"
  >
    <option value="" disabled selected hidden>{{ placeholder }}</option>
    <option v-for="{ id, name } in options" :key="id" :value="id">
      {{ name }}
    </option>
  </select>
</template>

<script>
export default {
  name: "Select",
  props: {
    placeholder: String,
    options: Array,
    modelValue: String,
  },
  inheritAttrs: false, // https://github.com/vuejs/vue-next/issues/813
  methods: {
    onChangeInput(e) {
      this.$emit("update:modelValue", e.target.value);
      this.$attrs.onChange && this.$attrs.onChange(e);
    },
  },
  emits: ["update:modelValue"],
};
</script>
