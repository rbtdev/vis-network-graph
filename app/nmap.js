var nmap = require('node-nmap');
var os = require('os');

nmap.nodenmap.nmapLocation = "nmap"; //default 

var name = 'wlo1';
var ifOpts = {
    name: name,
    family: 'IPv4'
}
var ifaces = ifconfig(ifOpts);
console.log("ifconfig: " + JSON.stringify(ifaces, null, 2));

var net = ifaces[name][0].address.split('.');
net[3] = '0-255';
net = net.join('.');
map(net, function (err, result) {
    if (err) console.log("Error " + err);
    console.log(JSON.stringify(result, null, 2));
    console.log("Found " + result.length + " devices on " + net)
});


function map(net, cb) {
    //    Accepts array or comma separated string of NMAP acceptable hosts 
    var quickscan = new nmap.nodenmap.QuickScan(net);

    quickscan.on('complete', function (data) {
        var result = [];
        data.forEach(function (node, name) {
            if (node.mac) result.push(node);
        });
        cb(null, result);
    });

    quickscan.on('error', function (error) {
        cb(err, error);
    });

    quickscan.startScan();

}

function ifconfig(_opts) {
    var opts = _opts || opts;
    var ifaces = os.networkInterfaces();
    var result = {};
    Object.keys(ifaces).forEach(function (ifname) {
        var arr = [];
        if (!opts.name || opts.name === ifname) {
            ifaces[ifname].forEach(function (iface) {
                if ((!opts.family || opts.family === iface.family) &&
                    (!opts.internal || opts.internal === iface.internal) &&
                    (!opts.mac || opts.mac === iface.mac) &&
                    (!opts.netmask || opts.netmask === iface.netmask)) {
                    arr.push(iface);
                }
                result[ifname] = arr;
            });
        }
    });
    return result;
}