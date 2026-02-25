#!/bin/bash

# Note: this script requires environment variables to be properly set beforehand, suggested to use systemd
NODE_PATH=/home/ec2-user/.nvm/versions/node/v22.22.0/bin/node
FLASK_PATH=/home/ec2-user/.local/bin/flask
NGINX_PATH=/usr/sbin/nginx
$NGINX_PATH -c daq.conf
$NODE_PATH index.js &
$FLASK_PATH --app microservices/microservices.py run -p 5000
