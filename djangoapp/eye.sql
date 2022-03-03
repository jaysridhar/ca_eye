create database eye;
create user 'eyeuser'@'%' identified with mysql_native_password by 'eye1234';
grant all privileges on eye.* to 'eyeuser'@'%';
