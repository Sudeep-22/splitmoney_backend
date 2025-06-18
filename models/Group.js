const mongoose = require("mongoose")
const { Schema } = require('mongoose');
const GroupSchema = new Schema({
    title:{
        type: String,
        required: true,
        unique: true,
        minlength: 3
    },
    description:{
        type:String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('Group', GroupSchema);