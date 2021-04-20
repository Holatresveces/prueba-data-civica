<template>
  <Select
    placeholder="Selecciona Crimen"
    :options="crimenes"
    v-model="selectedCrimenId"
    @change="handleSelectChange"
  />
  <Select
    placeholder="Selecciona Entidad"
    :options="entidades"
    v-model="selectedEntidadId"
    @change="handleEntidadChange"
  />
  <Select
    placeholder="Selecciona Municipio"
    :options="municipios"
    v-model="selectedMunicipioId"
    @change="handleSelectChange"
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
  methods: {
    setMunicipios() {
      const municipios = this.entidades.find(
        (entidad) => entidad.id === Number(this.selectedEntidadId)
      ).municipios;
      this.municipios = municipios;
      this.selectedMunicipioId = String(this.municipios[0].id);
    },
    handleSelectChange() {
      if (
        this.selectedCrimenId === "" ||
        this.selectedEntidadId === "" ||
        this.selectedMunicipioId === ""
      )
        return;

      const url = "https://spotlight-unfpa.datacivica.org/api/v1/timeline";

      const parameters = {
        id_crime: Number(this.selectedCrimenId),
        id_ent: Number(this.selectedEntidadId),
        id_mun1: Number(this.selectedMunicipioId),
      };
      console.log(parameters);

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
      })
        .then((res) => res.json())
        .then((data) => console.log(data));
    },
    handleEntidadChange() {
      this.setMunicipios();
      this.handleSelectChange();
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
