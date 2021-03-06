const {User} = require('../models/user')
const {Clinician} = require('../models/clinician')
const {Patient} = require('../models/patient')
const bcrypt = require('bcryptjs')

SALT_FACTOR = 10

const { validationResult } = require('express-validator');

const getUsers = async (req, res) => {
    const users = await User.find().lean()
    return res.render('API-createUser.hbs', {users: users})
}


const createClinicianUser = async (req, res, next) => {
    try {
        const user = new User(req.body)
        user.secret = "SqS8yF:Ac;<zn9YM8:=3s\",/q$9Rn9}hX\\y7&..Q!D~h'dJu5-BGKJ7#cR``\\Z^k"
        user.dateCreated = getDateTime()
        user.onModel = 'Clinician'

        const clinician = new Clinician
        clinician.user = user
        await clinician.save()

        user.model = clinician
        await user.save()
        return res.redirect('/login')
    }
    catch (e) {
        return next(e)
    }
}


const createPatientUser = async (req, res, next) => {
    try {
        if (req.user.onModel === 'Patient') {
            res.redirect('/patient')
        }
        else {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('patient_register.hbs', {user: req.user.toJSON(), darkMode: req.user.darkMode})
            }
            if (req.body.password !== req.body.password2) {
                return res.render('patient_register.hbs', {user: req.user.toJSON(), darkMode: req.user.darkMode, error: "Passwords did not match"})
            }
            const user = new User(req.body)
            const email = req.body.email
            user.secret = "SqS8yF:Ac;<zn9YM8:=3s\",/q$9Rn9}hX\\y7&..Q!D~h'dJu5-BGKJ7#cR``\\Z^k"
            user.dateCreated = getDateTime()
            user.onModel = 'Patient'

            const patient = new Patient
            patient.user = user
            patient.clinician = req.user._id
            await patient.save()

            user.model = patient
            await user.save()


            const doc = await Clinician.findById(req.user.toJSON().model)
            const usr = await User.findOne({email}, {_id: 1})
            const pat = await Patient.findOne({user: usr._id})
            await Clinician.findOneAndUpdate(
                {_id: doc._id},
                {$push: {patients: pat._id}}
            )
        }
        return res.redirect('/clinician/dashboard')
    }
    catch (e) {
        return next(e)
    }
}


const getDateTime = () => {
    return new Date().toLocaleString("en-AU", {timeZone: "Australia/Melbourne"});
}

const updateUserDetails = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            await User.findOneAndUpdate(
                {_id: req.user._id},
                {$set: {
                    bio: req.body.bio
                }}
            ).lean()
        }
        if (req.body.Password != "") {
            if (req.body.Password.localeCompare(req.body.Confirm_Password) == 0) {
                bcrypt.hash(req.body.Password, SALT_FACTOR, async (err, hash) => {
                    if (err) {
                        return next(err)
                    }
                    // Replace password with hash
                    await User.findOneAndUpdate(
                        {_id: req.user._id},
                        {$set: {
                            password: hash
                        }}
                    ).lean()
                })
            }
        }
        let role
        if (req.user.onModel == 'Patient') {
            role = 'patient'
        } else if (req.user.onModel == 'Clinician') {
            role = 'clinician'
        }
        let path = '/' + role + '/settings'
        return res.redirect(path)
    }
    catch (e) {
        return next(e)
    }
}

module.exports = {
    getUsers,
    createClinicianUser,
    createPatientUser,
    updateUserDetails,
}