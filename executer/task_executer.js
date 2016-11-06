/*jshint esversion: 6 */

var fs = require('fs');
var shortid = require('shortid');
var randomstring = require('randomstring');
var Client = require('node-rest-client').Client;
var client = new Client();

execute_wait_task = function(wait_time, callback) {
    console.log("Executing wait task, taking " + wait_time/1000 + " seconds.");
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
    primes = [];

    while(count<amount) {
        if( isPrime(i) ) {
            primes.push(i);
            count++;
        }
        i++;
    }

    callback();
};

execute_network_task = function(size, callback) {
    url = "http://ipv4.download.thinkbroadband.com/10MB.zip";
    if (size === "L") {
        url = "http://ipv4.download.thinkbroadband.com/100MB.zip";
    } else if (size === "M") {
        url = "http://ipv4.download.thinkbroadband.com/50MB.zip";
    }

    req = client.get(url, function (task, response) {
        callback();
    });

    req.on('error', function (err) {
        console.log("Error gettting " + url + ": " + err);
        callback();
    });
};

execute_io_task = function(size, callback) {
    filename = shortid.generate();
    wstream = fs.createWriteStream(filename);
    wstream.on('finish', function () {
        fs.unlink(filename, () => {
            callback();
        });
    });

    amount = 1000000;
    if (size === "L") {
        amount = 4000000;
    } else if (size === "M") {
        amount = 2000000;
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
    console.dir(task_info_string);

    if (task_info_string.length === 1) {
        // Test/default task
        execute_cpu_task("S", callback);
        
    } else if (task_info_string.length < 3) {
        // Not sure??
        console.log("Error: Not enough information on task: " + task.task_id);
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
            console.log("Error: Type unknown: " + task_info.type);
            callback("Type unknown: " + task_info.type);
        }
    }
};

exports.execute_task = execute_task;