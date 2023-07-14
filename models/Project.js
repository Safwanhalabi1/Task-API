const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectsSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		id: {
			type: String,
		},
		user: {
			type: String,
		},
		tasks: {
			type: String,
		},
	},
	{ timestamps: false }
);

const Projects = mongoose.model("projects", ProjectsSchema);
module.exports = Projects;
