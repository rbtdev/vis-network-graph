var vis = require('vis');
var hosts = require('./hosts');
var NetworkGraph = require('./graph.js');


$(document).ready(function () {
    var opts = {
        images: {
            computer: 'dist/img/computer.png',
            interface: 'dist/img/interface.png',
            router: 'dist/img/router.png',
            firewall: 'dist/img/firewall.png',
            laptop: 'dist/img/laptop.png',
            tablet: 'dist/img/tablet.png'
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

    network.on("selectNode", function (params) {
        if (params.nodes.length == 1) {
            if (network.isCluster(params.nodes[0]) == true) {
                network.openCluster(params.nodes[0]);
            } else {
                network.clusterByConnection(params.nodes[0], {
                    joinCondition: function (clusterNode, connectedNode) {
                        var join = ['router', 'firewall', 'network'].indexOf(connectedNode.details.type) < 0;
                        return (join)
                    }
                });
            }
        }
    });
})