BEGIN;

CREATE TABLE public.sensor_readings (
    sensor_mac_address macaddr8 NOT NULL,
    ts timestamp with time zone NOT NULL,
    gateway_serial text NOT NULL,
    schema text NOT NULL,
    schema_version text NOT NULL,
    reading jsonb,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE ONLY public.sensor_readings
    ADD CONSTRAINT sensor_readings_pkey PRIMARY KEY (sensor_mac_address, ts, gateway_serial);

CREATE INDEX sensor_readings_ts_idx ON public.sensor_readings USING btree (ts DESC);

DO $$ BEGIN
    PERFORM public.create_hypertable('public.sensor_readings', 'ts');
END $$;

COMMIT;