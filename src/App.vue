<template>
  <div class="container mb-5">
    <div class="row">
      <div class="col-md">
        <!-- 
          Disable Select components when loading a new request or if
          options have not been loaded yet
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
// TO DO: Maybe find a better way to represent the sort property

import Select from "./components/Select";
import Chart from "./components/Chart";
import ErrorNotification from "./components/ErrorNotification";

export default {
  name: "App",
  components: { Select, Chart, ErrorNotification },
  data() {
    return {
      crimeId: 4, // Manually set according to the Google Sheets document. See getSelectOptions method below.
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
    getSelectOptions() {
      // Options are retrieved directly from the Google Sheets document through a Google
      // Apps Script endpoint. To avoid making a new request on each visit, options are
      // stored in localStorage (since they're not likely to change constantly).
      // Response example:
      // {
      //   crimenes: [{id, name}],
      //   entidades: [{id, name, municipios: [{id, name}]}],
      // }
      // All properties in the Google Sheets document are available in the response, except
      // (id_name, crime_name), (id_ent, name_ent), (id_mun, name_mun) are renamed by the
      // Google Apps Script endpoint as (id, name) for better reusability in components

      let localStoragedata = localStorage.getItem("selectOptions");

      if (localStoragedata) {
        const parsedData = JSON.parse(localStoragedata);
        console.log(parsedData);
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

    // Retrieve data for a specific state and municipality (¿así se dice? jaja)
    getData() {
      this.onRequestInit();
      const url = "https://spotlight-unfpa.datacivica.org/api/v1/timeline";

      const parameters = {
        id_crime: parseInt(this.crimeId),
        id_ent: parseInt(this.selectedStateId),
        id_mun1: parseInt(this.selectedMunId),
      };

      const options = {
        method: "POST",
        // mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parameters),
      };

      fetch(url, options)
        .then((res) => res.json())
        .then((data) => {
          this.onRequestSuccess(data);
        })
        .catch((err) => {
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

    // Called for every onChange event on the Select component. This allows to
    // start a new data request or redraw the chart without additional buttons
    onSelectChange() {
      if (this.selectedStateId === "" || this.selectedMunId === "") return;
      this.getData();
    },

    onRequestInit() {
      this.status = "loading";
      this.errorMessage = "";
    },

    onRequestSuccess(data) {
      this.status = "idle";
      this.chartData = data.sort((a, b) => {
        return a.year - b.year;
      });
      // console.log(data);
    },

    onRequestError(message) {
      this.status = "error";
      this.selectedMunId = "";
      this.errorMessage = message;
      this.chartData = [];
    },
  },
};
</script>
