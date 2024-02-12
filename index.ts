import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from "zod";

const prisma = new PrismaClient();
const app = express();

const UserSchema = z.object({
    name: z.string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .min(2, {message: 'Name must be ate least 2 characters'}),
    age: z.number({
        required_error: "Age is required",
        invalid_type_error: "Age must be a number",
    })
});

const getUsers = async (_req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
};

const createUser = async (req: Request, res: Response) => {
    try {
        const validUserData = UserSchema.parse(req.body);
        const user = await prisma.user.create({
            data: validUserData
        });
        res.status(201).json(user);
    } catch(error) {
        res.status(500).json(error);
    }
};

const getUser = async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if(!user) {
        return res.status(404).json({
            status: 'error',
            message: `User with id ${userId} not found.`
        });
    }

    res.status(200).json(user);
};

const updateUser =  async (req: Request, res: Response) => {
    const body = req.body;
    const user = await prisma.user.update({
        data: {
            name: body.name
        },
        where: {
            id: req.params.userId
        }
    });
    res.status(200).json(user);
};

const deleteUser = async (req: Request, res: Response) => {
    await prisma.user.delete({
        where: {
            id: req.params.userId
        }
    });
    res.status(200).json({});
};

const getAllTasks = async (_req: Request, res: Response) => {
    const tasks = await prisma.task.findMany();
    res.status(200).json(tasks);
};

const createTask = async (req: Request, res: Response) => {
    const body = req.body;
    const task = await prisma.task.create({
        data: {
            description: body.description
        }
    });
    res.status(200).json(task);
};

const getTask = async (req: Request, res: Response) => {
    const taskId = req.params.taskId;

    const task = await prisma.task.findUnique({
        where: {
            id: taskId
        }
    });

    if(!task) {
        return res.status(404).json({
            status: 'error',
            message: `Task with id ${taskId} not found.`
        });
    }
    
    res.status(200).json(task);
};

const updateTask =  async (req: Request, res: Response) => {
    const body = req.body;
    const taskId = req.params.taskId;

    const task = await prisma.task.update({
        data: {
            completed: body.completed
        },
        where: {
            id: taskId
        }
    });

    res.status(200).json(task);
};

async function server() {
    app.use(express.json());

    const userRouter = Router();
    const taskRouter = Router();

    app.use('/app/v1/user', userRouter);
    app.use('/app/v1/task', taskRouter);

    app.use((req, res, next) => {
        console.log('middleware own');
        next();
    });  

    userRouter
        .route('/')
        .get(getUsers)
        .post(createUser);  

    userRouter
        .route('/:userId')
        .get(getUser)
        .put(updateUser)
        .delete(deleteUser);

    taskRouter
        .route('/')
        .get(getAllTasks)
        .post(createTask);

    taskRouter
        .route('/:taskId')
        .get(getTask)
        .patch(updateTask);

    app.listen(3001, () => {
        console.log('Server is running');
    });
}

server().then(async () => {
    await prisma.$disconnect();
}).catch(async (error) => {
    console.log(error);
    await prisma.$disconnect();
    process.exit(1);
});
