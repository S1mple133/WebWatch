const express = require('express');
const app = express();

var jsoninstring = '{"websites": [ {"website": "google.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8", "html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "facebook.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8","html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "google.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8", "html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "facebook.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8","html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "google.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8", "html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "facebook.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8","html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "google.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8", "html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "facebook.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8","html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "google.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8", "html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "facebook.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8","html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "google.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8", "html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"},{"website": "facebook.com","hash": "5fd924625f6ab16a19cc9807c7c506ae1813490e4ba675f843d5a10e0baacdb8","html": "https://duckduckgo.com","pdf": "https://duckduckgo.com"}]}';

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.render('saved',{title: 'Saved Websites',websites: JSON.parse(jsoninstring).websites});
});

const server = app.listen(80, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});