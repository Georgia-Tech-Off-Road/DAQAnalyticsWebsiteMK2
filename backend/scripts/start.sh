cross-env \
DATABASE_PATH=database/data.db \
MICROSERVICES_URL=http://127.0.0.1:5000 \
SESSION_SECRET="hello world" \
SAML_ENTRY_POINT="placeholder" \
SAML_CERT_PATH="sp-cert.pem" \
node index.js &
flask --app microservices/microservices run -p 5000
