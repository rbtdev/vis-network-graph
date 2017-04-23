var $ = require('jquery');
var hello = require('./hello').message;

$(document).ready(function () {
    $("#hello-world").text(hello);
})