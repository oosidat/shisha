var request = require('http-https');
var url = require('url');
var loader = require('./loader');
var parser = require('./parser');

function parse(shishaFile, locals) {
    return parser.parse(loader.load(shishaFile), locals);
}

var shisha = {
    smoke: function (shishaFile, locals, callback) {
        var report = {},
            data = parse(shishaFile, locals),
            urlsCount = 0,
            addToReport = function (url, status) {
                return function (res) {
                    report[url] = {
                        expected: status,
                        actual: res.statusCode,
                        result: status === res.statusCode.toString()
                    };

                    if (Object.keys(report).length === data.length) {
                        callback(report);
                    }
                };
            },
            processSmokeData = function (reqUrl, expectedStatus) {
                var options = url.parse(reqUrl);
                options.agent = false;
                request.request(options, addToReport(reqUrl, expectedStatus, ++urlsCount)).end();
            };

        for (var i = 0; i < data.length; i++) {
            processSmokeData(data[i].url, data[i].status);
        }
    }
};

module.exports = shisha;