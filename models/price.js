import { Schema } from "mongoose";

const SchemaMain = new Schema({
  roundId: Number,
  price: Number,
  startedAt: Date,
  updatedAt: Date,
  answeredInRound: Number,
});

export default SchemaMain;
