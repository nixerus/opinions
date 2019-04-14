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
        if(req.session.uuid in this.authorizedSession){
            return true;
        } else {
            return false;
        }
    }
}

module.exports = new Authentication();