const { Pool } = require('pg')
require('dotenv').config()

// gcp sql
module.exports = new Pool({
  user: process.env.GCP_POSTGRES_USER,
  database: process.env.GCP_POSTGRES_DB,
  password: process.env.GCP_POSTGRES_PASS,
  host: process.env.GCP_POSTGRES_HOST,
  port: process.env.GCP_POSTGRES_PORT,
})
