import Koa from "koa";
import Router from "@koa/router";
import mongoose from "mongoose";
import { config } from "dotenv";
import {
  getLatestPrice,
  getLatestRoundData,
  getRoundData,
  generateMetadata,
} from "./services/price";

config();
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

// Debug routes
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

router.get("/generateMetadata", async (ctx) => {
  //* only months are 0 indexed
  await generateMetadata();
  ctx.body = "Done";
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Started server on port ${PORT}`);
});
