const express = require('express')
const router = express.Router()
const getPdfy = require('../controllers/protectedPdfy')
router.route('/').get(getPdfy)