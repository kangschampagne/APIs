var request = require('request');
var express = require('express');

var router = express.Router();

var options = {
    url: "",
    headers: {
        "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.8 Safari/537.36",
        "Accept-Language": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8;zh-CN,zh;q=0.8,en;q=0.6",
        "Cookie": "CPROID=79B0124316DBE78F447AA4D8DAB14EE9:FG=1; LDID=79B0124316DBE78F447AA4D8DAB14EE9:FG=1; FCID=79B0124316DBE78F447AA4D8DAB14EE9:FG=1;BAIDUID=550010BB8A6A5BE9FBD192546895B18B:FG=1; PSTM=1471495920; BIDUPSID=79B0124316DBE78F447AA4D8DAB14EE9; plus_cv=1::m:691fc2a7; MCITY=-134%3A; fmtip=never; Hm_lvt_d0ad46e4afeacf34cd12de4c9b553aa6=1472275021,1472353828; Hm_lpvt_d0ad46e4afeacf34cd12de4c9b553aa6=1472354655; tracesrc=-1%7C%7C-1; u_lo=0; u_id=; u_t=; TOPMSG=1472354660-0",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
        "Accept-Encoding": "identity;q=1, *;q=0",
        "Referer": "http://play.baidu.com/",
        "Range": "bytes=0-"
    }
};

var songDetail = {};

// songDetail = {
//     detailStatus: "",
//     detailMsg: "",
//     songList: [{
//         song_id: "",
//         song_name: "",
//         artist_name: "",
//         songPic_small: "",
//         songPic_big: "",
//         lrcLink: "",
//         time: "",
//         songLink: "",
//         format: "",
//         rate: "",
//         size: ""
//     }]
// };


//require
router.get('/:songid', function (req, res) {
    var songid = req.params.songid;

    var url = 'http://music.baidu.com/data/music/fmlink?type=mp3&rate=320&songIds=' + songid;
    options.url = url;
    console.log(url);

    var _res = res;


    request(options, function (err, res, body) {
        //解析返回页面
        if (!err && res.statusCode == 200) {
            var paramsdata = JSON.parse(body).data.songList;

            songDetail.detailStatus = "success";
            songDetail.detailMsg = "GET_SONG_DETAIL";
            // console.log(paramsdata);
            try {
                var List = [];
                var list = {};
                // song_id
                list.song_id = paramsdata[0].songId;
                // song_name
                list.song_name = paramsdata[0].songName;
                // artist_name
                list.artist_name = paramsdata[0].artistName;
                console.log("song:%s, %s, %s",list.song_id,list.song_name,list.artist_name);
                // songPic_small
                list.songPic_small = paramsdata[0].songPicSmall;
                // songPic_big
                list.songPic_big = paramsdata[0].songPicBig;
                // lrcLink
                list.lrcLink = paramsdata[0].lrcLink;
                // time
                list.time = paramsdata[0].time;
                // songLink
                list.songLink = paramsdata[0].songLink;
                // format
                list.format = paramsdata[0].format;
                // rate
                list.rate = paramsdata[0].rate;
                // size
                list.size = paramsdata[0].size;
                List.push(list);
                songDetail.songList = List;
            }catch (err) {
                songDetail.detailStatus = "fail";
                songDetail.detailMsg = "ERROR_SONG_ID";
            }

        } else {
            songDetail.detailStatus = "fail";
            songDetail.detailMsg = "SEVER_ERROR";
        }

        _res.jsonp(songDetail);
    })

});


module.exports = router;