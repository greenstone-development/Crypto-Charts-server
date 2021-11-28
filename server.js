const Koa = require("koa");
const Router = require("@koa/router");
const mongoose = require("mongoose");
const {
  getLatestPrice,
  getLatestRoundData,
  getRoundData,
  generateMetadata,
} = require("./services/price");
const { uploadImageFolder } = require("./services/chart");
const getAllData = require("./database/getAllData");

const PORT = 3000;

const app = new Koa();
const router = new Router();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database.");
  } catch (err) {
    console.log("Could not connect to database.", err);
  }
})();
// TODO: Enable "top-level await" ECMAScript proposal
// Otherwise, remember db may be unconnected here

// Debug route
router.get("/price", async (ctx) => {
  ctx.body = await getLatestPrice();
});

// Debug route
router.get("/round", async (ctx) => {
  ctx.body = await getLatestRoundData();
});

// Debug route
router.get("/round/:id", async (ctx) => {
  const { id } = ctx.params;
  ctx.body = await getRoundData(id);
});

// Debug route
router.get("/getAllData", async (ctx) => {
  ctx.body = await getAllData();
});

// ! Creates the NFT metadata, generates chart images, and uploads to IPFS
router.get("/generateMetadata", async (ctx) => {
  ctx.body = await generateMetadata();
});

// Debug route
router.get("/updateContractCharts", async (ctx) => {
  const metadataArr = await uploadImageFolder();
  ctx.body = metadataArr;
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Started server on port ${PORT}`);
});
