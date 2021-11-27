const { Price } = require("../models");

async function getByDateRange(startDate, endDate) {
  try {
    console.log(`Getting records for date range [${startDate} to ${endDate})`);
    return await Price.find({
      updatedAt: {
        $gte: startDate,
        $lt: endDate,
      },
    });
  } catch (error) {
    console.error("Error getting records by date range", error);
  }
  return null;
}

module.exports = getByDateRange;
