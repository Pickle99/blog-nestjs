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


## Additional notes

Everything from Auth must go to User folder, User folder is empty right now, i noticed it only in the end, i will refactor the code to work from User folder and not from auth a little bit later.

It could be a good idea as well to use Docker, since i had a problems to run the app from node 18.

Also it could be a good idea to start endpoints via /api , however i decided to not, since its not really important in this app
