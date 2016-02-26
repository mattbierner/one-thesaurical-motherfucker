"use strict";

const thesauric = require('./thesauric');
const bodyParser = require('body-parser')
const express = require('express');

const PORT = 3000;

const MAX_LENGTH = 10000;


var app = express();
app.use(bodyParser.json())

app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    next();
});

app.post('/api/text', (req, res) => {
    const body = req.body;
    if (!body || !body.text)
        return res.send({
            error: "No text entry provided"
        });

    if (body.text.length > MAX_LENGTH)
        return res.send({
            error: "Too much text provided"
        });

    thesauric.text(body.text)
        .then(result =>
            res.send({
                text: result
            }))
        .catch(err =>
            res.send({
                error: '' + err
            }));
});

app.post('/api/tokens', (req, res) => {
    const body = req.body;
    if (!body || !body.tokens)
        return res.send({
            error: "No tokens provided"
        });

    if (body.tokens.length > MAX_LENGTH)
        return res.send({
            error: "Too many tokens provided"
        });

    thesauric.tokens(body.tokens)
        .then(result =>
            res.send({
                tokens: result
            }))
        .catch(err =>
            res.send({
                error: '' + err
            }));
});

app.listen(PORT, () => {
    console.log('Example app listening on port ' + PORT);
});
