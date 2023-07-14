const express = require('express');
const router = express.Router()

const TasksController = require('../controllers/TasksController')

router.get('/', TasksController.index)
router.post('/show', TasksController.show)
router.post('/store', TasksController.store)
router.post('/update', TasksController.update)
router.post('/delete', TasksController.destroy)

module.exports = router