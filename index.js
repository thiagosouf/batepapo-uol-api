import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';

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
    {from: 'João1', to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')},
    {from: 'João1', to: 'João', text: 'entra na sala...', type: 'private_message', time: dayjs().format('HH:mm:ss')}
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
    mensagens.push({from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs().format('HH:mm:ss')});
    console.log(participantes);
    console.log(mensagens)
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
    console.log("headers")
    console.log (req.headers)
    const {limit} = req.query;
    const Visivel = mensagens.filter(mensagem => {
        return(mensagem.to === "Todos" || mensagem.to === req.headers.user || mensagem.from === req.headers.user)});
    res.send(Visivel.slice(-limit));
})

app.post("/status", (req, res) => {
    const {user} = req.headers;
    let participante = participantes.find(participante => participante.name === user);

    if (!participante) {
        console.log("Participante não encontrado");
        res.status(404).send("Participante não encontrado");
        return
    }

    participantes.map((participante, index) => {
        if (Date.now() - participante.lastStatus > 10000){
            mensagens.push({from: participante.name, to: 'Todos', text: 'saiu da sala...', type: 'status', time: dayjs().format('HH:mm:ss')});
            participantes.splice(index, 1);
        };
    });

    participante.lastStatus = Date.now();
    console.log("participante: " + participante.lastStatus);

    // setInterval(() => {
    //     const participantesAtivos = participantes.filter(participante => {
    // })})

    res.sendStatus(200);
})



// Configura o servidor para rodar na porta 5000
app.listen(5000, console.log("Server ligado na porta 5000"));