import { model } from "mongoose";
import SchemaPrice from "./price";

export const Price = model("price", SchemaPrice);
