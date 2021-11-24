const Koa = require('koa');
const { ethers } = require('ethers');
const dotenv = require('dotenv');
const Router = require('@koa/router');
const priceConsumerV3 = require('./utils/PriceConsumerV3.json');

const PORT = 3000;

dotenv.config();
const app = new Koa();
const router = new Router();

const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_HTTP_RINKEBY);
// const signer = provider.getSigner();
const priceConsumerContract = new ethers.Contract(
  process.env.PRICE_CONSUMER_CONTRACT_RINKEBY,
  priceConsumerV3.abi,
  provider,
);

// Returns the USD price of 1 ETH
async function getPrice() {
  console.log('Created tx to fetch current price');
  const price = await priceConsumerContract.getLatestPrice();
  return ethers.utils.formatUnits(price, 8);
}

router.get('/', (ctx) => {
  ctx.body = 'CryptoCharts Home';
});

router.get('/price', async (ctx) => {
  const price = await getPrice();
  ctx.body = price;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Started server on port ${PORT}`);
});
