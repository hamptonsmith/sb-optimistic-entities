'use strict';

const fakeMongoDbClientBuilder = require('./fake-mongo-db-client');
const MongoDbClientWrapper = require('./mongo-db-client-wrapper');

const { MongoClient } = require('mongodb');

module.exports = fn => async t => {
    const subtestId = buildSubtestId();

    let dbClient;
    if (process.env.MONGO_CONNECT_STRING) {
        const mongoClient =
                await MongoClient.connect(process.env.MONGO_CONNECT_STRING);

        dbClient = new MongoDbClientWrapper(
                mongoClient.db(`${process.env.TEST_ID}-${subtestId}-db`));
    }
    else {
        dbClient = fakeMongoDbClientBuilder(t.log.bind(t));
    }

    try {
        await fn(t, { dbClient });
    }
    finally {
        await dbClient.dropDatabase();
    }
};

function buildSubtestId() {
    const alpha = 'abcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    while (result.length < 6) {
        result += alpha.charAt(Math.floor(Math.random() * alpha.length));
    }
    return result;
}
