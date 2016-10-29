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
        url = "http://ipv6.download.thinkbroadband.com/50MB.zip";
    }

    req = client.get(url, function (task, response) {
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
    task_info = task.task_id.split(":");
    
    execute_io_task("S", callback);
};

exports.execute_task = execute_task;