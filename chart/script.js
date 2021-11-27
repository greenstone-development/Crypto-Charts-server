import Chart from "chart.js";

const canvas = document.getElementById("canvas");

// Apply multiply blend when drawing datasets
const multiply = {
  beforeDatasetsDraw(chart, options, el) {
    chart.ctx.globalCompositeOperation = "multiply";
  },
  afterDatasetsDraw(chart, options) {
    chart.ctx.globalCompositeOperation = "source-over";
  },
};

// Gradient color - this week
const gradientThisWeek = canvas
  .getContext("2d")
  .createLinearGradient(0, 0, 0, 150);
gradientThisWeek.addColorStop(0, "#5555FF");
gradientThisWeek.addColorStop(1, "#9787FF");

// Gradient color - previous week
const gradientPrevWeek = canvas
  .getContext("2d")
  .createLinearGradient(0, 0, 0, 150);
gradientPrevWeek.addColorStop(0, "#FF55B8");
gradientPrevWeek.addColorStop(1, "#FF8787");

const config = {
  type: "line",
  data: {
    labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    datasets: [
      {
        label: "This week",
        data: [24, 18, 16, 18, 24, 36, 28],
        backgroundColor: gradientThisWeek,
        borderColor: "transparent",
        pointBackgroundColor: "#FFFFFF",
        pointBorderColor: "#FFFFFF",
        lineTension: 0.4,
      },
      // {
      //     label: 'Previous week',
      //     data: [20, 22, 30, 22, 18, 22, 30],
      //     backgroundColor: gradientPrevWeek,
      //     borderColor: 'transparent',
      //     pointBackgroundColor: '#FFFFFF',
      //     pointBorderColor: '#FFFFFF',
      //     lineTension: 0.40,
      // }
    ],
  },
  options: {
    elements: {
      point: {
        radius: 0,
        hitRadius: 5,
        hoverRadius: 5,
      },
    },
    legend: {
      display: false,
    },
    scales: {
      xAxes: [
        {
          display: false,
        },
      ],
      yAxes: [
        {
          display: false,
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  },
  plugins: [multiply],
};

window.chart = new Chart(canvas, config);
