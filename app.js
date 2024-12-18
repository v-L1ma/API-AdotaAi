require('dotenv').config()
const express= require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

/*
==========   outra maneira de fazer os imports   =============
import 'dotenv/config';
import express, { json } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
*/

const app = express()
//Fazendo o express ler json
app.use(express.json())


//MongoDB models
const User = require('./models/User')
const { findOne } = require('./models/User')

//Rota publica
app.get('/', (req,res) => {
    res.status(200).json({msg: 'Bem vindo a minha api'})
})

//Rota privada
app.get('/user/:id', checkToken, async (req,res) =>{
    const id = req.params.id

    //check if user exists
    const user = await User.findById(id,'-password')

    if(!user){
        return res.status(404).json({msg:'Usuario não encontrado'})
    }

    res.status(200).json({ user })

})

function checkToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]
    if(!token){
        return res.status(401).json({msg: "Acesso negado!"})
    }

    try{
        const SECRET = process.env.secret

        jwt.verify(token, secret)

        next()

    }
    catch(error){
        res.status(400).json({msg: "Token invalido!"})
    }
}

//Registrando usuario
app.post('/auth/register', async (req, res)=>{
    const {name, email, password, confirmpassword} = req.body

    if(!name || !email || !password){
        res.status(422).json({msg: 'ERRO: Algum campo não preenchido'})
    }
    if(confirmpassword !== password){
        res.status(422).json({msg: 'ERRO: As senhas não conferem'})
    }
    
    //Verificando se o usuario já existe
    const userExists = await User.findOne({ email:email })
    if(userExists){
        return res.status(422).json({ msg: 'Por favor, utilize ourto email!'})
    }

    //Criando a senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //Criando o usuario
    const user = new User({
        name,
        email,
        password: passwordHash,
    })
    try{
        
        await user.save()
        
        res.status(201).json({msg: 'Usuario criado com sucesso'})

    }
    catch(error){
        res.status(500).json({msg: error})
    }
})

//Logando o usuario
app.post("/auth/login", async(req,res) => {
    const {email, password} = req.body

    if(!email || !password){
        res.status(422).json({msg: 'ERRO: Email e senha são obrigatorios'})
    }

    //Checkando se o usuario existe
    const user = await User.findOne({email:email})
    if(!user){
        res.status(422).json({msg:'Usuario não cadastrado'})
    } 
    
    //Checkando se a senha esta certa
    const checkPassword = await bcrypt.compare(password, user.password)
    console.log(password)

    if(!checkPassword){
        return res.status(422).json({msg: 'Senha invalida!'})
    }

    try{

        const secret = process.env.SECRET

        const token = jwt.sign({
            id: user._id,
        },
        secret,
    )

    res.status(200).json({msg:"Autenticação realizada com sucesso", token})

    }
    catch(error){
        res.status(500).json({msg: error})
    }

})

//Trazendo as credenciais do arquivo .env
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@adotaai.66td0.mongodb.net/Usuarios?retryWrites=true&w=majority&appName=AdotaAi`)
.then(()=>{
    app.listen(3000)
    console.log('API conectou ao banco!!')
})
.catch((err)=> console.log(err))