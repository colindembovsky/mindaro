const request = require('supertest');
const assert = require('assert');
const {router, connectToMongoServer, closeMongoServer} = require("../app");
const express = require('express');

const app = new express();
app.use('/', router);
const agent = request.agent(app);

beforeAll((done) => {
    connectToMongoServer(function(e, d) {
        console.log("Connected to db");
        done();
    });
});
afterAll(() => closeMongoServer());

describe('Test Handlers', function () {

    test('responds to /hello', (done) => {
        agent.get('/hello')
            .expect(200)
            .then(response => {
                assert.equal(response.text, 'hello!\n');
                done();
            })
            .catch(err => done(err));
    });

    test('/api/allbikes is correct', (done) => {
        agent.get('/api/allbikes')
            .expect(200)
            .then(response => {
                assert.equal(response.body.length, 3);
                done();
            })
            .catch(err => {
                done(err)
            });
    });
});