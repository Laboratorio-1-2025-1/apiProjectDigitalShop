// /controllers/receiptController.js

// Here will be the controller file, methods and such to process receipts from clients

const db = require('../db/connection');
const sqlFunc = {
    async selectAllSql(req, res) {
        res = await db.any('SELECT (id, clientid) FROM receipt');
        return res;
    },
    async selectSql(req, res) {
        res = await db.oneOrNone('SELECT * FROM receipt WHERE id = $1', req);
        return res;
    },
    async insertSql(req, res) {
        await db.none('INSERT INTO receipt (receiptnr, totalAmount, emitDate, clientid, shopid) VALUES ($1, 0, $2, $3, $4)', req);
    },
    async updateSql(req, res) {
        await db.none('UPDATE receipt SET status = $1 WHERE id = $2', req);
    },
    async findSql(req, res) {
        res = await db.oneOrNone('SELECT id FROM client WHERE id = $1 AND status = \'a\'', req);
        return res;
    },
    async findSql2(req, res) {
        res = await db.oneOrNone('SELECT id FROM shop WHERE id = $1', req);
        return res;
    },
    async findSql3(req, res) {
        res = await db.oneOrNone('SELECT id from receipt WHERE id = $1', req);
        return res;
    },
    async checkAvailability(req, res) {
        db.task(async t => {
            return t.one('SELECT id FROM receipt WHERE id = $1', req[0])
                .then(async p => {
                    res = await t.one('SELECT (id, unitprice, stock, taxinfo) FROM product WHERE id = $1', req[1])
                    return res;
                })
                .catch(error => {
                    res = error;
                    return res
                });
        })
    },
    async insertReceiptSql(req, res) {
        db.task(t => {
            t.none('INSERT INTO receiptdetail (receiptId, productId, quantity, price, subtotal, tax, discount) VALUES ($1, $2, $3, $4, $5, $6, 0)', req);
            t.none('UPDATE receipt SET totalAmount = totalAmount + $1', req[4]);
        })
    }
};
// GET /api/receipt - Get all clients
exports.getAllReceipts = (req, res) => {
    const receipt = sqlFunc.selectAllSql();
    receipt.then(r => {
        res.json({ message: 'List of receipts ', receipts: r });
    })
}

// GET /api/receipt:id - Get an especific receipt by id
exports.getReceipt = (req, res) => {
    // We first get the receipt id from the parameters, then we pass it to the function and get the receipt information
    const receipt = sqlFunc.selectSql(req.params.id);
    // When we resolve the promise we check, if it was done or if there was a problem.
    receipt.then(o => {
        if (receipt === null) {
            return res.status(404).json({ message: "Receipt not found" });
        }
        res.json({ message: 'Receipt found ', client: o });
    });
    receipt.catch(error => {
        return res.json({ message: error });
    })

};
// POST /api/receipt - Start and register one receipt 
exports.startReceipt = (req, res) => {
    const { receiptnr, clientId, shopId } = req.body;
    const date = new Date(); date.setHours(0, 0, 0, 0);
    const client = sqlFunc.findSql(clientId);
    client.then(c => {
        if (!client) {
            return res.status(404).json({ message: "The client does not exist or is not active " });
        }
    });
    client.catch(error => {
        return res.status(400).json({ error: error });
    });
    sqlFunc.insertSql([receiptnr, date, clientId, shopId]);
    res.json({ message: "Receipt succesfully made", Number: id })
};

// POST /api/receipt/:id - Add items to receipt
exports.updateReceipt = (req, res) => {
    // The program receives the 
    const idReceipt = parseInt(req.params.id, 10);
    const { productId, quantity } = req.body;
    const receipt = Object.values(req.body);
    const nullableField = (field) => field === null;
    if (nullableField(receipt)) {
        return res.status(400).json({ message: 'All information of the product must be provided' });
    };
    if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity of the product must be non negative' })
    }
    const receiptDetail = checkAvailability([idReceipt, productId]);
    receiptDetail.then(o => {
        const subtotal = o[0]["unitprice"] * quantity;
        const total = 0;
        const tax = 0;
        if (o[0]["taxinfo" === 'i']) {
            tax = subtotal * 0.16;
            total = subtotal - tax;
        }
        else {
            tax = 0;
            total = subtotal;
        };
        sqlFunc.insertReceiptSql([idReceipt, productId, quantity, total, subtotal, tax]);
        return res.json({ message: "Receipt succesful" });
    });
    receiptDetail.catch(error => {
        return res.json({ error: error });
    })
}

// PUT /api/receipt/:id - Change status of the receipt

exports.updateReceiptStatus = (req, res) => {
    //We parse and get the id from the parameters
    const idReceipt = parseInt(req.params.id, 10);
    // We get status from the req.body;
    const status = req.body;
    // We send the receipt find function if it gets it, it checks for which status the user will transform it into
    const receipt = sqlFunc.findSql3(idReceipt);
    receipt.then(r => {
        if (status === 'c') {
            return res.status(200).json({ message: "Receipt successfully cancelled" })
        }
        if (status === 'p') {
            return res.status(200).json({ message: "Receipt successfully paid" })
        }
        if (status === 'n') {
            return res.status(200).json({ message: "Receipt successfully changed to pending" })
        }
        else {
            return res.status(400).json({ message: "Insert a valid receipt status: a, p, n" });
        }
    });
    receipt.catch(error => {
        return res.json({ error: error });
    })
}