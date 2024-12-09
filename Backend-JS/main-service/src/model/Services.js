const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    title:{
        type:String
    },
    image:{
        type:String
    },
    titleImage:{
        type:String
    },
    description:{
        type:String
    },
    prority:{
        type:Number
    }
})

module.exports = mongoose.model("Service",serviceSchema)