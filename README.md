# ID-Back-Front-Project-Template


Cosas a ver del server:
- estandarizar manejo de errores
- agregar logger
- ver logica de autenticacion
- refinar y desglosar el codigo de node_server/src/app.ts
- encontrar una mejor forma para el swagger, ahora la descripcion en cada router (las saque, por lo que no se van a ver) ensucia mucho el codigo
- el codigo no se probo por lo que no se si es funcional
- falta la db
- verificar los ficheros de configuracion de entorno: jest.config.ts, nodemon.json, package-lock.json, package.json, tsconfigjson

Cosas para ver de la postgres:
- checkear si hay mejores practicas


How to run node server:

For Day-to-Day Development (99% of the time)

npm run dev

Every time you save a file, the server will restart automatically in the terminal, showing you any new output or errors.

For Deploying to a Live Server (Production)

npm install: Installs all dependencies.

npm run build: Compiles all your TypeScript into fast, efficient JavaScript in the build folder.

npm run start: Runs the compiled JavaScript app.