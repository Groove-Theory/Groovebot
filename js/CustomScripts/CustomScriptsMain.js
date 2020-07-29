const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js')
const TwitterTrendsNameChange = require('./TwitterTrendsNameChange.js')
const RedditModMailLog = require('./RedditModMailLog.js')
const RedditVulgarModLog = require('./RedditVulgarModLog.js')

exports.Init = async function(client) {
    try
    {
        InitJobs();
    }
    catch(err)
    {
        ErrorHandler.HandleError(client, err)
    }
}

function InitJobs()
{
    //TwitterTrendsNameChange.Init();
    RedditModMailLog.Init();
    //RedditVulgarModLog.Init();
}
