const Sequelize = require("sequelize");

export const sequelize = new Sequelize({
  dialect: "postgres",
  username: process.env.SQ_USERNAME,
  password: process.env.SQ_PASSWORD,
  database: process.env.SQ_DB,
  port: 5432,
  host: process.env.SQ_DB_HOST,
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
