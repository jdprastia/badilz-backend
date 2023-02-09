const mongoose = require('mongoose');

const portofolioSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    year : {
        type : String,
        required : true
    },
    youtubeLink : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('Portofolio', portofolioSchema)