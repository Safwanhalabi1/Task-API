var taskObj = {
	// local storage key
	key: "projects",

	saveToDB: async function () {
		swal({
			title: "Are you sure?",
			text: "This cannot be undone.",
			icon: "info",
			buttons: true,
			// dangerMode: false,
		}).then(async (willSave) => {
			if (willSave) {
				try {
					const response = await fetch("/tasks/save", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(taskObj.getAllProjects()),
					});
					const result = await response.text();
					console.log(result);
				} catch (error) {
					console.error("Error sending data: ", error);
				}
			}
		});
	},

	// delete project
	deleteProject: function (self) {
		// check if any project is selected
		if (self.project.value == "") {
			swal("Please select a project to delete");
			return false;
		}

		// ask for confirmation
		swal({
			title: "Are you sure?",
			text: "Deleting the project will delete its tasks too.",
			icon: "warning",
			buttons: true,
			dangerMode: true,
		}).then((willDelete) => {
			if (willDelete) {
				// remove from array and update local storage
				var projects = taskObj.getAllProjects();
				for (var a = 0; a < projects.length; a++) {
					if (projects[a].id == self.project.value) {
						projects.splice(a, 1);
						localStorage.setItem(
							taskObj.key,
							JSON.stringify(projects)
						);

						// re-load data
						taskObj.loadAllProjects();
						taskObj.showAllTasks();

						break;
					}
				}
			} else {
				// reset project dropdown
				self.project.value = "";
			}
		});
		return false;
	},

	// add project
	addProject: function () {
		// check if project is selected
		if (document.getElementById("add-project").value == "") {
			swal("Please enter project name");
			return false;
		}

		// initialize local storage if not already initialized
		var option = "";
		if (localStorage.getItem(this.key) == null) {
			localStorage.setItem(this.key, "[]");
		}

		// get stored object from local storage
		var data = JSON.parse(localStorage.getItem(this.key));

		// check of project already exists
		for (var i = 0; i < data.length; i++) {
			if (data[i].name == document.getElementById("add-project").value) {
				swal("Project already exists!");
				return;
			}
		}
		// async function getEmail	() {
		// 	try {
		// 		const response = await fetch("/tasks/getEmail");
		// 		const data = await response.json();
		// 		return data.email; // Assign the value to the email variable
		// 	} catch (error) {
		// 		console.error("Error:", error);
		// 	}
		// };
		// result = getEmail();

		var project = {
			id: data.length,
			name: document.getElementById("add-project").value,
			user: "<%= email %>",
			tasks: [],
		};

		console.log(project.user);

		// push new project in local storage
		data.push(project);
		localStorage.setItem(this.key, JSON.stringify(data));

		// re-load all projects
		this.loadAllProjects();

		// re-load all tasks here
		this.showAllTasks();
	},

	// load all projects in dropdown
	loadAllProjects: function () {
		var projects = taskObj.getAllProjects();
		projects = projects.reverse();
		var html = "<option value=''>Select Project</option>";
		for (var a = 0; a < projects.length; a++) {
			html +=
				"<option value='" +
				projects[a].id +
				"'>" +
				projects[a].name +
				"</option>";
		}
		document.getElementById("add-task-project").innerHTML = html;
		document.getElementById(
			"form-task-hour-calculator-all-projects"
		).innerHTML = html;
	},

	// get all stored projects
	getAllProjects: function () {
		if (localStorage.getItem(this.key) == null) {
			localStorage.setItem(this.key, "[]");
		}
		return JSON.parse(localStorage.getItem(this.key));
	},

	//add New Task
	addTask: function (form) {
		// get selected project and entered task
		var project = form.project.value;
		var task = form.task.value;
		var taskStartedDate = form.startDate.value;

		//getting the current date
		var currentDate = this.getCurrentTimeInTaskStartEndFormat();

		// add task in project's array
		var projects = this.getAllProjects();

		//making a date types to compare between them
		var taskDate = new Date(taskStartedDate);
		var currentDate = new Date(currentDate);

		var status = "Progress";

		if (currentDate < taskDate) {
			swal({
				title: "Assigning a late task!",
				text: "The task cannot be in progress, when the date comes it will be in progress automatically",
				icon: "warning",
				buttons: {
					ok: "OK",
				},
				dangerMode: false,
			});
			status = "Not yet";
		}

		for (var a = 0; a < projects.length; a++) {
			if (projects[a].id == project) {
				var taskObj = {
					id: projects[a].tasks.length,
					name: task,
					status: status, // not started, in progress, completed
					isStarted: true,
					logs: [],
					started: taskStartedDate,
					ended: "",
				};
				projects[a].tasks.push(taskObj);
				break;
			}
		}

		// update local storage
		localStorage.setItem(this.key, JSON.stringify(projects));

		// hide modal
		jQuery("#addTaskModal").modal("hide");
		jQuery(".modal-backdrop").remove();

		// re-load all tasks
		this.showAllTasks();

		// prevent form from submitting
		return false;
	},

	editTask: function (form) {
		var projectName = form.project.value;
		var oldTaskName = form.oldTaskName.value;
		var newTaskName = form.task.value;
		var newTaskStartDate = form.startDate.value;

		var projects = this.getAllProjects();
		for (var a = 0; a < projects.length; a++) {
			if (projects[a].name == projectName) {
				projects[a].tasks.forEach((task) => {
					if (task.name == oldTaskName) {
						task.name = newTaskName;
						task.started = newTaskStartDate;
						//getting the current date
						var currentDate =
							this.getCurrentTimeInTaskStartEndFormat();
						//making a date types to compare between them
						var newTaskDate = new Date(newTaskStartDate);
						var currentDate = new Date(currentDate);
						var status = "Progress";

						if (currentDate < newTaskDate) {
							status = "Not yet";
							swal({
								title: "Assigning a late task!",
								text: "The task cannot be in progress, when the date comes it will be in progress automatically",
								icon: "warning",
								buttons: false,
								dangerMode: true,
							});
						}
						task.status = status;
					}
				});
				break;
			}
		}

		// update local storage
		localStorage.setItem(this.key, JSON.stringify(projects));

		// hide modal
		jQuery("#editTaskModal").modal("hide");
		jQuery(".modal-backdrop").remove();

		// re-load all tasks
		this.showAllTasks();

		// prevent form from submitting
		return false;
	},

	// get current datetime in proper format (e.g. 2021-06-15 20:53:15)
	getCurrentTimeInTaskStartEndFormat() {
		let current_datetime = new Date();
		var date = current_datetime.getDate();
		date = date < 10 ? "0" + date : date;
		var month = current_datetime.getMonth() + 1;
		month = month < 10 ? "0" + month : month;

		let formatted_date =
			current_datetime.getFullYear() + "-" + month + "-" + date;
		return formatted_date;
	},

	// show all tasks in table
	showAllTasks: function () {
		// Set the default value to the input field
		document.getElementById("taskNameAdd").value = "";

		// Get the current date
		var currentDate = taskObj.getCurrentTimeInTaskStartEndFormat();
		// Set the default value to the input field
		document.getElementById("datePickerStartDateAdd").value = currentDate;

		var taskDate = "";
		var currentDate = new Date(currentDate);

		// get all projects
		var projects = this.getAllProjects();

		for (var a = 0; a < projects.length; a++) {
			projects[a].tasks.forEach((task) => {
				taskDate = new Date(task.started);
				if (task.status == "Not yet" && taskDate <= currentDate) {
					task.status = "Progress";
				}
			});
		}

		var html = "";

		//highlighting the relevant dates in the calendar
		highlightInCalendar(projects);

		const selectedProject = document.getElementById(
			"form-task-hour-calculator-all-projects"
		).selectedOptions[0].text;
		var wantedProjects = projects; // display all the projects by default
		if (selectedProject != "Select Project") {
			wantedProjects = [];
			for (var a = 0; a < projects.length; a++) {
				if (projects[a].name == selectedProject) {
					wantedProjects.push(projects[a]);
					break;
				}
			}
		}

		// loop through all projects
		for (var a = 0; a < wantedProjects.length; a++) {
			//sort the tasks array based on their status
			wantedProjects[a].tasks.sort(compareStatus);

			for (var b = 0; b < wantedProjects[a].tasks.length; b++) {
				currentTask = wantedProjects[a].tasks[b];

				if (searchInput.value.toLowerCase()) {
					if (
						currentTask.name
							.toLowerCase()
							.indexOf(searchInput.value.toLowerCase()) === -1
					) {
						continue; // Skip this task if it doesn't match the search query
					}
				}
				if (currentTask.started != datePicker.value) {
					if (datePicker.value != "") {
						continue; // Skip this task if it doesn't match the search query
					}
				}
				html += "<tr>";
				var projectName = wantedProjects[a].name;
				var oldTaskName = currentTask.name;
				var oldTaskDate = currentTask.started;
				html +=
					"<td><a href='#' onclick='showModal(\"" +
					projectName +
					'", "' +
					oldTaskName +
					'", "' +
					oldTaskDate +
					"\")'>" +
					wantedProjects[a].tasks[b].name +
					"</a></td>";
				html += "<td>" + projectName + "</td>";
				if (currentTask.status == "Progress") {
					html +=
						"<td><label class='started'>In progress</label></td>";
				} else if (currentTask.status == "Not yet") {
					html +=
						"<td><label class='stoped'>" +
						currentTask.status +
						"</label></td>";
				} else {
					html +=
						"<td><label class='completed'>" +
						currentTask.status +
						"</label></td>";
				}

				// get total duration of each task using it's logs
				var duration = 0;
				for (var c = 0; c < currentTask.logs.length; c++) {
					var log = currentTask.logs[c];
					if (log.endTime > 0) {
						duration += log.endTime - log.startTime;
					}
				}

				// show timer if task is already started
				if (currentTask.isStarted) {
					var dataStartedObj = {
						duration: duration,
						project: wantedProjects[a].id,
						task: currentTask.id,
					};
					// html += "<td data-started='" + JSON.stringify(dataStartedObj) + "'>" + hours + ":" + minutes + ":" + seconds + "</td>";
				} else {
					//html += "<td>" + hours + ":" + minutes + ":" + seconds + "</td>";
				}

				// show task duration if completed
				if (currentTask.status == "Completed") {
					html +=
						"<td>" +
						currentTask.started +
						"<br><span style='margin-left: 30px;'>to</span><br>" +
						currentTask.ended +
						"</td>";
				} else {
					html += "<td>" + currentTask.started + "</td>";
				}

				// form to change task status
				html += "<td>";
				html +=
					"<form method='POST' id='form-change-task-status-" +
					wantedProjects[a].id +
					currentTask.id +
					"'>";
				html +=
					"<input type='hidden' name='project' value='" +
					wantedProjects[a].id +
					"'>";
				html +=
					"<input type='hidden' name='task' value='" +
					currentTask.id +
					"'>";
				html +=
					"<select class='form-control' name='status' style='width: 45%;' onchange='taskObj.changeTaskStatus(this);' data-form-id='form-change-task-status-" +
					wantedProjects[a].id +
					wantedProjects[a].tasks[b].id +
					"'>";
				html += "<option value=''>Change status</option>";
				if (currentTask.status == "Progress") {
					html +=
						"<option value='complete'>Mark as Completed</option>";
				} else if (currentTask.status == "Completed") {
					html +=
						"<option value='progress'>Make in Progress</option>";
				}
				html += "<option value='delete'>Delete</option>";
				html += "</select>";
				html += "</form>";
				html += "</td>";
				html += "</tr>";
			}
		}
		document.getElementById("all-tasks").innerHTML = html;
	},

	// change task status
	changeTaskStatus: function (self) {
		// if task is not selected
		if (self.value == "") {
			return;
		}

		// loop through all projects
		var formId = self.getAttribute("data-form-id");
		var form = document.getElementById(formId);
		var projects = this.getAllProjects();
		for (var a = 0; a < projects.length; a++) {
			// if project matches
			if (projects[a].id == form.project.value) {
				// loop through all tasks of that project
				for (var b = 0; b < projects[a].tasks.length; b++) {
					(function (b) {
						// if task matches
						if (projects[a].tasks[b].id == form.task.value) {
							// if the status is set to delete
							if (self.value == "delete") {
								// ask for confirmation
								swal({
									title: "Are you sure?",
									text: "",
									icon: "warning",
									buttons: true,
									dangerMode: true,
								}).then((willDelete) => {
									if (willDelete) {
										// remove task from array
										projects[a].tasks.splice(b, 1);
										// update local storage
										localStorage.setItem(
											taskObj.key,
											JSON.stringify(projects)
										);

										// re-load all tasks
										taskObj.showAllTasks();
									} else {
										// reset dropdown
										self.value = "";
									}
								});
							} else if (self.value == "complete") {
								// mark as completed
								projects[a].tasks[b].status = "Completed";

								// stop the timer
								projects[a].tasks[b].isStarted = false;

								// log end time
								projects[a].tasks[b].ended =
									taskObj.getCurrentTimeInTaskStartEndFormat();
								for (
									var c = 0;
									c < projects[a].tasks[b].logs.length;
									c++
								) {
									if (
										projects[a].tasks[b].logs[c].endTime ==
										0
									) {
										projects[a].tasks[b].logs[c].endTime =
											new Date().getTime();
										break;
									}
								}
							} else if (self.value == "progress") {
								// mark as in progress
								projects[a].tasks[b].status = "Progress";

								// stop the timer
								projects[a].tasks[b].isStarted = true;
							}
						}
					})(b);
				}
				break;
			}
		}

		localStorage.setItem(this.key, JSON.stringify(projects));
		this.showAllTasks();
	},
};

