
var db = require('./database');


function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}


function validateSequence(providedCode, userChessCode, userChessSize) {

    // Logic for determing the right sequecne 
    // providedCode = [
    //     { chessaman: { x: 0, y: 0 }, newMove: {"x": 0, "y": 1}},
    //     { chessaman: { x: 1, y: 0 }, newMove: {"x": 1, "y":1 }},
    // ]

    // userChessSize = 4

    // userChessCode= [
    //     {
    //         "x" : 0.0, 
    //         "y" : 0.0, 
    //         "chessman" : "queen", 
    //         "order" : 1.0
    //     }, 
    //     {
    //         "x" : 2.0, 
    //         "y" : 2.0, 
    //         "chessman" : "bishop", 
    //         "order" : 2.0
    //     }
    // ]

    console.log("VS:", providedCode, userChessCode, userChessSize)
    // UPDATED: cleaned data for the algo
    // providedCode = [{ "x": 2, "y": 2},{ "x": 3, "y":3 }]
    // userChessSize = 4
    // userChessCode= [
    //     {
    //         "x" : 0.0, 
    //         "y" : 0.0, 
    //         "chessman" : "queen", 
    //         "order" : 0.0
    //     }, 
    //     {
    //         "x" : 2.0, 
    //         "y" : 2.0, 
    //         "chessman" : "bishop", 
    //         "order" : 1.0
    //     }
    // ]

    return isOrderTrue(userChessCode, providedCode)

}


function isOrderTrue(userChessCode, providedCode) {
    var validSequence = true
    for (var i = 0; i < userChessCode.length; i++) {
        var chesspiece = userChessCode[i].chessman;
        var chessPiecePosition = { x: userChessCode[i].x, y: userChessCode[i].y }
        console.log(piecesMove(chesspiece, chessPiecePosition, providedCode[i]))
        validSequence &= piecesMove(chesspiece, chessPiecePosition, providedCode[i])
    }
    return validSequence
}


// movement for each type of chessman

function piecesMove(chesspiece, chessPiecePosition, providedCode) {

    if (chesspiece == "bishop" && ((Math.abs(chessPiecePosition.x - providedCode.x) ==
        Math.abs(chessPiecePosition.y - providedCode.y)))) {

        return true;
    }
    else if (chesspiece == "knight" && (Math.abs(chessPiecePosition.x - providedCode.x) == 2 &&
        Math.abs(chessPiecePosition.y - providedCode.y)) == 1) {
        return true;
    }
    else if (chesspiece == "knight" && ((Math.abs(chessPiecePosition.x - providedCode.x)) == 1 &&
        Math.abs(chessPiecePosition.y - providedCode.y) == 2)) {

        return true;
    }
    else if (chesspiece == "rook" && ((chessPiecePosition.x == providedCode.x) !=
        (chessPiecePosition.y == providedCode.y))) {

        return true;
    }
    else if (chesspiece == "queen" && ((chessPiecePosition.x == providedCode.x) !=
        (chessPiecePosition.y == providedCode.y))) {

        return true;
    }
    else if (chesspiece == "queen" && (Math.abs(chessPiecePosition.x - providedCode.x) ==
        Math.abs(chessPiecePosition.y - providedCode.y))) {

        return true;
    }
    else return false;

}

function getMinDifference(currentDay, pastDay) {
    var diffMs = (currentDay - pastDay); // milliseconds between now & past day
    var diffDays = Math.floor(diffMs / 86400000); // days
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    return { diffDays: diffDays, diffHrs: diffHrs, diffMins: diffMins }
}


function isValidAccount(userName, callback) {

    db.initialize('chess', 'attempts', (collection) => {
        collection.findOne({ userName: userName }, function (err, res) {
            if (res == null || res.attempt <= 3) {
                callback({ status: true, message: "Account is valid" })
            } else {
                let now = new Date(),
                    result = getMinDifference(now, res.lastTime)
                maxLock = 5
                if (result.diffDays == 0 && result.diffHrs == 0 && result.diffMins < maxLock) {
                    callback({ status: false, message: "Account is locked, try after " + (maxLock - result.diffMins) + " mins" })
                } else {
                    resetAttempt(userName,(status)=>{
                        if(status){
                            callback({ status: true, message: "Account is ready for re-activate" })
                        }else {
                            callback({ status: false, message: "Please try in different time" })
                        }
                    })
                }
            }
        })

    }, (err) => {
    })
}

function resetAttempt(userName, callback) {

    db.initialize('chess', 'attempts', (collection) => {

        collection.deleteOne({ userName: userName }, function (err, otpDocument) {
            if (err) {
                callback(false)
            } else {
                callback(true)
            }
        })


    }, (err) => {

    })
}


// create login location for secret objects
function createSecretLocation(userName,secret, callback) {

    db.initialize('chess', 'logins', (collection) => {
        collection.findOne({ userName: userName }, function (err, res) {

            if(res == null){
                collection.insertOne({ userName: userName, secret: secret }, function (err, user) {})
            }else {
                collection.update({ userName: userName }, { $set: { 'secret': secret } }, function (err, res) {})
            }
        })

    }, (err) => {
    })
}

function getSecretLocation(userName, callback) {

    db.initialize('chess', 'logins', (collection) => {
        collection.findOne({ userName: userName }, function (err, res) {

            if(res == null){
                callback({success : false})
            }else {
                callback({success : true, location : res.secret })
            }
        })

    }, (err) => {
    })
}



module.exports = {
    generateOTP, validateSequence, isValidAccount,createSecretLocation,getSecretLocation
}