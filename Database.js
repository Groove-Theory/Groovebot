const MongoClient = require("mongodb").MongoClient;
const Globals = require("./Globals.js");
const ErrorHandler = require("./ErrorHandler.js");

const uri = process.env.DB_URI;
let MDBlient = new MongoClient(uri, {
  useNewUrlParser: true
});
let dbo = null;

exports.Init = async function Init(client) {
  console.log("DB INIT....");
  const conn = new Promise((resolve, reject) => {
    MDBlient.connect(function MDBlientConnect(err, db) {
      if (err) {
        MDBlient = null;
        console.error("[mongo] client err", err);
        ErrorHandler.HandleError(client, err);
        return reject(err);
      }
      dbo = db.db(Globals.bProduction ? "GrooveDB" : "TestingDB");
      console.log("[mongo] connected");

      resolve(true);
    });
  });
  return conn;
};

exports.Insert = function Insert(client, cCollectionName, oInsertObj) {
  const myobj = oInsertObj;
  dbo
    .collection(cCollectionName)
    .insertOne(myobj, function InsertCallback(err) {
      if (err) throw err;
    });
};

exports.Upsert = function Upsert(
  client,
  cCollectionName,
  oKeyObj,
  oUpsertDataObj,
  fCallabck = null
) {
  dbo.collection(cCollectionName).updateOne(
    oKeyObj,
    {
      $set: oUpsertDataObj
    },
    {
      upsert: true,
      safe: false
    },
    function UpsertCallback(err) {
      if (err) throw err;
      if (fCallabck) {
        try {
          fCallabck();
        } catch (callbackErr) {
          ErrorHandler.HandleError(client, callbackErr);
        }
      }
      // MongoDB.close();
    }
  );
};

// Use for Special Updates such as $pull that can't be done normally inside a $set. You need to set the $set property if you use this.
exports.UpsertManual = function UpsertManual(
  client,
  cCollectionName,
  oKeyObj,
  oUpdateObj,
  fCallabck = null
) {
  dbo.collection(cCollectionName).updateOne(
    oKeyObj,
    oUpdateObj,
    {
      upsert: true,
      safe: false
    },
    function UpsertManualCallback(err) {
      if (err) ErrorHandler.HandleError(client, err);
      if (fCallabck) {
        try {
          fCallabck();
        } catch (callbackErr) {
          ErrorHandler.HandleError(client, callbackErr);
        }
      }
    }
  );
};

exports.Query = function Query(client, cCollectionName, oQueryObj, oSort = {}) {
  const query = new Promise(resolve => {
    dbo
      .collection(cCollectionName)
      .find(oQueryObj)
      .sort(oSort)
      .toArray(function QueryToArrayCallback(err, result) {
        if (err) ErrorHandler.HandleError(client, err);
        else resolve(result);
      });
  });

  return query;
};

exports.QueryRandom = function QueryRandom(
  client,
  cCollectionName,
  oQueryObj,
  iNumDocs = 1
) {
  const query = new Promise(resolve => {
    dbo
      .collection(cCollectionName)
      .aggregate([
        {
          $match: oQueryObj
        },
        {
          $sample: {
            size: iNumDocs
          }
        }
      ])
      .toArray(function QueryRandomToArrayCallback(err, result) {
        if (err) ErrorHandler.HandleError(client, err);
        else resolve(result);
      });
  });
  return query;
};

exports.Update = function Update(
  client,
  cCollectionName,
  oQueryObj,
  oNewValuesObj
) {
  dbo
    .collection(cCollectionName)
    .updateOne(oQueryObj, oNewValuesObj, function UpdateCallback(err) {
      if (err) ErrorHandler.HandleError(client, err);
    });
};

exports.Delete = function Delete(client, cCollectionName, oQueryObj) {
  dbo
    .collection(cCollectionName)
    .deleteMany(oQueryObj, function DeleteCallback(err) {
      if (err) ErrorHandler.HandleError(client, err);
    });
};
