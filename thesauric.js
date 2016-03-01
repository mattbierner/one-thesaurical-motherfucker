"use strict";

const async = require('async');
const pos = require('pos');
const mapCase = require('map-case');
const moby = require('moby');
const _ = require('lodash');

const WORD_RE = /(\w[\w'-]*\w)/g;

const goodTags = [
    'NN', // noun
    'NNS', // noun plural
    'JJ', // adjective
    'JJR', // adj, comparative
    'JJS', // adj, superlative
    'VB', // verb
    'VBD', // verb past
    'VBG', // verb gerund
    'VBN', // verb past part
    'VBP', // verb present
    'VBZ', // verb present
];

const isUppercase = x =>
    x && x[0].toUpperCase() === x[0] && x[0].toUpperCase() !== x[0].toLowerCase();

const mobyLookup = word =>
    moby.search(word);

const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; --i) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
};

const getSynonyms = (search, word) => {
    const lookups = search(word)
    lookups.push(word);
    return lookups
        .filter((word, pos, arr) => arr.indexOf(word) === pos);
};

const thesurusizeWord = (search, word, selector) => {
    const lookups = getSynonyms(search, word.toLowerCase());
    let pick = selector(lookups);
    pick = mapCase.upper(word, pick);
    return pick;
};

const tagger = new pos.Tagger();

/**
 * 
 */
const synonymResponse = (token, synonym) => {
    const response = { token: token.token };
    const id = token.id;
    if (typeof id === 'number' || typeof id === 'string')
        response.id = id;
    if (synonym && synonym != token.token)
        response.synonym = synonym;
    return response;
};

/**
 * Filter the source to only include whole words.
 */
const wholeWordsOnly = source =>
    word => {
        const results = source(word).filter(x => x.match(/^(\w[\w'-]*\w)$/));
        return results.length ? results : [word];
    };

/**
 * Filter the source to exclude proper nouns.
 */
const noProperNouns = source =>
    word => {
        const results = source(word).filter(x => {
            return !(isUppercase(x[0]) && !isUppercase(x[1]));
        });
        return results.length ? results : [word];
    };

/**
 * Filter the source to exclude proper nouns.
 */
const filterOutAcronyms = source =>
    word => {
        const results = source(word).filter(x => ![].every.call(x, isUppercase));
        return results.length ? results : [word];
    };

/**
 * Select the longest `synonym`.
 */
const selectLongest = module.exports.selectLongest = choices =>
    choices.reduce((longest, word) => word.length > longest.length ? word : longest);

/**
 * Select the shortest `synonym`.
 */
const selectShortest = module.exports.selectShortest = choices =>
    choices.reduce((shortest, word) => word.length < shortest.length ? word : shortest);

/**
 * Select a random `synonym`.
 */
const selectRandom = module.exports.selectRandom = choices =>
    shuffle(choices)[0];

/**
 * 
 */
const thesurusizeTokens = module.exports.tokens = (tokens, selector, options) => {
   let search = filterOutAcronyms(mobyLookup);
    
    if (options && options['whole_words']) {
        search = wholeWordsOnly(search);
    }
    
    if (options && options['no_proper_nouns']) {
        search = noProperNouns(search);
    }
    
    tokens = tokens
        .map(x => x && typeof x === 'string' ? { token: x } : x)
        .filter(x => x && typeof x.token === 'string' && x.token.length)
    
    const tokenValues = tokens.map(x => x.token);
    const taggedWords = _.zip(tagger.tag(tokenValues), tokens);
    return new Promise((resolve, reject) =>
        async.map(taggedWords, (pair, callback) => {
            const tagged = pair[0];
            const token = pair[1];
            
            if (!tagged)
                return callback(null, synonymResponse(token, null));
                
            const word = tagged[0];
            const tag = tagged[1];

            if (!word.match(WORD_RE) || goodTags.indexOf(tag) === -1)
                return callback(null, synonymResponse(token, null));

            let newWord = thesurusizeWord(search, word, selector);
            return callback(null, synonymResponse(token, newWord));
        }, (err, results) => {
            if (err)
                return reject(err);
            return resolve(results);
        }));
};

/**
 * 
 */
const thesurusizeText = module.exports.text = (text, selector, options) => {
    const tokens = text.split(WORD_RE).filter(x => x.length);
    return thesurusizeTokens(tokens, selector, options)
        .then(result => result.map(x => x.synonym || x.token).join(''));
};

