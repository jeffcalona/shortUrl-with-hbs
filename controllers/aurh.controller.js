const { nanoid } = require("nanoid");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer")
const User = require("../models/user.model");
require("dotenv").config()

const registerForm = (req, res) => {
  //antes de colocar los mensajes de forma local, estaba el código así
  //res.render("register", { mensajes: req.flash("mensajes") })
  res.render("register");
};

const registerUser = async (req, res) => {
  //Con esto ya estoy llamando la validaciones que hice en el router antes de que se registre el usuario
  //validationResult pertenece a la libreria de express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/register");
  }

  const { userName, email, password } = req.body;
  try {
    let user = await User.findOne({ email: email }); //esta es una validación para verificar que el usuario no exista (lo hago antes de registrarlo, para no registrar al mismo usuario)
    if (user) throw new Error("Ya existe un usuario registrado con ese correo");

    user = new User({ userName, email, password, tokenConfirm: nanoid() }); //tambien se puede colocar user = new User(req.body)
    await user.save();

    //aquí configuro para que se le envie el correo electronico de confirmación
    //esto es lo que se va a cambiar con las credenciales y el metodo de envío de correos
    //que esté configurado en el hosting
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.USEREMAIL,
        pass: process.env.PASSEMAIL
      }
    });

    await transport.sendMail({
      from: "Jefferson",
      to: user.email,
      subject: "Verificar tu cuenta de correo",
      html: `<a href="${process.env.PATHEROKU || "http://localhost:5000"}/auth/confirmar/${user.tokenConfirm}"><h1>Verifica tu cuenta aquí</h1></a>`
    })

    req.flash("mensajes", [
      { msg: "Por favor revisar email y confirmar cuenta" },
    ]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/register");
    //res.json({ error: error.message });
  }
};

const confirmarCuenta = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ tokenConfirm: token });

    if (!user) throw new Error("No existe el usuario");

    user.cuentaConfirmada = true;
    user.tokenConfirm = null;
    await user.save();
    req.flash("mensajes", [{ msg: "Cuenta de email confirmada" }]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    res.redirect("/auth/login");
    //res.send(error.message)
  }
};

const loginForm = (req, res) => {
  //antes de colocar los mensajes de forma local, estaba el código así
  //res.render("register", { mensajes: req.flash("mensajes") })
  res.render("login");
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //acá es donde hago uso de Flash (para que me pinte el error en el frontend)
    //coloco errors.array() porque flash trabaja sólo con array para despues tomar el dato que quiero expresar en el frontend
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/login");
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("El usuario no existe");
    if (!user.cuentaConfirmada) throw new Error("Por favor confirme la cuenta");
    if (!(await user.comparePassword(password)))
      throw new Error("Contraseña incorrecta");

    //Esto me está creando la sesión de usuario a través de Passport
    req.login(user, function (err) {
      if (err) throw new Error("Error al crear la sesión");
      res.redirect("/");
    });
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
  }
};

const cerrarSesion = (req, res) => {
  req.logout();
  return res.redirect("/auth/login");
};

module.exports = {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
};
