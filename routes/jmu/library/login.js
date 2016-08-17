var request = require('request');
var express = require('express');

var router = express.Router();

var options = {
    url: "http://libinfo.jmu.edu.cn/cuser/",
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.8 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
    }
};

router.get('/', function (req, res) {

    var user = req.query;
    // console.log(user);
    options.form = {
        "__VIEWSTATE": "/wEPDwULLTE3OTEyNjY3NjFkZNqnTdHPer8i7/KpwiHD/CnHVgZEda8MaVn9XTSCaswc",
        "__EVENTVALIDATION": "/wEWBALZ4dupBALcgpeMBwLGmdGVDAKM54rGBskycVhQHFcvHARxC0oV7bW0FLvBuUgfzUDjp9DvaiCw",
        "user": user.username,
        "pwd": user.userpwd,
        "Button1": "登录"
    };
    var _res = res;
    var userCookie = {};
    userCookie = {
        loginStatus: "",
        loginMsg: "",
        loginCookie: ""
    };
    request.post(options, function (err, res, body) {
        //判断是否返回成功
        if (!err && res.statusCode == 200) {
            try {
                // console.log(res.headers);
                var cookie = res.headers['set-cookie'].toString().split('=')[1].split(';')[0];
                userCookie.loginStatus = "success";
                userCookie.loginMsg = "LOGIN_SUCCESS";
                userCookie.loginCookie = cookie;
                console.log("cookie:" + userCookie.loginCookie);
            } catch (err) {
                console.log(err);
                userCookie.loginStatus = "fail";
                userCookie.loginMsg = "INCORRECT_USERNAME_OR_PASSWORD";
            }
        } else {
            userCookie = {};
            userCookie.loginStatus = "fail";
            userCookie.loginMsg = "ERROR";
        }

        _res.jsonp(userCookie);
    });

});

module.exports = router;