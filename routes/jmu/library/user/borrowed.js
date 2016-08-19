var request = require('request');
var cherrio = require('cheerio');
var express = require('express');

var router = express.Router();

var userborrowed = {};
// userborrowed = {
//     borrowedStatus : "",
//     borrowedMsg : "",
//     bookTotal : "",
//     bookList : [
//         {
//             No : "",
//             bookId : "",
//             name : "",
//             author : "",
//             type : "",
//             callNumber : "",
//             borrowedDate: "",
//             expireDate: ""
//         }
//     ]
// };

router.get('/', function (req, res) {

    var cookie = req.query;
    cookie.loginCookie = "AQIC5wM2LY4SfcyFFs3PFvDYqX3%2foQxlWsyJYB2uS0bf60U%3d%40AAJTSQACMDE%3d%23";
    var url = "http://smjslib.jmu.edu.cn/user/bookborrowed.aspx";

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
            //有COOKIE 1.判断请求是否有误 2.判断COOKIE是否正确或过期。
            var $ = cherrio.load(body);
            if (!err && res.statusCode == 200) {
                userborrowed.borrowedStatus = "success";
                userborrowed.borrowedMsg = "GET_USER_BORROWED";

                // 2.try case
                try {
                    //解析页面数据
                    //bookTotal
                    userborrowed.bookTotal = $("#bcdiv tbody td")['1'].children[0].data;
                    // bookList
                    var bookList = [];
                    $("#borrowedcontent tbody tr").each(function (item, elem) {
                        var list = {};
                        //No
                        list.No = item + 1;
                        //bookId
                        list.bookId = elem.children[5].children[0].attribs.href.split("=")[1];
                        //name
                        list.name = elem.children[5].children[0].children[0].data.split("／")[0];
                        //author
                        list.author = elem.children[5].children[0].children[0].data.split("／")[1];
                        //type
                        list.type = elem.children[9].children[0].data;
                        //callNumber
                        list.callNumber = elem.children[11].children[0].data;
                        //borrowedDate
                        list.borrowedDate = elem.children[13].children[0].data;
                        //expireDate
                        list.expireDate = elem.children[3].children[0].data;
                        bookList.push(list);
                    });

                    userborrowed.bookList = bookList;
                    //解析完毕

                } catch (err) {
                    userborrowed.borrowedStatus = "fail";
                    userborrowed.borrowedMsg = "USER_COOKIE_ERROR";
                }
            } else {
                userborrowed.borrowedStatus = "fail";
                userborrowed.borrowedMsg = "SEVER_ERROR";
            }
        });
    } else {
        userborrowed.borrowedStatus = "fail";
        userborrowed.borrowedMsg = "USER_COOKIE_NULL";
    }

    res.jsonp(userborrowed);
});

module.exports = router;