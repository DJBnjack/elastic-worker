/*jshint esversion: 6 */

workflows = require('./listener/workflows');
task_executer = require('./executer/task_executer');
console.log("Worker started.");

get_and_execute = function() {
    workflows.get_next_task((err, task) => execute_task(err, task, get_and_execute));
};

execute_task = function(err, task, callback) {
    if (err) {
        console.log("Error starting task: " + err + ", waiting for 15 seconds.");
        setTimeout(callback, 15 * 1000);

    } else if (task === null) {

        console.log("No tasks to execute now, waiting for 15 seconds.");
        setTimeout(callback, 15 * 1000);

    } else {

        console.log("Executing task:");
        console.dir(task);
        
        task_executer.execute_task(task, (execute_error) => {
            if (execute_error) {
                console.log("Error: " + execute_error + ", waiting for 15 seconds.");
                setTimeout(callback, 15 * 1000);
            } else {
                workflows.flag_task_done(task, (error) => {
                    if (error) {
                        console.log("Error: " + error + ", waiting for 15 seconds.");
                        setTimeout(callback, 15 * 1000);
                    } else {
                        console.log("Done!");
                        callback();
                    }
                });
            }
        });
    }
};

get_and_execute();