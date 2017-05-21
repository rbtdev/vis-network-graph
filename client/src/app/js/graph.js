var ip2long = function (ip) {
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

var inSubNet = function (ip, subnet) {
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

    var routerId = 0;
    hosts.forEach(function (host, i) {
        if (host.type === 'router') {
            var image = opts.images ? opts.images['router'] : undefined;
            var shape = image ? 'image' : undefined;
            var routerNode = {
                id: 'router_' + routerId++,
                label: host.hostname,
                image: image,
                shape: shape,
                details: host
            }
            if (nodeMap[routerNode.id]) debugger
            else nodeMap[routerNode.id] = routerNode;
            nodes.push(routerNode);
            host.networks.forEach(function (network) {
                // add to networks if not already there
                if (!networks[network.cidr]) {
                    networks[network.cidr] = network;
                    var image = opts.images ? opts.images['network'] : undefined;
                    var shape = image ? 'image' : undefined;
                    var networkNode = {
                        id: network.cidr,
                        label: network.cidr,
                        image: image,
                        shape: shape,
                        details: network
                    }
                    if (nodeMap[networkNode.id]) debugger
                    else nodeMap[networkNode.id] = networkNode;
                    nodes.push(networkNode);
                }
                edges.push({
                    from: network.cidr,
                    to: routerNode.id,
                    label: network.address
                })
            })
        } else if (host.type === 'computer') {
            var image = opts.images ? opts.images['computer'] : undefined;
            var shape = image ? 'image' : undefined;
            var hostNode = {
                id: host.ip,
                label: host.ip,
                image: image,
                shape: shape,
                details: host
            }
            if (nodeMap[hostNode.id]) debugger
            else nodeMap[hostNode.id] = hostNode;
            nodes.push(hostNode);
            Object.keys(networks).forEach(function (networkId) {
                if (inSubNet(host.ip, networks[networkId].cidr)) {
                    edges.push({
                        from: hostNode.id,
                        to: networkId
                    })
                }
            })
        }
    });
    return {
        nodes: nodes,
        edges: edges
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