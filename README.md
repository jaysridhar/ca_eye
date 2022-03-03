## TheEye Django Application

The application is a Django application which uses a MySQL database
for storing the events. The events are stored in a background worker
based on Celery with a RabbitMQ server. The storage routine dispatches
the event to the Celery worker and returns a response immediately to
the client. This helps the application handle many clients
simultaneously.

I also have implemented a python client for logging events. Also
included in the application is a front-end dashboard application which
helps the admin team manage the events, search through them and also
delete events.

Only trusted clients can log events. Trust is established through
Token authentication which is generated per registered user. Tokens
can be generated through the Django admin interface at `/admin`. (Due
to insufficient time, I did not implement token generation in the
dashboard application).

Validation of events by category is implemented in the Celery task
file `tasks.py`. I have added stubs for these since information about
what constitutes a valid event is missing. The application does,
however, check for invalid timestamps in the future and marks it as
such. This can be viewed from the dashboard.

The whole thing took me about 6 hours, but I have made the application
as thorough as I can. Due to running out of time, I could not finish
an AWS Cloudformation stack description.

## Django Template

I have used a Django template that I have prepared myself. I use this
template in most projects that I start from scratch. It provides the
following features.

* Uses a MySQL database as the backend instead of the default SQLite
  that Django uses. A real-world application typically needs a robust
  SQL database, and MySQL and Postgres both fulfil this requirement.

* I use a login page for the website root since authentication is
  usually a requirement.

* I load database credentials and other sensitive data required by the
  application via a `.env` file in the root of the
  application. Embedding such credentials within `settings.py` as is
  typically done is not acceptable for a real world application. Also,
  when these applications are shipped, they are configured to run as a
  user with `/sbin/nologin` as shell so login to the account running
  the application is disabled. The `.env` file is owned by this user
  and is readable only by that user (and `root` of course).

## Install pre-requisites

The application requires MySQL and RabbitMQ server. Install them (on
Ubuntu):

```shell
apt install mysql-server rabbitmq-server
```

## Running the application

The application has been configured to use a MySQL database. Setting
up the database is done using the SQL script `eye.sql` in the root of
the project (shown here):

```sql
create database eye;
create user 'eyeuser'@'%' identified with mysql_native_password by 'eye1234';
grant all privileges on eye.* to 'eyeuser'@'%';
```

Create a virtual environment and set it up using the following
commands.

```shell
virtualenv venv
. venv/bin/activate
pip install -r requirements.txt
```

Change directory to the `djangoapp` directory and run the
migrations. Create a super user by following the prompts.

```shell
cd djangoapp
python manage.py migrate
python manage.py createsuperuser
```

Start the server. This runs the server in development mode on port
8000 on the local machine.

```shell
python manage.py runserver
```

Start the celery worker as follows. A `Makefile` is included for
convenience.

```shell
make runcelery
```

Build the front-end application. It uses `npm` and `rollup`.

```shell
cd eye/rollup
npm install
make watch
```

## Serving the application

To serve the application, you can setup an NGINX server as follows:

```shell
apt install nginx
```

Replace `/etc/nginx/sites-available/default` with the following: This
assumes that the application has been installed at
`/opt/theeye/djangoapp`. This directory should contain the `assets`
directory.

```
server {
        listen 80 default_server;
        listen [::]:80 default_server;
        return 301 https://$host$request_uri;
}

server {
        listen 443 ssl;
        listen [::]:443 ssl ipv6only=on;
        ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
        ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
        ssl_session_cache shared:le_nginx_SSL:10m;
        ssl_session_timeout 1440m;
        ssl_session_tickets off;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;
        ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA";
        ssl_dhparam /etc/nginx/dhparam.pem;
        index index.html;
        server_name _;
        location = /favicon.ico { access_log off; log_not_found off; }
        location /assets { root /opt/theeye/djangoapp/; }
        location / {
                proxy_pass http://127.0.0.1:8000/;
                proxy_set_header X-Forwarded-Host $host;
                proxy_set_header X-Forwarded-Proto $scheme;
        }
}
```

The NGINX server needs an SSL certificate. Create a self-signed
certificate using this command:

```shell
openssl req -new -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -subj '/C=US/ST=NotPresent/L=Springfield/O=Dis/CN=www.example.com
```

Create the required `dhparam.pem` using the following command:

```shell
openssl dhparam -out /etc/nginx/dhparam.pem 2048
```

## The Application

Here are some notes about the application, assumptions, etc.

* I have added stubs for event validation in `tasks.py`. However since
  event validation rules are unknown at this time, the rules are
  empty.

* I have configured the django admin site at `/admin`. I normally
  remove it since the same facilities are provided in the dashboard
  with more validation rules, but for this application, I figured it
  convenient to leave it in.

* I have made arrangements for the queries on `session`, `category`
  and `timestamp` to be fast by adding indexes on these fields, but
  could not test it due to lack of data.
