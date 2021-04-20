// TODO: Handle fetch error

<template>
  <Select
    :disabled="this.status === 'loading'"
    :placeholder="
      this.status === 'loading' ? 'Cargando Estados...' : 'Selecciona un Estado'
    "
    :options="states"
    v-model="selectedStateId"
    @change="handleStateChange"
  />
  <Select
    :disabled="this.status === 'loading' || this.selectedState === ''"
    placeholder="Selecciona un Municipio"
    :options="muns"
    v-model="selectedMunId"
    @change="handleSelectChange"
  />
  <p>Entidad: {{ this.selectedStateId }}</p>
  <p>Municipio: {{ this.selectedMunId }}</p>
</template>

<script>
import Select from "./components/Select";
// import Graph from "./components/Graph";

export default {
  name: "App",
  components: { Select },
  data() {
    return {
      states: [],
      muns: [],
      crimeId: 1,
      selectedState: "",
      selectedStateId: "",
      selectedMun: "",
      selectedMunId: "",
      status: "idle",
    };
  },
  created() {
    this.status = "loading";
    fetch(
      "https://script.google.com/macros/s/AKfycbw7d0IaEnAFY4Iihd9OOOkCEvdTpfHafSQk3NfIyPMb-vvCpZysibFVJl1lD7TGw2pZ6g/exec"
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.status = "idle";
        this.states = data.entidades;
        // this.muns = this.states[0].municipios;
      })
      .catch((err) => {
        this.errorMessage =
          "Hubo un error al obtener los datos. Por favor refresca la página";
        console.log(err);
      });
  },
  methods: {
    setMuns() {
      const muns = this.states.find(
        (state) => state.id === parseInt(this.selectedStateId)
      ).municipios;
      this.muns = muns;
      if (this.selectedMunId !== "") {
        this.selectedMunId = String(this.muns[0].id);
      }
    },

    getData() {
      this.status = "loading";

      const url = "https://spotlight-unfpa.datacivica.org/api/v1/timeline";

      const parameters = {
        id_crime: parseInt(this.crimeId),
        id_ent: parseInt(this.selectedStateId),
        id_mun1: parseInt(this.selectedMunId),
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
        .then((data) => {
          this.status = "idle";
          console.log(data);
        });
    },
    handleSelectChange() {
      if (this.selectedStateId === "" || this.selectedMunId === "") return;
      this.getData();
    },
    handleStateChange() {
      this.selectedState = this.states.find(
        (state) => state.id === parseInt(this.selectedStateId)
      ).name;
      this.setMuns();
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
