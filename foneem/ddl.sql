begin;

----------------------------------------------------------

--
-- Table structure for table `recipient`
--

-- DROP TABLE IF EXISTS recipient;
CREATE TABLE IF NOT EXISTS recipient (
  recnum serial primary key,
  "name" varchar(128) DEFAULT NULL,
  email varchar(128) NOT NULL,
  sex varchar(8) NOT NULL,
  diagnosis varchar(64) NOT NULL,
  ability varchar(64) NOT NULL
);

--
-- Table structure for table `form_data`
--

-- DROP TABLE IF EXISTS form_data;
CREATE TABLE IF NOT EXISTS form_data (
  recnum serial primary key,
  "name" varchar(128) DEFAULT NULL,
  email varchar(128) NOT NULL,
  phone varchar(16) DEFAULT NULL,
  "comment" text,
  role varchar(64) NOT NULL,
  d int NOT NULL DEFAULT '0',
  p int NOT NULL DEFAULT '0',
  s int NOT NULL DEFAULT '0',
  f int NOT NULL DEFAULT '0',
  o int NOT NULL DEFAULT '0',
  batchmail int NOT NULL DEFAULT '0',
  primary_language varchar(128) DEFAULT NULL,
  other_language varchar(128) DEFAULT NULL,
  age varchar(4) DEFAULT NULL,
  state_province varchar(128) DEFAULT NULL
);


create table if not exists sentences(
    id serial primary key,
    filename varchar(80),
    sentence text,
    phonetic text,
    phonemes text,
    flag varchar(80),
    creation timestamp default current_timestamp
);

create table if not exists phonemes(
   id serial primary key,
   symbol char(2)
);

create table if not exists sentence_phoneme(
    sentence_id int references sentences(id),
    phoneme_id int references phonemes(id)
);

create table if not exists sentence_ordering(
   id serial primary key,
   sentence_id int references sentences(id)
);

create table if not exists users(
    id serial primary key,
    "name" varchar(80),
    email text,
    creation_time timestamp default current_timestamp
);    

create table if not exists address (
   id serial primary key,
   user_id int references users(id),
   address varchar(80),
   state varchar(80),
   postal_code varchar(10),
   country varchar(80) 
);

create table user_sentence(
    user_id int references users(id),
    next_sentence int references sentences(id)
);

commit;                