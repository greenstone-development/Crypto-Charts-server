const { Price } = require("../models");

async function addAllData(dataPoints) {
  console.log("Clearing collection...");
  await Price.collection.deleteMany({});

  try {
    console.log("Inserting new records...");
    await Price.collection.insertMany(dataPoints);
    console.log("Database updated.");
  } catch (error) {
    console.error("Error inserting all data points", error);
  }
}

module.exports = addAllData;
