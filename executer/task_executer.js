/*jshint esversion: 6 */

execute_wait_task = function(wait_time, callback) {
    console.log("Executing wait task, taking " + wait_time/1000 + " seconds.");
    setTimeout(callback, wait_time);
};

execute_task = function(task, callback) {
    task_info = task.task_id.split(":");
    
    if (task_info.length == 1) {
        // Default = wait task
        execute_wait_task(2000, callback);
    }
};

exports.execute_task = execute_task;