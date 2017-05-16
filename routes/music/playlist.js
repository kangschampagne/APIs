var request = require('request');
var express = require('express');
var urlencode = require('urlencode');

var router = express.Router();

var options = {
    url: "",
    headers: {
        "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.8 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
        // "Connection":"keep-alive",
        "Cookie": "CPROID=79B0124316DBE78F447AA4D8DAB14EE9:FG=1; LDID=79B0124316DBE78F447AA4D8DAB14EE9:FG=1; FCID=79B0124316DBE78F447AA4D8DAB14EE9:FG=1;BAIDUID=550010BB8A6A5BE9FBD192546895B18B:FG=1; PSTM=1471495920; BIDUPSID=79B0124316DBE78F447AA4D8DAB14EE9; plus_cv=1::m:691fc2a7; MCITY=-134%3A; fmtip=never; Hm_lvt_d0ad46e4afeacf34cd12de4c9b553aa6=1472275021,1472353828; Hm_lpvt_d0ad46e4afeacf34cd12de4c9b553aa6=1472354655; tracesrc=-1%7C%7C-1; u_lo=0; u_id=; u_t=; TOPMSG=1472354660-0"
    }
};

var channelList = {};

// channelList = {
//     channelStatus: "",
//     channelMsg: "",
//     channel_id: "",
//     channel_name: "",
//     songTotal: "",
//     list: [{
//         No: "",
//         song_id: ""
//     }]
// };

// Redirect
router.get('/', function (req, res) {
    var channeL = [
        "public_scene_28_%e5%9c%a8%e5%ae%b6",
        "public_scene_29_%e4%b8%8a%e7%bd%91",
        "public_tag_%e8%bd%bb%e6%9d%be",
        "public_tag_%e8%88%92%e7%bc%93",
        "public_tag_%e5%ae%89%e9%9d%99",
        "public_tuijian_ktv",
        "public_tuijian_rege",
        "public_tuijian_ktv",
        "public_tuijian_chengmingqu",
        "public_tuijian_wangluo",
        "public_tuijian_suibiantingting",
        "public_tuijian_billboard",
        "public_tuijian_kaiche",
        "public_tuijian_yingshi",
        "public_tuijian_winter",
        "public_tuijian_spring",
        "public_tuijian_autumn",
        "public_shiguang_jingdianlaoge",
        "public_shiguang_80hou",
        "public_shiguang_90hou",
        "public_scene_33_%e7%81%ab%e7%88%86%e6%96%b0%e6%ad%8c",
        "public_shiguang_yedian",
        "public_shiguang_70hou",
        "public_shiguang_erge",
        "public_shiguang_lvxing",
        "public_fengge_liuxing",
        "public_fengge_dj",
        "public_fengge_qingyinyue",
        "public_fengge_xiaoqingxin",
        "public_fengge_yaogun",
        "public_fengge_dianyingyuansheng",
        "public_fengge_zhongguofeng",
        "public_scene_50_%e6%b0%91%e8%b0%a3",
        "public_xinqing_huankuai",
        "public_xinqing_shuhuan",
        "public_xinqing_shanggan",
        "public_xinqing_qingsongjiari",
        "public_scene_15_%e6%85%b5%e6%87%92%e5%8d%88%e5%90%8e",
        "public_xinqing_tianmi",
        "public_xinqing_jimo",
        "public_xinqing_qingge",
        "public_yuzhong_huayu",
        "public_yuzhong_oumei",
        "public_yuzhong_riyu",
        "public_yuzhong_hanyu",
        "public_yuzhong_yueyu",
        "private",
        "lovesongs",
        "public_yyr_sbtt"
    ];
    var num = Math.floor(Math.random() * channeL.length);
    res.redirect('channel/' + channeL[num]);
});


//require
router.get('/:channel', function (req, res) {
    var channel_name = req.params.channel;
    var url = 'http://fm.baidu.com/dev/api/?tn=playlist&format=json&id=' + urlencode(channel_name);
    options.url = url;
    console.log(url);

    var _res = res;


    request(options, function (err, res, body) {
        //解析返回页面
        if (!err && res.statusCode == 200) {
            var paramsdata = JSON.parse(body);
            // console.log(paramsdata);
            channelList.channelStatus = "success";
            channelList.channelMsg = "GET_SONGS_LIST";
            // channel_id
            channelList.channel_id = channel_name;
            // channel_name
            channelList.channel_name = paramsdata.channel_name;
            // songTotal
            channelList.songTotal = paramsdata.list.length;
            //list
            var List = [];
            for (var i = 0; i < paramsdata.list.length; i++) {
                var list = {};
                list.No = i + 1;
                list.song_id = paramsdata.list[i].id;
                List.push(list);
            }
            channelList.list = List;

        } else {
            channelList.channelStatus = "fail";
            channelList.channelMsg = "SEVER_ERROR";
        }

        _res.jsonp(channelList);
    })

});


module.exports = router;