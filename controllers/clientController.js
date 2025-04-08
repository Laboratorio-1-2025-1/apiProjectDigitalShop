// controllers/productController.js
// db requerido para hacer uso de la conexion con la base de datos
const db = require('../db/connection');

//clase de funciones sql, para mantener el codigo limpio y ordenado y hacer las queries necesarias
const sqlFunc = {
    async selectAllSql(req, res) {
        res = await db.any('SELECT * FROM client WHERE status = \'a\'');
        return res;
    },
    async selectSql(req, res) {
        res = await db.oneOrNone('SELECT * FROM client WHERE id = $1 AND status = \'a\'', req.toString());
        return res;
    },
    async insertSql(req, res) {
        await db.none('INSERT INTO client (id, name, lastName, mail, phone, address) VALUES ($1, $2, $3, $4, $5, $6)', req);
    },
    async updateSql(req, res) {
        await db.none('UPDATE client SET (name, lastName, mail, phone, address) = ($1, $2, $3, $4, $5) WHERE id = $6 AND status = \'a\'', req);
    },
    async deleteSql(req, res) {
        await db.none('UPDATE client SET status = \'i\' WHERE id = $1', req);
    },
    async findSql(req, res) {
        res = await db.oneOrNone('SELECT id FROM client WHERE id = $1 AND status = \'a\'', req);
        return res;
    }
};
// GET /api/clients - Get all clients
exports.getAllClient = (req, res) => {
    const clients = sqlFunc.selectAllSql();
    clients.then(c => {
        res.json({ message: 'List of clients ', clients: c });
    })
}


// GET /api/clients:id - Get an especific client by id
exports.getClient = (req, res) => {
    // We first get the client id from the parameters, then we pass it to the function and get the clients information
    const client = sqlFunc.selectSql(req.params.id);
    client.then(c => {
        if (client === null) {
            return res.status(404).json({ message: "Client not found" });
        }
        res.json({ message: 'Client found ', client: c });
    });
    client.catch(error => {
        return res.json({ message: error });
    })

};

// POST /api/clients - Registers a new client 
exports.addClient = (req, res) => {
    // We convert the js object that comes in the body into an array; object -> array
    const client = Object.values(req.body);
    // We make a function that checks if any field is null for verification purposes
    const nullableField = (field) => field === null;
    if (nullableField(client)) {
        return res.status(400).json({ message: 'All information of the client must be provided' });
    };
    // Hacer verificacion de correo
    // We insert the client in the db and send the corresponding message.
    sqlFunc.insertSql(client);
    res.status(201).json({ message: 'Registration successful with ID:' + client[0].toString() })
};

// PUT /api/clients/id
exports.updateClient = (req, res) => {
    // We do something similar to update clients
    const id = parseInt(req.params.id, 10);
    // First we convert the body to an js object
    // const c = req.body;
    // We convert it to an array and push the id
    const client = Object.values(req.body); client.push(id);
    const clientFind = sqlFunc.findSql(id);
    if (!clientFind) {
        return res.status(404).json({ message: 'Client not found' });
    }
    //Hacer el check del update dinamico, asi no hay que llenar todo con datos
    sqlFunc.updateSql(client);
    return res.status(200).json({ message: 'Client updated' })
};

// DELETE /api/clients/id
exports.deleteClient = (req, res) => {
    const id = parseInt(req.params.id, 10);
    const clientFind = sqlFunc.findSql(id);
    if (!clientFind) {
        return res.status(404).json({ message: 'Client not found' });
    }
    //Hacer check sobre si realmente se desea borrar
    sqlFunc.deleteSql(id);
    return res.status(200).json({ message: 'Client registry deleted' })
};

