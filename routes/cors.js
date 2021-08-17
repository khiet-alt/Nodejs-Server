const cors = require('cors')

var whitelist = ['http://localhost:3000', 'https://localhost:3443','http://localhost:3002', 'http://localhost:3001']
var corsOptionsDelegate = (req, callback) => {
    var corsOptions

    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }
    }
    else {
        corsOptions = { origin: false }
    }
    callback(null, corsOptions)
}

exports.cors = cors()
exports.corsWithOptions = cors(corsOptionsDelegate)