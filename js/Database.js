var MongoClient = require('mongodb').MongoClient;
var Globals = require('./Globals.js')
const ErrorHandler = require('./ErrorHandler.js');

const uri = process.env.DB_URI;
var MDBlient = new MongoClient(uri,
{
  useNewUrlParser: true
});
var MongoDB = null;

exports.dbo = null;

exports.Init = async function(client)
{
  console.log("DB INIT....")
  var conn = new Promise((resolve, reject) =>
  {
    MDBlient.connect(function(err, db)
    {
      if (err)
      {
        MDBlient = null;
        console.error('[mongo] client err', err);
        ErrorHandler.HandleError(client, err);
        return reject(false);
      }
      exports.dbo = db.db(Globals.Environment.PRODUCTION ? "GrooveDB" : "TestingDB");
      MongoDB = db;
      console.log('[mongo] connected');

      resolve(true);
    });
  });
  return conn;
}

exports.Insert = function(cCollectionName, oInsertObj)
{
  var myobj = oInsertObj;
  exports.dbo.collection(cCollectionName).insertOne(myobj, function(err, res)
  {
    if (err) throw err;
    console.log("1 document inserted");
    //MongoDB.close();
  });
}

exports.Upsert = function(cCollectionName, oKeyObj, oUpsertDataObj, fCallabck = null)
{
  exports.dbo.collection(cCollectionName).updateOne(oKeyObj,
  {
    $set: oUpsertDataObj
  },
  {
    upsert: true,
    safe: false
  }, function(err, res)
  {
    if (err) throw err;
    console.log("1 document upserted");
    if (fCallabck)
    {
      try
      {
        fCallabck();
      }
      catch(err)
      {
        ErrorHandler.HandleError(client, err);
      }
    }
    //MongoDB.close();
  });
}

exports.UpsertCustom = function(client, cCollectionName, oKeyObj, oOptions, fCallabck = null)
{
  exports.dbo.collection(cCollectionName).updateOne(oKeyObj, oOptions,
  {
    upsert: true,
    safe: false
  }, function(err, res)
  {
    if (err) throw err;
    console.log("1 document upserted");
    if (fCallabck)
    {
      try
      {
        fCallabck();
      }
      catch(err)
      {
        ErrorHandler.HandleError(client, err);
      }
    }
    //MongoDB.close();
  });
}
// Use for Special Updates such as $pull that can't be done normally inside a $set. You need to set the $set property if you use this.
exports.UpsertManual = function(cCollectionName, oKeyObj, oUpdateObj, fCallabck = null)
{
  exports.dbo.collection(cCollectionName).updateOne(oKeyObj, oUpdateObj,
  {
    upsert: true,
    safe: false
  }, function(err, res)
  {
    if (err) throw err;
    console.log("1 document upserted");
    if (fCallabck)
    {
      try
      {
        fCallabck();
      }
      catch(err)
      {
        ErrorHandler.HandleError(client, err);
      }
    }
    //MongoDB.close();
  });
}

exports.Query = function(cCollectionName, oQueryObj, oReturn = {}, oSort = {}, fCallabck = null)
{

  var query = new Promise((resolve, reject) =>
  {
    exports.dbo.collection(cCollectionName).find(
      oQueryObj, oReturn).sort(oSort).toArray(function(err, result)
    {
      if (err)
        reject(err);
      else
        resolve(result)
    });
  });

  return query;
}

exports.QueryAggregate = function(cCollectionName, oQueryObj, oReturn = {}, oSort = {}, fCallabck = null)
{
  var query = new Promise((resolve, reject) =>
  {
    exports.dbo.collection(cCollectionName).aggregate(
        {$match:oQueryObj},
        {$project:oReturn}).toArray(function(err, result)
        {
        if (err)
            reject(err);
        else
            resolve(result)
        });
  });

  return query;
}

exports.QueryRandom = function(cCollectionName, oQueryObj, iNumDocs = 1)
{

  var x = exports.dbo.collection(cCollectionName).aggregate([
  {
    $sample:
    {
      size: iNumDocs
    }
  }]).toArray(function(err, docs)
  {
    if (err) console.log(err)
  });



  var query = new Promise((resolve, reject) =>
  {
    console.log("made it to the eunction");
    exports.dbo.collection(cCollectionName).aggregate([
    {
      $match: oQueryObj
    },
    {
      $sample:
      {
        size: iNumDocs
      }
    }]).toArray(function(err, result)
    {
      if (err)
        reject(err);
      else
        resolve(result);
    });
  });
  return query;
}


exports.Update = function(cCollectionName, oQueryObj, oNewValuesObj)
{
  exports.dbo.collection(cCollectionName).updateOne(oQueryObj, oNewValuesObj, function(err, res)
  {
    if (err) throw err;
    console.log("1 document updated");
    //MongoDB.close();
  });
}

exports.Delete = function(cCollectionName, oQueryObj)
{
  var myquery = {
    Address: '2'
  };
  exports.dbo.collection(cCollectionName).deleteMany(oQueryObj, function(err, obj)
  {
    if (err) throw err;
    console.log("1 document deleted");
    //MongoDB.close();
  });
}




