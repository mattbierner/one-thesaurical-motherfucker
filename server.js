"use strict";
const thesauric = require('./thesauric');
const bodyParser = require('body-parser')
const express = require('express');
const process = require('process');

const PORT = process.env.PORT || 3000;

const MAX_LENGTH = 10000;
const MAX_TOKENS_LENGTH = 2000;
 
const DEFAULT_MODE = 'longest';

const MODES = {
    longest: thesauric.selectLongest,
    random: thesauric.selectRandom
};

var app = express();
app.use(bodyParser.json({ limit: '2mb' }));

app.all('/*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    next();
});

/**
 * Get the translation function.
 */
const getMode = mode => {
    if (!mode || typeof mode !== 'string')
        return null;
    return MODES[mode];
};

app.post('/api/text', (req, res) => {
    const body = req.body;
    if (!body || !body.text)
        return res.send({
            error: "No text provided"
        });

    if (body.text.length > MAX_LENGTH)
        return res.send({
            error: "Too much text provided"
        });

    const mode = getMode(body.mode || DEFAULT_MODE);
    if (!mode)
        return res.send({
            error: "Invalid mode"
        });

    thesauric.text(body.text, mode, body)
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
    if (!body || !body.tokens || !Array.isArray(body.tokens))
        return res.send({
            error: "No tokens provided"
        });

    if (body.tokens.length > MAX_TOKENS_LENGTH)
        return res.send({
            error: "Too many tokens provided"
        });
    
    const mode = getMode(body.mode || DEFAULT_MODE);
    if (!mode)
        return res.send({
            error: "Invalid mode"
        });

    thesauric.tokens(body.tokens, mode, body)
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
    console.log('One thesaurical motherfucker electronic surveillance on cast of countenance: ' + PORT);
});
