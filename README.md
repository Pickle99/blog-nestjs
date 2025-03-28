## Requirements
Node >=20 (20 on dev) <br/>
Postgres >=17 (17 on dev)

## Starting the app

first of all run <br/>
`` npm run start:dev `` <br/>
then generate the migrations with command 
<br/>`` npm run migration:generate database/migrations/NewMigration ``<br/>
then run the migrations with <br/> `` npm run migration:run `` <br/>
to run the unit tests, write <br/> `` npm run test `` <br/>
