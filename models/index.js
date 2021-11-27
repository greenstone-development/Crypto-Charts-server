const { model } = require("mongoose");
const SchemaPrice = require("./price");

module.exports = {
  Price: model("price", SchemaPrice),
};
