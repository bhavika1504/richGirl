import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://rich_girl_1990:s34EbZ2KfUJTMxMv@richgirl.qhlla8d.mongodb.net/RichGirl_Test";

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const logs = await mongoose.connection.db.collection('error_logs').find().sort({ timestamp: -1 }).limit(5).toArray();
    console.log(`Found ${logs.length} error logs:`);
    for (const log of logs) {
      console.log(`-----------------------------------------------`);
      console.log(`Time: ${log.timestamp}`);
      console.log(`Error: ${log.error}`);
      console.log(`Stack: ${log.stack}`);
      console.log(`Body: ${JSON.stringify(log.body, null, 2)}`);
    }
  } catch (err) {
    console.error("Error reading logs:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
