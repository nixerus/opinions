const webHandler = require('./webhandler');
const errorCodes = {
    [403]: "You aren't authorized to view this!",
    [401]: "You must log in first.",
    [404]: "This doesn't exist!",
    [405]: "Method Not Allowed",
    [503]: "This server is under maintenance.",
    [500]: "There was an error processing that request."
}

webHandler.addPage('error', false, function(req,res){
    let errorCode = 500;
    if(req.params.code){
        errorCode = req.params.code;
    }
    const message = errorCodes[errorCode];

    res.render('error',{code: errorCode, message: message});
},'GET');