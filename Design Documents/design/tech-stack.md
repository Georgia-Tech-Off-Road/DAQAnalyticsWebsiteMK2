# Frontend
The frontend portion of the website will be handled by Next.js (React based framework). See [decisions/frontend.md](../decisions/frontend.md) for rationale.

# Backend
The backend portion of the framework will be handeled by Express.js See [decisions/backend](../decisions/backend.md).md for rationale.

# Python Microservices
DAQ already has a robust collection of python functions for data processing implemented in our local DAQ program. To work with this existing code, we will use Flask to expose API endpoints to call these functions.

# Data Receiver Server
This server will be built in C++ as that is the language of the [CMBTL](https://github.com/Georgia-Tech-Off-Road/CommboardTransmissionLibrary) library. Its purpose is to receive data from the vehicle, decode it, and then transmit it to our backend.


# Filesystem
We wil store our data locally (including resolutions, modifications, etc.) locally in our local server filesystem. Metadata for the files will be stored locally initially, but the plan is to migrate metadata to an sqlite server in the long run.

# Onboard DAQ
It the responsability of our onboard DAQ system to maintain current sensor state, coordinate with and send data to the Data Receiver Server.
