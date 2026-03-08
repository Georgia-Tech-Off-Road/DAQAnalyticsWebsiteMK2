cross-env \
DATABASE_PATH=database/data.db \
MICROSERVICES_URL=http://127.0.0.1:5000 \
SESSION_SECRET="hello world" \
node index.js &
flask --app microservices/microservices run -p 5000
