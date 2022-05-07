const express = require("express");
const session = require("express-session")
const MongoStore = require("connect-mongo")
const flash = require("connect-flash")
const passport = require("passport")
const csrf = require("csurf")
const cors = require("cors")
const mongoSanitize = require("express-mongo-sanitize")
const { create } = require("express-handlebars");
const User = require("./models/user.model")

require("dotenv").config()
const clientdb = require("./database/db")

const app = express();

//Configuración del Express Handlebars, para trabajar con los sistemas de plantilla
const hbs = create({
  extname: ".hbs",
  partialsDir: ["views/components"], //<-- esto es para poder trabajar el codigo separado en componentes como se hace con react
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

//middleware --> se utiliza el --> .use <--
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({extended: true}))

const corsOptions = {
  credentials: true,
  origin: process.env.PATHEROKU || "*", // El * indica: que funcione con todos, o mejor dicho que cualquier persona puede hacer la solicitud
  methods: ["GET", "POST"]
}
app.use(cors(corsOptions))

//Middleware de las session
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  name: process.env.NAME,
  store: MongoStore.create({
    clientPromise: clientdb,
    dbName: process.env.DBNAME
  }),
  cookie: { secure: process.env.MODO === "production", maxAge: 30 * 24 * 60 * 60 * 1000 } // Aquí le agregamos seguridad a las sesiones y le damos y máximo de tiempo a la sesion de 30 días para qu esté abierta
  //El "secure: true" sólo funciona para "https", en producción debe estar en "false"
}))
//Middleware de Flash
app.use(flash())

//Middleware de Passport --> para trabajar con sesiones y rutas protegidas
//(si el usuario inicia sesión, que lo mande al home, sino no)
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => done(null, {id: user._id, userName: user.userName}))
passport.deserializeUser(async (user, done) => {
  const userDB = await User.findById(user.id)
  return done(null, {id: userDB._id, userName: userDB.userName})
})

app.use(csrf())
app.use(mongoSanitize())

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken()
  //esto lo hago para hacer locales los mensajes de errores y no tener que colocarlos cada vez
  res.locals.mensajes = req.flash("mensajes")
  next()
})

//Rutas
app.use("/", require("./routes/home.routes"));
app.use("/auth", require("./routes/auth.routes"));

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log("servidor andando en el puerto " + PORT + " ✌"));
