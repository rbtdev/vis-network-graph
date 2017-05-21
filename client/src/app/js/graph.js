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

function construct(hosts, routers) {
    var nodes = [];
    var edges = [];
    var networks = {};

    routers.forEach(function (router, i) {
        var routerNode = {
            id: 'router_' + i,
            label: router.name,
            image: 'dist/img/router.png',
            shape: 'image',
            details: router
        }
        nodes.push(routerNode);
        router.networks.forEach(function (network) {
            // add to networks if not already there
            if (!networks[network.cidr]) {
                networks[network.cidr] = network;
                var networkNode = {
                    id: network.cidr,
                    label: network.cidr,
                    image: 'dist/img/interface.png',
                    shape: 'image',
                    details: network
                }
                nodes.push(networkNode);
            }
            edges.push({
                from: network.cidr,
                to: routerNode.id
            })
        })
    });

    hosts.forEach(function (host) {
        var hostNode = {
            id: host.ip,
            label: host.ip,
            image: 'dist/img/computer.png',
            shape: 'image',
            details: host
        }
        nodes.push(hostNode);
        debugger
        Object.keys(networks).forEach(function (networkId) {
            if (inSubNet(host.ip, networks[networkId].cidr)) {
                edges.push({
                    from: hostNode.id,
                    to: networkId
                })
            }
        })
    });
    return {
        nodes: nodes,
        edges: edges
    }
}


function Graph(hosts, routers) {
    var graph = construct(hosts, routers);
    this.nodes = graph.nodes;
    this.edges = graph.edges;
}

Graph.prototype.toJSON = function (transform, indent) {
    return JSON.stringify(graph, transform, indent);
}

module.exports = Graph;