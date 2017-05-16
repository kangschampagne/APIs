var request = require('request');
var cherrio = require('cheerio');
var express = require('express');

var router = express.Router();

var bookshelf = {};

// bookshelf = {
//     shelfStatus: "",
//     shelfMsg: "",
//     pageTotal: "",
//     pageCurrent: "",
//     shelfList: [
//         {
//             No: "",
//             bookId: "",
//             name: "",
//             addtime: "",
//         }
//     ]
// };

router.get('/', function (req, res) {
    res.redirect('bookshelf/page/' + 1);
});

router.get('/page/:page', function (req, res) {
    var page = req.params.page;
    var cookie = req.query;
    var original_loginCookie = req.originalUrl.split("loginCookie=")[1].split("&")[0];
    // cookie.loginCookie = "AQIC5wM2LY4SfcxyZZCOJTs3dbT%2fipAwEpuhaoPVtv8bCbU%3d%40AAJTSQACMDE%3d%23";
    var url = "http://smjslib.jmu.edu.cn/user/mybookshelf.aspx?page=" + page;

    //定制headers  //参考资料 https://www.npmjs.com/package/request
    var j = request.jar();
    var loginCookie = request.cookie('iPlanetDirectoryPro=' + original_loginCookie);
    j.setCookie(loginCookie, url);

    var options = {
        url: url,
        jar: j,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.8 Safari/537.36",
            "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
        }
    };
    var _res = res;
    //如果loginCookie = "" 不执行request
    if (cookie.loginCookie != "") {
        request(options, function (err, res, body) {
            //有COOKIE 1.判断请求是否有误 2.判断COOKIE是否正确或过期。
            var $ = cherrio.load(body);
            if (!err && res.statusCode == 200) {
                bookshelf.shelfStatus = "success";
                bookshelf.shelfMsg = "GET_USER_BOOK_SHELF";

                // 2.try case
                try {
                    //解析页面数据
                    //
                    //pageTotal
                    bookshelf.pageTotal = $("#ctl00_cpRight_Pagination2_gplbl2")['0'].children[0].data;
                    if (page > bookshelf.pageTotal) {
                        bookshelf.shelfStatus = "fail";
                        bookshelf.shelfMsg = "BOOKSHELF_PAGE_NONE";
                    }
                    //pageCurrent
                    bookshelf.pageCurrent = $("#ctl00_cpRight_Pagination2_dplbl2")['0'].children[0].data;
                    //shelfList
                    var shelfList = [];
                    $("#mbsresultdiv tbody tr").each(function (item, elem) {
                        var list = {};
                        //No
                        list.No = elem.children[1].children[0].data;
                        //bookId
                        list.bookId = elem.children[3].children[0].children[0].attribs.href.split("=")[1];
                        //name
                        list.name = elem.children[3].children[0].children[0].children[0].data;
                        //addtime
                        list.addtime = elem.children[5].children[0].data;
                        shelfList.push(list);
                    });
                    bookshelf.shelfList = shelfList;
                    //解析完毕

                } catch (err) {
                    bookshelf.shelfStatus = "fail";
                    bookshelf.shelfMsg = "USER_COOKIE_ERROR";
                }
            } else {
                bookshelf.shelfStatus = "fail";
                bookshelf.shelfMsg = "SEVER_ERROR";
            }
            _res.jsonp(bookshelf);
        });
    } else {
        bookshelf.shelfStatus = "fail";
        bookshelf.shelfMsg = "USER_COOKIE_NULL";
        // _res.jsonp(bookshelf);
    }

});

module.exports = router;