// const { Config } = require('./src/config/config');


// async function connect(MongoUrl) { 
//     const mongoose = require('mongoose');
  
//       // Connect to MongoDB
//       await mongoose.connect(MongoUrl)
//     .then(() => console.log('MongoDB Connected'))
//     .catch(() => console.log('!!Err in the Connected MongoDb'))
  
    
// }


// async function init(MongoDbUrl, envConfig) {
//     try {
//         console.log(1);
//         await connect(MongoDbUrl);

//         const config = await Config.getConfigFromClient(envConfig); 

//         const { repositories, models } = require('./src');
      
//         return { repositories, models };
    
//     } catch (error) {
//         console.log(error,'789');
//         console.log(2);
//         console.error('Error initializing application:', error);
//     }
// }

// module.exports = init; 
        const { repositories, models } = require('./src');
        module.exports = {
            repositories,
            models
        }
