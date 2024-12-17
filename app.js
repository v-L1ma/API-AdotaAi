import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express()

app.get('/', (req,res) => {
    res.status(200).json({msg: 'Bem vindo a minha api'})
})

app.listen(3000)