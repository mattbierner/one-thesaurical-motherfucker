"use strict";
const thesauric = require('../thesauric');
const longest = thesauric.selectLongest;

const chai = require('chai');
const expect = chai.expect;

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


describe('text', () => {
    const id = x => [x];
    
    it('should perform no mappings for identity dict', () => {
        return Promise.all([
            expect(thesauric.text('', id, longest)).to.eventually.equal(''),
            expect(thesauric.text('aaa', id, longest)).to.eventually.equal('aaa'),
            expect(thesauric.text('aaa bbb', id, longest)).to.eventually.equal('aaa bbb'),
            expect(thesauric.text('good bad', id, longest)).to.eventually.equal('good bad')
        ]);
    });
    
    it('should map tokens', () => {
        const dup = x => [x + x];
        return Promise.all([
            expect(thesauric.text('aaa', dup, longest)).to.eventually.equal('aaaaaa'),
            expect(thesauric.text('aaa bbb', dup, longest)).to.eventually.equal('aaaaaa bbbbbb'),
            expect(thesauric.text('good bad', dup, longest)).to.eventually.equal('goodgood badbad')
        ]);
    });
});