// Custom comparison function based on status priority
function compareStatus(taskA, taskB) {
	var statusPriority = {
		Progress: 1,
		"Not yet": 2,
		Completed: 3,
	};

	var priorityA = statusPriority[taskA.status];
	var priorityB = statusPriority[taskB.status];

	if (priorityA < priorityB) {
		return -1;
	} else if (priorityA > priorityB) {
		return 1;
	} else {
		// If the status priorities are the same, compare the dates
		var dateA = new Date(taskA.started);
		var dateB = new Date(taskB.started);

		if (dateA < dateB) {
			return -1;
		} else if (dateA > dateB) {
			return 1;
		} else {
			return 0;
		}
	}
}

function showModal(projectName, oldTaskName, oldTaskDate) {
	// Use the modal's id to show it
	jQuery("#editTaskModal").modal("show");

	// Get the input element
	var taskEditingProjectName = document.getElementById("taskEditingProject");
	// Change the value
	taskEditingProjectName.value = projectName;

	var taskEditingTaskName = document.getElementById("newTaskName");
	// Change the value
	taskEditingTaskName.value = oldTaskName;

	// Get the input element
	var oldTaskDateID = document.getElementById("datePickerStartDateEdit");
	// Change the value
	oldTaskDateID.value = oldTaskDate;

	// Get the input element
	var oldTaskNameID = document.getElementById("oldTaskName");
	// Change the value
	oldTaskNameID.value = oldTaskName;
	// Hide the input element
	oldTaskNameID.style.display = "none";
}

