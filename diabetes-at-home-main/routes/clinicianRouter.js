const express = require('express')
const clinicianRouter = express.Router()

const clinicianController = require('../controllers/clinicianController')
const homeController = require('../controllers/homeController')
const userController = require('../controllers/userController')

const { body } = require('express-validator');

clinicianRouter.get('/dashboard', homeController.isAuthenticated, homeController.hasRole('Clinician'), clinicianController.getClinicianDashboard)

clinicianRouter.get('/patient-comments', homeController.isAuthenticated, homeController.hasRole('Clinician'), clinicianController.getPatientComments)

clinicianRouter.use('/patient', require('./clinicianPatientRouter'))

clinicianRouter.get('/settings', homeController.isAuthenticated, homeController.hasRole('Clinician'), clinicianController.getClinicianSettings)

clinicianRouter.get('/register-patient', homeController.isAuthenticated, homeController.hasRole('Clinician'), clinicianController.getRegisterPatient)

clinicianRouter.post('/register-patient', 
                    homeController.isAuthenticated, 
                    homeController.hasRole('Clinician'), 
                    body('email').isEmail().not().isEmpty().escape(),
                    body('nameGiven').not().isEmpty().escape(),
                    body('nameFamily').not().isEmpty().escape(),
                    body('nameScreen').not().isEmpty().escape(),
                    body('yearBorn').isInt().not().isEmpty().escape(),
                    body('password').isLength({ min: 8 }).not().isEmpty().escape(),
                    body('password2').isLength({ min: 8 }).not().isEmpty().escape(),
                    userController.createPatientUser)

clinicianRouter.get('/dark-mode', homeController.isAuthenticated, homeController.hasRole('Clinician'),clinicianController.turnOnDarkMode)

clinicianRouter.get('/', homeController.isAuthenticated, homeController.hasRole('Clinician'), clinicianController.getClinicianDashboard)

module.exports = clinicianRouter
