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

// DELETE/REMOVE route -> deletes the comment
router.delete('/comments/:workoutId/:commId', requireToken, (req,res, next) => {
    // saving both ids to variables for easy ref later
    const commId = req.params.commId
    const workoutId = req.params.workoutId
    // find the pet in the db
    Workout.findById(workoutId)
       .populate('comments.owner')
        // if pet not found throw 404
        .then(handle404)
        .then(workout => {
            // get the specific subdocument by its id
            const theComment = workout.comments.id(commId)
            console.log('this is the comment', theComment)
            // require that the deleter is the owner of the comment
            requireOwnership(req, theComment)
            // call remove on the toy we got on the line above requireOwnership
            theComment.remove()

            // return the saved pet
            return workout.save()
        })
        // send 204 no content
        .then(() => res.sendStatus(204))
        .catch(next)
})

module.exports = router