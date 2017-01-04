/*jshint esversion: 6 */

workflows = require('./listener/workflows');
task_executer = require('./executer/task_executer');
console.log("worker:ready Worker started.");

get_and_execute = function() {
    workflows.get_next_task((err, task) => execute_task(err, task, get_and_execute));
};

var hand_in_results = function(task, callback) {
    workflows.flag_task_done(task, (error) => {
        if (error) {
            console.log("worker:error " + error + " while handing in results.");
            setTimeout(() => {hand_in_results(task, callback);}, 1000); // retry after 1 sec
        } else {
            console.log("worker:done Finished with task " + task.task_id + " for workflow " + task.workflow_id);
            callback();
        }
    });
};

execute_task = function(err, task, callback) {
    if (err) {
        console.log("worker:error " + err + ", waiting for 15 seconds.");
        setTimeout(callback, 15 * 1000);

    } else if (task === null) {

        console.log("worker:idle No tasks to execute now, waiting for 15 seconds.");
        setTimeout(callback, 15 * 1000);

    } else {

        console.log("worker:start Executing task " + task.task_id + " for workflow " + task.workflow_id);
        
        task_executer.execute_task(task, (execute_error) => {
            if (execute_error) {
                console.log("worker:error " + execute_error + " while executing, waiting for 15 seconds.");
                setTimeout(callback, 15 * 1000);
            } else {
                hand_in_results(task, callback);
            }
        });
    }
};

get_and_execute();