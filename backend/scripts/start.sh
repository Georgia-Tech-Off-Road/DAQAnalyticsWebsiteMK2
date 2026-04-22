cross-env \
DATABASE_PATH=database/data.db \
MICROSERVICES_URL=http://127.0.0.1:5000 \
SESSION_SECRET="hello world" \
SAML_ENTRY_POINT="placeholder" \
SAML_CERT_PATH="sp-cert.pem" \
SAML_PRIVATE_KEY_PATH="sp-key.pem" \
SAML_DECRYPTION_PVK_PATH="sp-key.pem" \
SAML_IDP_METADATA_URL="https://idp.gatech.edu/idp/profile/Metadata/SAML" \
BACKEND_URL="localhost" \
BACKEND_PORT=3000 \
node index.js &
flask --app microservices/microservices run -p 5000
