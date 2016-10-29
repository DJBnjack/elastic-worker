/*jshint esversion: 6 */

workflows = require('./listener/workflows');
task_executer = require('./executer/task_executer');
console.log("Worker started.");

get_and_execute = function() {
    workflows.get_next_task(execute_task);
};

execute_task = function(err, task) {
    if (err) {
        console.log("Error starting task: " + err);
        process.exit(1);
    }

    if (task === null) {
        console.log("No more tasks to execute, quitting.");
        process.exit();
    }

    console.log("Executing task:");
    console.dir(task);
    
    task_executer.execute_task(task, () => {
        workflows.flag_task_done(task, (error) => {
            if (error) {
                console.log("Error: " + error);
                process.exit(1);
            } else {
                console.log("Done!");
                process.exit(0);
            }
        });
    });
};

get_and_execute();