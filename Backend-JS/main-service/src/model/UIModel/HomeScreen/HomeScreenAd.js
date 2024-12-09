const  mongoose  = require("mongoose");

const HomeScreenSchema = new mongoose.Schema({
    title:{
        type:String
    },
    content:{
        type:String
    },
    dirURL : {
        type:String
    },
    protity:{ 
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
})


module.exports = mongoose.model("HomeScreemAds",HomeScreenSchema)