const Express = require('express');
const cookieSession = require('cookie-session')
const config = require('../config/config')

class WebHandler {
    constructor(database){
        this.database = database;
        this.auth = require('./auth')
        this.app = Express();

        this.app.set('trust proxy', 1) // trust first proxy

        this.app.use(cookieSession({
            name: 'session',
            keys: [this.makeid(14),this.makeid(14)]
        }))

        this.app.set('view engine', 'pug');
        this.app.use(Express.static('static'));
        this.app.use(Express.json());
        this.app.use(Express.urlencoded());
    }

    makeid(length) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
    
        return text;
    }
    

    addPage(url, internal, callback, method){
        if(method == 'GET'){
            this.app.get(url, function(req,res){
                if(internal && !this.auth.authenticated(req)){
                    res.redirect('error?code=403');
                } else {
                    callback(req,res);
                }
            });
        } else {
            this.app.post(url, function(req,res){
                if(internal && !this.auth.authenticated(req)){
                    res.redirect('error?code=403');
                } else {
                    callback(req,res);
                }
            });
        }
    }

    listen() {
        this.app.listen(config.port, () => console.log("App now listenining!"))
    }
}

module.exports = new WebHandler();