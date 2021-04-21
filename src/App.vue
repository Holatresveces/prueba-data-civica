// TODO: Handle fetch error

<template>
  <div class="container">
    <div class="row">
      <div class="col-md">
        <Select
          label="Estado"
          :disabled="this.status === 'loading'"
          :placeholder="
            this.status === 'loading'
              ? 'Cargando Estados...'
              : 'Selecciona un Estado'
          "
          :options="states"
          v-model="selectedStateId"
          @change="handleStateChange"
        />
      </div>
      <div class="col-md">
        <Select
          label="Municipio"
          :disabled="this.status === 'loading' || this.selectedState === ''"
          placeholder="Selecciona un Municipio"
          :options="muns"
          v-model="selectedMunId"
          @change="handleMunChange"
        />
      </div>
      <div class="col-md">
        <Select
          label="Orden"
          :disabled="this.status === 'loading'"
          :options="['Ascendente', 'Descendente']"
          v-model="sort"
        />
      </div>
    </div>
    <Chart
      :data="chartData"
      :sort="sort"
      :loading="this.status === 'loading'"
    />
  </div>
</template>

<script>
import Select from "./components/Select";
import Chart from "./components/Chart";

export default {
  name: "App",
  components: { Select, Chart },
  data() {
    return {
      crimeId: 1,
      crimeName: "",
      states: [],
      muns: [],
      selectedState: "",
      selectedStateId: "",
      selectedMun: "",
      selectedMunId: "",
      sort: "0",
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
        const parsedData = JSON.parse(data);
        this.crimeName = parsedData.crimenes.find(
          (crimen) => crimen.id === this.crimeId
        );
        this.states = parsedData.entidades;
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

.chart {
  position: relative;
}

.d3 {
  width: 100%;
}
</style>
