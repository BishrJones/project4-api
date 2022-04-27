const express = require('express')
const passport = require('passport')

const Workout = require('../models/workout')

const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership
const requireToken = passport.authenticate('bearer', {session: false})

const removeBlanks = require('../../lib/remove_blank_fields')
const { handle } = require('express/lib/application')

const router = express.Router()

// POST route -> create a new exercise
router.post('/exercise/:workoutId', requireToken, (req, res, next)=>{
    //get our exercise from req.body
    const exercise = req.body.exercise
    //get our workoutId from req.params.id
    const workoutId = req.params.workoutId
    //find the workout
    Workout.findById(workoutId)
        .then(handle404)
    //push the exercise to the exercise array
        .then(workout => {
            console.log('this is the workout', workout)
            console.log('this is the exercise', exercise)
            requireOwnership(req, workout)
            workout.exercise.push(exercise)
            //save the workout
            return workout.save()
        })
    //then we send the workout as json
        .then(workout => res.status(201).json({workout: workout}))
    //catch errors and send to the handler
        .catch(next)
})