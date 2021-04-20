<template>
  <div class="d3">This is the graph</div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "Graph",
  props: {
    data: Array,
    selectedState: String,
    selectedMun: String,
    sort: Number,
  },
  mounted() {
    console.log("mounted");

    const width = 500;
    const height = 500;

    const margin = {
      top: 20,
      right: 20,
      bottom: 50,
      left: 60,
    };

    const svg = d3
      .select(".d3")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var x = d3
      .scaleTime()
      .domain(
        d3.extent(this.data, function(d) {
          return d.date;
        })
      )
      .range([0, width]);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(this.data, function(d) {
          return +d.value;
        }),
      ])
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    // Add the line
    svg
      .append("path")
      .datum(this.data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x(function(d) {
            return x(d.date);
          })
          .y(function(d) {
            return y(d.value);
          })
      );

    console.log("end of mounted");
  },
};
</script>
