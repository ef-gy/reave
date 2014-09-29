#!/usr/bin/env nodejs

var reave = require('../lib/reave.js');

reave[process.argv[2]](process.argv[3], console.log);
