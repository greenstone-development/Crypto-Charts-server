const { Price } = require("../models");

async function getAllData() {
  console.log("Getting all records");
  try {
    return await Price.find({});
  } catch (error) {
    console.error("Error getting all records", error);
  }
  return null;
}

module.exports = getAllData;
