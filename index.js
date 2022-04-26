import express from 'express';
import cors from 'cors';

const app = express(); // Cria um servidor
app.use(express.json()); // Permite que o express entenda json
app.use(cors()); // Permite acesso de qualquer lugar




// Configura uma função pra ser executada quando bater um GET na rota "/"
app.post("/participants", (req, res) => {
    const nomeUsuario = req.body;

    if (nomeUsuario.nome === "") {
        res.status(422).send("Nome não informado");
        return
    }

    // nomeDuplicado = 
});

// Configura o servidor para rodar na porta 5000
app.listen(5000);