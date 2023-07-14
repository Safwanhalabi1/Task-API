const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");
const PORT = process.env.PORT || 3000;
const Task = require("./models/Tasks");
const Project = require("./models/Project");
const db = mongoose.connection;
const session = require("express-session");
const projectsCollection = db.collection("projects");

const UserRoute = require("./routes/user.js");
const ProjectRoute = require("./routes/project.js");

mongoose.connect(
	"mongodb+srv://bish150b:HFwETV9HRWgmk7am@cluster0.uorwthh.mongodb.net/Temp",
	{ useNewUrlParser: true, useUnifiedTopology: true }
);

db.on("error", (err) => {
	console.log(err);
});

db.once("open", () => {
	console.log("Database connection established");
});

// app.use(morgan('dev'))
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(session({ resave: true, secret: "123456", saveUninitialized: true }));
app.use("/user", UserRoute);
app.use("/project", ProjectRoute);

// get data from database
async function getItems(userEmail) {
	var projCol = db.collection("projects");
	const Items = await projCol.find({ user: userEmail }).toArray();
	return Items;
}

function ConvertDBDataToJSON(mongodbData) {
	const transformedData = mongodbData.map((item) => {
		const { _id, projectName, id, name, tasks } = item;
		return { _id, projectName, id: parseInt(id), name, tasks };
	});

	return JSON.stringify(transformedData);
}

const connectedUser = {
	connected: false,
	username: "Logout",
};

app.get("/", async (req, res) => {
	res.setHeader("Access-Control-Allow-Credentials","true");
	if (!req.session.initialised) {
		// Initialise our variables on the session object (that's persisted across requests by the same user
		req.session.initialised = true;
		req.session.connected = false;
		req.session.username = "";
		req.session.email = "";
		req.session.message = "";
		app.locals.projects = [];
		
	}
	if (req.session.connected == true) {
		req.session.message = "";
		app.locals.connected = true;
		app.locals.username = req.session.username;
		app.locals.email = req.session.email;
		let allProjects = getItems(req.session.email);
		allProjects.then(function (result) {
			let projectsJson = ConvertDBDataToJSON(result);
			app.locals.projects = projectsJson;
			res.render("landingPage.ejs");
		});
	} else {
		req.session.message = "";
		app.locals.connected = false;
		app.locals.projects = [];
		app.locals.email = "";
		res.render("landingPage.ejs");
	}
});

app.get("/signup", async (req, res) => {
	if (req.session.connected == true) {
		return res.redirect("/error");
	}
	app.locals.message = "";
	if (req.session.message != "") {
		app.locals.message = req.session.message;
	}
	app.locals.connected = false;
	res.render("signup.ejs");
});

app.get("/login", async (req, res) => {
	if (req.session.connected == true) {
		return res.redirect("/error");
	}
	app.locals.message = "";
	if (req.session.message != "") {
		app.locals.message = req.session.message;
	}
	app.locals.connected = false;
	res.render("login.ejs");
});

app.get("/logout", async (req, res) => {
	if (req.session.connected == true) {
		req.session.connected = false;
		req.session.username = "";
		req.session.password = "";
		req.session.email = "";
		app.locals.projects = [];
	}
	res.redirect("/");
});

app.get("/tutorial", async (req, res) => {
	if (req.session.connected == false) {
		return res.redirect("/error");
	}
	res.render("tutorial.ejs");
});

app.get("/gantt", async (req, res) => {
	if (req.session.connected == false) {
		return res.redirect("/error");
	}
	res.render("gantt.ejs");
});

app.get("/tasks", async (req, res) => {
	if (req.session.connected == false) {
		return res.redirect("/error");
	}
	app.locals.email = req.session.email;
	res.render("tasksPage.ejs");
});

app.get("/error", async (req, res) => {
	res.render("error.ejs");
});


app.post("/tasks/save", async (req, res) => {
	req.body.forEach((project) => {
		const query = { name: project.name };
		const update = {
			$set: {
				name: project.name,
				id: project.id,
				user: project.user,
				tasks: project.tasks,
			},
		};
		const options = { upsert: true };
		projectsCollection.updateOne(query, update, options);
	});

});

app.post("/tasks/deleteProject", async (req, res) => {
	const query = { name: req.body.name };
	console.log("req.body.name")
	console.log(req.body.name)
	console.log(req.body)
	Project.deleteOne({ name: req.body.name, user: req.body.user }).then(function () {
		console.log("Blog deleted"); // Success
	}).catch(function (error) {
		console.log(error); // Failure
	});
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});


