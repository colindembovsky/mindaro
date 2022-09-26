const request = require('supertest');
const assert = require('assert');
const {router} = require("../app");
const express = require('express');

const app = new express();
app.use('/', router);

describe('Test Handlers', function () {

    test('responds to /hello', (done) => {
        request(app)
            .get('/hello')
            .expect(200)
            .then(response => {
                assert.equal(response.text, 'hello!\n');
                done();
            })
            .catch(err => done(err));
    });

    test('responds to /hello', (done) => {
        request(app)
            .get('/hello')
            .expect(200)
            .then(response => {
                assert.equal(response.text, 'hello!\n');
                done();
            })
            .catch(err => done(err));
    });
});