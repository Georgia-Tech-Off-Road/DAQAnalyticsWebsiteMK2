python database/manage.py refresh database/migrations/ database/test.db && 
cross-env \
DATABASE_PATH=database/test.db \
MICROSERVICES_URL=http://127.0.0.1:5000 \
LOCAL_STORAGE_PATH=Test-DAQFiles \
jest --verbose --coverage
