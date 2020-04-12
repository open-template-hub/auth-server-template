CREATE TABLE IF NOT EXISTS users
(
  username text NOT NULL PRIMARY KEY, 
  password text NOT NULL,
  email text NOT NULL, 
  verified boolean, 
  role text
);

CREATE TABLE IF NOT EXISTS tokens
(
  token text NOT NULL, 
  expire_date date
);