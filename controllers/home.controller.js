const Url = require("../models/url.model");
const { nanoid } = require("nanoid");

const leerUrls = async (req, res) => {
  //una vez se haya verificado el usuario y se encuentre en esta pestaña, ya tenemos
  //disponible el req.user <--- del usuario que hizo el login
  //otra forma de decirlo, cada ruta que contenga el meddleware "verificarUser"
  //tiene a su vez el req.user del id del usuario logiado
  try {
    const urls = await Url.find({user: req.user.id}).lean(); // el lean es porque necesitamos que el find nos traiga un objeto de js tradicional y no de mongoose
    res.render("home", { urls: urls }); //<-- (se coloca la clave y el valor) como es redundante puedo colocar sólo urls una vez
  } catch (err) {
    //console.log(err);
    //res.send("ERROR falló algo 😢");
    req.flash("mensajes", [{msg: err.message}])
    return res.redirect("/")
  }
};

const agregarUrl = async (req, res) => {
  const { origin } = req.body;

  try {
    const url = new Url({
      origin: origin,
      shortURL: nanoid(8),
      user: req.user.id
    });
    req.flash("mensajes", [{msg: "URL agregada"}])
    await url.save();
    res.redirect("/");
  } catch (err) {
    req.flash("mensajes", [{msg: err.message}])
    return res.redirect("/")
  }
};

const eliminarUrl = async (req, res) => {
  const { id } = req.params;
  try {
    //await Url.findByIdAndDelete(id);
    const url = await Url.findById(id)
    if(!url.user.equals(req.user.id)){
      throw new Error("No es tu URL 😛")
    }
    await url.remove()
    req.flash("mensajes", [{msg: "URL eliminada"}])
    res.redirect("/");
  } catch (err) {
    req.flash("mensajes", [{msg: err.message}])
    return res.redirect("/")
  }
};

const editarUrlForm = async (req, res) => {
  const { id } = req.params;

  try {
    const url = await Url.findById(id).lean();
    if(!url.user.equals(req.user.id)){
      throw new Error("No es tu URL 😋")
    }
    res.render("home", { url });
  } catch (err) {
    req.flash("mensajes", [{msg: err.message}])
    return res.redirect("/")
  }
};

const editarUrl = async (req, res) => {
  const { id } = req.params;
  const { origin } = req.body;
  try {
    const url = await Url.findById(id)
    if(!url.user.equals(req.user.id)){
      throw new Error("No es tu URL 😋")
    }
    await Url.updateOne({origin})
    req.flash("mensajes", [{msg: "URL editada"}])
    //await Url.findByIdAndUpdate(id, { origin: origin });
    res.redirect("/");
  } catch (err) {
    req.flash("mensajes", [{msg: err.message}])
    return res.redirect("/")
  }
};

const redireccionamiento = async (req, res) => {
  try {
    const { shortURL } = req.params;
    const urlDB = await Url.findOne({ shortURL: shortURL });
    res.redirect(urlDB.origin);
  } catch (err) {
    req.flash("mensajes", [{msg: "No existe esta URL configurada"}])
    return res.redirect("/auth/login")
  }
};

module.exports = {
  leerUrls,
  agregarUrl,
  eliminarUrl,
  editarUrlForm,
  editarUrl,
  redireccionamiento,
};
