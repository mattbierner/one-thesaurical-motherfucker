"use strict";
import autoTextOptions from './data';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import * as chroma from 'chroma-js';

const API = "http://one-thesaurical-motherfucker.azurewebsites.net/api/tokens";
const WORD_RE = /(\w[\w'-]*\w)/g;

const MODES = {
    'longest': 'Longest word',
    'random': 'Random word'
};

/**
 * Translate tome text.
 */
const translate = (tokens, mode, whole) =>
    new Promise((resolve, reject) =>
        $.ajax({
            type: "POST",
            url: API,
            contentType: 'application/json',
            data: JSON.stringify({
                tokens: tokens,
                mode: mode,
                whole_words: whole
            }),
            dataType: 'json'
        }).then(resolve, reject));

/**
 * Split text into tokens.
 */
const tokenize = text => {
    const tokens = text.split(WORD_RE);
    return tokens.map((token, i) => ({
        id: i,
        token: token
    }));
};

const translateTextInput = (text, mode, whole) => {
    const tokens = tokenize(text);
    return translate(tokens, mode, whole)
        .then(result => {
            if (result.error)
                throw result.error;
            return result.tokens;
        });
};

const resizeTextArea = () =>
    $('textarea').each(function(x) { 
        $(this).height(0).height($(this).get()[0].scrollHeight);
    });

/**
 * A single token.
 */
class Token extends React.Component {
    constructor() {
        super();
        this.state = { active: false };
    }
    
    getColor(token) {
        if (!token.synonym)
            return 'transparent';
            
        const alpha = this.state.active ? 1.0: 0.4;
        const best = 8;
        const expansion = ((token.synonym.length >= token.token.length) ? token.synonym.length / token.token.length : -token.token.length / token.synonym.length ) / best / 2;
        const ratio = Math.max(0, Math.min(1, 0.5 + expansion));

        const scale = chroma.scale(['red', 'yellow', 'green']);
        return scale(ratio).alpha(alpha).css();
    }
    
    onMouseEnter() {
        this.setState({ active: true });
    }
    
    onMouseLeave() {
        this.setState({ active: false });
    }
    
    render() {
        const token = this.props.token;
        const id = token.id;
        const word = token.synonym || token.token;
        
        if (!token.synonym)
            return <span data-id={id} className={`token token-${id}`}>{word}</span>;
        
        const style = {
            backgroundColor: this.getColor(token)
        };
        return (
            <span data-id={id}
                className={`token token-${id}`}
                style={style}
                onMouseEnter={this.onMouseEnter.bind(this)}
                onMouseLeave={this.onMouseLeave.bind(this)}>{word}&#8203;<div style={{ display: this.state.active ? 'inherit' : 'none' }}className="source"><span className="text" style={style}>{token.token}</span></div></span>
        );
    }
}

/**
 * 
 */
class Site extends React.Component {
    constructor() {
        super();
        this.state = {
            input: '',
            output: [],
            outputCache: { nodes: undefined, length: 0 }
        };
    }
    
    componentWillMount() {
        this.setState({ input: this.props.input || '' });
        if (this.props.choices) {
            const choices = Object.keys(this.props.choices);
            choices[0] && this.onSelectChoice(choices[0]);
        }
         if (this.props.modes) {
            const modes = Object.keys(this.props.modes);
            this.setState({ mode: modes[0] });
        }
    }
    
    componentDidUpdate() {
        resizeTextArea();
    }
    
    translate(text, mode, whole) {
        translateTextInput(text, mode, whole)
            .then(tokens => {
                this.setState({ output: tokens, outputCache: this.getOuputData(tokens) });
            })
            .catch(console.error);
    }
    
    onSubmit() {
        this.translate(this.state.input, this.state.mode, this.state.whole);
    }
    
    onInputChange(e) {
        this.setState({ input: e.target.value });
    }
    
    onSelect(e) {
        this.onSelectChoice(e.target.value);
    }
    
    onSelectChoice(choice) {
        let text = autoTextOptions[choice];
        if (!text)
            return;
        text = text.replace(/\\n/g, '\n');
        this.setState({ input: text });
        this.translate(text, this.state.mode, this.state.whole);
    }
    
    onModeChange(e) {
        this.setState({ mode: e.target.value });
        this.translate(this.state.input, e.target.value, this.state.whole);
    }
    
    onWholeChange(e) {
        const on = e.target.checked;
        this.setState({ whole: on });
        this.translate(this.state.input, this.state.mode, on);
    }
    
    getOuputData(tokens) {
        let outputLength = 0;
        const nodes = tokens.map(token => {
            const word = token.synonym || token.token;
            outputLength += word.length;
            return <Token key={token.id} token={token} />;
        });
        return { nodes: nodes, length: outputLength };
    }
    
    render() {
        const output = this.state.outputCache;
        
        const choices = Object.keys(this.props.choices || {}).map(title => (
            <option key={title} value={title}>{title}</option>
        ));
        
        const modeOptions = Object.keys(this.props.modes || {}).map(title => (
            <option key={title} value={title}>{this.props.modes[title]}</option>
        ));
        
        return (<div>
            <div id="pre-text-choices" >
                <select onChange={this.onSelect.bind(this)}>{choices}</select>
            </div>
            <div id="ouput-container" className="container-fluid">
                <div id="results" className="row">
                    <div id="input-container" className="col-lg-6">
                        <header className="result-header">
                            <h1>Input</h1>
                            <h2 className="length">{this.state.input.length}</h2>
                        </header>
                        
                        <textarea id="input" onChange={this.onInputChange.bind(this)} value={this.state.input} />
                        
                        <div id="submit-group">
                            <span>Whole words: <input type="checkbox" onChange={this.onWholeChange.bind(this)} /></span>
                            <select onChange={this.onModeChange.bind(this)}>{modeOptions}</select>
                            <button onClick={this.onSubmit.bind(this)}>Submit</button>
                        </div>
                    </div>
                    <div id="result-output" className="col-lg-6">
                        <header className="result-header">
                            <h1>Output</h1>
                            <h2 className="length">{output.length}</h2>
                        </header>
                        <pre className="tokens">{output.nodes}</pre>
                    </div>
                </div>
            </div>
        </div>);
    }
};


$(() => {
  //  $("textarea").on('input propertychange paste change', resizeTextArea);
    
   $(window).resize(resizeTextArea);
    
   resizeTextArea();
});


ReactDOM.render(
    <Site choices={autoTextOptions} modes={MODES} />,
    document.getElementById('target'));