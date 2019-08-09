/* eslint-disable no-console */
import { MongoClient } from "mongodb";
import { bProduction } from "./Globals";
import { HandleError } from "./ErrorHandler";

const uri = process.env.DB_URI;
let MDBlient = new MongoClient(uri, {
  useNewUrlParser: true
});
let dbo = null;

export async function Init(client) {
  console.log("DB INIT....");
  const conn = new Promise((resolve, reject) => {
    MDBlient.connect(function MDBlientConnect(err, db) {
      if (err) {
        MDBlient = null;
        console.error("[mongo] client err", err);
        HandleError(client, err);
        return reject(err);
      }
      dbo = db.db(bProduction ? "GrooveDB" : "TestingDB");
      console.log("[mongo] connected");

      resolve(true);
    });
  });
  return conn;
}

export function Insert(client, cCollectionName, oInsertObj) {
  const myobj = oInsertObj;
  dbo
    .collection(cCollectionName)
    .insertOne(myobj, function InsertCallback(err) {
      if (err) throw err;
    });
}

export function Upsert(
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
          HandleError(client, callbackErr);
        }
      }
      // MongoDB.close();
    }
  );
}

// Use for Special Updates such as $pull that can't be done normally inside a $set. You need to set the $set property if you use this.
export function UpsertManual(
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
      if (err) HandleError(client, err);
      if (fCallabck) {
        try {
          fCallabck();
        } catch (callbackErr) {
          HandleError(client, callbackErr);
        }
      }
    }
  );
}

export function Query(client, cCollectionName, oQueryObj, oSort = {}) {
  const query = new Promise(resolve => {
    dbo
      .collection(cCollectionName)
      .find(oQueryObj)
      .sort(oSort)
      .toArray(function QueryToArrayCallback(err, result) {
        if (err) HandleError(client, err);
        else resolve(result);
      });
  });

  return query;
}

export function QueryRandom(client, cCollectionName, oQueryObj, iNumDocs = 1) {
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
        if (err) HandleError(client, err);
        else resolve(result);
      });
  });
  return query;
}

export function Update(client, cCollectionName, oQueryObj, oNewValuesObj) {
  dbo
    .collection(cCollectionName)
    .updateOne(oQueryObj, oNewValuesObj, function UpdateCallback(err) {
      if (err) HandleError(client, err);
    });
}

export function Delete(client, cCollectionName, oQueryObj) {
  dbo
    .collection(cCollectionName)
    .deleteMany(oQueryObj, function DeleteCallback(err) {
      if (err) HandleError(client, err);
    });
}
