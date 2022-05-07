const express = require("express");
const { leerUrls, agregarUrl, eliminarUrl, editarUrlForm, editarUrl, redireccionamiento } = require("../controllers/home.controller");
const { formPerfil, editarFotoPerfil } = require("../controllers/perfil.controller");
const urlValidar = require("../middlewares/urlValida");
const verificarUser = require("../middlewares/verificarUser");

const router = express.Router();

router.get("/", verificarUser, leerUrls);
router.post("/", verificarUser, urlValidar, agregarUrl) //<-- Gracias al next que tiene el middleware "urlEliminar", una vez termine de ejecutarse CON EXITO pasa a "agregarUrl"
router.get("/eliminar/:id", verificarUser, eliminarUrl)
router.get("/editar/:id", verificarUser, editarUrlForm)
router.post("/editar/:id", verificarUser, urlValidar, editarUrl)

router.get("/perfil", verificarUser, formPerfil)
router.post("/perfil", verificarUser, editarFotoPerfil)

router.get("/:shortURL", redireccionamiento)



module.exports = router;
