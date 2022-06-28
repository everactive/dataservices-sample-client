const { Pool } = require("pg");

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

  const query = `INSERT INTO public.sensor_readings (
        sensor_mac_address,
        ts,
        gateway_serial,
        schema,
        schema_version,
        reading
    ) VALUES (
        $1, $2, $3, $4, $5, $6
    ) ON CONFLICT DO NOTHING`;

  const values = [
    macAddress,
    timestamp,
    serialNumber,
    schema,
    schemaVersion,
    JSON.stringify(reading),
  ];
  
  await pool.query(query, values);
};

var insertGatewayStatus = async function (gatewayStatus) {
  if (!gatewayStatus) {
    return;
  }

  const serial = gatewayStatus.serial;
  const timestamp = new Date(gatewayStatus.timestamp) * 1000;
  const schema = gatewayStatus.schema;

  const query = `INSERT INTO public.gateway_status (
        gateway_serial,
        ts,
        schema,
        payload
    ) VALUES (
        $1, $2, $3, $4
    ) ON CONFLICT DO NOTHING`;

  const values = [
    serial,
    timestamp,
    schema,
    JSON.stringify(gatewayStatus),
  ];

  await pool.query(query, values);
};

module.exports = {
  insertReading: insertReading,
  insertGatewayStatus: insertGatewayStatus,
};
