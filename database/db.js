const mongoose = require("mongoose");
require("dotenv").config()

const clientDB = mongoose
  .connect(process.env.URI)
  .then((m) => {
    console.log("db conectada 👌")
    return m.connection.getClient()
  })
  .catch((err) => console.log("falló la conexión " + err + " 😢"));

module.exports = clientDB