#!/usr/bin/env nodejs

var reave = require('../lib/reave.js');

reave.medium(process.argv[2], function(page) {
  console.log(page);
});