function highlightInCalendar(projects) {
	var highlightedDates = [];
	for (var a = 0; a < projects.length; a++) {
		projects[a].tasks.forEach((task) => {
			highlightedDates.push(task.started);
		});
	}

	// Example dates to highlight (replace with your own logic to determine the dates)
	//var highlightedDates = ["2023-06-21", "2023-06-25", "2023-06-30"];

	flatpickr("#datePicker", {
		dateFormat: "Y-m-d",
		enable: highlightedDates,
	});
}

flatpickr("#datePickerStartDateEdit", {
	dateFormat: "Y-m-d",
});
flatpickr("#datePickerStartDateAdd", {
	dateFormat: "Y-m-d",
});

// Disable the input element using JavaScript
document.getElementById("taskEditingProject").disabled = true;

var selectedProject = document.getElementById(
	"form-task-hour-calculator-all-projects"
);
var searchInput = document.getElementById("searchInput");
var datePicker = document.getElementById("datePicker");

// Add an event listener for the 'input' event
selectedProject.addEventListener("input", function () {
	taskObj.showAllTasks();
});
// Add an event listener for the 'input' event
searchInput.addEventListener("input", function () {
	taskObj.showAllTasks();
});

datePicker.addEventListener("input", function () {
	taskObj.showAllTasks();
});

// when page loads
window.addEventListener("load", function () {
	// show all projects and tasks
	taskObj.loadAllProjects();

	// show all tasks here
	taskObj.showAllTasks();
});
