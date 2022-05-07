const { URL } = require("url");
// un middleware es una funcion simple como las que se utilizan en los controladores
// con la diferencia de que ademas del req y el res, usa un next
// el next es para que una vez se haga la validación, siga con la siguiente ejecución
const urlValidar = (req, res, next) => {
  try {
    const { origin } = req.body;
    const urlFrontend = new URL(origin);
    if (urlFrontend.origin !== "null") {
      if (
        urlFrontend.protocol === "http:" ||
        urlFrontend.protocol === "https:"
      ) {
        return next();
      }
      throw new Error("La URL debe contener https://")
    }
    throw new Error("no válida 😢");
  } catch (err) {
      if(err.message === "Invalid URL") {
          req.flash("mensajes", [{msg: "La URL es invalida"}])
      } else {
          req.flash("mensajes", [{ msg: err.message }]);
      }
    return res.redirect("/")
  }
};

module.exports = urlValidar;
