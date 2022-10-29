import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db/db";

export class User extends Model {}
User.init(
  {
    firstName: DataTypes.STRING,
    email: DataTypes.STRING,
  },
  { sequelize, modelName: "User" }
);
