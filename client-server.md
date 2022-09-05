```json
{
    "msgType":"addPeer",
    "peerID":"123123",
    "requestID (optional)":"123123"
}
```
```json
{
    "msgType":"removePeer",
    "peerID":"123123",
}
```
```json
{
    "msgType":"textMessage",

    "message":message,

    "peerID":"123123",
    "requestID": "123123"
}
```
```json
{
    "msgType":"fileMessage",

    "file": file,
    "peerID":"123123",
    "requestID": "123123"
}
```
```json
{
    "msgType": "requestSucceeded",
    "peerID": "123123",
    "requestID": "123123"
}
```
```json
{
    "msgType": "blocked",
    "peerID": "123123"
}   
```

