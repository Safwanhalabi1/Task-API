const express = require('express');
const router = express.Router()

const ProjectsController = require('../controllers/ProjectController')

router.get('/', ProjectsController.index)
router.post('/show', ProjectsController.show)
router.post('/store', ProjectsController.store)
router.post('/update', ProjectsController.update)
router.post('/delete', ProjectsController.destroy)

module.exports = router