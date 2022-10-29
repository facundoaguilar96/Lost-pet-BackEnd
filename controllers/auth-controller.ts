import { Auth } from "../models";
import * as crypto from "crypto";

function getSHA256ofString(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function createOrFindAuth(data, id) {
  const { password, email } = data;
  const [authUser, authCreated] = await Auth.findOrCreate({
    where: { user_ID: id },
    defaults: {
      password: getSHA256ofString(password),
      email,
    },
  });
  return { authCreated };
}
