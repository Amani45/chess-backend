var MongoClient = require('mongodb').MongoClient;


userName = "amoon"
password = "It123654iT"
const database = 'chess';

// const uri = 'mongodb://' + userName + ':' + password + '@cluster0-l32un.mongodb.net'


const dbConnectionUrl = 'mongodb://' + userName + ':' + password + '@cluster0-shard-00-00-l32un.mongodb.net:27017,cluster0-shard-00-01-l32un.mongodb.net:27017,cluster0-shard-00-02-l32un.mongodb.net:27017/Chess?ssl=true&authSource=admin'
// const dbConnectionUrl = 'mongodb://localhost:27017'
function initialize(
    dbName,
    dbCollectionName,
    successCallback,
    failureCallback
) {
    MongoClient.connect(dbConnectionUrl,{ useUnifiedTopology: true }, function(err, dbInstance) {
        if (err) {
            console.log(`[MongoDB connection] ERROR: ${err}`);
            failureCallback(err); // this should be "caught" by the calling function
        } else {
            const dbObject = dbInstance.db(dbName);
            const dbCollection = dbObject.collection(dbCollectionName);
            console.log("[MongoDB connection] SUCCESS");

            successCallback(dbCollection);
        }
    });
}

module.exports = {
    initialize
};



// class Database {

//     constructor() {
//         this.main();
//     }


//     main() {

//         // change based on your mongodb connection instance
//         MongoClient.connect(uri,{useUnifiedTopology: true })
//             .then(client => {
//                 const db = client.db("notification");
//                 const collection = db.collection("Users");
//                 console.log("colle: ", collection)
//                 // const changeStream = collection.watch([{ $project: { fullDocument: 1, operationType: 1 } }]);
//                 // changeStream.on("change", function (change) {
//                 //     io.emit('new-notification', change);
//                 // });
//             }, (err)=>{
//                 console.log("err: ", err)
//             });

//         // const client = new MongoClient(uri,{ useNewUrlParser: true, useUnifiedTopology: true });

//         // client.connect().then( client =>{
//         //     const db = client.db("chess")
//         //     const users = db.collection("Users")
//         //     console.lo("Hello Users", users)
//         // });

//         // try {
//         //     // Connect to the MongoDB cluster
//         //     client.connect()
//         //     client.db().admin().listDatabases();
//         //     // console.log(client.db().collections('Users'))
//         //     // Make the appropriate DB calls
//         //    // this.listDatabases(client);

//         // } catch (e) {
//         //     console.error(e);
//         // } finally {
//         //     client.close();
//         // }
//     }

//     // listDatabases(client){
//     //     databasesList = client.db().admin().listDatabases();

//     //     console.log("Databases:");
//     //     databasesList.databases.forEach(db => console.log(` - ${db.name}`));
//     // };



// }
// module.exports = new Database();