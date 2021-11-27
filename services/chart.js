const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const { promises: fs } = require("fs");
const { NFTStorage, File } = require("nft.storage");

async function createChartImage(priceData, fileName) {
  const labels = [];
  const data = [];
  priceData.forEach((price) => {
    labels.push(price.updatedAt);
    data.push(price.price);
  });

  const dateOptions = {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const dateFormatter = new Intl.DateTimeFormat("en-US", dateOptions);

  const startDate = dateFormatter.format(new Date(labels[0]));
  const endDate = dateFormatter.format(new Date(labels[labels.length - 1]));

  const width = 650;
  const height = 500;

  const configuration = {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "ETH/USD",
          data,
          pointRadius: 0,
          borderWidth: 1,
          fill: true,
          backgroundColor: (ctx) => {
            const gradientStroke = ctx.chart.ctx.createLinearGradient(
              500,
              0,
              100,
              0
            );
            gradientStroke.addColorStop(0, "#69a9f2");
            gradientStroke.addColorStop(1, "#f27b69");
            return gradientStroke;
          },
          borderColor: (ctx) => {
            const gradientStroke = ctx.chart.ctx.createLinearGradient(
              500,
              0,
              100,
              0
            );
            gradientStroke.addColorStop(0, "#69a9f2");
            gradientStroke.addColorStop(1, "#f27b69");
            return gradientStroke;
          },
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: ["ETH / USD", `${startDate} - ${endDate}`],
        fontSize: 24,
        fontStyle: "normal",
        fontWeight: 300,
      },
      scales: {
        xAxes: [{ display: false }],
        yAxes: [{ display: true }],
      },
      legend: {
        display: false,
      },
      layout: {
        padding: {
          right: 10,
          bottom: 10,
        },
      },
    },
    plugins: [
      {
        id: "background-colour",
        beforeDraw: (chart) => {
          const { ctx } = chart;
          ctx.save();
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        },
      },
    ],
  };
  const chartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.maintainAspectRatio = false;
  };
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    chartCallback,
  });
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  await fs.writeFile(`./output/${fileName}.png`, buffer, "base64");
}

async function uploadImage(name) {
  const client = new NFTStorage({ token: process.env.NFTSTORAGE_API_KEY });

  const metadata = await client.store({
    name: "CryptoChart",
    description: "Pin is not delicious beef!",
    image: new File(
      [
        /* data */
      ],
      "pinpie.jpg",
      { type: "image/jpg" }
    ),
  });
  console.log(metadata.url);
}

module.exports = {
  createChartImage,
  uploadImage,
};
