const Globals = require('../Globals.js')
const ErrorHandler = require('../ErrorHandler.js');
var Twitter = require('twitter');
exports.Init = async function (client, msg) {
    try{
        if(Globals.Environment.PRODUCTION)
        {
            var params = {
                id: 1, //global WOEID
            }
            Globals.TwitterApi.get('trends/place', params, function(err, data, response) {
            // If there is no error, proceed
                if(!err && data.length > 0)
                {
                    let aTrends = data[0].trends
                    if(aTrends && aTrends.length > 1)
                    {
                        let cFirstTrend = aTrends[0].name.replace("#","");
                        let cSecondTrend = aTrends[1].name.replace("#","");

                        let oFirstChannel = Globals.g_Client.channels.get("620732470677078016");
                        let oSecondChannel = Globals.g_Client.channels.get("457789197303021568");
                        // let oFirstChannel = Globals.g_Client.channels.get("554769046470656010");
                        // let oSecondChannel = Globals.g_Client.channels.get("558156350320803851");
                        if(oFirstChannel)
                            oFirstChannel.setName(`${cFirstTrend}-general`)
                        if(oSecondChannel)
                            oSecondChannel.setName(`${cSecondTrend}-general-2`)
                    }
                } else {
                    console.log(err);
                }
            })
        }
    }
    catch (err) {
        ErrorHandler.HandleError(client, err);
    }
}