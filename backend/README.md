# Overview
Backend folder for our data analytics website

# Quickstart
Create the development database and populate it with a couple values:

``npm run init-dev``
If you get an error after running the previous command, then you likely already have database at database/data.db.

Start the server:

``npm run start``

# How To

## Running Python Microservices

Our microservices uses the flask python library. Make sure you already have python installed. Next, install flask:  
``pip install flask``

To run start the server, run:  
``flask --app microservices run -p 5000``
