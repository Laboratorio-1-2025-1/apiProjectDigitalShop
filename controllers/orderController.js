// /controllers/orderController.js

// Here will be the controller file, methods and such to process orders from clients

const db = require('../db/connection');
const sqlFunc = {
    async selectAllSql(req, res) {
        res = await db.any('SELECT (id, clientid) FROM clientorder');
        return res;
    },
    async selectSql(req, res) {
        res = await db.oneOrNone('SELECT * FROM clientorder WHERE id = $1', req);
        return res;
    },
    async insertSql(req, res) {
        await db.none('INSERT INTO clientorder (id, startdate, totalAmount, clientid) VALUES ($1, $2, $3, $4)', req);
    },
    async findSql(req, res) {
        res = await db.oneOrNone('SELECT id FROM client WHERE id = $1 AND status = \'a\'', req);
        return res;
    },
    async checkAvailability(req, res) {
        db.task(async t => {
            return t.one('SELECT id FROM clientorder WHERE id = $1', req[0])
                .then(async p => {
                    res = await t.one('SELECT (id, unitprice, stock, taxinfo) FROM product WHERE id = $1', req[1])
                    return res;
                })
                .catch(error => {
                    res = error;
                    return res
                });
        });
        return res;
    },
    async insertOrderSql(req, res) {
        db.task(async t => {
            t.none('INSERT INTO orderdetail (orderId, productId, quantity, price, subtotal, tax, discount) VALUES ($1, $2, $3, $4, $5, $6, 0)', req);
            t.none('UPDATE product SET stock = $1', req[7]);
            t.none('UPDATE clientorder SET totalAmount = totalAmount + $1', req[4]);
        })
    }
};
// GET /api/order - Get all clients
exports.getAllOrders = (req, res) => {
    const order = sqlFunc.selectAllSql();
    order.then(o => {
        res.json({ message: 'List of orders ', orders: o });
    })
}

// GET /api/order:id - Get an especific client by id
exports.getOrder = (req, res) => {
    // We first get the order id from the parameters, then we pass it to the function and get the order information
    const order = sqlFunc.selectSql(req.params.id);
    order.then(o => {
        if (order === null) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json({ message: 'Order found ', order: o });
    });
    order.catch(error => {
        return res.json({ message: error });
    })

};
// POST /api/order - Start and register one order 
exports.startOrder = (req, res) => {
    const { id, clientid } = req.body;
    const date = new Date(); date.setHours(0, 0, 0, 0);
    const client = sqlFunc.findSql(clientid);
    client.then(c => {
        if (!client) {
            return res.status(404).json({ message: "The client does not exist or is not active " });
        }
    });
    client.catch(error => {
        return res.status(400).json({ error: error });
    });
    sqlFunc.insertSql([id, date, 0, clientid]);
    res.json({ message: "Order succesfully made", ID: id })
};

exports.updateOrder = (req, res) => {
    const idOrder = parseInt(req.params.id, 10);
    const { productId, quantity } = req.body;
    const order = Object.values(req.body);
    const nullableField = (field) => field === null;
    if (nullableField(order)) {
        return res.status(400).json({ message: 'All information of the product must be provided' });
    };
    if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity of the product must be non negative' })
    }
    const orderDetail = sqlFunc.checkAvailability([idOrder, productId]);
    orderDetail.then(o => {
        if (o["stock"] < quantity) {
            return res.status(400).json({ message: "Quantity inserted exceeds the quantity in stock" })
        }
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
        const productStock = o[0]["stock"] - quantity;
        sqlFunc.insertOrderSql([idOrder, productId, quantity, total, subtotal, tax, productStock]);
        return res.json({ message: "Order succesful " });
    });
    orderDetail.catch(error => {
        return res.json({ error: error });
    })
}