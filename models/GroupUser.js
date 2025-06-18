const mongoose = require("mongoose")
const { Schema } = require('mongoose');
const GroupUserSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    group:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Group'
    },
    date:{
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('GroupUser', GroupUserSchema);