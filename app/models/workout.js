const mongoose = require('mongoose')
const exerciseSchema = require('./exercise')
const commentSchema = require('./comment')

const { Schema, model } = mongoose

const workoutSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        muscleTargeted: {
            type: String,
            required: true,
        },
        intensity: {
            type: Number,
            required: true,
        },
        time: {
            type: Number,
            required: true, 
        },
        exercise: [exerciseSchema],
		comments: [commentSchema],
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Workout', workoutSchema)