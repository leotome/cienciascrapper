const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : true }));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`The server is running on ${PORT}`);
})

app.use(express.static("public_html"));

const cienciaID = 'BD1A-1C89-616D';
const test = require('./controllers/scrape_cienciavitae');
test.doScrapeVitae(cienciaID);

