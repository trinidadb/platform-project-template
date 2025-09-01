# ID-Back-Front-Project-Template

Welcome to the project! This document is your guide to understanding, running, and contributing to this application. Please read it carefully to ensure a smooth development process.

<!-- TOC start (generated with https://github.com/derlin/bitdowntoc) -->
- [ID-Back-Front-Project-Template](#id-back-front-project-template)
  - [**🏛️ Core Philosophy \& Architecture**](#️-core-philosophy--architecture)
  - [**🚀 Getting Started**](#-getting-started)
    - [**Prerequisites**](#prerequisites)
    - [**The .env File**](#the-env-file)
    - [**⚠️ The Two (or Three) Golden Rules of Configuration**](#️-the-two-or-three-golden-rules-of-configuration)
  - [**🏃 Running the Application**](#-running-the-application)
    - [**Running the Full Application with Docker**](#running-the-full-application-with-docker)
      - [💾 Database Initialization (`init.sql`)](#-database-initialization-initsql)
    - [**Running Node.js Server Locally (For focused backend development)**](#running-nodejs-server-locally-for-focused-backend-development)
    - [**Running the Frontend Locally**](#running-the-frontend-locally)
  - [**🛠️ Development Workflow \& Best Practices**](#️-development-workflow--best-practices)
    - [🏗️ Code Conventions \& Structure for Node.js Server](#️-code-conventions--structure-for-nodejs-server)
    - [**📚 API Documentation (Swagger) for Node.js Server**](#-api-documentation-swagger-for-nodejs-server)
    - [**Frontend: Vue.js Application**](#frontend-vuejs-application)
      - [**🎨 Architecture \& Philosophy**](#-architecture--philosophy)
      - [**📁 Folder Structure**](#-folder-structure)
      - [**📄 Code Conventions**](#-code-conventions)
      - [**📜 Available Scripts**](#-available-scripts)
    - [**🧪 Testing Strategy**](#-testing-strategy)
      - [**Unit vs. Integration Tests**](#unit-vs-integration-tests)
      - [**Node.js Server Testing**](#nodejs-server-testing)
      - [Jest Configuration Strategy](#jest-configuration-strategy)
      - [The `setup.ts` Script](#the-setupts-script)
      - [Naming Convention and Redundancy](#naming-convention-and-redundancy)
      - [Code Coverage](#code-coverage)
      - [Running Tests: Speed vs. Thoroughness](#running-tests-speed-vs-thoroughness)

<!-- TOC end -->

<!-- TOC --><a name="-core-philosophy-architecture"></a>
## **🏛️ Core Philosophy & Architecture**

The repo structure is the following:
```
|__ 📁 database
    |__ init.sql
|__ 📁 node_server
    |__ 📁 src
        |__ 📁 config
        |__ 📁 connectors
        |__ 📁 controllers
        |__ 📁 docs
        |__ 📁 middleware
        |__ 📁 models
        |__ 📁 routes
        |__ 📁 services
        |__ 📁 tests
        |__ 📁 utils
        |__ app.ts
        |__ index.ts
    |__ dockerfile
    |__ jest.config.base.ts
    |__ jest.config.integration.ts
    |__ jest.config.ts
    |__ jest.config.unit.ts
    |__ nodemon.json
    |__ package-lock.json
    |__ package.json
    |__ tsconfig.json
|__ .env
|__ .env.example
|__ .gitignore
|__ docker-compose.yml
|__ README.md
```

The project was built with maintainability, scalability, and best practices in mind. We adhere to principles like **SOLID** to ensure our code is understandable, flexible, and robust.

Our goal was to follow a **Hexagonal Architecture** (also known as Ports and Adapters). Here's what that means in simple terms:

- **The Core Logic is Independent:** The heart of our application (the business rules, found in the `/src/services directory`) has no knowledge of the outside world. It doesn't know about our database, any external APIs, or even that it's being accessed via HTTP. It's pure, testable logic.


- **Ports are the Gates:** The core logic defines "ports" (interfaces or abstract classes) through which it communicates.

- **Adapters are the Plugs:** We connect "adapters" to these ports to interact with the outside world.

   - An **HTTP Controller** (`/src/controllers`) is an adapter that translates an incoming web request into a call to our core logic.

   - A **Database Connector** (`/src/connectors`) is an adapter that implements how our core logic talks to a specific database like PostgreSQL.

This approach is reflected in both our Node.js server structure and our Docker setup. The docker-compose.yml file treats the database and the server as separate, swappable components (adapters), while the Node.js code in the src folder keeps business logic (services) cleanly separated from the delivery mechanism (routes, controllers).

<!-- TOC --><a name="-getting-started"></a>
## **🚀 Getting Started**

<!-- TOC --><a name="prerequisites"></a>
### **Prerequisites**

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (LTS version recommended)

- [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

<!-- TOC --><a name="1-configuration-the-env-file"></a>
### **The .env File**

All configuration for this project is managed through environment variables. The single source of truth for local development is the .env file. 🚨🚨🚨 HARDCODED VARIABLES WILL NOT BE ACCEPTED IN THE CODE 🚨🚨🚨

1. **Create your own .env file:** Copy the example file to create your local configuration.
   ```
   cp .env.example .env
   ```

2. **Fill in the values:** Open the new .env file and populate the variables with your specific settings (passwords, ports, etc.).

<!-- TOC --><a name="-the-two-or-three-golden-rules-of-configuration"></a>
### **⚠️ The Two (or Three) Golden Rules of Configuration**

This is the most important section. To add a **new** environment variable, you **MUST** update it in three places. If you miss a step, it will not work.

1. **Add it to .env:** Define your new variable in your local .env file (and also add it to .env.example without a value, so other developers know it exists).
   ```
   # .env
   MY_NEW_VARIABLE=some_secret_value
   ```

2. **Pass it in docker-compose.yml:** The Docker container is an isolated environment. You must explicitly pass the variable from your .env file to the correct service in the docker-compose.yml file.
   ```
   # docker-compose.yml
   services:
     server:
       environment:
         # ... other variables
         - MY_NEW_VARIABLE=${MY_NEW_VARIABLE}
   ```

3. (For node_server, if necessary) **Add it to the ConfigService:** To maintain architectural purity, **you must never use process.env directly in your application code**. All configuration is managed by a single, reliable service. Add your new variable to the configuration loader in `node_server/src/config/config.ts`. This ensures it's properly typed and accessible throughout the app in a controlled way.

<!-- TOC --><a name="-running-the-application"></a>
## **🏃 Running the Application**

<!-- TOC --><a name="running-the-full-application-with-docker"></a>
### **Running the Full Application with Docker**

This is the easiest way to run the entire stack, including the database and any other services.

- **Start all services (except the ones that have a profile set):**
  ```
  #This command builds the images if they don't exist and starts the containers.
  docker-compose up --build
  ```

   Be aware that:
   - `docker compose up` → **starts containers**. It uses existing images. It **won’t rebuild** images unless they’re missing.

   - `docker compose up --build` → **builds images first**, then starts containers. It’s like running `docker compose build && docker compose up`.
   
   Common scenarios:
   
   - **You’re bind-mounting code** (`./app:/usr/src/app`): code changes reflect live; **no rebuild** needed unless deps/Dockerfile changed. Use plain `up`.
   - **You’re baking code into the image** (`COPY . .` in Dockerfile): code changes require `--build` (or a separate `docker compose build`).
   - **Image comes from a registry and you want the latest**: use `docker compose up --pull always` (or run `docker compose pull` first).


- **Clean Restart (Delete all data):**\
  If you have "trash" in your database and want a completely fresh start, you must bring the containers down and explicitly remove the volumes.
  ```
  #This stops containers, removes them, and DELETES associated volumes (like your DB data).
  docker-compose down -v
  ```

- **Stop the services:**
  ```
  #This stops the containers but preserves the data in the volumes.
  docker-compose down
  ```

- **Run only specific services:**\
  If you don't need all the services (e.g., you don't need the database), you can simply comment out or delete that service's entry in the docker-compose.yml file before running docker-compose up. If you only want to run one container you can do
  ```
  #This only runs you postgres container (db_postgres).
  docker-compose up --build db_postgres
  ```
  
- **Run services with a specific profile (e.g., "test"):**\
  If you also want to run services with a specific profile (e.g., "test"), you should do:
  ```
  #This run all profile-less services and the ones with a "test" profile
  docker compose --profile test up --build
  ```
  If you only want to run services with a specific profile (e.g., "test"), you should do:
  ```
  #This run all profile-less services and the ones with a "test" profile
  docker compose --profile test up --build postgres_test_db
  ```

   A service with a profile looks like this:
  ```#docker-compose
   services:
     ...
     postgres_test_db:
       image: "postgres:15"
       profiles: ["test"]   # container built only when profile 'test' is active
       ...
     ...
  ```

  
<!-- TOC --><a name="-database-initialization-initsql"></a>
#### 💾 Database Initialization (`init.sql`)

You might wonder how the database gets its tables created the first time. We use a feature built into the official PostgreSQL Docker image. When the PostgreSQL container starts **for the very first time on an empty data volume**, it automatically executes any `.sql` scripts it finds in the `/docker-entrypoint-initdb.d/` directory inside the container. Our `docker-compose.yml` file uses a volume mount to place our local `./database/init.sql` file into that special directory.

This means that all the statements in the `init.sql` script are run automatically to set up the database schema, but only once. To force this script to run again, you must perform a clean restart with `docker-compose down -v`.

<!-- TOC --><a name="running-nodejs-server-locally-for-focused-backend-development"></a>
### **Running Node.js Server Locally (For focused backend development)**

This is useful when you are actively working on the Node.js server and want faster feedback.

1. **Install dependencies:**
   ```
   cd node_server
   npm install
   ```

2. **Run in Development Mode:**
   This uses nodemon to watch for file changes and automatically restart the server. This is what you'll use 99% of the time.
   ```
   npm run dev
   ```

3. **Build for Production:**
   This compiles your TypeScript code into plain JavaScript in the `/build` directory.
   ```
   npm run build
   ```

4. **Start in Production Mode:**
   This runs the compiled JavaScript code from the `/build` directory. It's faster but does not auto-reload.
   ```
   npm run start
   ```
   
### **Running the Frontend Locally**
This is useful when you are actively working on the user interface and want the fastest feedback with Hot Module Replacement (HMR).

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run in Development Mode:**
    This uses Vite to start a development server that watches for file changes and instantly updates the browser.
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:5173`.

<!-- TOC --><a name="-development-workflow-best-practices"></a>
## **🛠️ Development Workflow & Best Practices**

**Follow Existing Patterns:** Before adding new code, take a moment to look at the existing structure. Place your files in the appropriate directories. Name your files, variables, and classes following the conventions you see in the project (e.g., `userController.ts`, `UserService`). Consistency is key to a readable codebase.

<!-- TOC --><a name="-code-conventions-structure-for-nodejs-server"></a>
### 🏗️ Code Conventions & Structure for Node.js Server

- **Centralized Configuration:** Any specific configuration for a part of the `node_server` (e.g., Swagger options, CORS settings) should be defined in its own file within the `src/config/` directory. This keeps our main `app.ts` clean and makes configuration easy to find.

- **Barrel Exports (index.ts):** Inside each directory (`controllers`, `services`, etc.), there is an `index.ts` file. This file exports all the contents of its sibling files. This allows for cleaner imports elsewhere in the project.

   - Bad: `import { UserController } from '../controllers/userController'`;

   - Good: `import { UserController } from '../controllers'`;

- **Connectors for External Services:** As part of our Hexagonal Architecture, the `src/connectors/` directory is where we place our "adapters" for external services. These are responsible for the specific logic of connecting to and communicating with things like our database or AWS S3. We use the **Singleton Pattern** in these connectors to ensure we only ever have one connection instance to these services, which is efficient and prevents resource leaks.

  - **Example 1: Database Connector (`database.ts`)** This file provides a singleton instance for both the Sequelize ORM and the native `pg` client.

        import { Client } from 'pg';
        import { Sequelize } from "sequelize";
        import { ConfigService } from '../config';

        class PostgresSingletonSequelize {
          private static instance: Sequelize;

          private constructor() {} // Prevents direct instantiation

          public static getInstance(): Sequelize {
            if (!PostgresSingletonSequelize.instance) {
              const config = ConfigService.getInstance().db;
              PostgresSingletonSequelize.instance = new Sequelize({
                dialect: "postgres",
                host: config.host,
                port: config.port,
                database: config.database,
                username: config.user,
                password: config.password,
                logging: false,
              });
            }
            return PostgresSingletonSequelize.instance;
          }
        }

        export const postgresDbConnector = PostgresSingletonSequelize.getInstance();

  - **Example 2: AWS S3 Connector (`aws.ts`)** This file creates and exports a configured S3 client.

        import { S3Client } from "@aws-sdk/client-s3";
        import { ConfigService } from "../config";

        const config = ConfigService.getInstance().s3;

        export const s3Client = new S3Client({
          region: config.region,
          credentials:
            config.accessKeyId && config.secretAccessKey
              ? {
                  accessKeyId: config.accessKeyId,
                  secretAccessKey: config.secretAccessKey,
                }
              : undefined,
        });

<!-- TOC --><a name="-api-documentation-swagger-for-nodejs-server"></a>
### **📚 API Documentation (Swagger) for Node.js Server**

We use Swagger for dynamic API documentation. It is not optional.

- **Location:** All Swagger documentation is written in YAML files located in `node_server/src/docs/`.

- **The Rule:** If you add or modify an API endpoint in the `/routes` directory, you **MUST** update the corresponding documentation in the `/docs` directory.

- **New Endpoint Groups:** If you create a new group of related endpoints (e.g., for "Products"), create a new corresponding documentation file (e.g., productDocs.yaml) inside `node_server/src/docs/` and ensure it's loaded by the Swagger config.

### **Frontend: Vue.js Application**

#### **🎨 Architecture & Philosophy**
The frontend is a **Vue 3** application built with **Vite**. It follows a clear and scalable architecture based on the principle of **Separation of Concerns**.

We use a "Restaurant" analogy to understand the structure:
- **The Kitchen (Logic & Data):** This is where data is prepared, far from the user's view.
    - **`services/api.js` (The Chef):** This is the only part of the app that communicates with the backend API. It isolates all HTTP request logic.
    - **`store/userStore.js` (The Head Chef):** This is the central brain for a specific feature (like users). It manages the application's **state** (the data), calls the service to fetch data, and provides it to the components. We use **Pinia** for state management.
- **The Dining Room (Visual Layer):** This is what the user sees and interacts with.
    - **`views/` (The Pages):** These are the main pages of the application, like the Dashboard or the User Management screen. They orchestrate which components to show.
    - **`components/` (The Reusable Parts):** These are the building blocks, like tables, forms, and buttons (`UserTable.vue`, `UserForm.vue`). They receive data via **props** and communicate actions via **emits**. They are kept as "dumb" as possible, only responsible for displaying information.

#### **📁 Folder Structure**
The `frontend/src` directory is organized by responsibility:

frontend/src/
├── assets/       # Global styles (base.css), images, fonts
├── components/   # Reusable Vue components (buttons, tables, forms)
├── router/       # Vue Router configuration (defines URL paths)
├── services/     # API communication layer (api.js)
├── store/        # Pinia state management stores (userStore.js)
└── views/        # Page-level components (DashboardView.vue, AdminHome.vue)

#### **📄 Code Conventions**
- **JSDoc for Documentation:** All key functions (store actions, API service methods) and component APIs (`props` and `emits`) are documented using **JSDoc**. This enables editor autocompletion and makes the code easier to understand.
- **Scoped CSS:** Components use `<style scoped>` to ensure their styles are encapsulated and do not leak out to affect other parts of the application.
- **CSS Variables:** Global design tokens (colors, fonts) are defined as CSS variables in `src/assets/base.css` for easy theming and consistency.

#### **📜 Available Scripts**
Inside the `frontend/` directory, you can run the following commands:
- `npm run dev`: Starts the Vite development server with Hot Module Replacement. Use this for active development.
- `npm run build`: Compiles and minifies the application for production. This creates a `/dist` folder with the final static files.
- `npm run preview`: Starts a simple local server to preview the production build from the `/dist` folder. Use this to test the final version before deployment.
- `npm run format`: Runs Prettier to automatically format all code files, ensuring a consistent style across the project.

<!-- TOC --><a name="-testing-strategy"></a>
### **🧪 Testing Strategy**

🚨🚨🚨**Testing is Mandatory. There is no exception to this rule.** 🚨🚨🚨

- **All new code requires tests.** This includes bug fixes, new features, and refactors. A ticket or Jira story is not "done" until it is accompanied by meaningful tests.

- **Even if a ticket doesn't ask for tests, you are required to write them.** This is a core part of our definition of quality.

- **Provide Evidence:** When you complete a task, you must attach evidence of your new developed feature, bug, etc, to the Jira ticket. This proves your changes work as expected and are protected against future regressions.

A robust testing strategy is non-negotiable for maintaining a high-quality codebase. We employ a combination of unit and integration tests.

<!-- TOC --><a name="unit-vs-integration-tests"></a>
#### **Unit vs. Integration Tests**
* **Unit Tests**: These are fast, isolated tests that check a single piece of logic (e.g., one function in a service) without any external dependencies. They do not connect to a database or make network requests. 🚨**All calls to other parts of the code should be mocked**🚨

* **Integration Tests**: These are end-to-end tests that verify how multiple parts of the system work together. For example, they make real HTTP requests to your endpoints and interact with a real, isolated test database to ensure the entire flow is working correctly.

<!-- TOC --><a name="nodejs-server-testing"></a>
#### **Node.js Server Testing**

All tests live inside the `src/tests/` directory, which is organized as follows:

- `src/tests/unit/:` Contains all unit tests.

- `src/tests/integration/:` Contains all integration tests.

Integration tests will point to a test database. This is defined by the `NODE_ENV` variable. Unit tests don't need to have this flag set as there shouldn't be any actual call to external resource (it violets the idea of a unit test).

```
#package.json
  ...
  "scripts": {
    "build": "rimraf ./build && tsc",
    "start": "node build/index.js",
    "dev": "nodemon src/index.ts",
    "test": "cross-env NODE_ENV=test jest --runInBand",
    "test:unit": "jest --config jest.config.unit.ts",
    "test:integration": "cross-env NODE_ENV=test jest --config jest.config.integration.ts --runInBand --detectOpenHandles",
    "test:watch": "cross-env NODE_ENV=test jest --watch",
    "test:unit:watch": "jest --config jest.config.unit.ts --watch",
    "test:integration:watch": "cross-env NODE_ENV=test jest --config jest.config.integration.ts --watch",
    "test:coverage": "cross-env NODE_ENV=test jest --coverage --runInBand"
  },
...
```

<!-- TOC --><a name="jest-configuration-strategy"></a>
#### Jest Configuration Strategy

To handle the different requirements of unit and integration tests, this project uses a multi-config "Projects" setup in Jest. This is a best practice that keeps our testing workflow efficient, organized, and easy to maintain.

Instead of a single configuration file, we have four:

1. **`jest.config.base.ts` (The Foundation)** This file contains all the common settings that are shared across all types of tests. This includes things like the test environment (`ts-jest`), code coverage settings, and mocks. This ensures our configuration is DRY (Don't Repeat Yourself).

2. **`jest.config.unit.ts` (The Sprinter)** This configuration inherits all the settings from `jest.config.base.ts` and adds one key rule: `testMatch: ['**/tests/unit/**/*.test.ts']`. Its only job is to find and run the fast, isolated unit tests. It does **not** run the database setup script.

3. **`jest.config.integration.ts` (The Marathon Runner)** This also inherits from the base configuration. It sets its own `testMatch` to run only integration tests and, crucially, adds the `setupFilesAfterEnv` property. This command tells Jest to run our `src/tests/setup.ts` script before the tests, which connects to the test database, syncs the tables, and prepares the environment.

4. **`jest.config.ts` (The Orchestrator)** This is the main configuration file that Jest finds by default. It contains no test rules itself. Its only job is to tell Jest about the other "projects" (unit and integration).

This setup allows our `package.json` scripts to work efficiently:

- When you run `npm run test:unit`, you are telling Jest: "Ignore everything else and use only the rules in `jest.config.unit.ts`." This is why it's so fast.

- When you run `npm run test:integration`, you are telling Jest: "Ignore everything else and use only the rules in `jest.config.integration.ts`," which correctly sets up the database.

- When you run the main `npm test` command, you are telling Jest: "Use the orchestrator (`jest.config.ts`), which will run _both_ the unit and integration test projects sequentially." This is the command used for final validation before committing code.

<!-- TOC --><a name="the-setupts-script"></a>
#### The `setup.ts` Script

A key part of our integration testing strategy is the `src/tests/setup.ts` file.
- **What is it?** This is a special script that our integration test configuration (`jest.config.integration.ts`) is instructed to run once before executing any test files.

- **What does it do?** Its job is to prepare the entire testing environment and ensure it's clean and predictable. It handles several critical tasks:

  1. **Connects** to the dedicated test database.

  2. **Syncs** all Sequelize models, creating the necessary tables (`beforeAll`).

  3. **Wipes all data** from all tables before each individual test runs (`beforeEach`). This is the most important step, as it guarantees that your tests are completely isolated and one test cannot affect the outcome of another.

  4. **Disconnects** cleanly from the database after all tests have finished (`afterAll`).

- **Why is it only for integration tests?** Running this setup script involves slow I/O operations (network connections, database queries). Unit tests are designed to be lightning-fast and run in complete isolation without any external dependencies. Forcing every unit test to wait for a database connection and cleanup would be incredibly inefficient and would completely defeat the purpose of having fast, separate unit tests. This is why our `jest.config.unit.ts` intentionally ignores this setup file

<!-- TOC --><a name="naming-convention-and-redundancy"></a>
#### Naming Convention and Redundancy
To keep our tests organized and easy to identify, we use a specific naming convention:

- Unit tests end in `.unit.test.ts` (e.g., `userService.unit.test.ts`).

- Integration tests end in `.integration.test.ts` (e.g., `user.integration.test.ts`).

While it might seem redundant to have both a folder (`/unit`) and a filename convention (`.unit.test.ts`), this is an intentional best practice. It provides clarity at a glance, makes it trivial to search for specific types of tests, and gives us flexibility in how we organize our test files in the future.

<!-- TOC --><a name="code-coverage"></a>
#### Code Coverage
Code coverage is a report that tells you what percentage of your code is being executed by your tests. It's an essential tool for identifying untested parts of your application.

To generate a coverage report, run:
```
npm run test:coverage
```
This will create a `coverage/` folder. Open the `coverage/lcov-report/index.html` file in your browser to see a detailed, line-by-line report.

<!-- TOC --><a name="running-tests-speed-vs-thoroughness"></a>
#### Running Tests: Speed vs. Thoroughness
We have different test scripts optimized for different phases of development:

- `npm run test:integration` or `npm run unit:integration`(The "Final Exam"): This is the script you run before you commit your code or in your CI/CD pipeline. Its job is to be as strict and thorough as possible. You need it to run serially for stability (`--runInBand`) and to check for resource leaks to keep the app healthy (`--detectOpenHandles`). Speed is less important than correctness here.

- `npm run test:integration:watch` or `npm run test:unit:watch`:  (The "Quick Rehearsal"): This is your development tool. When you're in watch mode, you save a file and want immediate feedback. The top priority is speed. While you still want stability, the extra time `--detectOpenHandles` takes on every single save can be frustrating and slow down your development loop

So, in summary the difference is in this two flags:

- `--runInBand`: This forces Jest to run all tests serially (one after another) in the same process. **This is crucial for integration tests because they often share a single resource** (like the test database connection), and running them in parallel could cause them to interfere with each other.

- `--detectOpenHandles`: This is a powerful debugging tool. After the tests run, it scans for any "handles" (like server ports or database connections) that haven't been properly closed. It's great for finding resource leaks but adds a significant performance overhead, making the tests run noticeably slower.

Now yes, happy coding! :)
