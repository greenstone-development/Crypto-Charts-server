import { Price } from "../models";

export default async function addDataPoints(dataPoints) {
  await Price.collection.deleteMany({});
  try {
    await Price.collection.insertMany(dataPoints);
    console.log("Inserted data points");
  } catch (error) {
    console.error("Error inserting data points", error);
  }
}
