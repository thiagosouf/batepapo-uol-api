import express from 'express';
import cors from 'cors';

const app = express(); // Cria um servidor
app.use(express.json()); // Permite que o express entenda json
app.use(cors()); // Permite acesso de qualquer lugar

const participantes = [
    {name: 'João', lastStatus: 12313120}, 
    {name: 'João1', lastStatus: 12313121},
    {name: 'João2', lastStatus: 12313122},
    {name: 'João3', lastStatus: 12313123},
]


// Configura uma função pra ser executada quando bater um GET na rota "/"
app.post("/participants", (req, res) => {
    const {name} = req.body;
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


app.post("")

// Configura o servidor para rodar na porta 5000
app.listen(5000, console.log("Server ligado na porta 5000"));