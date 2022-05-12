# Everactive Data Services Example

This repository contains a multi-container docker-compose environment to receive, store and review Eversensor time series readings. It is intended as a tool to for evaluating Everactive's Data Services. As such, this project is not a production ready sample.

The environment has three main componets:

- A [nodejs](https://nodejs.org) application webhook that receives Eversensor readings.
- A [Timescale](https://timescale.com) postgres database to store the Eversensor readings in a time-series hypertable.
- A [Grafana](https://grafana.com) application to provide a dashboard for the time series data.

## Webhook Application

The node webhook application is an [express](https://www.npmjs.com/package/express) application that exposes three endpoints. By default the webhook application uses port 4440. This can be changed in the docker-compose.yml file.

`POST /` - The webhook endpoint. Each Eversensor reading received is stored in the postgres `sensor_readings` table.

`GET /` - Returns the last ten Eversensor readings received.

`GET /health` - Returns a simple 200 status code if the application is running successfully.

To prevent invalid requests to the webhook application, the POST and GET / endpoints require a header `x-api-key` for authorization. The value for this header is set via the `API_KEY` environment variable in the docker-compose.yml file. It is set to `secret_key` by default. All requests to these two endpoints must include the `x-api-key` header with the correct value or a 401 status code will be returned.

When running locally, the webhook is not a secure connection, it is http. The Everactive webhook subscription requires an https connection. To expose the local application and provide a secure connection we recommend using [localtunnel](https://www.npmjs.com/package/localtunnel).

## Timescale Postgres

A Timescale postgres instance is used to store the sensor readings in a Timescale hypertable, `sensor_readings`.

The database exposes port 4441 to connect using a Postgres client. The docker-compose.yml file sets the postgres user / password to postgres / postgres. If modified, the grafana and node database connection values must also be modified.

The table is created when the container is started. The table creation sql can be found in the `./timeseries-db/initdb.d/create_tables.sql` script.

## Grafana

A Grafana dashboard is provided that shows temperature and humidity readings for each sensor the webhook has received at least one reading from.

The dashboard can be viewed by browsing to `http://localhost:4442`. The default username / password when first logging in is admin / admin.

## Using the Sample

To use this sample application you must have [Docker](https://docker.com) installed and Everactive api_credentials to create a webhook.

Steps to use this sample:

- Clone this repository.
- Start the docker environment:
  ```
  docker-compose up -d
  ```
  Note: The webhook runs on port 4440 by default and the grafana application runs on port 4442. These can be changed by editing the docker-compose.yml file.
- Create an https tunnel to the webhook. If you have node installed, we recommend using [localtunnel](https://www.npmjs.com/package/localtunnel) with npx.
  ```
  npx localtunnel --port 4440
  ```
- Register the webhook with Everactive using the following command:

  ```
  curl -v -X POST 'https://api.data.everactive.com/ds/v1/webhooks \
  -H `Authorization: Bearer {{access_token}}' \
  -H 'Content-Type: application/json' \
  -d '{"callbackUrl": "https://[your sample webhook url]", "eventType": "sensor_reading", "enabled": true, "headers": [{"key": "x-api-key", "value": "secret_key"}]}'
  ```

  The webhook should start receiving Eversensor readings within the next few minutes. Each reading is saved in a time series postgres table `sensor_readings`.

- Verify the webhook is receiving data. It can take a few minutes before data is flowing.
  ```
  curl -v -X GET 'http://localhost:4440 \
  -H `x-api-key: secret_key`'
  ```

Once the webhook is registered and receiving data, the Grafana application can be used to view the data. The Grafana application is available at `http://localhost:4442`, the initial login username / password is admin / admin.

A default dashboard is included in the Grafana application. It will show temperature and humidity readings as they are received.
