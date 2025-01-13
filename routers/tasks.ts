import mongoose from "mongoose";
import express, {RequestHandler} from "express";
import Task from "../models/Task";
import auth, {RequestWithUser} from "../middlaware/auth";

const taskRouter = express.Router();

taskRouter.get("/", auth as RequestHandler, async (req, res, next) => {
    try {
        const user =  req as RequestWithUser;

        if (!user) {
            res.status(401).send({ error: 'Unauthorized: User not found' });
            return;
        }

        const tasks = await Task.find({ user: user});

        if (!tasks || tasks.length === 0) {
            res.status(404).send({ error: 'No tasks found for the user' });
        }

        res.status(200).send(tasks);
    } catch (error) {
        return next(error);
    }
});

taskRouter.post("/", auth, async (req, res, next) => {
    try {
        const user =  req as RequestWithUser;
        if (!user) {
            res.status(401).send({ error: 'Unauthorized: User not found' });
            return;
        }

        const { title, description, status } = req.body;
        if (!title) {
            res.status(400).send({ error: 'Bad Request: Task title is required' });
            return;
        }

        const taskBody = new Task({
            user: user,
            title,
            description,
            status: 'new',
        });

        await taskBody.save();
        res.status(201).send(taskBody);
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).send(error);
        }
        next(error);
    }
});

taskRouter.patch("/:id", auth, async (req: RequestWithUser, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).send({ error: 'Unauthorized: User not found' });
            return;
        }

        const taskId = req.params.id;
        const task = await Task.findById(taskId);

        if (!task) {
            res.status(404).send({ error: 'Task not found' });
            return;
        }

        if (!task.user.equals(user._id)) {
            res.status(403).send({ error: 'Forbidden: Cannot edit some task' });
            return;
        }

        const { title, description, status } = req.body;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;

        const updatedTask = await task.save();

        const populatedTask = await Task.findById(updatedTask._id)
            .select("-user")
            .populate({ path: "user", select: "-password -token" });

        res.status(200).send(populatedTask);
        return;
    } catch (error) {
        next(error);
    }
});


taskRouter.delete('/:id', auth, async (req: RequestWithUser, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).send({ error: 'Unauthorized: User not found' });
            return;
        }

        const taskId = req.params.id;
        const task = await Task.findById(taskId);

        if (!task) {
            res.status(404).send({ error: 'Not Found: Task does not exist' });
            return;
        }

        if (task.user.toString() !== user._id.toString()) {
            res.status(403).send({ error: 'Forbidden: Cannot edit some task' });
            return;
        }

        await Task.deleteOne({ _id: taskId });

        res.status(204).send();
        return;
    } catch (error) {
        next(error);
    }
});

export default taskRouter;







