python database/manage.py refresh database/migrations/ database/test.db && 
cross-env \
DATABASE_PATH=database/test.db \
jest --verbose --coverage
