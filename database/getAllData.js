import { Price } from "../models";

export default async function getAllData() {
  console.log("Getting all records");
  try {
    return await Price.find({});
  } catch (error) {
    console.error("Error getting all records", error);
  }
  return null;
}
