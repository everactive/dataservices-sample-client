BEGIN;

CREATE TABLE IF NOT EXISTS public.sensor_readings (
    sensor_mac_address macaddr8 NOT NULL,
    ts timestamp with time zone NOT NULL,
    gateway_serial text NOT NULL,
    schema text NOT NULL,
    schema_version text NOT NULL,
    reading jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.sensor_readings
    DROP CONSTRAINT IF EXISTS sensor_readings_pkey;
ALTER TABLE public.sensor_readings
    ADD CONSTRAINT sensor_readings_pkey PRIMARY KEY (sensor_mac_address, ts, gateway_serial);

CREATE INDEX IF NOT EXISTS sensor_readings_ts_idx ON public.sensor_readings USING btree (ts DESC);

DO $$ BEGIN
    PERFORM public.create_hypertable('public.sensor_readings', 'ts', if_not_exists => true);
END $$;

CREATE TABLE IF NOT EXISTS public.gateway_status (
    ts timestamp with time zone NOT NULL,
    gateway_serial text NOT NULL,
    schema text NOT NULL,
    reading jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.gateway_status
    DROP CONSTRAINT IF EXISTS gateway_status_pkey;
ALTER TABLE public.gateway_status
    ADD CONSTRAINT gateway_status_pkey PRIMARY KEY (ts, gateway_serial);

CREATE INDEX IF NOT EXISTS gateway_status_ts_idx ON public.gateway_status USING btree (ts DESC);

DO $$ BEGIN
    PERFORM public.create_hypertable('public.gateway_status', 'ts', if_not_exists => true);
END $$;

COMMIT;