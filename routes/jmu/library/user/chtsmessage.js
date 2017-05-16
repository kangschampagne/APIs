var request = require('request');
var cherrio = require('cheerio');
var express = require('express');
var router = express.Router();


var expireBooks = {};
// var expireBooks = {
//     expiredBooks: [
//         {
//             No: "",
//             bookid: "",
//             name: "",
//             author: "",
//             location: "",
//             expiredDate: "",
//             accessNo: "",
//             departmentName: "",
//             expiredTotal: ""
//         }
//     ],
//     expiringBooks : [
//         {
//             No: "",
//             bookid: "",
//             name: "",
//             author: "",
//             location: "",
//             expiredDate: "",
//             accessNo: "",
//             departmentName: "",
//             expiredTotal: ""
//         }
//     ]
// };

router.get('/', function (req, res, next) {

    var cookie = req.query;
    var original_loginCookie = req.originalUrl.split("loginCookie=")[1].split("&")[0];
    console.log('查看超期图书\t', original_loginCookie);

    if (cookie.loginCookie != "") {

        var _res = res;
        var url = "http://smjslib.jmu.edu.cn/user/chtsmessage.aspx";

        var jar = request.jar();
        var loginCookie = request.cookie('iPlanetDirectoryPro=' + original_loginCookie);
        jar.setCookie(loginCookie, url);

        var options = {
            url: url,
            jar: jar,
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
                "Content-Type": "x-www-form-urlencoded",
                "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
            }
        };

        request(options, function (err, res, body) {

            if (!err && res.statusCode == 200) {
                var $ = cherrio.load(body);

                expireBooks.expireStatus = "success";
                expireBooks.expireMsg = "GET_USER_EXPIREBOOKS";

                $('.tb').each(function (i, elem) {
                    switch (i) {
                        case 0:
                            // 超期
                            var expiredBooksList = [];
                            var expiredTotal = 0;
                            $(elem).find('tbody tr').each(function (i, elem) {
                                expiredTotal++;
                                var expiredBook = {};
                                //No
                                expiredBook.No = i + 1;

                                //bookid & name & author
                                var id_name_author = elem.children[9].children[0];
                                expiredBook.bookid = id_name_author.attribs.href.split('=')[1];
                                expiredBook.name = id_name_author.children[0].data.split('／')[0];
                                expiredBook.author = id_name_author.children[0].data.split('／')[1];
                                //location
                                expiredBook.location = elem.children[5].children[0].data;
                                //expiredDate
                                expiredBook.expiredDate = elem.children[7].children[0].data;
                                //accessNo
                                expiredBook.accessNo = elem.children[3].children[0].data;
                                //departmentName
                                expiredBook.departmentName = elem.children[1].children[0].data;
                                expiredBooksList.push(expiredBook);
                            });
                            expireBooks.expiredTotal = expiredTotal;
                            if (expiredTotal) {
                                expireBooks.expiredBooks = expiredBooksList;
                            }
                            break;
                        case 1:
                            // 催还
                            var expiringBooksList = [];
                            var expiringTotal = 0;
                            $(elem).find('tbody tr').each(function (i, elem) {
                                expiringTotal++;
                                var expiringBook = {};
                                //No
                                expiringBook.No = i + 1;
                                //bookid & name & author
                                var id_name_author = elem.children[9].children[0];
                                expiringBook.bookid = id_name_author.attribs.href.split('=')[1];
                                expiringBook.name = id_name_author.children[0].data.split('／')[0];
                                expiringBook.author = id_name_author.children[0].data.split('／')[1];
                                //location
                                expiringBook.location = elem.children[5].children[0].data;
                                //expiredDate
                                expiringBook.expiredDate = elem.children[7].children[0].data;
                                //accessNo
                                expiringBook.accessNo = elem.children[3].children[0].data;
                                //departmentName
                                expiringBook.departmentName = elem.children[1].children[0].data;
                                expiringBooksList.push(expiringBook);
                            });
                            expireBooks.expiringTotal = expiringTotal;
                            if (expiringTotal) {
                                expireBooks.expiringBooks = expiringBooksList;
                            }
                            break;
                    }
                });

                _res.jsonp(expireBooks);
            } else {
                expireBooks.expireStatus = "fail";
                expireBooks.expireMsg = "SEVER_ERROR";
                _res.jsonp(expireBooks);
            }
        })
    } else {
        expireBooks.expireStatus = "fail";
        expireBooks.expireMsg = "USER_COOKIE_NULL";
        // _res.jsonp(expireBooks);
    }

});


module.exports = router;