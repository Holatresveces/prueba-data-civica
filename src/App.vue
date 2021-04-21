<template>
  <div class="container mb-5">
    <div class="row">
      <div class="col-md">
        <!-- 
          Disable Select components when loading a new request
         -->
        <Select
          label="Estado"
          :disabled="states.length === 0 || status === 'loading'"
          :placeholder="
            this.states.length === 0
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
          :disabled="selectedState === '' || status === 'loading'"
          placeholder="Selecciona un Municipio"
          :options="muns"
          v-model="selectedMunId"
          @change="handleMunChange"
        />
      </div>
      <div class="col-md">
        <Select
          label="Orden"
          :disabled="status === 'loading'"
          :options="['Ascendente', 'Descendente']"
          v-model="sort"
        />
      </div>
    </div>
    <ErrorNotification :message="errorMessage" />
    <Chart
      v-show="status !== 'error'"
      :crimeName="crimeName"
      :selectedState="selectedState"
      :selectedMun="selectedMun"
      :data="chartData"
      :sort="sort"
      :loading="status === 'loading'"
    />
  </div>
</template>

<script>
// TO DO: Maybe find a better way of handling the sort property

import Select from "./components/Select";
import Chart from "./components/Chart";
import ErrorNotification from "./components/ErrorNotification";

export default {
  name: "App",
  components: { Select, Chart, ErrorNotification },
  data() {
    return {
      crimeId: 4, // Manually set according to the Google Sheets document
      crimeName: "",
      states: [],
      muns: [],
      selectedState: "",
      selectedStateId: "",
      selectedMun: "",
      selectedMunId: "",
      sort: "0", // '0' -> 'Ascending, 1 -> 'Descending'
      status: "idle", // Possible values: 'idle', 'loading', 'error'
      chartData: [],
      errorMessage: "",
    };
  },
  created() {
    this.getSelectOptions();
  },
  methods: {
    // Options are retrieved directly from the Google Sheets document through a Google
    // Apps Script endpoint. To avoid making a new request on each visit, options are
    // stored in localStorage (since they're not likely to change constantly).
    getSelectOptions() {
      let data = localStorage.getItem("selectOptions");

      if (data) {
        const parsedData = JSON.parse(data);
        this.crimeName = parsedData.crimenes.find(
          (crimen) => crimen.id === this.crimeId
        ).name;
        this.states = parsedData.entidades;
      } else {
        const url =
          "https://script.google.com/macros/s/AKfycbw7d0IaEnAFY4Iihd9OOOkCEvdTpfHafSQk3NfIyPMb-vvCpZysibFVJl1lD7TGw2pZ6g/exec";

        fetch(url)
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            localStorage.setItem("selectOptions", JSON.stringify(data));
            this.status = "idle";
            this.crimeName = data.crimenes.find(
              (crimen) => crimen.id === this.crimeId
            ).name;
            this.states = data.entidades;
          })
          .catch((err) => {
            console.log(err);
            const message =
              "No fue posible cargar los datos. Favor de refrescar la página";
            this.onRequestError(message);
          });
      }
    },

    getData() {
      this.onRequestInit();
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
          this.chartData = data.sort((a, b) => {
            return a.year - b.year;
          });
          console.log(data);
        })
        .catch((err) => {
          this.selectedMunId = "";
          const message =
            "No fue posible obtener los datos. Por favor intenta nuevamente";
          this.onRequestError(message);
          console.log(err);
        });
    },

    handleStateChange() {
      this.selectedState = this.states.find(
        (state) => state.id === parseInt(this.selectedStateId)
      ).name;
      this.setMuns();
      this.onSelectChange();
    },

    handleMunChange() {
      this.selectedMun = this.muns.find(
        (mun) => mun.id === parseInt(this.selectedMunId)
      ).name;
      this.onSelectChange();
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

    onSelectChange() {
      if (this.selectedStateId === "" || this.selectedMunId === "") return;
      this.getData();
    },

    onRequestInit() {
      this.status = "loading";
      this.errorMessage = "";
    },

    onRequestError(message) {
      this.status = "error";
      this.errorMessage = message;
      this.chartData = [];
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
