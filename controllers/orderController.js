// /controllers/orderController.js

// Here will be the controller file, methods and such to process orders from clients

const db = require('../db/connection');
const sqlFunc = {
    // SQL Query to SELECT all
    async selectAllSql(req, res) {
        res = await db.any('SELECT id, clientid FROM clientorder');
        return res;
    },
    // SQL Query to SELECT one
    async selectSql(req, res) {
        res = await db.oneOrNone('SELECT * FROM clientorder WHERE id = $1', req);
        return res;
    },
    // SQL Query to INSERT
    async insertSql(req, res) {
        await db.none('INSERT INTO clientorder (id, startdate, totalAmount, clientid) VALUES ($1, $2, $3, $4)', req);
    },
    // SQL Query to find one registry
    async findSql(req, res) {
        res = await db.oneOrNone('SELECT id FROM client WHERE id = $1 AND status = \'a\'', req);
        return res;
    },
    // SQL Query to check valid order registry, if so, return product info with only one connection
    async checkAvailability(req, res) {
        return db.task(async t => {
            const order = await t.one('SELECT id FROM clientorder WHERE id = $1', req[0])
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
    // SQL Query to update many tables based on previous operations
    async insertOrderSql(req, res) {
        db.task(async t => {
            // Insert into orderDetail
            await t.none('INSERT INTO orderdetail (orderId, productId, quantity, price, subtotal, tax, discount) VALUES ($1, $2, $3, $4, $5, $6, 0)', req);
            // Update product stock
            await t.none('UPDATE product SET stock = $1', req[6]);
            // Update clientOrder totalAmount
            await t.none('UPDATE clientorder SET totalAmount = totalAmount + $1', req[3]);
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
    // Using then and catch it receives the Promise result
    order.then(o => {
        // if successful, but no order is found, it shows an error message
        if (order === null) {
            return res.status(404).json({ message: "Order not found" });
        }
        // if succesful, and there's a matching order, it shows the information of it
        res.json({ message: 'Order found ', order: o });
    })
    // catch any error if unsuccessful
    order.catch(error => {
        return res.json({ message: error });
    })

};
// POST /api/order - Start and register one order 
exports.startOrder = (req, res) => {
    // Gets variables from the requirements body
    const { id, clientid } = req.body;
    // Gets a new date, sets the hours to 0 (only handles dd/mm/yyyy)
    const date = new Date(); date.setHours(0, 0, 0, 0);
    // Sends clientId to find a client registry
    const client = sqlFunc.findSql(clientid);
    // if client doesn't exist, it shows this error
    client.then(c => {
        if (!c) {
            return res.status(404).json({ message: "The client does not exist or is not active " });
        }
    })
    // catch any error if promise resolve is unsuccessful
    client.catch(error => {
        return res.status(400).json({ error: error });
    });
    // if no error is found, sends the data in an array to insert in db
    sqlFunc.insertSql([id, date, 0, clientid]);
    res.json({ message: "Order succesfully made", ID: id })
};

// PUT /api/order:id - Updates the order, inserting items one to one
exports.updateOrder = (req, res) => {
    // Gets the orderId from the requisites
    const orderId = parseInt(req.params.id, 10);
    // Gets variables from the requirement body AND converts it to an array
    const { productId, quantity } = req.body;
    // Array is used to check for null fields
    const order = Object.values(req.body);
    const nullableField = (field) => field === null;
    if (nullableField(order)) {
        return res.status(400).json({ message: 'All information of the product must be provided' });
    };
    // If quantity inserted is less or equal than 0, shows an error message
    if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity of the product must be non negative' })
    };
    // If it passes the checks, it goes to the checkAvailability function, that checks for order registry and product information
    const orderDetail = sqlFunc.checkAvailability([orderId, productId]);
    // if found
    orderDetail.then(o => {
        // it checks if product stock in db is less than quantity ordered, if so, shows an error message
        if (o.stock < quantity) {
            return res.status(400).json({ message: "Quantity inserted exceeds the quantity in stock" })
        }
        // Variable declaration, subtotal: price without taxes, taxes calculation and total price
        let subtotal = o.unitprice * quantity;
        let total = 0;
        let tax = 0;
        if (o.taxinfo === 'i') {
            tax = subtotal * 0.16;
            total = subtotal + tax;
        }
        else {
            tax = 0;
            total = subtotal;
        };
        // productStock: new product stock after quantity was substracted from initial inventory levels
        const productStock = o.stock - quantity;
        // array that contains all values to pass to insertOrder function
        const orderArray = [orderId, productId, quantity, total, subtotal, tax, productStock];
        sqlFunc.insertOrderSql(orderArray);
        return res.json({ message: "Order succesful" });
    })
    // catch any error that arises after unsuccessful promise resolve
    orderDetail.catch(error => {
        return res.json({ error: error });
    })
}