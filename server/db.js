const pg = require('pg');
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const client = new pg.Client( 
    process.env.DATABASE_URL || 'postgres://localhost/the_acme_store_db'
);