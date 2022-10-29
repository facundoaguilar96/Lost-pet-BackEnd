import { sequelize } from "./db/db";

sequelize.sync({ force: true }).then(() => {
  console.log("listo");
});
