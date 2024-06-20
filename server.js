const WebSocket = require('ws')
const port = process.env.PORT || 8082
const wss = new WebSocket.Server({port: port})
const sockets = {}
const pairs = []

function randomNumber(min, max) { 
    return Math.floor(Math.random() * (max - min) + min)
} 


const cleanupPairs = (socketID) => {


    if(sockets[socketID].chatID) {
        pairs[sockets[socketID].chatID].forEach((item, index) => {
            if(item[0] === socketID) {
                if(pairs[sockets[socketID].chatID].length === 3)
                    pairs[sockets[socketID].chatID] = [pairs[sockets[socketID].chatID][index ? 0 : 1]]
                else pairs[sockets[socketID].chatID] = undefined
            }
        })
    }

}

wss.on("connection", socket => {

    const socketID = randomNumber(100000, 999999)
    const interval = setInterval(() => {        
        socket.send(JSON.stringify(
            {
                "msgType": "yourID",
                "ID": socketID
            }
        ))
    }, 100);
    sockets[socketID] = socket
    
    socket.on("message", data => {
        const parsedData = JSON.parse(`${data}`)

        console.log(parsedData)

        if(parsedData.msgType==="removePeer") {

            cleanupPairs(parsedData.peerID)
    
        }
        
        if(parsedData.chatID && parsedData.msgType === "forceAdd") {
            console.log("THIS RAN")
            const chatID = parsedData.chatID
            sockets[parsedData.senderID].chatID = chatID
            if(pairs[chatID] === undefined) pairs[chatID] = []
            if(pairs[chatID].length < 2) pairs[chatID].push([parsedData.senderID, parsedData])
            if(pairs[chatID].length === 2) {
                
                pairs[chatID].forEach((item, index) => {
                    sockets[item[0]].send(JSON.stringify(
                        pairs[chatID][index ? 0 : 1][1]
                    ))
                })
                
                pairs[chatID].push(true)
            }   
            console.log(pairs)
        }

        if(parsedData.msgType === "MYID_RECEIVED" && parsedData.senderID === socketID) {
            clearInterval(interval)
        }
        if(parsedData.peerID && sockets[parsedData.peerID]) {
                if(parsedData.senderID !== undefined && parsedData.senderID !== socketID) return
                sockets[parsedData.peerID].send(`${data}`)
        }
    })

    socket.on("close", () => {
        console.log(socketID + "disconnected")

        cleanupPairs(socketID)


        delete sockets[socketID] 
        Object.keys(sockets).forEach(key => {
            const val = sockets[key]
            val.send(JSON.stringify({
                "msgType": "disconnect",
                "ID": socketID
            }))
        })
   })
}) 

