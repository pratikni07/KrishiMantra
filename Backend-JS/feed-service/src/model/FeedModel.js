const mongoose = require("mongoose")

const FeedSchema = new mongoose.Schema({
    userId:{
        type: String
    },
    userName:{
        type: String
    },
    profilePhoto:{
        type: String
    },
    description: {
        type:String,
    },
    content:{
        type:String,
    },
    like:{
        count:{
            type:Number,
        },
        likes:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Likes'
            }
        ]
    },
    comment:{
        count:{
            type:Number,
        },
        comments:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comments'
            }
        ]
    },
    tags:[
        {
            type:{
                type:String
            }
        }
    ],
    locaion:{
        lantitude:{

        },
        langitude:{

        }
    },
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Feed",FeedSchema)