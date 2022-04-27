import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs'

const app = express(); // Cria um servidor
app.use(express.json()); // Permite que o express entenda json
app.use(cors()); // Permite acesso de qualquer lugar

const participantes = [
    {name: 'João', lastStatus: 12313120}, 
    {name: 'João1', lastStatus: 12313121},
    {name: 'João2', lastStatus: 12313122},
    {name: 'João3', lastStatus: 12313123},
]

const mensagens =[
    {from: 'João', to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')},
    {from: 'João1', to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')}
]


// Configura uma função pra ser executada quando bater um GET na rota "/"
app.post("/participants", (req, res) => {
    const {name} = req.body;
    console.log(dayjs().format('HH:mm:ss'));
    if (name === "") {
        console.log("Nome não pode ser vazio");
        res.status(422).send("Nome não informado");
        return
    }

    const nomeDuplicado = participantes.find(participante => participante.name === name);
    if (nomeDuplicado) {
        console.log("Nome duplicado");
        res.status(422).send("Nome duplicado");
        return
    }

    participantes.push({name: req.body.name, lastStatus: Date.now()});
    console.log(participantes);
    res.sendStatus(201);
});


app.get("/participants", (req, res) => {
    res.send(participantes);
});

app.post("/messages", (req, res) => {
    const {to, text, type} = req.body;
    const from = req.headers.user;
    let destinatario = participantes.find(participante => participante.name === from);
    if ((to === "") || (text === "") || (type !== "message" && type !== "private_message") || (!destinatario)) {
        console.log("Dados incompletos");
        res.status(422).send("Dados incompletos");
        return
    }

    mensagens.push({from, to, text, type, time: dayjs().format('HH:mm:ss')});
    console.log(mensagens);
    res.sendStatus(201);

})

app.get("/messages", (req, res) => {
    const {limit} = req.query;
    //fazer o filtro para mostrar só as mensagens destinadas a todos ou ao usuário
    
    res.send(mensagens.slice(-limit));
})



// Configura o servidor para rodar na porta 5000
app.listen(5000, console.log("Server ligado na porta 5000"));