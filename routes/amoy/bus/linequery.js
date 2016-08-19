var request = require('request');
var cherrio = require('cheerio');
var express = require('express');

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

var amoyline = {};
// amoyline = {
//     lineStatus: "",
//     lineMsg: "",
//     lineTotal: "",
//     lineList: [
//         {
//             lineId: "",
//             direction : "",
//             detail : {
//                 lineNum: "",
//                 startStation : "",
//                 endStation : ""
//             }
//         }
//     ]
// }

// Request
router.get('/:line', function (req, res) {
    var linebus = req.params.line;
    var url = "http://mybus.xiamentd.com/LineQuery?line=" + linebus;
    options.url = url;

    request(options, function (err, res, body) {
        var $ = cherrio.load(body);
        if (!err && res.statusCode == 200) {
            //解析body
            //lineTotal
            var lineTotal = $('.list-route').length;
            //判断是否有公交信息哦
            if (lineTotal != "0") {
                amoyline.lineStatus = "success";
                amoyline.lineMsg = "GET_AMOY_" + linebus.toUpperCase() + "_LINE";
                //lineTotal
                amoyline.lineTotal = lineTotal;
                //lineList
                var lineList = [];
                $('.list-route').each(function (item, elem) {
                    var linelist = {};
                    var linelists = elem.attribs.onclick.toString();
                    // lineId
                    linelist.lineId = linelists.split('?lineId=')[1].split('&')[0];
                    //direction
                    linelist.direction = linelists.split('&direction=')[1];

                    //detail
                    var detail = {};
                    var details = elem.children[1].children[0].data;
                    //lineNum
                    detail.lineNum = details.split('(')[0];
                    //startStation
                    detail.startStation = details.split("(")[1].split("→")[0];
                    //endStation
                    detail.endStation = details.split("→")[1].split(")")[0];

                    linelist.detail = detail;
                    lineList.push(linelist);
                });

                amoyline.lineList = lineList;
                //

            } else {
                amoyline.lineStatus = "fail";
                amoyline.lineMsg = "PAUSED_" + linebus.toUpperCase() + "_OR_WITHOUT_LINE_";
            }

        } else {
            amoyline.lineStatus = "fail";
            amoyline.lineMsg = "SEVER_ERROR";
        }

    })
    res.jsonp(amoyline);
});


module.exports = router;