var assert = require('assert')
var byline = require('byline')
var fs = require('fs')
var os = require('os')
var path = require('path')
var next = require('nextflow')
var util = require('./util')

function jsontocsv (inStream, outStream, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }

  if (opts.whitelist) assert(Array.isArray(opts.whitelist))
  if (opts.blacklist) assert(Array.isArray(opts.blacklist))

  var lineCount = 0

  // default to print out header
  var header = typeof opts.header === 'boolean' ? opts.header : true

  if (opts.whitelist) { // only 1-pass necessary
    if (header) {
      outStream.write(util.toCSV(opts.whitelist, opts.separator) + '\n')
    }

    var lineStream = byline(inStream)
    lineStream.on('data', function (data) {
      try {
        var obj = JSON.parse(data)
        var fields = []

        for (var i = 0; i < opts.whitelist.length; ++i) {
          if (opts.whitelist[i] in obj) {
            fields.push(obj[opts.whitelist[i]])
          } else {
            fields.push('')
          }
        }
        outStream.write(util.toCSV(fields, opts.separator) + '\n')
      } catch (err) {
        console.error('Parsing error on line (%d): %s', lineCount, err)
      }
    })
    lineStream.on('end', function () {
      setTimeout(function () { // purposely not using process.nextTick... this is slower
        callback(null)
      }, 25)
    })
    lineStream.resume()
  } else { // must do 2-pass
    var tempFile = path.join(os.tmpdir(), 'jsontocsv-' + Date.now())
    var keys = {}
    var flow = {}

    next(flow = {
      ERROR: function (err) {
        callback(err)
      },
      extractHeaders: function () {
        var lineStream = byline(inStream)
        var tmpOut = fs.createWriteStream(tempFile)

        lineStream.on('data', function (data) {
          lineCount += 1

          try {
            var obj = JSON.parse(data)
            keys = util.merge(keys, obj)
            tmpOut.write(data + '\n')
          } catch (err) {
            console.error('Parsing error on line (%d): %s', lineCount, err)
          }
        })
        lineStream.on('end', function () {
          if (opts.blacklist) {
            opts.blacklist.forEach(function (key) {
              if (keys[key]) delete keys[key]
            })
          }
          keys = Object.keys(keys) // convert object to array
          tmpOut.end(function () {
            setTimeout(function () {
              flow.next()
            }, 25) // breath
          })
        })
        lineStream.resume()
      },
      outputCsv: function () {
        if (header) outStream.write(util.toCSV(keys, opts.separator) + '\n') // write header

        var tmpLineStream = byline(fs.createReadStream(tempFile))
        tmpLineStream.on('data', function (data) {
          var obj = JSON.parse(data),
            fields = []

          for (var i = 0; i < keys.length; ++i) {
            if (keys[i] in obj) {
              fields.push(obj[keys[i]])
            } else {
              fields.push('')
            }
          }

          outStream.write(util.toCSV(fields, opts.separator) + '\n')
        })
        tmpLineStream.on('end', function () {
          flow.next()
        })
      },
      cleanup: function () {
        setTimeout(function () { // purposely not using process.nextTick
          fs.unlink(tempFile, callback)
        }, 25)
      }
    })
  }
}

module.exports = jsontocsv
