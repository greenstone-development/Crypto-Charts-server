const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const fs = require("fs");
const { NFTStorage, File } = require("nft.storage");

async function createChartImage(labels, data, fileName, dateRangeName) {
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
        text: ["ETH / USD", dateRangeName],
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
  await fs.promises.writeFile(`./output/${fileName}.png`, buffer, "base64");
}

async function uploadImageFolder(chartNames) {
  const client = new NFTStorage({ token: process.env.NFTSTORAGE_API_KEY });

  const nfts = [];
  const fullFileNames = await fs.promises.readdir("output/");
  console.log("Read directory");

  await Promise.all(
    fullFileNames.map(async (fullFileName) => {
      const fileName = fullFileName.split(".")[0];
      const filePath = `output/${fileName}.png`;
      console.log("Read file");

      const fileData = new File(
        [await fs.promises.readFile(filePath)],
        `${fileName}.png`,
        {
          type: "image/png",
        }
      );

      nfts.push({
        name: chartNames[parseInt(fileName, 10)],
        description:
          "ETH/USD monthly chart. Created using Chainlink Data Feed, NFT.Storage, and Alchemy.",
        image: fileData,
      });
    })
  );

  console.log(nfts);
  const allMetadata = nfts.map(async (nft) => {
    const metadata = await client.store({
      name: nft.name,
      description: nft.description,
      image: nft.image,
    });
    return metadata;
  });
  const resolvedMetadata = await Promise.all(allMetadata);
  console.log("Uploaded NFT metadata");
  return resolvedMetadata;
}

module.exports = {
  createChartImage,
  uploadImageFolder,
};
