import Koa from "koa";
import Router from "@koa/router";
import { ethers } from "ethers";
import mongoose from "mongoose";
import { config } from "dotenv";
import {
  getLatestPrice,
  getLatestRoundData,
  getRoundData,
} from "./services/price";
import db from "./database";

config();
const PORT = 3000;

const app = new Koa();
const router = new Router();

async function initialize() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to database.");
  } catch (err) {
    console.log("Could not connect to database.");
    console.log(err);
  }
}
initialize();

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

//! Warning: This will clear the existing db collection.
router.get("/save", async (ctx) => {
  const calls = [];

  let roundStart = ethers.BigNumber.from("0x020000000000000001");
  // Rounds 0 to 14876 (11/25/2021 7:18pm)
  for (let i = 0; i < 14876; i++) {
    const curRound = roundStart.toString();
    calls.push(() => getRoundData(curRound));
    roundStart = roundStart.add(1);
  }

  const allData = [];
  while (calls.length) {
    const data = await Promise.all(calls.splice(0, 100).map(call => call()) );
    allData.push(...data);
  }
  await db.addDataPoints(allData);

  ctx.body = "Done";
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Started server on port ${PORT}`);
});
