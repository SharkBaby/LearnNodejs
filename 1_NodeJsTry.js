// file name :test.js
var express = require('express');
var app = express();
var bodyParse = require('body-parser');// Why there is no need to install this package from npm
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParse.urlencoded({ extended: false }));

// import fs from node.js
const fs = require('fs');
const utility = require('utility');
// import required modules for scrapy
const superagent = require('superagent');
const cheerio = require('cheerio');
// url 模块是 Node.js 标准库里面的
// http://nodejs.org/api/url.html
var url = require('url');
const eventproxy = require('eventproxy');

// use async to 分段爬去多个url
const common = require('./common');
// 处理根目录的get请求
app.get('/', function (req, res) {
    res.sendfile('public/main.html');
    console.log('main page is required ');
    var q = req.query.q;
    var md5Value = utility.md5(q);
    // res.send(md5Value);
    console.log(md5Value);
});
// 处理Home的get请求
app.get('/Home', function (req, res) {
    res.sendfile('public/main.html');
    console.log('Home controller will redirect to main page is required ');
});
// 处理Index目录的get请求
app.get('/Index', function (req, res) {
    res.sendfile('public/main.html');
    console.log('Index controller will redirect to main page is required ');
});

// 处理/login的get请求
app.get('/Add', function (req, res) {
    res.sendfile('public/add.html');
    console.log('add page has been sent to Client browser ');
});
var cnodeUrl = 'https://cnodejs.org/';
// 处理/Scrapy的get请求
app.get('/Scrapy', function (req, res, next) {
    // 用 superagent 去抓取 https://cnodejs.org/ 的内容
    superagent.get(cnodeUrl)
        .end(function (err, sres) {
            // 常规的错误处理
            if (err) {
                return next(err);
            }
            var topicUrls = [];
            // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
            // 剩下就都是 jquery 的内容了
            var $ = cheerio.load(sres.text);
            var items = [];
            $('#topic_list .topic_title').each(function (idx, element) {
                var $element = $(element);
                items.push({
                    title: $element.attr('title'),
                    href: $element.attr('href')
                });
                var href = url.resolve(cnodeUrl, $element.attr('href'));
                topicUrls.push(href);
            });
            res.send(items);
            console.log(topicUrls);
            // 使用async来分段爬去多个url.
            common.asyncScrapy(topicUrls);
            // 得到一个 eventproxy 的实例
            // var ep = new eventproxy();
            // // 命令 ep 重复监听 topicUrls.length 次（在这里也就是 40 次） `topic_html` 事件再行动
            // ep.after('topic_html', topicUrls.length, function (topics) {
            //     // topics 是个数组，包含了 40 次 ep.emit('topic_html', pair) 中的那 40 个 pair
            //     // 开始行动
            //     topics = topics.map(function (topicPair) {
            //         // 接下来都是 jquery 的用法了
            //         var topicUrl = topicPair[0];
            //         var topicHtml = topicPair[1];
            //         var $ = cheerio.load(topicHtml);
            //         return ({
            //             title: $('.topic_full_title').text().trim(),
            //             href: topicUrl,
            //             comment1: $('.reply_content').eq(0).text().trim(),
            //         });
            //     });

            //     console.log('final:');
            //     console.log(topics);
            // });
            // topicUrls.forEach(function (topicUrl) {
            //     superagent.get(topicUrl)
            //         .end(function (err, res) {
            //             console.log('fetch ' + topicUrl + ' successful');
            //             ep.emit('topic_html', [topicUrl, res.text]);
            //         });
            // });
        });
});
// 处理/login的post请求
app.post('/login', function (req, res) {
    name = req.body.name;
    pwd = encodeURIComponent(req.body.pwd);
    readFile('./etc/ctntFiles.txt');
    console.log(name + '--' + pwd);
    res.status(200).send(name + '--' + pwd);
});

var readFile = function (fielPath) {
    fs.readFile(fielPath, 'utf8', (err, data) => {
        if (err) throw err;
        console.log(data);
    });
}

// 监听3000端口
var server = app.listen(3000);