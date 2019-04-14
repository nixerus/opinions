const webHandler = require('./handlers/webhandler');
const config = require('./config/config');
const request = require('request');
const fs = require('fs');
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

    webHandler.addPage('/submit', false, function(req,res){
        let obj = {
            ip: req.ip,
            body: req.body.msg,
            type: req.body.type,
            answered: false,
            answeredTime: 0,
            createdAt: new Date().getTime()
        }
        db.collection("questions").insertOne(obj);
        res.redirect('/home?success');
    },'POST');

    webHandler.listen();
});