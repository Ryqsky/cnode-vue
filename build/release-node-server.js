"use strict"
var path = require('path')
var express = require('express')
var config = require('../config')
var port = process.env.PORT || 80

var app = express()

// serve pure static assets
var staticPath = path.posix.join(config.build.assetsPublicPath, config.build.assetsSubDirectory)
app.use('/', express.static(path.resolve(__dirname, '../dist')))

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})
