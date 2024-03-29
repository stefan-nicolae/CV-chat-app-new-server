const WebSocket = require('ws')
const port = process.env.PORT || 8082
const wss = new WebSocket.Server({port: port})
const sockets = {}
const pairs = {}
const usersInPairs = {}

function randomNumber(min, max) { 
    return Math.floor(Math.random() * (max - min) + min)
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

        if(parsedData.chatID && parsedData.msgType === "forceAdd") { 
            if(!pairs[parsedData.chatID]) pairs[parsedData.chatID] = []
            if(pairs[parsedData.chatID].length !== 2) { 
                if(!pairs[parsedData.chatID].includes(parsedData.senderID)) {
                    pairs[parsedData.chatID].push(parsedData.senderID)
                    usersInPairs[parsedData.senderID] = parsedData
                }
            }
            if(pairs[parsedData.chatID].length === 2) {
                let index = 0
                pairs[parsedData.chatID].forEach(user => {
                    sockets[user].send(JSON.stringify(
                        usersInPairs[pairs[parsedData.chatID][index ? 0 : 1 ]]
                    ))
                    index++
                })
            }
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
        if(usersInPairs[socketID]) {
            if(pairs[usersInPairs[socketID].chatID].length === 1) {
                delete pairs[usersInPairs[socketID].chatID]  
                delete usersInPairs[socketID]
            } 
            else if(usersInPairs[socketID] && pairs[usersInPairs[socketID].chatID].includes(socketID)) {
                let index = 0 
                pairs[usersInPairs[socketID].chatID].forEach((user) => {
                    if(user === socketID) {
                        pairs[usersInPairs[socketID].chatID].splice(index, 1)
                        return
                    }
                    index++
                })
            }
        }

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

