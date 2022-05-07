const mongoose = require("mongoose")
const {Schema} = mongoose

const urlSchema = new Schema({
    origin: {
        type: String,
        unique: true,
        required: true
    },
    shortURL: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User", //se refiere al nombre del modelo al que le estamos haciendo referencia
        required: true
    }
})

module.exports = mongoose.model("Url", urlSchema)