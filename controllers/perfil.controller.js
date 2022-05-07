const formidable = require("formidable")
const fs = require("fs")
const Jimp = require("jimp")
const path = require("path")
const User = require("../models/user.model")

module.exports.formPerfil = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        return res.render("perfil", {user: req.user, imagen: user.imagen})
    } catch (error) {
        req.flash("mensajes", [{msg: "Error al leer el usuario"}])
        return res.redirect("/perfil")
    }
}

module.exports.editarFotoPerfil = async (req, res) => {
    const form = new formidable.IncomingForm()
    form.maxFileSize = 50 * 1024 * 1024 //50mb

    form.parse(req, async(err, fields, files) => {
        try {
            if (err) {
                throw new Error("Falló la subida de imagen")
            }
            console.log(fields)
            console.log(files)

            const file = files.myFile 
            //Validación en caso tal de que no mandemos img
            if (file.originalFilename === "") {
                throw new Error("Por favor agrege una imagen")
            }

            if (!["image/gif", "image/jpeg", "image/png"].includes(file.mimetype)) { // Es lo mismo a escribir --> !(file.mimetype === "image/gif" || "image/jpeg" || "image/png"))
                throw new Error("Por favor agrege una imagen jpeg, jpg, gif o png")
            }

            if (file.size > 50 * 1024 * 1024) {
                throw new Error("Por favor agrege una imagen con tamaño menor a 50mb")
            }

            const extension = file.mimetype.split("/")[1]
            //en este caso el dirFile lo cree con el id del usuario debido a que es su única img de perfil
            const  dirFile = path.join(__dirname, `../public/img/perfiles/${req.user.id}.${extension}`)
            
            //Fs (filesistem) nos sirve para manipular los archivos de nuestro sistema
            fs.renameSync(file.filepath, dirFile)

            const image = await Jimp.read(dirFile)
            image.resize(200, 200, Jimp.HORIZONTAL_ALIGN_CENTER).quality(90).writeAsync(dirFile)

            const user = await User.findById(req.user.id)
            user.imagen = `${req.user.id}.${extension}`
            await user.save()

            req.flash("mensajes", [{msg: "Imagen subida"}])
        } catch (error) {
            console.log(error)
            req.flash("mensajes", [{msg: error.message}])
            //Este Finally es para no colocar el "return res.redirect("/perfil")" dos veces, es decir, en el try y en el catch
        } finally {
            return res.redirect("/perfil")
        }
    })
}