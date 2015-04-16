var jsontocsv = require('../lib/jsontocsv')
var testutil = require('testutil')
var path = require('path')
var fs = require('fs')
var S = require('string')

/* global beforeEach, describe, it, F, T */
/* eslint-disable no-spaced-func */

var TEST_DIR = ''

function ARR_EQ (arr1, arr2) {
  T (arr1.length === arr2.length)
  for (var i = 0; i < arr1.length; ++i) {
    T (arr1[i] === arr2[i])
  }
}

describe('jsontocsv', function () {
  var OUTS = ''
  var OUT_FILE = ''

  beforeEach(function (done) {
    TEST_DIR = testutil.createTestDir('jsontocsv')
    OUT_FILE = path.join(TEST_DIR, 'output.csv')
    OUTS = fs.createWriteStream(OUT_FILE, {encoding: 'utf8'})
    done()
  })

  describe('> when no options', function () {
    it('should create output file with all fields', function (done) {
      jsontocsv(fs.createReadStream('./test/resources/data.txt'), OUTS, function (err) {
        F (err)
        var data = fs.readFileSync(OUT_FILE, 'utf8').trim().split('\n')
        T (data.length === 4)

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
      jsontocsv(fs.createReadStream('./test/resources/data.txt'), OUTS, {blacklist: ['url', 'state']}, function (err) {
        F (err)
        var data = fs.readFileSync(OUT_FILE, 'utf8').trim().split('\n')
        T (data.length === 4)

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
      jsontocsv(fs.createReadStream('./test/resources/data.txt'), OUTS, {header: false, blacklist: ['url', 'state']}, function (err) {
        F (err)
        var data = fs.readFileSync(OUT_FILE, 'utf8').trim().split('\n')
        T (data.length === 3)

        ARR_EQ (S(data[0]).parseCSV(), ['jp', 'richardson'])
        ARR_EQ (S(data[1]).parseCSV(), ['bill', 'gates'])
        ARR_EQ (S(data[2]).parseCSV(), ['michael', 'dell'])

        done()
      })
    })
  })

  describe('> when whitelist is an option', function () {
    it('should create output file with only whitelisted fields', function (done) {
      jsontocsv(fs.createReadStream('./test/resources/data.txt'), OUTS, {whitelist: ['first', 'last']}, function (err) {
        F (err)
        var data = fs.readFileSync(OUT_FILE, 'utf8').trim().split('\n')
        T (data.length === 4)

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
      jsontocsv(fs.createReadStream('./test/resources/data.txt'), OUTS, {header: false, whitelist: ['first', 'last']}, function (err) {
        F (err)
        var data = fs.readFileSync(OUT_FILE, 'utf8').trim().split('\n')
        T (data.length === 3)

        ARR_EQ (S(data[0]).parseCSV(), ['jp', 'richardson'])
        ARR_EQ (S(data[1]).parseCSV(), ['bill', 'gates'])
        ARR_EQ (S(data[2]).parseCSV(), ['michael', 'dell'])

        done()
      })
    })
  })
})
