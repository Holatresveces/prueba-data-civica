<template>
  <div class="wrapper">
    <h2>
      {{ heading }}
    </h2>
    <h3>{{ subheading }}</h3>
    <div class="d3"></div>
    <Loader v-show="loading" />
  </div>
</template>

<script>
// TO DO: Refactor plot() method as most of the logic is duplicated for mobile and desktop.

import _ from "lodash";
import * as d3 from "d3";
import Loader from "./Loader";

export default {
  name: "Chart",
  components: { Loader },
  data() {
    return {
      isMobile: Boolean, // 'true' when viewport.width is <= 480
      svg: Object,
      svgInner: Object,
      width: Number,
      height: Number,
      margin: 25,
      xScale: Function,
      yScale: Function,
      xAxis: Object,
      yAxis: Object,
      lineGroup: Object,
      viewport: {
        width: Number,
        height: Number,
      },
      desktopRatio: 16 / 9, // Size ratio for the chart on desktop
      mobileRatio: 4 / 3, // Size ratio for the chart on mobile
    };
  },
  props: {
    crimeName: String,
    loading: Boolean,
    data: Array,
    selectedState: String,
    selectedMun: String,
    sort: String, // '0' -> Ascendente, '1' -> Descendente
  },
  watch: {
    data() {
      if (!this.data.length) return;
      this.plot();
    },
    sort() {
      if (!this.data.length) return;
      this.plot();
    },
  },
  computed: {
    heading() {
      return !this.data.length
        ? ""
        : `Total de ${this.crimeName} de ${this.getYearsRange().min} a ${
            this.getYearsRange().max
          }`;
    },
    subheading() {
      return !this.data.length
        ? ""
        : this.selectedState === "Nacional"
        ? "Nacional"
        : `${this.selectedMun}, ${this.selectedState}`;
    },
  },
  created() {
    window.addEventListener("resize", _.debounce(this.onResize, 150));
  },
  mounted() {
    this.setDimensions();
    this.init();
  },
  methods: {
    init() {
      this.svg = d3
        .select(".d3")
        .append("svg")
        .attr("height", this.height);

      this.svgInner = this.svg
        .append("g")
        .style("transform", `translate(${this.margin}px, ${this.margin}px)`);

      // this.xScale = d3
      //   .scaleTime()
      //   .domain([
      //     d3.min(this.data, (d) => d.year),
      //     d3.max(this.data, (d) => d.year) + 1,
      //   ]);

      // this.yScale = d3
      //   .scaleLinear()
      //   .domain([
      //     1,
      //     d3.max(this.data, (d) => {
      //       return d.total_mun1 === undefined ? d.total_nac : d.total_mun1;
      //     }),
      //   ])
      //   .range([0, this.height - 2 * this.margin]);

      this.xAxis = this.svgInner.append("g").attr("id", "x-axis");
      // .style("transform", `translate(0, ${this.height - 2 * this.margin}px)`);

      this.yAxis = this.svgInner.append("g").attr("id", "y-axis");
      // .style("transform", `translate(${this.margin}px, 0)`);

      this.lineGroup = this.svgInner
        .append("g")
        .append("path")
        .attr("id", "line")
        .style("fill", "none")
        .style("stroke", "red")
        .style("stroke-width", "2px");
    },
    plot() {
      if (this.isMobile) {
        this.xScale = d3
          .scaleLinear()
          .domain([
            0,
            d3.max(this.data, (d) =>
              parseInt(d.total_mun1 === undefined ? d.total_nac : d.total_mun1)
            ),
          ]);

        const yDomain = d3.extent(this.data, (d) => d.year);
        if (this.sort === "1") {
          yDomain.reverse();
        }

        this.yScale = d3
          .scaleTime()
          .domain(yDomain)
          .range([this.height - 2 * this.margin, 0]);

        this.svg.attr("width", this.width);
        this.svg.attr("height", this.height);

        this.xScale.range([this.margin, this.width - 2 * this.margin]);
        const xAxis = d3.axisBottom(this.xScale);
        // .ticks(this.data.length)
        // .tickFormat(d3.format("d"));
        this.xAxis.call(xAxis);

        const yAxis = d3.axisLeft(this.yScale).tickFormat(d3.format("d"));
        this.yAxis.call(yAxis);

        this.xAxis.style(
          "transform",
          `translate(0, ${this.height - 2 * this.margin}px)`
        );

        this.yAxis.style("transform", `translate(${this.margin}px, 0)`);

        const line = d3
          .line()
          .x((d) => d[0])
          .y((d) => d[1]);

        let points;

        points = this.data.map((d) => [
          this.xScale(
            parseInt(d.total_mun1 === undefined ? d.total_nac : d.total_mun1)
          ),
          this.yScale(d.year),
        ]);

        this.lineGroup.attr("d", line(points));
      } else {
        this.xScale = d3
          .scaleTime()
          .domain(d3.extent(this.data, (d) => d.year));

        const yDomain = [
          0,
          d3.max(this.data, (d) =>
            parseInt(d.total_mun1 === undefined ? d.total_nac : d.total_mun1)
          ),
        ];
        if (this.sort === "1") {
          yDomain.reverse();
        }

        this.yScale = d3
          .scaleLinear()
          .domain(yDomain)
          .range([this.height - 2 * this.margin, 0]);

        this.svg.attr("width", this.width);
        this.svg.attr("height", this.height);

        this.xScale.range([this.margin, this.width - 2 * this.margin]);
        const xAxis = d3
          .axisBottom(this.xScale)
          .ticks(this.data.length)
          .tickFormat(d3.format("d"));
        this.xAxis.call(xAxis);

        const yAxis = d3.axisLeft(this.yScale);
        this.yAxis.call(yAxis);

        this.xAxis.style(
          "transform",
          `translate(0, ${this.height - 2 * this.margin}px)`
        );

        this.yAxis.style("transform", `translate(${this.margin}px, 0)`);

        const line = d3
          .line()
          .x((d) => d[0])
          .y((d) => d[1]);

        let points;

        points = this.data.map((d) => [
          this.xScale(d.year),
          this.yScale(
            parseInt(d.total_mun1 === undefined ? d.total_nac : d.total_mun1)
          ),
        ]);

        this.lineGroup.attr("d", line(points));
      }
    },
    getYearsRange() {
      const range = d3.extent(this.data, (d) => d.year);
      return { min: range[0], max: range[1] };
    },
    onResize() {
      this.setDimensions();
      if (!this.data.length) return;
      this.plot();
    },
    setDimensions() {
      this.viewport.width = document.body.clientWidth;
      this.viewport.height = window.innerHeight;

      this.width = document.querySelector(".d3").clientWidth;

      this.isMobile = this.viewport.width <= 480;

      this.height = this.isMobile
        ? this.width * this.mobileRatio
        : this.width / this.desktopRatio;
    },
  },
};
</script>

<style>
.wrapper {
  position: relative;
  overflow: hidden;
}
</style>
