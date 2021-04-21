<template>
  <div class="form-group mb-4">
    <label :for="label">{{ label }}:</label>
    <select
      class="form-select"
      name=""
      :id="label"
      :disabled="$attrs.disabled"
      :value="modelValue"
      @change="onChangeInput"
    >
      <option value="" disabled selected hidden>{{ placeholder }}</option>
      <!--
        The options property expects an array of objects with id and name properties,
        but you can pass an array of the values that will render as options. In this
        case, the value attribute will be set to the index in the array.
       -->
      <option
        v-for="({ id, name }, i) in options"
        :key="id === undefined ? i : id"
        :value="id === undefined ? i : id"
      >
        {{ name || options[i] }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: "Select",
  props: {
    placeholder: String,
    options: Array,
    modelValue: String,
    label: String,
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
