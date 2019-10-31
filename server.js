let express = require('express');
let app = express();
let server = require('http').createServer(app);
const path = require('path');

app.use('/src', express.static('src'));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/index.html'));
});

server.listen(3000, function(){
    console.log("listening on port 3000...");
});