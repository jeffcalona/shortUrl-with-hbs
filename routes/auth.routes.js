const express = require("express");
const { body } = require("express-validator");
const {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
} = require("../controllers/aurh.controller");
const router = express.Router();

router.get("/register", registerForm);
//Con express validator voy a hacer las validaciones antes de que se ejecute la función "registerUser"
router.post(
  "/register",
  [
    body("userName", "Ingrese un nombre válido").trim().notEmpty().escape(),
    body("email", "Ingrese un email válido").trim().isEmail().normalizeEmail(),
    body("password", "Contraseña de mínimo 6 carácteres")
      .trim()
      .isLength({ min: 6 })
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.repassword) {
          throw new Error("No coinciden las contraseñas");
        }
        return value; //Esto quiere decir que en caso tal de que las contraseñas sean iguales, devuelva la contraseña, es decir la coloque sin problema en el repassword
      }),
  ],
  registerUser
);
router.get("/confirmar/:token", confirmarCuenta);
router.get("/login", loginForm);
router.post(
  "/login",
  [
    body("email", "Ingrese un email válido").trim().isEmail().normalizeEmail(),
    body("password", "Contraseña de mínimo 6 carácteres")
      .trim()
      .isLength({ min: 6 })
      .escape(),
  ],
  loginUser
);

router.get("/logout", cerrarSesion);

module.exports = router;
