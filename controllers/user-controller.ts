import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { User, Auth } from "../models";

const SERCRET = process.env.U_SECRET;

function getSHA256ofString(text: string) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export function authMiddleWare(token) {
  const tk = token.split(" ")[1];
  try {
    const data = jwt.verify(tk, SERCRET);
    return data;
  } catch (error) {
    return { error: true };
  }
}

export async function searchUser(email) {
  const userFinded = await User.findOne({
    where: {
      email,
    },
  });
  if (userFinded) {
    return { found: true, userFinded };
  } else {
    return { found: false };
  }
}

export async function searchUserByPk(pk) {
  const userFinded = await User.findByPk(pk);
  if (userFinded) {
    return { userFinded };
  } else {
    return { found: false };
  }
}

export async function updateUser(data) {
  const { email, password } = data;
  if (data.firstName && data.password) {
    const user = await User.update(data, {
      where: {
        email,
      },
    });
    const userfind = await User.findOne({
      where: {
        email,
      },
    });
    const authUser = await Auth.update(
      { password: getSHA256ofString(password) },
      {
        where: { user_ID: userfind.get("id") },
      }
    );
    return { user: user };
  } else if (data.firstName) {
    const user = await User.update(data, {
      where: {
        email,
      },
    });
    return { user: user };
  } else {
    const user = await User.update(data, {
      where: {
        email,
      },
    });
    const userfind = await User.findOne({
      where: {
        email,
      },
    });
    const authUser = await Auth.update(
      { password: getSHA256ofString(password) },
      {
        where: { user_ID: userfind.get("id") },
      }
    );
    return { user: user, authUser: authUser };
  }
}

export async function createOrFindUser(data) {
  const email = data.email;
  const [user, created] = await User.findOrCreate({
    where: { email },
    defaults: {
      ...data,
    },
  });
  return { user, created };
}

export async function validateUser(data) {
  const passwordHash = getSHA256ofString(data.password);
  const email = data.email;
  const user = await Auth.findOne({
    where: { email, password: passwordHash },
  });
  if (user !== null) {
    const token = jwt.sign({ id: user.get("user_ID") }, SERCRET);
    return token;
  } else {
    return { error: "Email or password incorrect" };
  }
}
