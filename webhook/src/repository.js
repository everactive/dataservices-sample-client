const { Pool } = require('pg');

const pool = new Pool();

var insertReading = async function (reading) {
    if (!reading) {
        return;
    }
    const macAddress = reading.macAddress;
    const timestamp = new Date(reading.timestamp * 1000);
    const serialNumber = reading.gatewaySerialNumber;
    const schema = reading.schema;
    const schemaVersion = reading.schemaVersion;

    const query = `insert into public.sensor_readings (
        sensor_mac_address,
        ts,
        gateway_serial,
        schema,
        schema_version,
        reading
    ) values (
        $1, $2, $3, $4, $5, $6
    )`;
    const values = [macAddress, timestamp, serialNumber, schema, schemaVersion, JSON.stringify(reading)]
    await pool.query(query, values);
}

module.exports = {
    insertReading: insertReading
};