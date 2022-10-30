import * as express from "express";
import * as cors from "cors";
import { index } from "./lib/algolia";
// import fetch from "node-fetch";
import {
  newLostPet,
  returnPerfil,
  returnAllPets,
  arroundPet,
  returFilterPets,
  deletedPet,
  updatePet,
} from "./controllers/pet-controller";
import {
  createOrFindUser,
  searchUser,
  updateUser,
  validateUser,
  searchUserByPk,
  authMiddleWare,
} from "./controllers/user-controller";
import { createOrFindAuth } from "./controllers/auth-controller";
import { Auth, Pet, User } from "./models";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json({ limit: "50mb" }));
app.use(cors());

app.post("/user/recover", async (req, res) => {
  let numRamdom = Math.floor(Math.random() * 999999);
  console.log(req.body.email);

  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SG_KEY);

  const msg = {
    to: req.body.email,
    from: "testingdevfga@gmail.com",
    subject: "Código de recuperación",
    text: "Recuperacion",
    html:
      "Hola su código de recuperación es: <strong>" + numRamdom + "</strong>",
  };

  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
  res.json({ code: numRamdom });
});

app.post("/auth", async (req, res) => {
  if (req.body.email) {
    const userFinded = await searchUser(req.body.email);
    res.json(userFinded);
  } else {
    res.json({ error: true });
  }
});

app.post("/signup", async (req, res) => {
  if (req.body) {
    const user = await validateUser(req.body);
    if (user.error) {
      res.status(404).json(user);
    } else {
      res.json(user);
    }
  } else {
    res.status(404).json({ error: true });
  }
});

app.put("/user", async (req, res) => {
  console.log(req.body);

  if (req.body) {
    const modifyUser = await updateUser(req.body);
    res.json(modifyUser);
  } else {
    res.status(404).json({ error: true });
  }
});

app.post("/signin", async (req, res) => {
  if (req.body) {
    const userCreatedOrFinder = await createOrFindUser(req.body);
    const auth = await createOrFindAuth(
      req.body,
      userCreatedOrFinder.user.get("id")
    );
    res.json({ created: userCreatedOrFinder.created });
  } else {
    res.status(404).json({ error: true });
  }
});

app.get("/pet/:id", async (req, res) => {
  const id = req.params.id;
  const perfil = await returnPerfil(id);
  res.json(perfil);
});

app.post("/user/pets", async (req, res) => {
  if (req.headers.authorization) {
    const userId = authMiddleWare(req.headers.authorization);
    if (userId.id) {
      let myPets = await returFilterPets(userId.id);
      res.status(200).json(myPets);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } else {
    res.status(400).json({ error: "Error, authorization invalid" });
  }
});
app.delete("/user/pets", async (req, res) => {
  const token = req.headers.authorization;
  const petDeleted = await deletedPet(req.body.id, token);
  res.json({ petDeleted });
});

app.post("/arroundPet", async (req, res) => {
  arroundPet(req.body).then((e) => {
    const pet = e as any;
    let numeroPet = [];
    for (const i of pet) {
      numeroPet.push(parseInt(i.objectID));
    }

    returFilterPets(numeroPet).then((e) => {
      res.json(e);
    });
  });
});

app.post("/pet", async (req, res) => {
  const token = req.headers.authorization;
  if (req.body) {
    const newPet = await newLostPet(req.body, token);

    res.json({ create: true });
  } else {
    res.status(400).json({ error: true });
  }
});

app.put("/pet", async (req, res) => {
  const token = req.headers.authorization;
  console.log(token);

  if (req.body) {
    const pet = await updatePet(req.body, token);
    console.log(pet, "pet");

    res.status(200).json({ create: true });
  } else {
    res.status(400).json({ error: true });
  }
});

app.post("/pet/report", async (req, res) => {
  if (req.body.userId) {
    let user = await searchUserByPk(req.body.userId);

    if (user.userFinded) {
      const userEmail = user.userFinded.get("email");

      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(process.env.SG_KEY);

      const msg = {
        to: userEmail,
        from: "testingdevfga@gmail.com",
        subject: "Información sobre su mascota perdida",
        text: "info mascota",
        html:
          "Hola, <strong>" +
          req.body.name +
          "</strong> reportó información sobre su mascota perdida, su numero telefónico es <strong>" +
          req.body.phone +
          '</strong>. También le dejo el siguiente mensaje: <strong>"' +
          req.body.info +
          '"</strong>',
      };

      sgMail
        .send(msg)
        .then((response) => {
          console.log(response[0].statusCode);
          console.log(response[0].headers);
        })
        .catch((error) => {
          console.error(error);
        });

      res.json({ userEmail });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } else {
    res.status(400).json({ error: "Faltan datos" });
  }
});

app.listen(port, () => {
  console.log("Corriendo en http://localhots:" + port);
});
