import { ethers } from "ethers";
import { config } from "dotenv";

import { abi } from "../utils/PriceConsumerV3.json";

config();

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
    // First roundId: 0x020000000000000001 (36893488147419103233)
    roundId: ethers.BigNumber.from(data[0]).toString(),
    price: ethers.utils.formatUnits(data[1], 8),
    // First startedAt: November 23, 2020
    startedAt: ethers.BigNumber.from(data[2]).toNumber(),
    updatedAt: ethers.BigNumber.from(data[3]).toNumber(),
    answeredInRound: ethers.BigNumber.from(data[4]).toString(),
  };
}

export async function getLatestRoundData() {
  console.log("Getting latest round data");

  const rawData = await priceConsumerContract.latestRoundData();
  const formattedData = formatRoundData(rawData);

  console.log("Received data", formattedData);
  return formattedData;
}

export async function getRoundData(id) {
  console.log(`Getting data at round id# ${id}`);

  const rawData = await priceConsumerContract.getRoundData(id);
  const formattedData = formatRoundData(rawData);

  console.log("Received data", formattedData);
  return formattedData;
}

// Returns the USD price of 1 ETH
export async function getLatestPrice() {
  const formattedData = await getLatestRoundData();
  return formattedData.price;
}
