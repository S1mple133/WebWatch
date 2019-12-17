var request = require('request');

var myJSONObject = { url: "https://google.com" };
request({
    url: "http://localhost/api/test",
    method: "POST",
    json: true,   // <--Very important!!!
    body: myJSONObject
}, function (error, response, body){
    console.log(error);
});