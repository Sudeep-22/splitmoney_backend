const mongoose = require("mongoose")
const { Schema } = require('mongoose');
const ContibutionSchema = new Schema({
    expense:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Expense'
    },
    paidByUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    paidToUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    amount:{
        type:Number,
        required: true
    },
})
module.exports = mongoose.model('Contibution', ContibutionSchema);