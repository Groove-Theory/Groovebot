const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');

const CommandThreshold = 2;
const pollInterval = 5000;

let RateLimitCache = {};
exports.RateLimitCache = RateLimitCache;


exports.Init = async function () {
    var cachePoll = setInterval(LowerThreshold, pollInterval);

}

function AddToUserScore(oUser){
    if(!RateLimitCache[oUser.id])
        RateLimitCache[oUser.id] = 1;
    else
        RateLimitCache[oUser.id]++;
}
exports.AddToUserScore = AddToUserScore;

function GetUserScore(oUser){
    return RateLimitCache[oUser.id];
}
exports.GetUserScore = GetUserScore;

function GetUserTimeoutSeconds(oUser){
    return (RateLimitCache[oUser.id] - CommandThreshold) * (pollInterval/1000);
}
exports.GetUserTimeoutSeconds = GetUserTimeoutSeconds;

function IsUserBelowThreshold(oUser){
    return (RateLimitCache[oUser.id] - CommandThreshold) <= 0;
}
exports.IsUserBelowThreshold = IsUserBelowThreshold;

function HandleUserCommand(oUser)
{
    AddToUserScore(oUser);
    return IsUserBelowThreshold(oUser);
}
exports.HandleUserCommand = HandleUserCommand;


function LowerThreshold() {
    Object.keys(RateLimitCache).forEach(v => {
        RateLimitCache[v]-=1; 
        if(RateLimitCache[v] < 1) 
            delete RateLimitCache[v]
    })
}

