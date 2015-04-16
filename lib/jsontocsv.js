var byline = require('byline')
var path = require('path-extra')
var fs = require('fs')
var next = require('nextflow')
var util = require('./util')

function jsontocsv (ins, outs, options, callback) {
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  var whitelist = options.whitelist || null
  var blacklist = options.blacklist || null
  var lineCount = 0
  var header = true

  if (options.header !== null && typeof options.header !== 'undefined') {
    header = options.header
  }

  if (whitelist) { // only 1-pass necessary
    if (header) outs.write(util.toCSV(whitelist) + '\n')

    var lineStream = byline(ins)
    lineStream.on('data', function (data) {
      try {
        var obj = JSON.parse(data)
        var fields = []

        for (var i = 0; i < whitelist.length; ++i) {
          if (obj[whitelist[i]]) {
            fields.push(obj[whitelist[i]])
          } else {
            fields.push('')
          }
        }
        outs.write(util.toCSV(fields) + '\n')
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
    var tempDir = generateTempDir()
    var tempFile = path.join(tempDir, 'tempout')
    var keys = {}
    var flow = {}

    next(flow = {
      ERROR: function (err) {
        callback(err)
      },
      setup: function () {
        fs.mkdir(tempDir, flow.next)
      },
      extractHeaders: function () {
        var lineStream = byline(ins)
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
          if (blacklist) {
            blacklist.forEach(function (key) {
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
        if (header) outs.write(util.toCSV(keys) + '\n') // write header

        var tmpLineStream = byline(fs.createReadStream(tempFile))
        tmpLineStream.on('data', function (data) {
          var obj = JSON.parse(data),
            fields = []

          for (var i = 0; i < keys.length; ++i) {
            if (obj[keys[i]]) {
              fields.push(obj[keys[i]])
            } else {
              fields.push('')
            }
          }

          outs.write(util.toCSV(fields) + '\n')
        })
        tmpLineStream.on('end', function () {
          flow.next()
        })
      },
      cleanup: function () {
        setTimeout(function () { // purposely not using process.nextTick
          fs.unlink(tempFile, function () {
            fs.rmdir(tempDir, function () {
              callback(null)
            })
          })
        }, 25)
      }
    })
  }
}

module.exports = jsontocsv

/***********************
 * PRIVATE FUNCTIONS
 ***********************/

function generateTempDir () {
  return path.join(path.tempdir(), 'jsontocsv-' + Date.now())
}
