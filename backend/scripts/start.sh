cross-env \
DATABASE_PATH=database/data.db \
node index.js && echo "NodeJS backend started succesfully" &
flask --app microservices/microservices run -p 5000 && echo "Python microservices started sucessfully"
