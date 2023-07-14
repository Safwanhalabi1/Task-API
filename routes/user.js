const express = require('express');
const router = express.Router()

const UserController = require('../controllers/UserController')

router.get('/', UserController.index)
router.post('/show', UserController.show)
router.post('/store', UserController.store)
router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.post('/update', UserController.update)
router.post('/delete', UserController.destroy)

// router.get('/get-users', UserController.index)
// router.get('/:userID', UserController.show)
// router.post('/store', UserController.store)
// router.put('/:userID', UserController.update) 
// router.delete('/:userID', UserController.destroy)
// new ones


module.exports = router