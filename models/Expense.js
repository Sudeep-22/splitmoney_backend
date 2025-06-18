const mongoose = require("mongoose")
const { Schema } = require('mongoose');
const ExpenseSchema = new Schema({
    group:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Group',
        required: true
    },
    title:{
        type: String,
        required: true
    },
    amount:{
        type: Number,
        required: true,
    },
    paidBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('Expense', ExpenseSchema);