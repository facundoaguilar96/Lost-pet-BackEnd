import { Model, DataTypes } from "sequelize";
import { sequelize } from "../db/db";

export class Auth extends Model {}
Auth.init(
  {
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    user_ID: DataTypes.INTEGER,
  },
  { sequelize, modelName: "Auth" }
);
