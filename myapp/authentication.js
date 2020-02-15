
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}

function validateSequence(providedSequence, userChessCode, userChessSize) {

    // Logic for determing the right sequecne 
    // sampleProvidedSequence = [
    //     { chessaman: { x: 0, y: 0 }, sequecne: ["x": 0, "y": 1}, { "x": 2, "y": 2 }]},
    //     { chessaman: { x: 0, y: 1 }, sequecne: ["x": 0, "y": 0}, { "x": 2, "y": 2 } ]}
    // ]

    // smapleUserChessSize = 4
    
    // sampleUserChessCode= [
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
    


random = Math.floor(Math.random() * 10);

if (random > 5)
    return true
else return false
    
}


module.exports = {
    generateOTP, validateSequence
}