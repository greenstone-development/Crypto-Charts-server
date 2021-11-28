const { ethers } = require("ethers");
const { abi } = require("../utils/PriceConsumerV3.json");
const db = require("../database");
const { createChartImage, uploadImage } = require("./chart");

const provider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_HTTP_RINKEBY
);
const priceConsumerContract = new ethers.Contract(
  process.env.PRICE_CONSUMER_CONTRACT_RINKEBY,
  abi,
  provider
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

  // Rounds 14876 is Nov 25 2021 at 7:18pm EST
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

  const monthlyPriceData = await Promise.all(pendingData);
  monthlyPriceData.forEach((monthlyData, i) => {
    createChartImage(monthlyData, i);
    uploadImage();
    // Create the JSON metadata with URL and optional financial stats
    // Call contract to add metadata
  });
  console.log("Done generating metadata");
}

module.exports = {
  getLatestRoundData,
  getRoundData,
  getLatestPrice,
  syncDbWithDataFeed,
  generateMetadata,
};
