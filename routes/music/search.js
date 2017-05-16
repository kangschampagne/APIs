var request = require('request');
var cherrio = require('cheerio');
var urlEncode = require("encode-gb2312");
var urlencode = require('urlencode');
var express = require('express');

var router = express.Router();

var options = {
    url: "",
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.8 Safari/537.36",
        "Accept-Language": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Cookie": "CPROID=79B0124316DBE78F447AA4D8DAB14EE9:FG=1; LDID=79B0124316DBE78F447AA4D8DAB14EE9:FG=1; FCID=79B0124316DBE78F447AA4D8DAB14EE9:FG=1;BAIDUID=550010BB8A6A5BE9FBD192546895B18B:FG=1; PSTM=1471495920; BIDUPSID=79B0124316DBE78F447AA4D8DAB14EE9; plus_cv=1::m:691fc2a7; MCITY=-134%3A; fmtip=never; Hm_lvt_d0ad46e4afeacf34cd12de4c9b553aa6=1472275021,1472353828; Hm_lpvt_d0ad46e4afeacf34cd12de4c9b553aa6=1472354655; tracesrc=-1%7C%7C-1; u_lo=0; u_id=; u_t=; TOPMSG=1472354660-0"
    }
};

var music = {};
// music = {
//     musicStatus: "",
//     musicMsg: "",
//     musicTotal: "",
//     pageTotal: "",
//     pageCurrent: "",
//     musicList: [{
//         No: "",
//         music_id: "",
//         music_name: "",
//         author_name: ""
//     }]
// };

// Redirect
router.get('/:keyword', function (req, res) {
    res.redirect(urlencode(req.params.keyword) + '/page/' + 1);
});

//require
router.get('/:keyword/page/:page', function (req, res) {
    var music_name = urlencode(req.params.keyword);
    console.log("music_name:" + req.params.keyword);
    var page = req.params.page;
    var start = (page - 1) * 20;

    var url = 'http://music.baidu.com/search/song?s=1&key=' +
        music_name +
        '&jump=0' +
        '&start=' +
        start +
        '&size=20' +
        '&third_type=0';
    options.url = url;
    console.log(url);
    var _res = res;


    request(options, function (err, res, body) {

        //解析返回页面
        if (!err && res.statusCode == 200) {
            var $ = cherrio.load(body);
            music.musicStatus = "success";
            music.musicMsg = "GET_MUSIC_LIST_SUCCESS";
            //fwb ci
            try {
                // musicTotal
                music.musicTotal = $(".number")['0'].children[0].data;
                // pageTotal
                music.pageTotal = Math.ceil(music.musicTotal / 20);
                // pageCurrent
                music.pageCurrent = page;
                //musicList
                var musicList = [];
                $(".song-item-hook").each(function (item, elem) {
                    var list = {};
                    // No
                    list.No = $(".index-hook")[item].children[0].data;
                    var datalist = JSON.parse(elem.attribs['data-songitem']).songItem;
                    // music_id
                    list.music_id = datalist.sid;
                    // music_name
                    list.music_name = datalist.sname.toString().replace(/(\<em\>)*(\<\/em\>)*/g, "");
                    // author_name
                    list.author_name = datalist.author.toString().replace(/(\<em\>)*(\<\/em\>)*/g, "");
                    musicList.push(list);
                });
                music.musicList = musicList;
                //判斷是否超出頁數
                if (music.musicList == ""){
                    music.musicStatus = "fail";
                    music.musicMsg = "BEYOND_PAGE_NUMBER";
                }
            } catch (err) {
                music.musicStatus = "fail";
                music.musicMsg = "SONG_NAME_ERROR";
            }

        } else {
            music.musicStatus = "fail";
            music.musicMsg = "SEVER_ERROR";
        }

        _res.jsonp(music);
    })

});


module.exports = router;