# Frontend

The frontend portion of the website will be handled by Next.js (React based framework). See [decisions/frontend.md](../decisions/frontend.md) for rationale.

# Backend

The backend portion of the framework will be handeled by Express.js See [decisions/backend](../decisions/backend.md).md for rationale.

# Python Microservices

DAQ already has a robust collection of python functions for data processing implemented in our local DAQ program. To work with this existing code, we will use Flask to expose API endpoints to call these functions. These 