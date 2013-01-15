Node.js - jsontocsv
================

Convert lines of JSON data to CSV.


Why?
----

It's very convenient to write Node.js scripts that dump out a serialized object to a line. Most text processing utilities though cannot handle data like this. However, many can handle CSV files.



Installation
------------

    npm install jsontocsv



Programmatically
------

```javascript
var jsontocsv = require('jsontocsv')

jsontocsv(inputStream, outputStream, {header: false, whitelist: whitelistFields}, function (err) {
  if (!err) console.log('Success.')
});
```



Command Line
------------

      Usage: jsontocsv [options]

      Options:

        -h, --help                 output usage information
        -V, --version              output the version number
        -b, --blacklist [fields]   Prevent blacklisted fields from output, otherwise all will be used.
        -w, --whitelist [fields]   Only allow whitelisted fields in output, otherwise all will be used.
        -i, --input [file]         Input file. Otherwise STDIN.
        -o, --output [file]        Output file. Otherwise STDOUT.
        -h, --header [true/false]  If set to the true, the CSV header will be output. Defaults to true.



License
-------

(MIT License)

Copyright 2013, JP Richardson  <jprichardson@gmail.com>


