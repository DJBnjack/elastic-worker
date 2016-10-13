var redis = require("redis"),
    client = redis.createClient();

get_next_workflow = function(cb) {
    client.rpoplpush(['workflows', 'workflows_backup'], cb);
};

flag_workflow_done = function(workflow, cb) {
    // Removes the last appearance of workflow from list
    client.lrem(['workflows_backup', -1, workflow], cb);
};

exports.get_next_workflow = get_next_workflow;
exports.flag_workflow_done = flag_workflow_done;