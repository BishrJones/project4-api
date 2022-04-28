const mongoose = require('mongoose')

const exerciseSchema = new mongoose.Schema (
    {
    name: {
        type: String,
        required: true,
    },
    setsReps: {
        type: Number,
        required: true,
    },
    weight: {
        type: Number, 
    }
    }
)

module.exports = exerciseSchema