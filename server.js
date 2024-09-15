require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');

// inportando as rotas de usuários
const userRouters = require('./routes/users-disabled');

// criando o servidor
const app = express();

// iniciando o cors
app.use(cors());

// porta que sera usado para o servidor
const port = process.env.PORT || 3000; 

// middleware para lidar com dados JSON
app.use(express.json());

// criando a pasta root 'data' caso não exista
// const root = './data';
// fs.mkdir(root, { recursive: true}, (err) => {
//     if (err) {
//         return console.error('Erro ao criar o diretório:', err.message);
//     } else {
//         console.log('Diretório criado com sucesso!');
//     }
// });

app.use('/users', userRouters);

// inicia o servidor
app.listen(port, () => {
    console.log(`server is running in port: ${port}`);
})