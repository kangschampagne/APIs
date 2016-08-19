var request = require('request');
var cherrio = require('cheerio');
var express = require('express');

var router = express.Router();

var userinfo = {};
// userinfo = {
//     userinfoStatus : "",
//     userinfoMsg : "",
//     infos : {
//         userAccountId : "",
//         userName : "",
//         userType : "",
//         userDepartment : "",
//         userStatus : "",
//         userTel : "",
//         userMobile : "",
//         userRemarks : "",
//         userAddress : ""
//     }
// };

router.get('/', function (req, res) {

    var cookie = req.query;
    cookie.loginCookie = "AQIC5wM2LY4SfcyFFs3PFvDYqX3%2foQxlWsyJYB2uS0bf60U%3d%40AAJTSQACMDE%3d%23";
    var url = "http://smjslib.jmu.edu.cn/user/userinfo.aspx";

    //定制headers  //参考资料 https://www.npmjs.com/package/request
    var j = request.jar();
    var loginCookie = request.cookie('iPlanetDirectoryPro=' + cookie.loginCookie);
    j.setCookie(loginCookie, url);

    var options = {
        url: url,
        jar: j,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.8 Safari/537.36",
            "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
        }
    };
    //如果loginCookie = "" 不执行request
    if (cookie.loginCookie != "") {
        request(options, function (err, res, body) {
            //有COOKIE 1.判断请求是否有误 2.判断COOKIT是否正确或过期。
            var $ = cherrio.load(body);
            if (!err && res.statusCode == 200) {
                userinfo.userinfoStatus = "success";
                userinfo.userinfoMsg = "GET_USER_MASTER";

                // 2.try case
                try {
                    //解析页面数据
                    var infos = {};
                    // userAccountId
                    infos.userAccountId = getInfos(0);
                    //userName
                    infos.userName = getInfos(1);
                    //userType
                    infos.userType = getInfos(2);
                    //userDepartment
                    infos.userDepartment = getInfos(3);
                    //userStatus
                    infos.userStatus = getInfos(4);
                    //userTel
                    infos.userTel = getInfos(5);
                    //userMobile
                    infos.userMobile = getInfos(6);
                    //userRemarks
                    infos.userRemarks = getInfos(7);
                    //userAddress
                    infos.userAddress = getInfos(8);

                    userinfo.infos = infos;

                    function getInfos(index) {
                        var info = $(".inforight")['' + index + ''].children[0].data.trim();
                        return info;
                    }
                }catch (err){
                    userinfo.userinfoStatus = "fail";
                    userinfo.userinfoMsg = "USER_COOKIE_ERROR";
                }
            } else {
                userinfo.userinfoStatus = "fail";
                userinfo.userinfoMsg = "SEVER_ERROR";
            }
        });
    }else {
        userinfo.userinfoStatus = "fail";
        userinfo.userinfoMsg = "USER_COOKIE_NULL";
    }

    res.jsonp(userinfo);
});

module.exports = router;