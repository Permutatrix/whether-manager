var fs = require('fs');
require('colors');

function compare(a, b, name, indent) {
  name = name || '';
  indent = indent || '';
  if(name) {
    console.log(indent + name.bold);
    indent = indent + '  ';
  }
  for(var key in a) {
    var av = a[key], bv = b[key];
    if(typeof av === 'object') {
      compare(av, bv, key, indent);
    } else {
      var diff = bv - av;
      var output = indent + key + ': ';
      if(diff >= 0) {
        output += '+';
      }
      output += Math.round((diff / av) * 100);
      output += '%';
      if(Math.abs(diff) >= av * 0.1) {
        if(diff < 0) {
          output = output.green;
        } else {
          output = output.red;
        }
      }
      console.log(output);
    }
  }
}

var oldBench = JSON.parse(fs.readFileSync(process.argv[2]));
var newBench = JSON.parse(fs.readFileSync(process.argv[3]));

compare(oldBench, newBench);
