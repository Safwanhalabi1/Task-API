const Project = require('../models/Project');

//Show list of projects
const index = (req, res, next) => {
}

//Show single project
const show = (req, res, next) => {

}

//add new project
const store = (req, res, next) => {
    let newProject = new Project({
        name: req.body.project
    });
}

//update an project
const update = (req, res, next) => {

}

//del project
const destroy = (req, res, next) => {

}

module.exports = {
    index, show, store, update, destroy
}