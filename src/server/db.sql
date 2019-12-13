ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
Drop database if exists bomberman;
create database bomberman CHARSET 'utf8';
use bomberman;

Create table Users(
	id INT primary key auto_increment,
    username varchar(50) NOT NULL,
    password varchar(100) NOT NULL
);
