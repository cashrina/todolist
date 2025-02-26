import express from 'express';
import User from '../models/User';
import mongoose from 'mongoose';
import {randomUUID} from 'node:crypto';

const usersRouter = express.Router();

usersRouter.post('/', async (req, res, next) => {
  try {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      token: randomUUID(),
    });
    user.generateToken();
    await user.save();
    res.send(user);
    return;

  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).send(error);
    }
    next(error);
  }
});

usersRouter.post('/session', async (req, res, next) => {
  try {
    const user = await User.findOne({username: req.body.username});
    if (!user) {
      res.status(404).send({ error: 'User not found' });
      return;
    }
    const isMatch = await user.checkPassword(req.body.password);

    if (!isMatch) {
      res.status(400).send({ error: 'Password is wrong' });
    }
    user.generateToken();
    await user.save();

    res.send(user);
  } catch (error) {
    return next(error);
  }
});

export default usersRouter;