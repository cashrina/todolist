import mongoose from 'mongoose';
import config from './config';
import User from './models/User';
import Task from './models/Task';

const run = async () => {
  await mongoose.connect(config.database);
  const db = mongoose.connection;

  try {
    await db.dropCollection('users');
    await db.dropCollection('tasks');
  } catch (e) {
    console.log(e);
  }

  const Shara = new User({
    username: 'Shara',
    password: 'password1',
  });

  Shara.generateToken();
  await Shara.save();

  const Bob = new User({
    username: 'Bob',
    password: 'password2',
  });

  Bob.generateToken();
  await Bob.save();

  const [cooking, homework, sport] = await Task.create(
      {
        user: Shara._id,
        title: 'Task 1 - User 1',
        description: 'Doing some pasta',
        status: 'new',
      },
      {
        user: Shara._id,
        title: 'Task 2 - User 1',
        description: 'Doing programming homework',
        status: 'in_progress',
      },
      {
        user: Bob._id,
        title: 'Task 1 - User 2',
        description: 'Doing sport 40-minutes',
        status: 'complete',
      }
  );

  console.log('Data seeded successfully.');

  await db.close();
};

run().catch(console.error);