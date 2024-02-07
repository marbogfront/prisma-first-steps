import express from 'express';
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

async function server() {
    app.use(express.json());

    app.post('/user', async (req, res) => {
        try {
            const validUserData = UserSchema.parse(req.body);
            const user = await prisma.user.create({
                data: validUserData
            });
            res.status(201).json(user);
        } catch(error) {
            res.status(500).json(error);
        }
    });

    app.get('/user', async (req, res) => {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    });

    app.get('/user/:userId', async (req, res) => {
        const user = await prisma.user.findUnique({
            where: {
                id: req.params.userId
            }
        });
        res.status(200).json(user);
    });

    app.put('/user/:userId', async (req, res) => {
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
    });

    app.delete('/user/:userId', async (req, res) => {
        await prisma.user.delete({
            where: {
                id: req.params.userId
            }
        });
        res.status(200).json({});
    });

    app.post('/task', async (req, res) => {
        const body = req.body;
        const task = await prisma.task.create({
            data: {
                description: body.description
            }
        });
        res.status(200).json(task);
    });

    app.get('/task', async (req, res) => {
        const tasks = await prisma.task.findMany();
        res.status(200).json(tasks);
    });

    app.put('/task/:taskId', async (req, res) => {
        const body = req.body;
        const task = await prisma.task.update({
            data: {
                completed: body.completed
            },
            where: {
                id: req.params.taskId
            }
        });
        res.status(200).json(task);
    });

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
