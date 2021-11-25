const Koa = require("koa");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
const Router = require("@koa/router");
const priceConsumerV3 = require("./utils/PriceConsumerV3.json");

const PORT = 3000;

dotenv.config();
const app = new Koa();
const router = new Router();

const provider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_HTTP_RINKEBY
);
const priceConsumerContract = new ethers.Contract(
  process.env.PRICE_CONSUMER_CONTRACT_RINKEBY,
  priceConsumerV3.abi,
  provider
);

function formatRoundData(data) {
  return {
    // First roundId: 0x020000000000000001 (36893488147419103233)
    roundId: data[0],
    price: ethers.utils.formatUnits(data[1], 8),
    // First startedAt: November 23, 2020
    startedAt: ethers.BigNumber.from(data[2]).toNumber(),
    updatedAt: ethers.BigNumber.from(data[3]).toNumber(),
    answeredInRound: data[4],
  };
}

// Returns the USD price of 1 ETH
async function getLatestRoundData() {
  console.log("Getting latest round data");

  const rawData = await priceConsumerContract.latestRoundData();
  const formattedData = formatRoundData(rawData);

  console.log("Received data", formattedData);
  return formattedData;
}

async function getLatestPrice() {
  const formattedData = await getLatestRoundData();
  return formattedData.price;
}

async function getRoundData(id) {
  console.log(`Getting data at round id# ${id}`);

  const rawData = await priceConsumerContract.getRoundData(id);
  const formattedData = formatRoundData(rawData);

  console.log("Received data", formattedData);
  return formattedData;
}

router.get("/price", async (ctx) => {
  ctx.body = await getLatestPrice();
});

router.get("/round", async (ctx) => {
  ctx.body = await getLatestRoundData();
});

router.get("/round/:id", async (ctx) => {
  const { id } = ctx.params;
  ctx.body = await getRoundData(id);
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Started server on port ${PORT}`);
});
