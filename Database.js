var MongoClient = require('mongodb').MongoClient;
var Globals = require('./Globals.js')
const uri = process.env.DB_URI;
var MDBlient = new MongoClient(uri,
{
  useNewUrlParser: true
});
var MongoDB = null;
var dbo = null;

exports.Init = function()
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
        return reject(false);
      }
      dbo = db.db(Globals.bProduction ? "GrooveDB" : "TestingDB");
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
  dbo.collection(cCollectionName).insertOne(myobj, function(err, res)
  {
    if (err) throw err;
    console.log("1 document inserted");
    //MongoDB.close();
  });
}

exports.Upsert = function(cCollectionName, oKeyObj, oUpsertDataObj, fCallabck = null)
{
  dbo.collection(cCollectionName).updateOne(oKeyObj,
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
      fCallabck();
    //MongoDB.close();
  });
}

exports.Query = function(cCollectionName, oQueryObj, oSort = {}, fCallabck = null)
{

  var query = new Promise((resolve, reject) =>
  {
    dbo.collection(cCollectionName).find(
      oQueryObj).sort(oSort).toArray(function(err, result)
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

  var x = dbo.collection(cCollectionName).aggregate([
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
    dbo.collection(cCollectionName).aggregate([
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
  dbo.collection(cCollectionName).updateOne(oQueryObj, oNewValuesObj, function(err, res)
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
  dbo.collection(cCollectionName).deleteMany(oQueryObj, function(err, obj)
  {
    if (err) throw err;
    console.log("1 document deleted");
    //MongoDB.close();
  });
}
