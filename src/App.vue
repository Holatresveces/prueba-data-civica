<template>
  <Select
    placeholder="Selecciona Crimen"
    :options="crimenes"
    v-model="selectedCrimenId"
  />
  <Select
    placeholder="Selecciona Entidad"
    :options="entidades"
    v-model="selectedEntidadId"
    @change="setMunicipios"
  />
  <Select
    placeholder="Selecciona Municipio"
    :options="municipios"
    v-model="selectedMunicipioId"
  />
  <p>Crimen: {{ this.selectedCrimenId }}</p>
  <p>Entidad: {{ this.selectedEntidadId }}</p>
  <p>Municipio: {{ this.selectedMunicipioId }}</p>
</template>

<script>
import Select from "./components/Select";

export default {
  name: "App",
  components: { Select },
  data() {
    return {
      crimenes: [],
      entidades: [],
      municipios: [],
      selectedCrimenId: "",
      selectedEntidadId: "",
      selectedMunicipioId: "",
    };
  },
  created() {
    fetch(
      "https://script.google.com/macros/s/AKfycbw7d0IaEnAFY4Iihd9OOOkCEvdTpfHafSQk3NfIyPMb-vvCpZysibFVJl1lD7TGw2pZ6g/exec"
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.crimenes = data.crimenes;
        this.entidades = data.entidades;
        // this.municipios = this.entidades[0].municipios;
      });
  },
  computed: {
    getMunicipios() {
      return this.selectedEntidadId === "null"
        ? []
        : this.entidades.find(
            (entidad) => entidad.id === Number(this.selectedEntidadId)
          ).municipios;
    },
  },
  methods: {
    setMunicipios() {
      const municipios = this.entidades.find(
        (entidad) => entidad.id === Number(this.selectedEntidadId)
      ).municipios;
      this.municipios = municipios;
      this.selectedMunicipioId = String(this.municipios[0].id);
    },
  },
};
</script>

<style>
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

select {
  width: 100%;
  max-width: 200px;
}
</style>
