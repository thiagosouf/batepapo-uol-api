import express, {json} from "express";
// import chalk from "chalk";
import cors from "cors";
import {MongoClient} from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import dayjs from "dayjs";

const app = express();
app.use(cors());
app.use(json());
dotenv.config();

const schemaParticipants = joi.object({
    name: joi.string().min(1).required(),
    lastStatus: joi.number()
});

const schemaMessages = joi.object({
    to: joi.string().min(1).required(),
    text: joi.string().min(1).required(),
    type: joi.string().valid("message", "private_message").required()
});

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URI);


// Configura uma função pra ser executada quando bater um GET na rota "/"
app.post("/participants", async (req, res) => {
    const name = req.body;
    console.log(req.body)
    console.log(dayjs().format('HH:mm:ss'));

    const validacao = schemaParticipants.validate(name, {abortEarly: true});
    if (validacao.error) {
        console.log("Nome não pode ser vazio");
        return res.status(422).send("Nome não informado");
    }

    try{
        await mongoClient.connect();
        db = mongoClient.db('bpUol');

        const nomeDuplicado = await db.collection("participants").find({...name}).toArray();

        if (nomeDuplicado.length>0) {
            console.log("Nome duplicado2");
            return res.status(409).send("Nome duplicado");
        }

        await db.collection("participants").insertOne({...name, lastStatus: Date.now()});
        await db.collection("messages").insertOne({from: req.body.name, to: "Todos", text: "entra na sala...", type: "status", time: dayjs().format('HH:mm:ss')});
        res.status(201).send("Participante cadastrado com sucesso");
    }
    catch(err){
        console.log(err);
        res.status(422).send("Erro ao cadastrar participante");
    }
})

app.get("/participants", async (req, res) => {
    try{
        await mongoClient.connect();
        db = mongoClient.db("bpUol");
        const participantes = await db.collection("participants").find().toArray();
        res.status(200).send(participantes);
    }
    catch(err){
        console.log(err);
        res.status(500).send("Erro ao buscar participantes");
    }
    });

app.post("/messages", async (req, res) => {
    const {to, text, type} = req.body;
    const from = req.headers.user;
    const destinatario = await db.collection("participants").findOne({name: from});


    const validacao = schemaMessages.validate(req.body, {abortEarly: true});
    if (validacao.error || destinatario === null) {
        console.log("Dados incompletos");
        return res.status(422).send("Dados incompletos");
    }
    
    try{
        await mongoClient.connect();
        db = mongoClient.db('bpUol')

        db.collection("messages").insertOne({from, to, text, type, time: dayjs().format('HH:mm:ss')})
        res.status(201).send("Mensagem enviada com sucesso");
    }
    catch(err){
        console.log(err);
        res.status(422).send("Erro ao enviar mensagem");
    }   

});
    
app.get("/messages", async (req, res) => {
    const limit = req.query.limit;
    
    try{
        await mongoClient.connect();
        db = mongoClient.db("bpUol");
        const visivel =  await db.collection("messages").find({$or: [{to: "Todos"}, {to: req.headers.user}, {from: req.headers.user}, ]}).sort({time: 1}).toArray();
        res.status(200).send(visivel.slice(-limit));
    }
    catch(err){
        console.log(err);
        res.status(500).send("Erro ao buscar mensagens");
    }
    
})

app.post("/status", async (req, res) => {
    const {user} = req.headers;
    try{
        let participante = await db.collection("participants").findOne({name: user});
        if (!participante) {
            console.log("Participante não encontrado");
            res.status(404).send("Participante não encontrado");
            return
        }
        
        const participantes = await db.collection("participants").updateOne({name: user}, {$set: {lastStatus: Date.now()}});
        let expulso = await db.collection("participants").findOne({lastStatus: {$lt: Date.now() - 15000}});
        let nome = expulso.name;
        await db.collection("messages").insertOne({from: nome, to: "Todos", text: `saiu da sala...`, type: "status", time: dayjs().format('HH:mm:ss')});
        await db.collection("participants").deleteOne({name: nome});
        res.status(200).send("Status atualizado com sucesso");

    }
    catch(err){
        console.log(err);
        res.status(500).send("Erro ao atualizar status");
    }

})



// Configura o servidor para rodar na porta 5000
app.listen(5000, console.log("Server ligado na porta 5000"));