const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_store_db"
);
const createTables = async () => {
  await client.query(`drop table if exists favorites`);
  await client.query(`drop table if exists users`);
  await client.query(`drop table if exists products`);
  await client.query(`
        create table users(
            id uuid primary key,
            username varchar(50) unique not null,
            password varchar(255) not null);
    `);
  await client.query(`
        create table products(
          id uuid primary key,
          name varchar(50) not null);
    `);

  await client.query(`
        create table favorites(
          id uuid primary key,
          product_id uuid references products(id) not null,
          user_id uuid references users(id) not null,
          constraint unique_favorites unique(product_id, user_id));
    `);
};
const createProduct = async ({ name }) => {
  const response = await client.query(
    `insert into products(id, name) values($1, $2) returning id, name`,
    [uuid.v4(), name]
  );
  return response.rows[0];
};
const createUser = async ({ username, password }) => {
  const hash = await bcrypt.hash(password, 2);
  const response = await client.query(
    `insert into users(id, username, password) values($1, $2, $3) returning id, username, password`,
    [uuid.v4(), username, hash]
  );
  return response.rows[0];
};
const fetchUsers = async () => {
  const response = await client.query(
    `select id, username, password from users`
  );
  return response.rows;
};
const fetchProducts = async () => {
  const response = await client.query(`select id, name from products`);
  return response.rows;
};
const createFavorite = async ({ user_id, product_id }) => {
  const response = await client.query(
    `
      insert into favorites(id, user_id, product_id)
      values($1, $2, $3) returning id, user_id, product_id
    `,
    [uuid.v4(), user_id, product_id]
  );
  return response.rows[0];
};
const fetchFavorites = async ({ user_id }) => {
  const response = await client.query(`select id, user_id, product_id from favorites where user_id=$1`, [ user_id ]);
  return response.rows;
};
const destroyFavorite = async ({ id, user_id }) => {
  const response = await client.query(`delete from favorites where id=$1 and user_id=$2`, [id, user_id]);
  return response;
};
module.exports = {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
