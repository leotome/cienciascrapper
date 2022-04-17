const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended : true }));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`The server is running on ${PORT}`);
})

app.use(express.static("public_html"));

const test = require('./models/definicao_mapeamento');
test.cRud_getFullMapeamento()
.then(res => console.log(res));