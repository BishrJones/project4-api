const express = require('express')
const passport = require('passport')
const Comment = require('../models/comment')
const Workout = require ('../models/workout')
const router = express.Router()

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const requireToken = passport.authenticate('bearer', { session: false })
const removeBlanks = require('../../lib/remove_blank_fields')

// POST ROUTE -> create a comment
router.post('/comments/:workoutId', requireToken, (req,res, next) => {
    //get our comment from req.body
    const comment = req.body.comment
    req.body.comment.owner = req.user.id
    //get our workoutId from req.params.id
    const workoutId = req.params.workoutId
    //find the workout
    Workout.findById(workoutId)
        .then(handle404)
    //push the comment to the comments array
        .then(workout => {
            console.log('this is the workout', workout)
            console.log('this is the comment', comment)
            workout.comments.push(comment)
            //save the workout
            return workout.save()
        })
    //then we send the workout as json
        .then(workout => res.status(201).json({workout: workout}))
    //catch errors and send to the handler
        .catch(next)
})