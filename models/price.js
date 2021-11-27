import { Schema } from "mongoose";

const SchemaMain = new Schema(
  {
    roundId: String,
    price: Number,
    startedAt: {
      type: Number,
      get: (d) => new Date(d * 1000),
    },
    updatedAt: {
      type: Number,
      get: (d) => new Date(d * 1000),
    },
    answeredInRound: String,
  },
  { toJSON: { getters: true } }
);

export default SchemaMain;
