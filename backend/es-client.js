// es-client.js
const { Client } = require('@elastic/elasticsearch');

const ES_URL = process.env.ES_URL || 'http://localhost:9200';
const ES_USER = process.env.ES_USER || undefined;
const ES_PASS = process.env.ES_PASS || undefined;

const client = new Client({
    node: ES_URL,
    auth: ES_USER && ES_PASS ? { username: ES_USER, password: ES_PASS } : undefined
});

module.exports = client;