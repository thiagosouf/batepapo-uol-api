import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const app = express(); // Cria um servidor
app.use(express.json()); // Permite que o express entenda json
app.use(cors()); // Permite acesso de qualquer lugar

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URI);
const promise = mongoClient.connect();
promise.then(() => db = mongoClient.db("participants"));

// const participantes = [
//     {name: 'João', lastStatus: 12313120}, 
//     {name: 'João1', lastStatus: 12313121},
//     {name: 'João2', lastStatus: 12313122},
//     {name: 'João3', lastStatus: 12313123},
// ]

// const mensagens =[
//     {from: 'João', to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')},
//     {from: 'João1', to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')},
//     {from: 'João1', to: 'João', text: 'entra na sala...', type: 'private_message', time: dayjs().format('HH:mm:ss')}
// ]


// Configura uma função pra ser executada quando bater um GET na rota "/"
app.post("/participants", (req, res) => {
    if (req.body.name === "") {
        console.log("Nome não pode ser vazio");
        res.status(422).send("Nome não informado");
        return}
    const promise = db.collection('participants').insertOne({name: req.body.name, lastStatus: Date.now()});
    promise.then(() => {
        console.log("Participante inserido com sucesso");
        res.sendStatus(201);
    })
    promise.catch(() => {
        console.log("Erro ao inserir participante");
        res.sendStatus(500);
    })
})


app.get("/participants", (req, res) => {
    const promise = db.collection('participants').find().toArray();
    promise.then(participantes => {
        res.send(participantes);})
    promise.catch(() => {
        console.log("Erro ao buscar participantes");
        res.sendStatus(500);})
    });

app.post("/messages", (req, res) => {

})

app.get("/messages", (req, res) => {
    
})

app.post("/status", (req, res) => {
    
})



// Configura o servidor para rodar na porta 5000
app.listen(5000, console.log("Server ligado na porta 5000"));