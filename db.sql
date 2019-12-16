ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
Drop database if exists bomberman;
create database bomberman CHARSET 'utf8';
use bomberman;

Create table Users(
	id INT primary key auto_increment,
    username varchar(50) NOT NULL,
    password varchar(100) NOT NULL
);

Create table Replays(
	id INT primary key auto_increment,
    jsonData JSON NOT NULL,
    winner varchar(50) NOT NULL,
    replay_date date NOT NULL
);

Create table User_replay(
	user_id INT NOT NULL,
	replay_id INT NOT NULL,
	PRIMARY KEY(user_id, replay_id)
);
