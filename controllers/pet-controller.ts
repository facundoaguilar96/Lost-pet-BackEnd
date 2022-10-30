import { Pet } from "../models";
import { authMiddleWare } from "./user-controller";
import { cloudinary } from "../lib/claudinary";
import { index } from "../lib/algolia";
const { Op } = require("sequelize");

export async function newLostPet(data, token) {
  const verify = authMiddleWare(token);

  if (verify) {
    console.log(data);

    if (data.imgData) {
      const newPet = await Pet.create({
        name: data.name,
        lat: data.lat,
        lng: data.lng,
        description: data.description,
      });
      const imagen = await cloudinary.uploader.upload(data.imgData, {
        resource_type: "image",
        discard_original_filename: true,
        width: 1000,
      });
      console.log(newPet.get("id"));

      const pet = await Pet.update(
        { pictureURL: imagen.secure_url, UserId: verify.id },
        {
          where: {
            id: newPet.get("id"),
          },
        }
      );
      index
        .saveObject({
          objectID: newPet.get("id"),
          userId: verify.id,
          name: data.name,
          _geoloc: {
            lat: data.lat,
            lng: data.lng,
          },
        })
        .then((e) => {
          console.log("Argolia se guardó!");
        })
        .catch((e) => {
          console.log("error en Argolia!" + e);
        });
      return pet;
    } else {
      return { error: "No hay imagen!" };
    }
  } else {
    return { error: true };
  }
}

export async function updatePet(data, token) {
  const verify = authMiddleWare(token);

  if (verify) {
    const pet = await Pet.update(
      {
        name: data.name,
        lat: data.lat,
        lng: data.lng,
        description: data.description,
        pictureURL: data.imgData,
      },
      {
        where: {
          id: data.id,
        },
      }
    );
    index
      .partialUpdateObject({
        objectID: data.id,
        userId: verify.id,
        name: data.name,
        _geoloc: {
          lat: data.lat,
          lng: data.lng,
        },
      })
      .then((e) => {
        console.log("Argolia se guardó!");
      })
      .catch((e) => {
        console.log("Error en argolia" + e);
      });
    return pet;
  } else {
    return { error: true };
  }
}

export async function arroundPet(body) {
  if (body) {
    let busca = `${body.lat},${body.lng}`;
    let pet = index
      .search("", {
        aroundLatLng: busca,
        aroundRadius: 90000000, // 1000 km
      })
      .then(({ hits }) => {
        return hits;
      });

    return pet;
  } else {
    return "error";
  }
}

export async function returFilterPets(filter) {
  if (typeof filter == "number") {
    let userId = [filter];
    let filterUserPets = await Pet.findAll({
      where: {
        UserId: {
          [Op.or]: userId,
        },
      },
    });
    return filterUserPets;
  } else {
    let filterPets = await Pet.findAll({
      where: {
        id: {
          [Op.or]: filter,
        },
      },
    });
    return filterPets;
  }
}
export async function deletedPet(id, token) {
  const verify = authMiddleWare(token);

  if (verify) {
    let petDelete = await Pet.destroy({
      where: {
        id,
      },
    });
    const objectID = id;
    index.deleteObject(objectID).then((e) => {});
    return { destroy: true };
  } else {
    return { destroy: false };
  }
}

export async function returnPerfil(id) {
  const findPerfil = await Pet.findByPk(id);
  return findPerfil;
}

export async function returnAllPets() {
  const findPerfil = await Pet.findAll();
  return findPerfil;
}
