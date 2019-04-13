const Express = require('express');
const cookieSession = require('cookie-session')

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
        this.app.use(express.static('static'));
        this.app.use(express.json());
        this.app.use(express.urlencoded());
    }

    makeid(length) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
    
        return text;
    }
    

    addPage(url, internal, callback, method){
        this.app.get(url, function(req,res){
            if(internal && !this.auth.authenticated(req)){
                res.redirect('error?code=403');
            } else {
                callback(req,res);
            }
        });
    }
}

module.exports = new WebHandler();