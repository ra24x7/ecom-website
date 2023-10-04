 const app = require("./app");

 const dotenv = require("dotenv");
 const connectDatabase = require("./config/database");

 //Handling uncought exception

 process.on("uncaughtException",(err) => {
   console.log(`Error: ${err.message}`);
   console.log('Shutting down the server due to uncaught exception')
   process.exit(1);
 });

 dotenv.config({path:"backend/config/config.env"});

 connectDatabase();

 app.listen(process.env.PORT, () => {
    console.log("Server is running");
 });


 //Unhandled Promise Rejection

 process.on("unhandledRejection", (err) =>{
   console.log(`Error: ${err.message}`);
   console.log('Shutting down the server due to unhandled promise rejection')

   servicesVersion.close(()=>{
      process.exit(1);
   });
 });
