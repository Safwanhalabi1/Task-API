
class Task {
    taskTitle;
    taskStatus;
    startDate;
    constructor(taskTitle, taskStatus, startDate) {
        this.taskTitle = taskTitle;
        this.taskStatus = taskStatus;
        this.startDate = startDate;
    }
}

module.exports = Task;