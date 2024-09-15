const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

// criando o router paras as rotas
const router = express.Router();

// ID do Gist e Token de Acesso do GitHub (colocados no .env)
const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Configurando os headers para autenticação
const config = {
    headers: {
        'Authorization': `token ${GITHUB_TOKEN}`
    }
};

// Função para buscar o arquivo db.json do Gist
const getGistData = async () => {
    try {
        const response = await axios.get(`https://api.github.com/gists/${GIST_ID}`, config);
        const dbJson = response.data.files['user_db.json'].content;
        return JSON.parse(dbJson);
    } catch (error) {
        console.error('Erro ao buscar o Gist:', error.message);
        return [];
    }
};

// Função para atualizar o arquivo db.json no Gist
const updateGistData = async (data) => {
    try {
        const response = await axios.patch(
            `https://api.github.com/gists/${GIST_ID}`,
            {
                files: {
                    'user_db.json': {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            },
            config
        );
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar o Gist:', error.message);
    }
};

// ? ---------- rotas ---------- ? //

// Rota para obter todos os usuários
router.get('/', async (_req, res) => {
    const users = await getGistData();
    res.json(users);
});

// Rota para buscar um usuario pelo id
router.get('/:id', async (req, res) => {
    const users = await getGistData();
    const { id } = req.params;

    const user = users.find(user => user.id === id);

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'Usuário não encontrado!' });
    }
});

// Rota para adicionar um novo usuário
router.post('/', async (req, res) => {
    const { nome, zap } = req.body;
    const users = await getGistData();

    const newUser = {
        id: crypto.randomBytes(16).toString('hex'),
        nome,
        zap
    };

    users.push(newUser);
    await updateGistData(users);

    res.status(201).json({ message: 'Usuário adicionado com sucesso!' });
});

// Rota para atualizar um usuário pelo ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updateDataUser = req.body;
    let users = await getGistData();

    let userFound = false;

    users = users.map(user => {
        if (user.id === id) {
            userFound = true;
            return { ...user, ...updateDataUser };
        }
        return user;
    });

    if (userFound) {
        await updateGistData(users);
        res.json({ message: 'Usuário atualizado com sucesso!' });
    } else {
        res.status(404).json({ message: 'Usuário não encontrado!' });
    }
});

// Rota para deletar um usuário pelo ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    let users = await getGistData();

    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex !== -1) {
        const removedUser = users.splice(userIndex, 1)[0];
        await updateGistData(users);

        res.json({ message: 'Usuário removido com sucesso!', nome: removedUser.nome });
    } else {
        res.status(404).json({ message: 'Usuário não encontrado!' });
    }
});

// exportando as rotas
module.exports = router;
