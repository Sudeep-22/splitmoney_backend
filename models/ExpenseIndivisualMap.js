const mongoose = require("mongoose")
const { Schema } = require('mongoose');
const ContributionMapSchema = new Schema({
    expense:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Expense'
    },
    contribution:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Contribution'
    }
})
module.exports = mongoose.model('ContibutionMap', ContributionMapSchema);