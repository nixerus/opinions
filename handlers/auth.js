class Authentication {
    constructor(){
        this.authorizedSession = []
    }

    authenticateUser(req){
        this.authorizedSession.push(req.session.uuid);
    }

    removeUser(req){
        for(let i = 0; i < this.authorizedSession.length; i++){
            this.authorizedSession.splice(i,1);
        }
    }

    authenticated(req){
        console.log(this.authorizedSession)
        console.log("vs " + req.session.uuid)
        for(let i = 0; i < this.authorizedSession.length; i++){
            if(this.authorizedSession[i] === req.session.uuid){
                return true;
            }
        }
        return false;
    }
}

module.exports = new Authentication();