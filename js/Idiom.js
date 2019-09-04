const Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js')
const Translate = require('translate-google')

exports.oHelpText = new EmbeddedHelpText(
    "Idiom",
    "Tries to create an idiom for you",
     "",
     "",
     "``g!idiom``"
 )

exports.Init = async function(client, msg) {
    try{
        var cWordToBeTranslated = createTextToBeTranslated();
        var res = await Translate(cWordToBeTranslated, { from: 'ig', to: 'en' });
        msg.channel.send("**\"" + res + "\"**")
    }
    catch(err)
    {
        ErrorHandler.HandleError(client, err);
    }
}


function WordType(cString) {
    this.cString = cString.toLowerCase(),
        this.iNum = 0
}

function randomizeWord(cString) {
    return cString.split('').map(function(v) {
        var chance = Math.round(Math.random() / 1.8);
        return v = chance ? v.toUpperCase() : v.toLowerCase();
    }).join('')
}

function randomChance(iProbDenominator) {
    var fProb = (iProbDenominator - 1) / iProbDenominator;
    return fProb > Math.random();
}

function createTextToBeTranslated() {
    var g_aWordTypes = [];
    g_aWordTypes.push(new WordType("uwu"));
    g_aWordTypes.push(new WordType("nani"));
    g_aWordTypes.push(new WordType("owo"));
    g_aWordTypes.push(new WordType("uh"));
    g_aWordTypes.push(new WordType("ag"));


    for (var i = 0; i < g_aWordTypes.length; i++) {
        g_aWordTypes[i].iNum = parseInt(Math.random() * 10)
    }


    var bCompleted = false;
    var iNoSpaceChance = 6;
    var cStringToBeTranslated = "";

    while (g_aWordTypes.length > 0) {
        try {
            var iRandomIndex = Math.floor(Math.random() * g_aWordTypes.length);
            var oRandomWordType = g_aWordTypes[iRandomIndex];
            var cRandomString = randomizeWord(oRandomWordType.cString)
            cStringToBeTranslated += cRandomString;

            if (randomChance(iNoSpaceChance)) {
                cStringToBeTranslated += " "
                iNoSpaceChance = 6
            } else {
                iNoSpaceChance++;
            }
            oRandomWordType.iNum--;
            if (oRandomWordType.iNum <= 0) {
                g_aWordTypes.splice(iRandomIndex, 1);
            }
        } catch (e) {
            ErrorHandler.HandleError(client, err);

        }
    }
    return cStringToBeTranslated;
}
