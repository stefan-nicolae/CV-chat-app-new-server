const WebSocket = require('ws')
const port = process.env.PORT || 8082
const wss = new WebSocket.Server({port: port})
const sockets = {}

function randomNumber(min, max) { 
    return Math.floor(Math.random() * (max - min) + min)
} 

wss.on("connection", socket => {
    const socketID = randomNumber(100000, 999999)
    console.log(socketID + "connected")
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
        // console.log(Object.keys(sockets))
        const parsedData = JSON.parse(`${data}`)
        if(parsedData.msgType === "MYID_RECEIVED" && parsedData.senderID === socketID) {
            clearInterval(interval)
        }
        if(parsedData.peerID && sockets[parsedData.peerID]) {
                if(parsedData.senderID !== undefined && parsedData.senderID !== socketID) return
                sockets[parsedData.peerID].send(`${data}`)
        }
    })

    socket.on("close", () => {
        console.log("client closed")
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

