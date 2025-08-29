# ID-Back-Front-Project-Template

Welcome to the project! This document is your guide to understanding, running, and contributing to this application. Please read it carefully to ensure a smooth development process.

## **🏛️ Core Philosophy & Architecture**

This project is built with maintainability, scalability, and best practices in mind. We adhere to principles like **SOLID** to ensure our code is understandable, flexible, and robust.

Our goal is to follow a **Hexagonal Architecture** (also known as Ports and Adapters). Here's what that means for you in simple terms:

- **The Core Logic is Independent:** The heart of our application (the business rules, found in the /src/services directory) has no knowledge of the outside world. It doesn't know about our database, any external APIs, or even that it's being accessed via HTTP. It's pure, testable logic.


- **Ports are the Gates:** The core logic defines "ports" (interfaces or abstract classes) through which it communicates.

- **Adapters are the Plugs:** We connect "adapters" to these ports to interact with the outside world.

* An **HTTP Controller** (/src/controllers) is an adapter that translates an incoming web request into a call to our core logic.

* A **Database Connector** (/src/connectors) is an adapter that implements how our core logic talks to a specific database like PostgreSQL.

This approach is reflected in both our Node.js server structure and our Docker setup. The docker-compose.yml file treats the database and the server as separate, swappable components (adapters), while the Node.js code in the src folder keeps business logic (services) cleanly separated from the delivery mechanism (routes, controllers).


## **🚀 Getting Started**

### **Prerequisites**

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (LTS version recommended)

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose


### **1. Configuration: The .env File**

All configuration for this project is managed through environment variables. The single source of truth for local development is the .env file.

1. **Create your own .env file:** Copy the example file to create your local configuration.\
   cp .env.example .env

2. **Fill in the values:** Open the new .env file and populate the variables with your specific settings (passwords, ports, etc.).


### **⚠️ The Two (or Three) Golden Rules of Configuration**

This is the most important section. To add a **new** environment variable, you **MUST** update it in three places. If you miss a step, it will not work.

1. **Add it to .env:** Define your new variable in your local .env file (and also add it to .env.example without a value, so other developers know it exists).\
   \# .env\
   MY\_NEW\_VARIABLE=some\_secret\_value

2. **Pass it in docker-compose.yml:** The Docker container is an isolated environment. You must explicitly pass the variable from your .env file to the correct service in the docker-compose.yml file.\
   \# docker-compose.yml\
   services:\
     server:\
       environment:\
         # ... other variables\
         - MY\_NEW\_VARIABLE=${MY\_NEW\_VARIABLE}

3. (For node_server, if necessary) **Add it to the ConfigService:** To maintain architectural purity, **you must never use process.env directly in your application code**. All configuration is managed by a single, reliable service. Add your new variable to the configuration loader in node\_server/src/config/config.ts. This ensures it's properly typed and accessible throughout the app in a controlled way.


## **🏃 Running the Application**

### **Running the full application with Docker**

This is the easiest way to run the entire stack, including the database and any other services.

- **Start all services:**\
  \# This command builds the images if they don't exist and starts the containers.\
  docker-compose up --build

- Clean Restart (Delete all data):\
  If you have "trash" in your database and want a completely fresh start, you must bring the containers down and explicitly remove the volumes.\
  \# This stops containers, removes them, and DELETES associated volumes (like your DB data).\
  docker-compose down -v

- **Stop the services:**\
  \# This stops the containers but preserves the data in the volumes.\
  docker-compose down

- Run only specific services:\
  If you don't need all the services (e.g., you don't need the database), you can simply comment out or delete that service's entry in the docker-compose.yml file before running docker-compose up. If you only want to run one container you can do
  \# This only runs you postgres container (db_postgres).\
  docker-compose up --build db_postgres

### **Running Node.js Server Locally (For focused backend development)**

This is useful when you are actively working on the Node.js server and want faster feedback.

1. **Install dependencies:**\
   cd node\_server\
   npm install

2. Run in Development Mode:\
   This uses nodemon to watch for file changes and automatically restart the server. This is what you'll use 99% of the time.\
   npm run dev

3. Build for Production:\
   This compiles your TypeScript code into plain JavaScript in the /build directory.\
   npm run build

4. Start in Production Mode:\
   This runs the compiled JavaScript code from the /build directory. It's faster but does not auto-reload.\
   npm run start


## **🛠️ Development Workflow & Best Practices**

### **📚 API Documentation (Swagger) for Node.js Server**

We use Swagger for dynamic API documentation. It is not optional.

- **Location:** All Swagger documentation is written in YAML files located in node\_server/src/docs/.

- **The Rule:** If you add or modify an API endpoint in the /routes directory, you **MUST** update the corresponding documentation in the /docs directory.

- **New Endpoint Groups:** If you create a new group of related endpoints (e.g., for "Products"), create a new corresponding documentation file (e.g., productDocs.yaml) inside node\_server/src/docs/ and ensure it's loaded by the Swagger config.


### **🧪 Testing is Mandatory**

**There is no exception to this rule.**

- **All new code requires tests.** This includes bug fixes, new features, and refactors. A ticket or Jira story is not "done" until it is accompanied by meaningful tests.

- **Even if a ticket doesn't ask for tests, you are required to write them.** This is a core part of our definition of quality.

- **Provide Evidence:** When you complete a task, you must attach evidence of your new developed feature, bug, etc, to the Jira ticket. This proves your changes work as expected and are protected against future regressions.

Happy coding!
