CREATE TABLE real_estate_properties (
    property_id          INT PRIMARY KEY,
    address              VARCHAR(255),
    apartment            VARCHAR(50),
    city                 VARCHAR(100),
    state                VARCHAR(100),
    latitude             DOUBLE PRECISION,
    longitude            DOUBLE PRECISION,
    postcode             VARCHAR(20),
    price                DOUBLE PRECISION,
    bedroom_number       DOUBLE PRECISION,
    bathroom_number      DOUBLE PRECISION,
    price_per_unit       DOUBLE PRECISION,
    living_space         DOUBLE PRECISION,
    land_space           DOUBLE PRECISION,
    land_space_unit      VARCHAR(50),
    broker_id            DOUBLE PRECISION,
    year_build           DOUBLE PRECISION,
    listing_age          INT
);
select * from real_estate_properties