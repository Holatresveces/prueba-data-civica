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
    @change="handleMunChange"
  />
  <p>Entidad: {{ this.selectedStateId }} {{ this.selectedState }}</p>
  <p>Municipio: {{ this.selectedMunId }} {{ this.selectedMun }}</p>
  <div class="chart">
    <Chart :data="chartData" />
    <Loader v-show="this.status === 'loading'" />
  </div>
</template>

<script>
import Select from "./components/Select";
import Chart from "./components/Chart";
import Loader from "./components/Loader";

export default {
  name: "App",
  components: { Select, Chart, Loader },
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
      chartData: [],
    };
  },
  created() {
    this.getStates();
  },
  methods: {
    getStates() {
      let data = localStorage.getItem("datos");

      if (data) {
        this.states = JSON.parse(data).entidades;
      } else {
        this.status = "loading";
        const url =
          "https://script.google.com/macros/s/AKfycbw7d0IaEnAFY4Iihd9OOOkCEvdTpfHafSQk3NfIyPMb-vvCpZysibFVJl1lD7TGw2pZ6g/exec";

        fetch(url)
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            localStorage.setItem("datos", JSON.stringify(data));
            this.status = "idle";
            this.states = data.entidades;
          })
          .catch((err) => {
            this.errorMessage =
              "Hubo un error al obtener los datos. Por favor refresca la página";
            console.log(err);
          });
      }
    },
    setMuns() {
      this.muns = this.states.find(
        (state) => state.id === parseInt(this.selectedStateId)
      ).municipios;

      if (this.selectedMunId !== "") {
        console.log("change");
        this.selectedMunId = String(this.muns[0].id);
        this.selectedMun = this.muns.find(
          (mun) => mun.id === parseInt(this.selectedMunId)
        ).name;
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
          this.chartData = data;
          console.log(data);
        });
    },
    handleSelectChange() {
      if (this.selectedStateId === "" || this.selectedMunId === "") return;
      this.getData();
    },
    handleMunChange() {
      this.selectedMun = this.muns.find(
        (mun) => mun.id === parseInt(this.selectedMunId)
      ).name;
      this.handleSelectChange();
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

.chart {
  position: relative;
}

.d3 {
  width: 100%;
}
</style>
