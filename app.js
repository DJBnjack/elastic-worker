/*jshint esversion: 6 */

workflows = require('./listener/workflows');
task_executer = require('./executer/task_executer');
console.log("worker:ready Worker started.");
var Random = require("random-js");
var random = new Random(Random.engines.mt19937().autoSeed());
const minWait = 5000; // 5 sec
const maxWait = 60000; // 60 sec

get_and_execute = function() {
    var wait = random.integer(minWait, maxWait);
    console.log("worker:wait Waiting for " + wait + " milliseconds.");

    setTimeout(() => {
        workflows.get_next_task((err, task) => execute_task(err, task, get_and_execute));
    }, wait);
};

var hand_in_results = function(task, callback) {
    workflows.flag_task_done(task, (error) => {
        if (error && error === "hangup") {
            console.log("worker:error " + error + " while handing in results, retry in 5 second");
            setTimeout(() => {hand_in_results(task, callback);}, 5000); // retry after 5 sec
        } else if (error) {
            console.log("worker:error " + error + " while handing in results.");
            callback();
        } else {
            console.log("worker:done Finished with task " + task.task_id + " for workflow " + task.workflow_id);
            callback();
        }
    });
};


execute_task = function(err, task, callback) {
    if (err) {

        console.log("worker:error " + err);
        hand_in_results(task, callback);

    } else if (task === null) {

        console.log("worker:idle No tasks to execute now.");
        callback();

    } else {

        console.log("worker:start Executing task " + task.task_id + " for workflow " + task.workflow_id);
        task_executer.execute_task(task, (execute_error) => {
            if (execute_error) {
                console.log("worker:error " + execute_error + " while executing.");
                hand_in_results(task, callback);
            } else {
                hand_in_results(task, callback);
            }
        });

    }
};

get_and_execute();