var vis = require('vis');

var routers = require('./routers');
var hosts = require('./hosts');
var NetworkGraph = require('./graph.js');


$(document).ready(function () {
    var graph = new NetworkGraph(hosts, routers);
    var nodes = new vis.DataSet(graph.nodes);
    var edges = new vis.DataSet(graph.edges);
    var container = document.getElementById('network-graph');
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        height: $(window).innerHeight() + "px"
    };
    var network = new vis.Network(container, data, options);
    console.log("Seed = " + network.getSeed())
})