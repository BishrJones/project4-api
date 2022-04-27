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