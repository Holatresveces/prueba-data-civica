<template>
  <div class="wrapper">
    <div class="d3"></div>
    <Loader v-show="loading" />
  </div>
</template>

<script>
import * as d3 from "d3";
import Loader from "./Loader";

export default {
  name: "Chart",
  components: { Loader },
  data() {
    return {
      svg: Object,
      svgInner: Object,
      width: 700,
      height: 700,
      margin: 50,
      xScale: undefined,
      yScale: undefined,
      xAxis: undefined,
      yAxis: undefined,
      lineGroup: undefined,
    };
  },
  props: {
    loading: Boolean,
    data: Array,
    selectedState: String,
    selectedMun: String,
    sort: String,
  },
  watch: {
    data() {
      this.plot();
    },
    sort() {
      this.plot();
    },
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

      this.yScale = d3
        .scaleLinear()
        .domain([
          1,
          d3.max(this.data, (d) => {
            return d.total_mun1 === undefined ? d.total_nac : d.total_mun1;
          }),
        ])
        .range([0, this.height - 2 * this.margin]);

      this.xScale = d3
        .scaleTime()
        .domain([
          d3.min(this.data, (d) => d.year),
          d3.max(this.data, (d) => d.year) + 1,
        ]);

      this.yAxis = this.svgInner
        .append("g")
        .attr("id", "y-axis")
        .style("transform", `translate(${this.margin}px, 0)`);

      this.xAxis = this.svgInner
        .append("g")
        .attr("id", "x-axis")
        .style("transform", `translate(0, ${this.height - 2 * this.margin}px)`);

      this.lineGroup = this.svgInner
        .append("g")
        .append("path")
        .attr("id", "line")
        .style("fill", "none")
        .style("stroke", "red")
        .style("stroke-width", "2px");
    },
    plot() {
      this.xScale = d3.scaleTime().domain(d3.extent(this.data, (d) => d.year));

      const yDomain = [
        1,
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

      this.width = document.querySelector(".d3").clientWidth;
      this.svg.attr("width", this.width);

      this.xScale.range([this.margin, this.width - 2 * this.margin]);
      const xAxis = d3
        .axisBottom(this.xScale)
        .ticks(this.data.length)
        .tickFormat(d3.format("d"));
      this.xAxis.call(xAxis);

      const yAxis = d3.axisRight(this.yScale);
      this.yAxis.call(yAxis);

      const line = d3
        .line()
        .x((d) => d[0])
        .y((d) => d[1]);

      const points = this.data.map((d) => [
        this.xScale(d.year),
        this.yScale(
          parseInt(d.total_mun1 === undefined ? d.total_nac : d.total_mun1)
        ),
      ]);

      this.lineGroup.attr("d", line(points));
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style>
.wrapper {
  position: relative;
  overflow: hidden;
}
</style>
