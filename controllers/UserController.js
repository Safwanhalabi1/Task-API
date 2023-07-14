const User = require("../models/User");
// const Project = require('../models/Project')
var session = require("express-session");
// const products = require('../data.js') -> data from database

//Show list of employees
const index = (req, res, next) => {
	User.find() //mongoose query, which returns all employees in db
		.then((response) => {
			res.json({
				response,
			});
		})
		.catch((error) => {
			res.json({
				message: "An error occurred",
			});
		});
};

//Show single employee
const show = (req, res, next) => {
	let userID = req.body.userID;
	User.findById(userID)
		.then((response) => {
			res.json({
				response,
			});
		})
		.catch((error) => {
			res.json({
				message: "An error has occurred (const show)",
			});
		});
};

//add new employee
const store = (req, res, next) => {
	let user = new User({
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
	});
	user.save()
		.then((response) => {
			res.json({
				message: "User added successfully.",
			});
		})
		.catch((error) => {
			res.json({
				message: "An error has occurred (const store)",
			});
		});
};

const register = (req, res, next) => {
	let user = new User({
		email: req.body.email,
		username: req.body.username,
		password: req.body.password
	})

	if (req.body.password != req.body.confirm) {
		req.session.message = "Both passwords must match!"
		return res.redirect('/signup')
	}


	let userID = req.body.email
	User.findOne({ email: req.body.email }).then(response => {
		if (response) {
			req.session.message = "User already exists"
			return res.redirect('/signup')
		}
		else {
			user.save()
				.then(response => {
					const connectedUser = {
						connected: true,
						username: req.body.username,
					}
					req.session.connected = true
					req.session.username = req.body.username
					req.session.email = req.body.email
					return res.redirect('/');
				})
				.catch(error => {
					req.session.message = "Couldn't save user"
					return res.redirect('/signup')
				})
		}
	})

}

const login = (req, res, next) => {
	let userID = req.body.email;
	User.findOne({ email: req.body.email }).then((response) => {
		if (response) {
			if (response.password === req.body.password) {
				req.session.username = response.username;
				req.session.email = response.email;
				req.session.connected = true;
				return res.redirect("/");
			} else {
				req.session.message = "Incorrect login information";
				return res.redirect("/login");
			}
		} else {
			req.session.message = "User doesn't exist";
			return res.redirect("/login");
		}
	});
};

//update an employee
const update = (req, res, next) => {
	let userID = req.body.userID;

	let updateData = {
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
	};

	User.findByIdAndUpdate(userID, { $set: updateData })
		.then(() => {
			res.json({
				message: "User updated successfully",
			});
		})
		.catch((error) => {
			res.json({
				message: "An error has occurred (update)",
			});
		});
};

//del employee
const destroy = (req, res, next) => {
	let userID = req.body.userID;
	User.findByIdAndRemove(userID)
		.then(() => {
			res.json({
				message: "User deleted successfully",
			});
		})
		.catch((error) => {
			res.json({
				message: "An error has occurred (destroy)",
			});
		});
};

module.exports = {
	index,
	show,
	store,
	register,
	login,
	update,
	destroy,
};
