## Requirements
Node >=20 (20 on dev) <br/>
Postgres >=17 (17 on dev) <br/>
Redis / Redis CLI

## API documentation
API documentation can be accessed on /api endpoint, which is made from Swagger <br/>
To see the API Docs, visit: `` http://localhost:8000/api ``

## Starting the app

first of all run <br/>
`` npm run start:dev `` <br/>
then generate the migrations with command 
<br/>`` npm run migration:generate database/migrations/NewMigration ``<br/>
then run the migrations with <br/> `` npm run migration:run `` <br/>
to run the unit tests, write <br/> `` npm run test `` <br/>


## Additional notes

It could be a good idea to use Docker, since i had a problems to run the app from node 18.

Also it could be a good idea to start endpoints via /api , however i decided to not, since its not really important in this app
