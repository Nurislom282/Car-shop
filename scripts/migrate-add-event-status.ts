import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

// Import model and enum from project
import EventModel from '../src/schema/Event.model';
import { eventStatus } from '../src/libs/enums/event.enum';

async function run() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error('MONGO_URL is not set in environment');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUrl, {});
    console.log('Connected to MongoDB');

    const filter = { $or: [ { eventStatus: { $exists: false } }, { eventStatus: null } ] } as any;
    const update = { $set: { eventStatus: eventStatus.PROCESS } };

    const res = await EventModel.updateMany(filter, update).exec();
  // UpdateResult provides matchedCount and modifiedCount in modern drivers
  console.log('Matched:', (res as any).matchedCount ?? 0);
  console.log('Modified:', (res as any).modifiedCount ?? 0);

    await mongoose.disconnect();
    console.log('Disconnected. Migration finished.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
