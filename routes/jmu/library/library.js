var request = require('request');
var cherrio = require('cheerio');
var urlEncode = require("encode-gb2312");
var express = require('express');

var router = express.Router();

var options = {
    url: "",
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
    }
};

// Redirect
router.get('/:keyword', function (req, res) {
    var decodeKeyword = encodeURIComponent(req.params.keyword);
    res.redirect(decodeKeyword + '/page/' + 1 + '/count/' + 50);
});

// Request
//http://smjslib.jmu.edu.cn/searchresult.aspx?anywords=java&dt=ALL&cl=ALL&dp=20&sf=M_PUB_YEAR&ob=DESC&sm=table&dept=ALL
router.get('/:keyword/page/:page/count/:count', function (req, res) {
    //Params the url
    var keyword = encodeToGb2312(req.params.keyword);
    console.log("keyword", keyword);
    console.log("param-keyword", req.params.keyword);
    var page = req.params.page;
    var count = req.params.count;
    var url = "http://smjslib.jmu.edu.cn/searchresult.aspx?anywords=" +
        keyword +
        "&dt=ALL" +
        "&cl=ALL" +
        "&dp=" +
        count +
        "&sf=M_PUB_YEAR" +
        "&ob=DESC" +
        "&dept=ALL" +
        "&page=" + page;

    options.url = url;
    var library = {};
    var _res = res;
    //
    // library = {
    //     status = "",
    //     statusMsg = "",
    //     booksTotal = "",
    //     pageTotal = "",
    //     pageCurrent = "",
    //     booksList: [
    //     {   No: "",
    //         bookId: "",
    //         name: "",
    //         author: "",
    //         publisher: "",
    //         callNumber: "",
    //         total: "",
    //         available: ""}
    //     ]
    // }

    // request
    request(options, function (err, res, body) {
        //Find something request
        // 1.判断请求是否成功。 {1.1成功，解析返回内容中的书籍数。{1.1.1有书籍，接着解析。1.1.2无书籍，值为0，返回NO_BOOK。} 1.2失败，返回请求失败。}
        if (!err && res.statusCode == 200) {

            //cherrio params
            var $ = cherrio.load(body);
            var booksTotal = $('#ctl00_ContentPlaceHolder1_countlbl').text();
            // 1.1判断
            if ((booksTotal != "0") && (booksTotal != "")) {
                library.status = "success";
                library.statusMsg = "HAS_BOOK";
                library.booksTotal = booksTotal;
                library.pageTotal = $('#ctl00_ContentPlaceHolder1_gplblfl1').text();
                library.pageCurrent = $('#ctl00_ContentPlaceHolder1_dplblfl1').text();

                var booksList = [];
                // TEXT
                // booksList.No = $('tbody tr')['0'].children[1].children[1].data;
                // booksList.bookid = $('tbody tr')['0'].children[1].children[0].attribs.value;
                // console.log(booksList.No);
                // console.log(booksList.bookid);

                $('tbody tr').each(function (item, elem) {
                    var book = {};
                    book.No = elem.children[1].children[1].data;
                    book.bookId = elem.children[1].children[0].attribs.value;
                    book.name = elem.children[3].children[0].children[0].children[0].data;
                    try {
                        book.author = elem.children[5].children[0].data;
                    } catch (err) {
                        book.author = "无作者信息";
                    }
                    book.publisher = elem.children[7].children[0].data;
                    book.callNumber = elem.children[11].children[0].data;
                    book.total = elem.children[13].children[0].data;
                    book.available = elem.children[15].children[0].data;
                    booksList.push(book);
                });

                library['booksList'] = booksList;

            } else {
                library.status = "false";
                library.statusMsg = "NO_BOOK_FOUND";
            }
        } else {
            library.status = "false";
            library.statusMsg = "REQUEST_FALSE";
        }
        _res.jsonp(library);
    })


});

//encodeGb2312
function encodeToGb2312(str) {
    var keyword = urlEncode.encodeToGb2312(str);
    var encodeKeyword = "";
    for (i = 0; i < keyword.length * 0.5; i++) {
        encodeKeyword += "%";
        encodeKeyword += keyword.substr(i * 2, 2);
    }
    return encodeKeyword;
}

module.exports = router;