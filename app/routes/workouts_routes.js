const express = require('express')
const passport = require('passport')

const customErrors = require('../../lib/custom_errors')


const Workout = require('../models/workout')
//this function sends a 404 when non-existent document is requested
const handle404 = customErrors.handle404

//middleware that can send a  401 when a user tries to access something they do not own
const requireOwnership = customErrors.requireOwnership
//requireToken is passed as a second arg to router.<verb>
//makes it so that a token MUST be passed for that route to be available --> also sets 'req.user'
const requireToken = passport.authenticate('bearer', {session: false})

const removeBlanks = require('../../lib/remove_blank_fields')
const { handle } = require('express/lib/application')
// const workout = require('../models/workout')

const router = express.Router()

// INDEX ROUTE -> GET workouts
router.get('/workouts', (req, res, next)=>{
    Workout.find()
    .populate('owner')
        .then(workouts =>{
            return workouts.map(workout => workout.toObject())
        })
        .then(workouts =>{
            res.status(200).json({workouts: workouts})
        })
        .catch(next)
})

// INDEX ROUTE -> GET user's workouts
router.get('/workouts/mine', requireToken, (req, res, next)=>{
    Workout.find({owner: req.user.id})
    .populate('owner')
        .then(workouts =>{
            return workouts.map(workout => workout.toObject())
        })
        .then(workouts =>{
            res.status(200).json({workouts: workouts})
        })
        .catch(next)
})

// INDEX ROUTE -> GET specific user's workouts
router.get('/workouts/user/:ownerId', (req, res, next)=>{
    Workout.find({owner: req.params.ownerId})
    .populate('owner')
        .then(workouts =>{
            return workouts.map(workout => workout.toObject())
        })
        .then(workouts =>{
            res.status(200).json({workouts: workouts})
        })
        .catch(next)
})

// SHOW ROUTE -> GET workout by id
router.get('/workouts/:id', (req, res, next) => {
    // we get the id from req.params.id -> :id
    Workout.findById(req.params.id)
        .then(handle404)
        // if its successful, respond with an object as json
        .then(workout => res.status(200).json({ workout: workout.toObject() }))
        // otherwise pass to error handler
        .catch(next)
})

// CREATE ROUTE ->  POST route to make workouts
router.post('/workouts', requireToken, (req, res, next)=>{
    //we brought in requreToken so we can have access to req.user
    req.body.workout.owner = req.user.id
    Workout.create(req.body.workout)
        .then(workout =>{
            //send a successful response like this
            res.status(201).json({ workout: workout.toObject() })
        })
        //if an error occurs pass it to the error handler
        .catch(next)
})

// UPDATE ROUTE -> PATCH  route for workout by id
router.patch('/workouts/:id', requireToken, removeBlanks, (req, res, next)=>{
    //if the client attempts to change the owner of the workout we can disallow that from the get go
    delete req.body.owner
    //then find workout by id
    Workout.findById(req.params.id)
    //handle 404
    .then(handle404)
    //require ownership and update workout
    .then(workout =>{
        requireOwnership(req, workout)
        return workout.updateOne(req.body.workout)
    })
    //send a 204 no content if successful 
    .then(()=>res.sendStatus(204))
    //pass to errorhandler if not successful
    .catch(next)
})

// DELETE/REMOVE ROUTE -> delete the workout by id
router.delete('/workouts/:id', requireToken, (req, res, next) =>{
    //find the workout by id
    Workout.findById(req.params.id)
        .then(handle404)
        .then(workout => {
            //requireOwnership needs two arguments
            //these are the request itself and the document itself
            requireOwnership(req, workout)
            //we'll delete if the middleware doesn't throw an error
            workout.deleteOne()
        })
        .then(()=>res.sendStatus(204))
    //first handle the 404 if any
    //use requireownership middleware to make sure the right person is making the request
    //send back a 204 no content status if error occurs
    //if error occurs, pass to the handler
        .catch(next)
})

module.exports = router