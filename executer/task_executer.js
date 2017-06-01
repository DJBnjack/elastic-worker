/*jshint esversion: 6 */

var fs = require('fs');
var shortid = require('shortid');
var randomstring = require('randomstring');
var Client = require('node-rest-client').Client;
var client = new Client();

execute_wait_task = function (wait_time, callback) {
    setTimeout(callback, wait_time);
};

isPrime = function (n) {
    if (n < 2 || n != Math.round(n)) return false;

    q = Math.sqrt(n);

    for (var i = 2; i <= q; i++) {
        if (n % i === 0) {
            return false;
        }
    }

    return true;
};

execute_cpu_task = function (size, callback) {
    var amount = 200000;
    var reps = 1;
    if (size === "L") {
        reps = 4;
    } else if (size === "M") {
        reps = 2;
    }

    for (var times = 0; times < reps; times++) {
        var count = 0;
        var i = 2;
        while (count < amount) {
            if (isPrime(i)) {
                count++;
            }
            i++;
        }
    }

    callback();
};

execute_network_task = function (size, callback) {
    var url = "https://elasticrandom.blob.core.windows.net/filehost/100MB.zip";
    var reps = 1;
    if (size == "M") {
        reps = 2;
    } else if (size == "L") {
        reps = 4;
    }

    var download = function () {
        req = client.get(url, function (task, response) {
            reps = reps - 1;
            if (reps <= 0) {
                callback();
            } else {
                download();
            }
        });

        req.on('error', function (err) {
            callback("Error gettting " + url + ": " + err);
        });
    };

    download();
};

write_to_disk = function (callback) {
    var filename = shortid.generate();
    var wstream = fs.createWriteStream(filename);
    var i = 50000;
    write();
    function write() {
        var ok = true;
        do {
            i--;
            if (i === 0) {
                // last time!
                writer.write(randomstring.generate() + '\n', 'utf8', callback);
            } else {
                // see if we should continue, or wait
                // don't pass the callback, because we're not done yet.
                ok = writer.write(randomstring.generate() + '\n', 'utf8');
            }
        } while (i > 0 && ok);
        if (i > 0) {
            // had to stop early!
            // write some more once it drains
            writer.once('drain', write);
        }
    }
}

execute_io_task = function (size, callback) {
    if (size === "M") {
        write_to_disk(() => {
            write_to_disk(callback);
        });
    } else if (size === "L") {
        write_to_disk(() => {
            write_to_disk(() => {
                write_to_disk(() => {
                    write_to_disk(callback);
                });
            });
        });
    } else {
        // size === "S"
        write_to_disk(callback);
    }
};

execute_task = function (task, callback) {
    task_info_string = task.task_id.split(":");

    if (task_info_string.length === 1) {
        // Test/default task
        execute_cpu_task("S", callback);

    } else if (task_info_string.length < 3) {
        // Not sure??
        callback("Not enough information on task: " + task.task_id);

    } else if (task_info_string.length === 3) {
        // True task

        task_info = {
            id: task_info_string[0],
            type: task_info_string[1],
            difficulty: task_info_string[2]
        };

        try {
            if (task_info.type === "CC") {
                execute_cpu_task(task_info.difficulty, callback);
            } else if (task_info.type === "CN") {
                execute_network_task(task_info.difficulty, callback);
            } else if (task_info.type === "CI") {
                execute_io_task(task_info.difficulty, callback);
            } else {
                callback("Type unknown: " + task_info.type);
            }
        } catch (e) {
            callback("worker:error " + err);
        }
    }
};

exports.execute_task = execute_task;