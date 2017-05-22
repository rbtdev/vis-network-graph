function ip2long(ip) {
    var components;

    if (components = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)) {
        var iplong = 0;
        var power = 1;
        for (var i = 4; i >= 1; i -= 1) {
            iplong += power * parseInt(components[i]);
            power *= 256;
        }
        return iplong;
    } else return -1;
};

function inSubNet(ip, subnet) {
    var mask, base_ip, long_ip = ip2long(ip);
    if ((mask = subnet.match(/^(.*?)\/(\d{1,2})$/)) && ((base_ip = ip2long(mask[1])) >= 0)) {
        var freedom = Math.pow(2, 32 - parseInt(mask[2]));
        return (long_ip > base_ip) && (long_ip < base_ip + freedom - 1);
    } else return false;
};

function construct(hosts, opts) {
    var nodes = [];
    var edges = [];
    var networks = {};
    var nodeMap = {};
    var nodeId = 0;

    hosts.forEach(function (host, i) {

        // If this is a router/firewall, add it as a node, and add it's networks
        if (host.networks) {
            var node = addNode(host);

            // Add each network this router is connected to
            host.networks.forEach(function (network) {
                // add to networks if not already there
                if (!networks[network.cidr]) {

                    network.hostname = network.cidr;
                    network.type = 'network';
                    var networkNode = addNode(network);
                    networks[network.cidr] = networkNode;
                }

                // connect the network to the router
                edges.push({
                    from: networks[network.cidr].id,
                    to: node.id,
                    label: network.address
                })
            })
        } else {

            // Add a host to the node list and connect it to the appropriate network
            if (!host.hostname) host.hostname = host.ip;
            var node = addNode(host);

            // Find the network that this host belongs to
            Object.keys(networks).forEach(function (networkId) {
                if (inSubNet(host.ip, networkId)) {

                    // connect the host to the network
                    edges.push({
                        from: node.id,
                        to: networks[networkId].id,
                        title: "<pre>" + JSON.stringify(host, null, 2) + "</pre>"
                    })
                }
            })
        }
    });
    return {
        nodes: nodes,
        edges: edges
    }

    function addNode(entity) {
        var image = opts.images ? opts.images[entity.type] : undefined;
        var shape = image ? 'image' : undefined;
        var node = {
            id: nodeId++,
            label: entity.hostname,
            image: image,
            shape: shape,
            details: entity
        }
        node.title = "<pre>" + JSON.stringify(node, null, 2) + "</pre>"
        if (!nodeMap[node.id]) {
            nodeMap[node.id] = node;
            nodes.push(node);
        } else {
            alert("Duplicate node ID - " + JSON.stringify(node));
        }

        return node;
    }
}

function Graph(hosts, opts) {
    var graph = construct(hosts, opts);
    this.nodes = graph.nodes;
    this.edges = graph.edges;
}

Graph.prototype.toJSON = function (transform, indent) {
    return JSON.stringify(graph, transform, indent);
}

module.exports = Graph;