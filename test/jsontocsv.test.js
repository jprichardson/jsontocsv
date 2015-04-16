var jsontocsv = require('../lib/jsontocsv')
var path = require('path')
var os = require('os')
var fs = require('fs-extra')
var S = require('string')
require('terst')

/* global beforeEach, describe, it, EQ, F */
/* eslint-disable no-spaced-func */

function ARR_EQ (arr1, arr2) {
  EQ (arr1.length, arr2.length)
  for (var i = 0; i < arr1.length; ++i) {
    EQ (arr1[i], arr2[i])
  }
}

describe('jsontocsv', function () {
  var TEST_DIR, IN_STREAM, OUT_STREAM, OUT_FILE

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'jsontocsv')
    fs.emptyDirSync(TEST_DIR)

    OUT_FILE = path.join(TEST_DIR, 'output.csv')
    OUT_STREAM = fs.createWriteStream(OUT_FILE, {encoding: 'utf8'})
    IN_STREAM = fs.createReadStream('./test/fixtures/data.txt')
    done()
  })

  describe('> when no options', function () {
    it('should create output file with all fields', function (done) {
      jsontocsv(IN_STREAM, OUT_STREAM, function (err) {
        F (err)
        var data = fs.readFileSync(OUT_FILE, 'utf8').trim().split('\n')
        EQ (data.length, 4)

        ARR_EQ (S(data[0]).parseCSV(), ['url', 'first', 'last', 'state'])
        ARR_EQ (S(data[1]).parseCSV(), ['http://google.com', 'jp', 'richardson', ''])
        ARR_EQ (S(data[2]).parseCSV(), ['http://bing.com', 'bill', 'gates', 'washington'])
        ARR_EQ (S(data[3]).parseCSV(), ['', 'michael', 'dell', ''])

        done()
      })
    })
  })

  describe('> when blacklist is an option', function () {
    it('should create output file without blacklisted fields', function (done) {
      var opts = {
        blacklist: ['url', 'state']
      }

      jsontocsv(IN_STREAM, OUT_STREAM, opts, function (err) {
        F (err)
        var data = fs.readFileSync(OUT_FILE, 'utf8').trim().split('\n')
        EQ (data.length, 4)

        ARR_EQ (S(data[0]).parseCSV(), ['first', 'last'])
        ARR_EQ (S(data[1]).parseCSV(), ['jp', 'richardson'])
        ARR_EQ (S(data[2]).parseCSV(), ['bill', 'gates'])
        ARR_EQ (S(data[3]).parseCSV(), ['michael', 'dell'])

        done()
      })
    })
  })

  describe('> when blacklist is an option and header is false', function () {
    it('should create output file without blacklisted fields without the header', function (done) {
      var opts = {
        header: false,
        blacklist: ['url', 'state']
      }

      jsontocsv(IN_STREAM, OUT_STREAM, opts, function (err) {
        F (err)
        var data = fs.readFileSync(OUT_FILE, 'utf8').trim().split('\n')
        EQ (data.length, 3)

        ARR_EQ (S(data[0]).parseCSV(), ['jp', 'richardson'])
        ARR_EQ (S(data[1]).parseCSV(), ['bill', 'gates'])
        ARR_EQ (S(data[2]).parseCSV(), ['michael', 'dell'])

        done()
      })
    })
  })

  describe('> when whitelist is an option', function () {
    it('should create output file with only whitelisted fields', function (done) {
      var opts = {
        whitelist: ['first', 'last']
      }

      jsontocsv(IN_STREAM, OUT_STREAM, opts, function (err) {
        F (err)
        var data = fs.readFileSync(OUT_FILE, 'utf8').trim().split('\n')
        EQ (data.length, 4)

        ARR_EQ (S(data[0]).parseCSV(), ['first', 'last'])
        ARR_EQ (S(data[1]).parseCSV(), ['jp', 'richardson'])
        ARR_EQ (S(data[2]).parseCSV(), ['bill', 'gates'])
        ARR_EQ (S(data[3]).parseCSV(), ['michael', 'dell'])

        done()
      })
    })
  })

  describe('> when whitelist and header is false', function () {
    it('should create output file with only whitelisted fields and no header', function (done) {
      var opts = {
        header: false,
        whitelist: ['first', 'last']
      }

      jsontocsv(IN_STREAM, OUT_STREAM, opts, function (err) {
        F (err)
        var data = fs.readFileSync(OUT_FILE, 'utf8').trim().split('\n')
        EQ (data.length, 3)

        ARR_EQ (S(data[0]).parseCSV(), ['jp', 'richardson'])
        ARR_EQ (S(data[1]).parseCSV(), ['bill', 'gates'])
        ARR_EQ (S(data[2]).parseCSV(), ['michael', 'dell'])

        done()
      })
    })
  })
})
