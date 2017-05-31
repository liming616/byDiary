var path = require('path');
var fs = require('fs');
var mock = require("mockjs");
var app = require('express')();
var cors = require('cors');
var bodyParser = require('body-parser');
var port = process.argv.slice(2)[0] || 8080;
var server = app.listen(port, function(){
    console.info('Mock server is listening at ' + port);
});

const prefix = '/api';

var api = {};
var apiPath = path.join(__dirname, './api.json');
function getApis(){
    fs.readFile(apiPath, 'utf-8', function(err, content){
        api = JSON.parse(content);
        //console.log(content)
    });
}
//监听api.json变化
fs.watchFile(apiPath, function(curr){
    console.log('API is updated.', curr.mtime);
    getApis();
});
getApis();

function setApis(file , content , fn){
    //fs.writeFile(file, content, { 'flag': 'w' },{
    //    //flag: 'a'
    //}, function(err){
    //    if(err) throw err;
    //    console.log('exists.txt已存在，内容被覆盖！');
    //    fs.close();
    //});
    fs.writeFile(file, content, { 'flag': 'w' }, function(err) {
        if (err) {
            throw err;
        }

        console.log('Saved.');
    });
}


//支持callback
app.set('jsonp callback name', 'callback');
var options = {
    origin: true,
    credentials: true
};
app.use(cors(options));//跨域
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api/my" , function(req, res){
    if(req.originalUrl.indexOf("SaveDiary")){
        var diary = req.body;
        req.originalUrl = req.originalUrl.replace("my/SaveDiary" , "WuJi/GetMyDiarys")

        for(var group in api){
            //console.log("run in" + JSON.stringify(api[group].length) + "\n");
            //break;
            if(api[group].find(function(reqData){
                    if(reqData.regexp){
                        if(!new RegExp(reqData.url).test(req.originalUrl)){
                            return false;
                        }
                    }else if(req.originalUrl.indexOf(prefix + reqData.url) !== 0){
                        return false;
                    }

                   var id = req.body.id,
                       url = req.body.url,
                       flag = true;
                    if(req.originalUrl.indexOf("GetMyDiarys") && id){
                        for(var result in reqData.res.data){
                            var obj = reqData.res.data[result];
                            if(id == obj.id){
                                obj = diary;
                                flag = false;
                                break;
                            }
                        }
                        if(flag){
                            reqData.res.data.push(obj);
                        }
                    }
                }) !== undefined){
                break;
            }
        }

       setApis(apiPath , JSON.stringify(api));
    }


});
app.use("/api/WuJi" , function(req, res){
    var data = undefined;
    var delay = 0;
    getApis();
    for(var group in api){
        //console.log(api[group])
        console.log(req.originalUrl)
        req.originalUrl = req.originalUrl.replace("GetEditDiary" , "GetMyDiarys")
        req.originalUrl = req.originalUrl.replace("GetDiaryDetail" , "GetMyDiarys")
        if(api[group].find(function(reqData){
                if(reqData.regexp){
                    if(!new RegExp(reqData.url).test(req.originalUrl)){
                        return false;
                    }
                }else if(req.originalUrl.indexOf(prefix + reqData.url) !== 0){
                    return false;
                }
                //console.log(req.params.name);
                //console.log(req.query.name);
                //console.log(req.body.name);

                var apiRes = null,
                    id = req.body.keyValue;
                if(req.originalUrl.indexOf("GetMyDiarys") && id){
                    for(var result in reqData.res.data){
                        var obj = reqData.res.data[result];
                        if(id == obj.id){
                            reqData.res.data = obj;
                            //console.log(JSON.stringify(reqData.res.data));
                            apiRes = reqData.res;
                            break;
                        }
                    }
                }else {
                    apiRes = reqData.res;
                }

                //var apiRes = reqData.res;
                data = reqData.mock ? mock.mock(apiRes) : apiRes;
                delay = reqData.delay || 0;
                return true;
            }) !== undefined){
            break;
        }
    }
    //占位符[https://github.com/nuysoft/Mock/wiki/Mock.Random]
    console.log(mock.mock('@email'))
    console.log(mock.mock('@image'))
    console.log(mock.mock('@color'))
    console.log(mock.mock('@character'))
    data !== undefined ? setTimeout(() => res.jsonp(data), delay) : res.sendStatus(404);
});
