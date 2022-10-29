import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db/db";

export class Pet extends Model {}
Pet.init(
  {
    name: DataTypes.STRING,
    pictureURL: DataTypes.STRING,
    lat: DataTypes.FLOAT,
    lng: DataTypes.FLOAT,
    description: DataTypes.STRING,
  },
  { sequelize, modelName: "pet" }
);
