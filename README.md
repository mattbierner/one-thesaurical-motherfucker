<div align="center" >
    <img src="https://raw.githubusercontent.com/mattbierner/one-thesaurical-motherfucker/master/documentation/logo.png" alt="One Thesaurical Motherfucker" />
</div>


## Api
You are free to use the Api, but don't be a jerk. I can't guarantee it's availability or uptime, so you are probably better off hosting the server yourself. Any simple Node host will do.

Api hosted at `http://one-thesaurical-motherfucker.azurewebsites.net`

#### `/api/tokens`
Translate a set of tokens.

**Request**
```js
http://one-thesaurical-motherfucker.azurewebsites.net/api/tokens
{
    'tokens': [
        { 'token': 'Call', 'id': 0 },
        { 'token': 'me', 'id': 1 },
        { 'token': 'Ishmael', 'id': 2 },
        { 'token': '.', 'id': 3 },
        ...
    ],
    OPTIONS
}
```

- `tokens` - Array of between zero and 2000 tokens. Each token is either a `string` or an object with a `token` property. If you use an object, you can also pass an optional `id` property that will be returned on the result tokens. An `id` is not required and not used internally for translation.

See below for explanation of options.

**Response**
```js
{
    'tokens': [
        { 'token': 'Call', 'synonym': 'Compulsory military service', 'id': 0 },
        { 'token': 'me', 'id': 1 },
        { 'token': 'Ishmael', 'synonym': 'Unacceptable person', 'id': 2 },
        { 'token': '.', 'id': 3 },
        ...
    ]
}
```

All input tokens are returned as part of the response, but only translated tokens will have the `synonym` property.

**Errors**
- `Invalid mode`
- `Too many tokens`


#### `/api/text`
Translate some text, using the internal tokenizer. 

**Request**
```js
http://one-thesaurical-motherfucker.azurewebsites.net/api/text
{
    'text': "Call me Ishmael.",
    OPTIONS
}
```

- `text` - string of between zero and 30000 characters. 

See below for explanation of options.

**Response**
```js
{
    'tokens': [
        { 'token': 'Call', 'synonym': 'Compulsory military service' },
        { 'token': 'me' },
        { 'token': 'Ishmael', 'synonym': 'Unacceptable person' },
        { 'token': '.' },
        ...
    ]
}
```

**Errors**
- `Invalid mode`
- `Too much text`


### Options

#### `'mode'`
What translation method should be used. Choices are:

- `'longest'` - Always choose the longest word.
- `'random'` - Choose a random word.

#### `'whole_words'`
Should only whole words be returned? 
