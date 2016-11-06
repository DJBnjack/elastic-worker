/*jshint esversion: 6 */

workflows = require('./listener/workflows');
task_executer = require('./executer/task_executer');
console.log("=ready= Worker started.");

get_and_execute = function() {
    workflows.get_next_task((err, task) => execute_task(err, task, get_and_execute));
};

execute_task = function(err, task, callback) {
    if (err) {
        console.log("=error= " + err + ", waiting for 15 seconds.");
        setTimeout(callback, 15 * 1000);

    } else if (task === null) {

        console.log("=idle= No tasks to execute now, waiting for 15 seconds.");
        setTimeout(callback, 15 * 1000);

    } else {

        console.log("=start= Executing task " + task.task_id + " for workflow " + task.workflow_id);
        
        task_executer.execute_task(task, (execute_error) => {
            if (execute_error) {
                console.log("=error= " + execute_error + ", waiting for 15 seconds.");
                setTimeout(callback, 15 * 1000);
            } else {
                workflows.flag_task_done(task, (error) => {
                    if (error) {
                        console.log("=error= " + error + ", waiting for 15 seconds.");
                        setTimeout(callback, 15 * 1000);
                    } else {
                        console.log("=finish= Done with task " + task.task_id + " for workflow " + task.workflow_id);
                        callback();
                    }
                });
            }
        });
    }
};

get_and_execute();