workflows = require('./listener/workflows');
console.log("Worker started.");

get_and_execute = function() {
    workflows.get_next_workflow(execute_workflow);
};

execute_workflow = function(err, data) {
    if (err) {
        console.dir(err);
        process.exit(1);
    }

    if (data === null) {
        console.log("No more workflows to execute, quitting.");
        process.exit();
    }

    console.log("Executing workflow for " + data);
    
    /* TODO: get actual WF and exectute ;-) */


    workflows.flag_workflow_done(data, get_and_execute());
};

get_and_execute();