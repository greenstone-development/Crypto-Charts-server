import { Schema } from "mongoose";

const SchemaMain = new Schema({
  roundId: String,
  price: Number,
  startedAt: Date,
  updatedAt: Date,
  answeredInRound: String,
});

export default SchemaMain;
