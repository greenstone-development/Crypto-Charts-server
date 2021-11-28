const { ethers } = require("ethers");
const { NonceManager } = require("@ethersproject/experimental");
const { abi: priceConsumerABI } = require("../utils/PriceConsumerV3.json");
const { abi: cryptoChartsABI } = require("../utils/CryptoCharts.json");
const db = require("../database");
const { createChartImage, uploadImageFolder } = require("./chart");

const provider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_HTTP_RINKEBY
);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const managedWallet = new NonceManager(wallet); // Allow multiple transactions to be made simulataneously

const priceConsumerContract = new ethers.Contract(
  process.env.PRICE_CONSUMER_CONTRACT_RINKEBY,
  priceConsumerABI,
  provider
);
const nftContract = new ethers.Contract(
  process.env.NFT_CONTRACT_RINKEBY,
  cryptoChartsABI,
  managedWallet
);

function formatRoundData(data) {
  return {
    // First roundId is 0x020000000000000001 (36893488147419103233)
    roundId: ethers.BigNumber.from(data[0]).toString(),
    price: ethers.utils.formatUnits(data[1], 8),
    // First startedAt: November 23, 2020
    startedAt: ethers.BigNumber.from(data[2]).toNumber(),
    updatedAt: ethers.BigNumber.from(data[3]).toNumber(),
    answeredInRound: ethers.BigNumber.from(data[4]).toString(),
  };
}

async function getLatestRoundData() {
  console.log("Getting latest round data");

  const rawData = await priceConsumerContract.latestRoundData();
  const formattedData = formatRoundData(rawData);

  console.log("Received data", formattedData);
  return formattedData;
}

async function getRoundData(id) {
  console.log(`Getting data at round id# ${id}`);

  const rawData = await priceConsumerContract.getRoundData(id);
  const formattedData = formatRoundData(rawData);

  console.log("Received data", formattedData);
  return formattedData;
}

// Returns the USD price of 1 ETH
async function getLatestPrice() {
  const formattedData = await getLatestRoundData();
  return formattedData.price;
}

//! Warning: This will clear the existing db collection.
// TODO: Set limit to round id of getLatestRoundData()
// TODO: Convert function to perpetual loop that checks for new rounds
async function syncDbWithDataFeed() {
  console.log("Syncing db with data feed...");

  const calls = [];
  let roundStart = ethers.BigNumber.from("0x020000000000000001");

  // Rounds 14876 is Nov 25, 2021 at 7:18pm EST
  for (let i = 0; i < 14876; i++) {
    const curRound = roundStart.toString();
    calls.push(() => getRoundData(curRound));
    roundStart = roundStart.add(1);
  }

  // Make 100 getRoundData() calls at a time, waiting for all to resolve before continuing
  const allData = [];
  while (calls.length) {
    const data = await Promise.all(calls.splice(0, 100).map((call) => call()));
    allData.push(...data);
  }
  await db.addAllData(allData);

  console.log("Done syncing.");
}

async function getPricesByDateRange(startDateMs, endDateMs) {
  const startDateSec = startDateMs / 1000;
  const endDateSec = endDateMs / 1000;
  return db.getByDateRange(startDateSec, endDateSec);
}

async function generateMetadata() {
  //* only months are 0 indexed
  const lastDate = new Date(2021, 10, 2);
  let curDate = new Date(2021, 1, 1);

  const pendingData = [];

  while (curDate < lastDate) {
    let prevDate = new Date(curDate.getTime());
    prevDate = new Date(prevDate.setMonth(prevDate.getMonth() - 1));

    console.log(prevDate);
    console.log(curDate);

    // Query DB by date range
    pendingData.push(
      getPricesByDateRange(
        Date.UTC(
          prevDate.getFullYear(),
          prevDate.getMonth(),
          prevDate.getDate()
        ),
        Date.UTC(curDate.getFullYear(), curDate.getMonth(), curDate.getDate())
      )
    );
    curDate = new Date(curDate.setMonth(curDate.getMonth() + 1));
  }

  const dateOptions = {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const dateFormatter = new Intl.DateTimeFormat("en-US", dateOptions);
  const chartNames = [];

  const monthlyPriceData = await Promise.all(pendingData);
  await Promise.all(
    monthlyPriceData.map(async (priceData, i) => {
      const labels = [];
      const data = [];
      priceData.forEach((price) => {
        labels.push(price.updatedAt);
        data.push(price.price);
      });

      const startDateStr = dateFormatter.format(new Date(labels[0]));
      const endDateStr = dateFormatter.format(
        new Date(labels[labels.length - 1])
      );
      const dateRangeName = `${startDateStr} - ${endDateStr}`;
      chartNames.push(dateRangeName);

      await createChartImage(labels, data, i, dateRangeName);
    })
  );

  const metadataArr = await uploadImageFolder(chartNames);
  await Promise.all(
    metadataArr.map(async (metadata, i) => {
      console.log(metadata.url);
      await nftContract.addChart(i, metadata.url);
    })
  );

  console.log("Uploaded all IPFS URLs to contract.");
  return metadataArr;
}

module.exports = {
  getLatestRoundData,
  getRoundData,
  getLatestPrice,
  syncDbWithDataFeed,
  generateMetadata,
};
