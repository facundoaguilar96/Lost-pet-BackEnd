import { User } from "./user";
import { Auth } from "./auth";
import { Pet } from "./Pet";

User.hasMany(Pet);
Pet.belongsTo(User);

export { User, Pet, Auth };
