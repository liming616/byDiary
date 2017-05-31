var path = require('path')
var express = require('express')
var proxy = require("express-http-proxy")
var config = require('./config')
var webpack = require('webpack')
var webpackConfig = require('./webpack.config.js')
// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.port

// Define HTTP proxies to your custom API backend
// var hosts = "http://localhost:1983";

var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: {
        colors: true,
        chunks: false
    }
})

var hotMiddleware = require('webpack-hot-middleware')(compiler)
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
        hotMiddleware.publish({ action: 'reload' })
        cb()
    })      
})

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

//待删除
app.get("/passing", function(req, res) {
    res.sendFile(__dirname + '/passing.html');
});
app.get("/account", function(req, res) {
    res.sendFile(__dirname + '/account.html');
});


//设置 proxy 配置host
// var apiProxy = proxy(hosts, {
//     forwardPath:function(req,res){
//         return req._parsedUrl.path
//     }
// })

// app.get("/*", apiProxy);
// app.post("/*", apiProxy);

//正式环境则不需要，对应文件须修改js库路径
// serve pure static assets
 app.use('/dist', express.static('dist'));
app.use('/public', express.static('assets/public'));



module.exports = app.listen(port, function (err) {
    if(err){
        return console.log(err)
    }
    console.log('Listening at http://localhost:' + port + '\n')
})
