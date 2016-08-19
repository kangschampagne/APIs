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

var linedetail = {};
// linedetail = {
//     detailStatus: "",
//     detailMsg: "",
//     lineDescription: {
//         lineNum: "",
//         departureStation: "",
//         terminalStation: ""
//     },
//     schedule: {
//         dailyStartTime: "",
//         dailyEndTime: "",
//         nextDepartTime: ""
//     },
//     totalStations: "",
//     stations: [
//         {
//             no: "",
//             name: "",
//             status: ""
//         }
//     ]
// };

// Request
router.get('/:lineId/:direction', function (req, res) {
    var lineId = req.params.lineId;
    var direction = req.params.direction;
    console.log("lineId:%d direction:%d", lineId, direction);
    var url = "http://mybus.xiamentd.com/LineDetailQuery?lineId=" + lineId + "&direction=" + direction;
    options.url = url;
    //判断direction值是否正确
    if ((lineId != "") && (direction == "1") || (direction == "2")) {
        linedetail.detailStatus = "success";
        request(options, function (err, res, body) {
            var $ = cherrio.load(body);
            // console.log(body);
            //解析body
            //判断是否有此id的公交车 使用 try

            if (!err && res.statusCode == 200) {
                try {
                    //detailMsg
                    linedetail.detailMsg = "GET_LINE_DETAIL";
                    //lineDescription
                    var lineDescription = {};
                    var lineDescriptions = $(".model-content-a")['0'].children[0].data.trim();
                    lineDescription.lineNum = lineDescriptions.split("(")[0];
                    lineDescription.departureStation = lineDescriptions.split("(")[1].split("→")[0];
                    lineDescription.terminalStation = lineDescriptions.split("→")[1].split(")")[0];
                    linedetail.lineDescription = lineDescription;

                    //schedule
                    var schedule = {};
                    var schedules = $(".model-content-a")['1'].children[0].data.trim();
                    schedule.dailyStartTime = schedules.split("班:")[1].split("-")[0];
                    schedule.dailyEndTime = schedules.split("--")[1].split(" 计")[0];
                    schedule.nextDepartTime = schedules.split("车:")[1];
                    linedetail.schedule = schedule;

                    //totalStations
                    var totalStations = $(".model-content-a")['2'].children[0].data.trim().match(/[0-9]{1,3}/g).toString();
                    linedetail.totalStations = totalStations;

                    //stations
                    var stations = [];
                    $(".list-bus-station ").each(function (item, elem) {
                        var station = {};
                        //no
                        station.no = elem.children[1].children[0].data;
                        // name
                        station.name = elem.children[3].children[1].children[0].data;

                        // status 判断是否有正在运行车辆
                        var hasbus = 0;//默认为无
                        try {
                            var status1 = $(elem).find('.list-bus-station-showBus')[0].children[1].children[1].children[0];
                            //判断是否同时具备两个状态
                            try {
                                //具有第二状态
                                var status2 = $(elem).find('.list-bus-station-showBus')[0].children[3].children[1].children[0];
                                if (status2.data) {
                                    station.status = {};
                                    station.status.status1 = status1.data.trim();
                                    station.status.status2 = status2.data.trim();
                                }
                            } catch (err) {
                                //不具有第二状态
                                if (status1.data) {
                                    station.status = status1.data.trim();
                                }
                            }
                            //全局状态
                            linedetail.detailStatus = "success";
                            if (direction == "1") {
                                //lineNum
                                linedetail.detailMsg = "HAS_" + lineDescription.lineNum.split("路")[0] + "_FORWARD";
                            } else if (direction == "2") {
                                linedetail.detailMsg = "HAS_" + lineDescription.lineNum.split("路")[0] + "_REVERSE";
                            }
                            hasbus = 1;
                            //

                        } catch (err) {
                            station.status = " ";
                            if (hasbus == 0) {
                                if (direction == "1") {
                                    //lineNum
                                    linedetail.detailMsg = "NONE_" + lineDescription.lineNum.split("路")[0] + "_FORWARD";
                                } else if (direction == "2") {
                                    linedetail.detailMsg = "NONE_" + lineDescription.lineNum.split("路")[0] + "_REVERSE";
                                }
                            }
                        }
                        stations.push(station);
                    });
                    linedetail.stations = stations;

                } catch (err) {
                    linedetail = {};
                    linedetail.detailStatus = "fail";
                    linedetail.detailMsg = "NONE_LINE_ID_OR_DIRECTION";
                }

            } else {
                linedetail = {};
                linedetail.detailStatus = "fail";
                linedetail.detailMsg = "SEVER_ERROR";
            }
        });

    }
    else {
        linedetail = {};
        linedetail.detailStatus = "fail";
        linedetail.detailMsg = "ERROR_LINE_ID_OR_DIRECTION";
    }

    res.status(200).jsonp(linedetail);
});


module.exports = router;