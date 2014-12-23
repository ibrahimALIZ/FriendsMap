CREATE TABLE follow_request (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  uuid1 VARCHAR(100),
  uuid2 VARCHAR(100),
  status tinyint(100),
  created TIMESTAMP DEFAULT NOW(),
  CONSTRAINT uc_uuid_rel UNIQUE (uuid1, uuid2)
);

CREATE TABLE current_position (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  uuid VARCHAR(100) unique,
  latitude VARCHAR(100),
  longitude VARCHAR(100),
  created TIMESTAMP DEFAULT NOW()
);

CREATE TABLE kuser (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  userid VARCHAR(100) unique,
  uuid VARCHAR(100),
  msisdn VARCHAR(100),
  email VARCHAR(100),
  password VARCHAR(100),
  created TIMESTAMP DEFAULT NOW()
);

CREATE TABLE follow_request(
id INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
userid1 VARCHAR( 100 ) ,
userid2 VARCHAR( 100 ) ,
created TIMESTAMP DEFAULT NOW( )
);

CREATE TABLE follower(
id INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
uuid1 VARCHAR( 100 ) ,
uuid2 VARCHAR( 100 ) ,
created TIMESTAMP DEFAULT NOW( )
);

CREATE TABLE position_history(
id INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
position_id INT,
uuid VARCHAR( 100 ) ,
latitude VARCHAR( 100 ) ,
longitude VARCHAR( 100 ) ,
created TIMESTAMP
);