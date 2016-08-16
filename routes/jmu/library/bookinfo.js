var request = require('request');
var cherrio = require('cheerio');
var express = require('express');

var router = express.Router();

var options = {
    url: "",
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.8 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
    }
};

// var book = {
//     status: "",
//     statusMsg: "",
//     bookCard: "",
//     bookIntro: "",
//     ISBN: "",
//     bookInfo: [
//         {
//             location : "",
//             callNumber : "",
//             accessionNumber : "",
//             bookStatus : "",
//             bookType: ""
//         }
//     ]
// };
var book = {};

router.get('/', function (req, res) {
    res.render("NO_BOOK_INFO");
});

router.get('/:bookid', function (req, res) {
    var bookid = req.params.bookid;
    options.url = "http://smjslib.jmu.edu.cn/bookinfo.aspx?ctrlno=" + bookid;
    var _res = res;
    request(options, function (err, res, body) {
        //1.判断返回状态码。1.1错误为null。1.2有错误。
        if (err == null && res.statusCode == 200) {
            var $ = cherrio.load(body);

            //判断是否有(id=searchnotfound)的标签。
            if ($("#searchnotfound")['0'] == undefined) {
                book.status = "success";
                book.statusMsg = "BOOK_EXIST";
                //
                //
                var bookcardinfo = $("#ctl00_ContentPlaceHolder1_bookcardinfolbl")['0'];
                book.bookCard = bookcardinfo.children[0].data.split("．")[0].trim();
                console.log(bookcardinfo.children.length);
                //
                //
                var i_Arry = new Array();
                for (i = 0; i < bookcardinfo.children.length; i++) {
                    if (bookcardinfo.children[i].type == 'text'
                        && bookcardinfo.children[i].next.name == 'br'
                        // && bookcardinfo.children[i].next.type == 'tag'
                    ) {
                        i_Arry.push(i);
                        console.log(bookcardinfo.children[i].data + i);
                    }
                }
                try {
                    book.bookIntro = bookcardinfo.children[i_Arry[i_Arry.length-2]].data.trim();
                    book.ISBN = bookcardinfo.children[i_Arry[i_Arry.length-1]].data.split("ISBN")[1].split('：')[0];
                }catch (err) {
                    book.statusMsg = "INFORMATION_LACK";
                }
                //
                //
                var Info = [];
                $('table tbody tr').each(function (item, elem) {
                    var bookinfo = {};
                    //location
                    bookinfo.location = elem.children[1].children[0].children[0].data;
                    //callNumber
                    bookinfo.callNumber = elem.children[3].children[0].data;
                    //accessionNumber
                    bookinfo.accessionNumber = elem.children[5].children[0].data;
                    //bookStatus
                    bookinfo.bookStatus = elem.children[11].children[0].data.trim();
                    //bookType
                    bookinfo.bookType = elem.children[13].children[0].data.trim();
                    Info.push(bookinfo);
                });
                book.bookInfo = Info;
                //
                //

            } else {
                book.status = "false";
                book.statusMsg = "SEARCH_NOT_FOUND";
            }
        }
        _res.jsonp(book);
    })

});

module.exports = router;