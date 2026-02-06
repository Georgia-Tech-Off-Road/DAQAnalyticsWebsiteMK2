cross-env \
DATABASE_PATH=database/data.db \
MICROSERVICES_URL=http://127.0.0.1:5000 \
node index.js && echo "NodeJS backend started succesfully" &
flask --app microservices/microservices run -p 5000 && echo "Python microservices started sucessfully"
