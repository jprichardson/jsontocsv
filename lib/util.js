function merge (obj1, obj2) {
  Object.keys(obj2).forEach(function (key) {
    if (!obj1[key]) obj1[key] = obj2[key]
  })

  return obj1
}

function toCSV (arr, separator) {
  var buf = ''
  for (var i = 0; i < arr.length; ++i) {
    if (i !== arr.length - 1) {
      buf += '"' + arr[i] + '"' + (separator || ',')
    } else {
      buf += '"' + arr[i] + '"'
    }
  }

  return buf
}

module.exports = {
  merge: merge,
  toCSV: toCSV
}
