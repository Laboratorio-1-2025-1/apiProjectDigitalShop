// /controllers/receiptController.js

// Here will be the controller file, methods and such to process receipts from clients

const db = require('../db/connection');
const sqlFunc = {
    // SQL Query to SELECT all
    async selectAllSql(req, res) {
        res = await db.any('SELECT id, clientid FROM receipt');
        return res;
    },
    // SQL Query to SELECT one
    async selectSql(req, res) {
        res = await db.oneOrNone('SELECT * FROM receipt WHERE id = $1', req);
        return res;
    },
    // SQL Query to INSERT
    async insertSql(req, res) {
        await db.none('INSERT INTO receipt (receiptnr, totalAmount, emitDate, clientid, shopid) VALUES ($1, 0, $2, $3, $4)', req);
    },
    // SQL Query to UPDATE
    async updateSql(req, res) {
        await db.none('UPDATE receipt SET status = $1 WHERE id = $2', req);
    },
    // SQL Query to find one registry with status
    async findSql(req, res) {
        res = await db.oneOrNone('SELECT id FROM $1 WHERE id = $2 AND status = \'a\'', req);
        return res;
    },
    // SQL Query to find one registry
    async findSql2(req, res) {
        res = await db.oneOrNone('SELECT id FROM $1 WHERE id = $2', req);
        return res;
    },
    // SQL Query to check valid order registry, if so, return product info with only one connection
    async checkAvailability(req, res) {
        return db.task(async t => {
            const order = await t.one('SELECT id FROM receipt WHERE id = $1', req[0])
            if(order) {
                return t.one('SELECT id, unitprice, stock, taxinfo FROM product WHERE id = $1', req[1])
            }
            return [];
        })
        .then(product =>{
            return product;
        })
        .catch(error => {
            return error
        });
    },
    // SQL Query to insert receipt detail and update receipt totalAmount
    async insertReceiptSql(req, res) {
        db.task(async t => {
            await t.none('INSERT INTO receiptdetail (receiptId, productId, quantity, price, subtotal, tax, discount) VALUES ($1, $2, $3, $4, $5, $6, 0)', req);
            await t.none('UPDATE receipt SET totalAmount = totalAmount + $1', req[4]);
        })
    }
};
// GET /api/receipt - Get all receipts
exports.getAllReceipts = (req, res) => {
    // We call the sql function that queries all items from table
    const receipt = sqlFunc.selectAllSql();
    // If it returns something it shows it
    receipt.then(r => {
        res.status(200).json({ message: 'List of receipts ', receipts: r });
    })
}

// GET /api/receipt:id - Get an especific receipt by id
exports.getReceipt = (req, res) => {
    // We first get the receipt id from the parameters, then we pass it to the function and get the receipt information
    const receipt = sqlFunc.selectSql(req.params.id);
    // When we resolve the promise we check, if it was done or if there was a problem.
    receipt.then(r => {
        if (receipt === null) {
            return res.status(404).json({ message: "Receipt not found" });
        }
        res.status(200).json({ message: 'Receipt found ', receipt: r });
    });
    receipt.catch(error => {
        return res.json({ message: error });
    })

};
// POST /api/receipt - Start and register one receipt 
exports.startReceipt = (req, res) => {
    const { receiptnr, clientId, shopId } = req.body;
    const date = new Date(); date.setHours(0, 0, 0, 0);
    const client = sqlFunc.findSql(['client', clientId]);
    const nullableField = (field) => field === null;
    if (nullableField(receipt)) {
        return res.status(400).json({ message: 'All information of the product must be provided' });
    };
    client.then(c => {
        if (!client) {
            return res.status(404).json({ message: "The client does not exist or is not active " });
        }
    });
    client.catch(error => {
        return res.json({ error: error });
    });
    sqlFunc.insertSql([receiptnr, date, clientId, shopId]);
    res.status(201).json({ message: "Receipt succesfully made", Number: id })
};

// POST /api/receipt/:id - Add items to receipt
exports.updateReceipt = (req, res) => {
    // Gets the id from the requirements parameters
    const idReceipt = parseInt(req.params.id, 10);
    // Converts the body into an array and it retrieves constants from it
    const { productId, quantity } = req.body;
    const receipt = Object.values(req.body);
    // Checks if there is any null field in the body requirements body, if so, returns an error message
    const nullableField = (field) => field === null;
    if (nullableField(receipt)) {
        return res.status(400).json({ message: 'All information of the product must be provided' });
    };
    if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity of the product must be non negative' })
    }
    const receiptDetail = checkAvailability([idReceipt, productId]);
    receiptDetail.then(o => {
        let subtotal = o.unitprice * quantity;
        let total = 0;
        let tax = 0;
        if (o.taxinfo === 'i') {
            tax = subtotal * 0.16;
            total = subtotal - tax;
        }
        else {
            tax = 0;
            total = subtotal;
        };
        sqlFunc.insertReceiptSql([idReceipt, productId, quantity, total, subtotal, tax]);
        return res.status(201).json({ message: "Receipt succesful" });
    });
    receiptDetail.catch(error => {
        return res.json({ error: error });
    })
}

// PUT /api/receipt/:id/status - Change status of the receipt

exports.updateReceiptStatus = (req, res) => {
    //We parse and get the id from the parameters
    const idReceipt = parseInt(req.params.id, 10);
    // We get status from the req.body;
    const status = req.body;
    // We send the receipt find function if it gets it, it checks for which status the user will transform it into
    const receipt = sqlFunc.findSql2(['receipt', idReceipt]);
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