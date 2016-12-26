/*jshint esversion: 6 */

var fs = require('fs');
var shortid = require('shortid');
var randomstring = require('randomstring');
var Client = require('node-rest-client').Client;
var client = new Client();

execute_wait_task = function(wait_time, callback) {
    setTimeout(callback, wait_time);
};

isPrime = function(n) {
    if ( n%1 || n<2 ) return false;

    q = Math.sqrt(n);

    for (var i = 2; i <= q; i++) {
        if (n % i === 0) {
            return false;
        }
    }

    return true;
};

execute_cpu_task = function(size, callback) {
    amount = 400000;
    if (size === "L") {
        amount = 1600000;
    } else if (size === "M") {
        amount = 800000;
    }

    count = 0;
    i = 2;
    //primes = [];

    while(count<amount) {
        if( isPrime(i) ) {
            //primes.push(i);
            count++;
        }
        i++;
    }

    callback();
};

execute_network_task = function(size, callback) {
    url = "https://elasticrandom.blob.core.windows.net/filehost/100MB.zip";
    reps = 1;
    if (size == "M") {
        reps = 2;
    } else if (size == "L") {
        reps = 5;
    }

    var download = function() {
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

execute_io_task = function(size, callback) {
    filename = shortid.generate();
    wstream = fs.createWriteStream(filename);
    wstream.on('finish', function () {
//        fs.unlink(filename, () => {
            callback();
//        });
    });

    amount = 100000;
    if (size === "L") {
        amount = 400000;
    } else if (size === "M") {
        amount = 200000;
    }

    count = 0;
    while(count<amount) {
        wstream.write(randomstring.generate() + '\n');
        count++;
    }

    wstream.end();
};

execute_task = function(task, callback) {
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
        
        if (task_info.type === "CC") {
            execute_cpu_task(task_info.difficulty, callback);
        } else if (task_info.type === "CN") {
            execute_network_task(task_info.difficulty, callback);
        } else if (task_info.type === "CI") {
            execute_io_task(task_info.difficulty, callback);
        } else {
            callback("Type unknown: " + task_info.type);
        }
    }
};

exports.execute_task = execute_task;