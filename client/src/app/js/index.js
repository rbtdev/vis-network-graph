var vis = require('vis');
var hosts = require('./hosts');
var NetworkGraph = require('./graph.js');


$(document).ready(function () {
    var opts = {
        images: {
            computer: 'dist/img/computer.png',
            interface: 'dist/img/interface.png',
            router: 'dist/img/router.png'
        }
    }
    var graph = new NetworkGraph(hosts, opts);
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