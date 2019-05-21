const webHandler = require('./handlers/webhandler');
const config = require('./config/config');
const request = require('request');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;
const twitter = require('twitter');

let twitterClient;

if(config.twitterEnabled){
    twitterClient = new twitter(config.twitterConfig);
}

const mongoHandlerDep = require('./handlers/mongohandler');
const mongoHandler = new mongoHandlerDep();
const errorCodes = {
    [403]: "You aren't authorized to view this!",
    [401]: "You must log in first.",
    [404]: "This doesn't exist!",
    [405]: "Method Not Allowed",
    [503]: "This server is under maintenance.",
    [500]: "There was an error processing that request."
};

mongoHandler.setup().then(function(newObj){
    const db = newObj.db;

    newObj.fetchConfig().then(function(config){
        request.get(config.imageUrl).pipe(fs.createWriteStream("static/logo.png"));
    });

    webHandler.addPage('/error', false, function(req,res){
        let errorCode = 500;
        if(req.query.code){
            errorCode = req.query.code;
        }
        const message = errorCodes[errorCode];

        res.render('error',{code: errorCode, message: message});
    },'GET');

    function homeCallback(req,res){
        mongoHandler.fetchConfig().then(function(config){
            console.log(config);
            db.collection("questions").find({answered: true, type: "ques"},{limit: 20, sort: {answeredTime: -1}}, function(quesErr,quesResult){
                if(quesErr){
                    console.error(quesErr);
                    res.redirect('error');
                    return;
                }

                quesResult.toArray().then(function(arrayOfQuestions){
                    /*if(toArrayErr){
                        console.error(toArrayErr);
                        res.redirect('error');
                        return;
                    }*/

                    let msg = "";
                    if(req.params.success){
                        msg = "Thank you for your message!";
                    }

                    res.render('home',{questions: arrayOfQuestions,config: config, additionalMsg: msg});
                });

                
            });
        });
    }

    webHandler.addPage('/', false, homeCallback,'GET');
    webHandler.addPage('/home', false, homeCallback, 'GET')

    webHandler.addPage('/login', false, function(req,res){
        mongoHandler.fetchConfig().then(function(config){
            res.render('login', {config: config})
        })
    },'GET');

    webHandler.addPage('/login/submit', false, function(req,res){
        const password = req.body.password;
        if(password === config.adminPassword){
            webHandler.auth.authenticateUser(req);
            res.redirect('/admin/home');
        } else {
            res.redirect('/login?error')
        }
    },'POST');

    webHandler.addPage('/admin/home', true, function(req,res){
        mongoHandler.fetchConfig().then(function(config){
            db.collection("questions").find({answered: false, archived: false},{limit: 20, sort: {createdAt: -1}}, function(quesErr,quesResult){
                if(quesErr){
                    console.error(quesErr);
                    res.redirect('error');
                    return;
                }
                quesResult.toArray().then(function(arrayOfQuestions){
                    res.render('adminhome', {questions: arrayOfQuestions, config: config})
                });
            });
        });    
    },'GET');

    webHandler.addPage('/admin/reply/:id', true, function(req,res){
        const reply = req.body.reply;
        let objId = new ObjectID.createFromHexString(req.params.id);
        db.collection("questions").updateOne({_id: objId},{$set: {answered: true, answer: reply, answeredTime: new Date().getTime()}})
        if(config.twitterEnabled){
            db.collection("questions").findOne({_id: objId}, function(quesErr,quesResult){
                if(quesResult){
                    twitterClient.post('statuses/update', {status: `${quesResult.body} - ${reply} (Ask here: ${config.localUrl})`})
                }
            });
        }
        res.redirect('/admin/home');
    },'POST');

    webHandler.addPage('/admin/delete/:id', true, function(req,res){
        const objId = new ObjectID.createFromHexString(req.params.id);
        db.collection("questions").deleteOne({_id: objId});
        res.redirect('/admin/home')
    },'GET');

    webHandler.addPage('/admin/move/archive/:id', true, function(req,res){
        const objId = new ObjectID.createFromHexString(req.params.id);
        db.collection("questions").updateOne({_id: objId},{$set: {archived: true}})
        res.redirect('/admin/home')
    },'GET');

    webHandler.addPage('/admin/archive', true, function(req,res){
        mongoHandler.fetchConfig().then(function(config){
            db.collection("questions").find({$or: [{answered: true}, {archived: false}]}, function(quesErr,quesResult){
                if(quesErr){
                    console.error(quesErr);
                    res.redirect('error');
                    return;
                }
                quesResult.toArray().then(function(arrayOfQuestions){
                    res.render('archive', {questions: arrayOfQuestions, config: config})
                });
            });
        });    
    },'GET');

    webHandler.addPage('/submit', false, function(req,res){
        let ip = "";
        if(req.headers['cf-connecting-ip'] && config.allowCloudflare){
            ip = req.headers['cf-connecting-ip'];
        } else {
            ip = req.ip;
        }
        let obj = {
            ip: ip,
            body: req.body.msg,
            type: req.body.type,
            answered: false,
            answeredTime: 0,
            createdAt: new Date().getTime(),
            archived: false
        }
        db.collection("questions").insertOne(obj);
        res.redirect('/home?success');
    },'POST');

    webHandler.listen();
});