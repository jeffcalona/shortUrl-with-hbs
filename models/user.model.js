const mongoose = require("mongoose")
const {Schema} = mongoose
const bcrypt = require("bcryptjs")

const userSchema = new Schema({
    userName: {
        type: String,
        lowercase: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        index: {unique: true}
    },
    password: {
        type: String,
        required: true
    },
    tokenConfirm: {
        type: String,
        default: null
    },
    cuentaConfirmada: {
        type: Boolean,
        default: false
    },
    imagen: {
        type: String,
        default: null //es null debido a que cueando un usuario se registra no va a tener su propia imagen sino una img por defecto
    }
})

userSchema.pre("save", async function(next){
    var user = this //el "this" corresponde al userName, email, password, tokenConfirm, cuentaCinfirmada

    if (!user.isModified("password")) return next()

    try {
        const salt = await bcrypt.genSaltSync(10)
        const hash = await bcrypt.hashSync(user.password, salt)
        user.password = hash
        next()
    } catch (error) {
        console.log(error)
        throw new Error("Error al codificar la contraseña")
    }
})

userSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", userSchema)