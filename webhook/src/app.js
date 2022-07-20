/**
* This file defines the webhook that you registered using a POST request to the '/webhooks'
* endpoint. The webhook is running locally, and receives POST requests from Evercloud
* on the specified port whenever a sensor reading is received. 
* 
* The port is specified in the 'docker-compose.yml' configuration file, and is 3001 by default.\
* Communications go through the secure connection you established using localtunnel or ngrok.
*/

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
    insertReading: InsertReading,
    insertGatewayStatus: InsertGatewayStatus,
} = require('./repository');

// Use environment var or create a UUID to act as a "key" to prevent
// unauthorized POST / GET requests. To set to a known value
// start the application with the API_KEY environment variable set.
const secret = process.env.API_KEY || uuidv4();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const values = [];

/**
 * Handler for 'GET webhooks/health' requests from Evercloud
 * Returns a success response if the webhook server is up and running.
 */
app.get('/health', async (req, res) => {
    res.send();
});

/**
 * Handler for 'GET webhooks' requests from Evercloud
 *
 * Returns an array the last ten messages received via the POST / endpoint.
 */
app.get('/', async (req, res) => {
    const reqSecret = req.header('x-api-key');
    if (reqSecret !== secret) {
        res.sendStatus(401);
        return;
    }
    res.send(values);
});

/**
 * Handler for 'POST .../webhooks' requests from Evercloud
 *
 * Stores the body containing reported readings in the ephemeral values array
 * and persists the data to the 'sensor_readings' table in the database.
 */
app.post('/', async (req, res) => {
    const reqSecret = req.header('x-api-key');
    if (reqSecret !== secret) {
        res.sendStatus(401);
        return;
    }

    const doc = req.body;
    console.log(`Received reading: ${JSON.stringify(doc)}`);

    try {
        await InsertReading(doc);
    } catch (e) {
        console.log(`Error while saving record: ${JSON.stringify(e)}`);
        res.sendStatus(400);
        return;
    }

    values.unshift(doc);
    if (values.length > 10) {
        values.length = 10;
    }

    res.sendStatus(200);
});

/**
 * Handler for 'POST .../webhooks/gateway_status' requests from Evercloud
 *
 * Stores the body containing reported status in the ephemeral values array
 *  and persists the data to the 'gateway_status' table in the database.
 */
app.post('/gateway_status', async (req, res) => {
    const reqSecret = req.header('x-api-key');
    if (reqSecret !== secret) {
        res.sendStatus(401);
        return;
    }

    const payload = req.body;
    console.log(`Received payload: ${JSON.stringify(payload)}`);

    try {
        await InsertGatewayStatus(payload);
    } catch (e) {
        console.log(`Error while saving record: ${JSON.stringify(e)}`);
        res.sendStatus(400);
        return;
    }

    values.unshift(payload);
    if (values.length > 10) {
        values.length = 10;
    }

    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`listening on port ${port}, api-secret: ${secret}`);
});
