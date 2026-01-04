python database/manage.py migrate database/migrations/ database/data.db &&
cross-env \
DATABASE_PATH=database/data.db \
node scripts/init-dev.js \
echo "Populated development database!"
