/* global describe, it */
import {transform} from 'babel-core';
import {expect} from 'chai';
import {minify} from 'uglify-js';
import path from 'path';

// This is a little utility to make it easier to compare code generated;
// Generated code may be syntatically equivalent but not strictly equivalent.
const u = (code)=> minify(code, {fromString: true, mangle: false}).code;

const encapsulateTransformOptions = {
    plugins: [
        path.join(__dirname, '../src/index'),
        ['transform-react-jsx', { pragma: 'j' } ],
    ],
    filename: path.join(__dirname, './fixtures/yayEncapsulation.js'),
    filenameRelative: 'fixtures/yay.js',
};
const jsxOnlyTransformOptions = {
    plugins: [
        ['transform-react-jsx', { pragma: 'j' } ],
    ],
    // For some reason, without filename use strict is disabled... silly babel code plugins
    filename: 'STUPIDNESS',
    filenameRelative: 'DUE TO USE STRICT',
};

describe('encapsulate-jsx', function() {
    const className = 'yayEncapsulation'; // classname derived from filename `yayEncapsulation.js`
    describe('configuration', function() {
        it('excludes files that opt out');
    });
    describe('encapsulation', function() {
        it('can encapsulate a JSX Element with no attributes', function() {
            const code = '<Blue/>';
            const expectedCode = `<Blue className="${className}"/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate nested JSX elements with no attributes', function() {
            const code = '<Blue><Red/></Blue>';
            const expectedCode = `<Blue className="${className}"><Red className="${className}"/></Blue>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a single attribute', function() {
            const code = '<Blue red="no"/>';
            const expectedCode = `<Blue red="no" className="${className}"/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a classname attribute string', function() {
            const code = '<Blue className="no"/>';
            const expectedCode = `<Blue className="no ${className}"/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a classname attribute expression', function() {
            const code = '<Blue className={"blue"}/>';
            const expectedCode = `<Blue className={"blue ${className}"}/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a complex classname attribute expression', function() {
            const code = '<Blue className={yay ? "veryYay" : "boo"}/>';
            const expectedCode = `<Blue className={(yay ? "veryYay" : "boo") + " ${className}"}/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a spread attribute', function() {
            const code = '<Blue {...yay}/>';
            const expectedCode = `<Blue {...yay} className="${className}"/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a spread attribute and a className', function() {
            const code = '<Blue className="red" {...yay}/>';
            const expectedCode = `<Blue className="red ${className}" {...yay}/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('can encapsulate a JSX Element with a spread attribute and a classname inside (sorry, it\`s hacky)', function() {
            const code = '<Blue {...yay} className={yay.className}/>';
            const expectedCode = `<Blue {...yay} className={yay.className + " ${className}"}/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
    });
    describe('ignores a customizeable list of elements', function() {
        it('ignores React.Fragment elements', function() {
            const code = '<React.Fragment/>';
            const expectedCode = `<React.Fragment/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('ignores Fragment elements', function() {
            const code = '<Fragment/>';
            const expectedCode = `<Fragment/>`;
            const compiled = transform(code, encapsulateTransformOptions).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
        it('ignores custom elements', function() {
            const code = '<IgnoreMe/>';
            const expectedCode = `<IgnoreMe/>`;
            const transformWithIgnore = {
                plugins: [
                    [path.join(__dirname, '../src/index'), {
                        ignoredElements: ['IgnoreMe']
                    }],
                    ['transform-react-jsx', { pragma: 'j' } ],
                ],
                filename: path.join(__dirname, './fixtures/yayEncapsulation.js'),
                filenameRelative: 'fixtures/yay.js',
            };
            const compiled = transform(code, transformWithIgnore).code;
            const compiledExpectedCode = transform(expectedCode, jsxOnlyTransformOptions).code;
            expect(u(compiled)).to.equal(u(compiledExpectedCode));
        });
    });
});
