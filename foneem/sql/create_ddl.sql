begin;

create table if not exists users(
    id serial primary key,
    email varchar(255) not null unique,
    firstname varchar(80),
    lastname varchar(80),
    dob date,
    gender varchar(10),
    stateprovince varchar(64),
    country varchar(128),
    stateprovince1 varchar(64),
    country1 varchar(128),
    password varchar(1024),
    compendium varchar(1024),
    first_language varchar(64),
    second_language varchar(64),
    voice_sound varchar(64),
    accent varchar(64),

    height_inches varchar(2),
    height_feet varchar(1),
    session_count int not null default 10,
    creation_time timestamp default current_timestamp
);

create table if not exists sentences(
    id serial primary key,
    display_order int,
    filename varchar(80),
    sentence varchar(512),
    phonetic varchar(768),
    phonemes varchar(512),
    flag varchar(80),
    creation timestamp default current_timestamp
);

create table if not exists phonemes(
   id serial primary key,
   symbol char(2)
);

create table if not exists sessions(
   id serial primary key,
   calibrated_rms_value real,
   creation_time timestamp default current_timestamp
);

create table if not exists grid (
   id serial primary key,
   css_id varchar(5)
);

create table if not exists sentence_phoneme(
    sentence_id int references sentences(id),
    phoneme_id int references phonemes(id)
);

create table if not exists user_sentence_session(
    user_id int references users(id),
    sentence_id int references sentences(id),
    session_id int references sessions(id),
    loudness real,
    rms_value real,
    uri varchar(1024),
    creation_time timestamp default current_timestamp
);

create table if not exists phoneme_grid(
    phoneme_id int references phonemes(id),
    grid_id int references grid(id)
);

create table if not exists user_grid_opacity(
    user_id int references users(id),
    grid_id int references grid(id),
    opacity real,
    increments int,
    instances int
);

CREATE TABLE IF NOT EXISTS recipient (
  recnum serial primary key,
  "name" varchar(128) DEFAULT NULL,
  email varchar(128) NOT NULL,
  sex varchar(8) NOT NULL,
  diagnosis varchar(64) NOT NULL,
  ability varchar(64) NOT NULL
);

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
  age varchar(128) DEFAULT NULL,
  state_province varchar(128) DEFAULT NULL
);

commit;                