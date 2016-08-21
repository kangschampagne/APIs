var request = require('request');
var cherrio = require('cheerio');
var express = require('express');
var urlencode = require('urlencode');

var router = express.Router();

var options = {
    url: "",
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.8 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
        "Cookie": "JSESSIONID=E0D64D91E3B62BFF27D1C262D1A02BE8; platformid=3; HttpOnly=true; CNZZDATA4138244=cnzz_eid%3D1122251892-1470096295-%26ntime%3D1471518331"
    }
};

// Redirect
// router.get('/', function (req, res) {
//     res.redirect('dddd');
// });

var changequery = {};
// changequery = {};

// Request
router.get('/:from/:to', function (req, res) {
    var from = urlencode(req.params.from);
    var to = urlencode(req.params.to);
    console.log(from,to);
    var url = "http://mybus.xiamentd.com/ChangeQuery?from=" + from + "&to=" + to;

    options.url = url;

    request(options, function (err, res, body) {
        var $ = cherrio.load(body);
        // console.log(body);
        if (!err && res.statusCode == 200) {
            //解析body

            if (1) {
                //

            } else {
                changequery.lineStatus = "fail";
                changequery.lineMsg = "NONE_" + from.toUpperCase() + "_TO_" + to.toUpperCase();
            }

        } else {
            changequery.lineStatus = "fail";
            changequery.lineMsg = "SEVER_ERROR";
        }

    });
    // res.jsonp();
});


module.exports = router;