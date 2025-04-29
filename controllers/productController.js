// controllers/productController.js
// Required db to make sql queries
const db = require('../db/connection');

// Object containing all sql queries for easier reading
const sqlFunc = {
    // SQL Query to SELECT all
    async selectAllSql(req, res) {
        res = await db.any('SELECT * FROM product');
        return res;
    },
    // SQL Query to SELECT one
    async selectSql(req, res) {
        res = await db.oneOrNone('SELECT * FROM product WHERE id = $1', parseInt(req, 10));
        return res;
    },
    // SQL Query to INSERT
    async insertSql(req, res) {
        await db.none('INSERT INTO product (id, name, description, category, unitprice, stock, taxinfo) VALUES ($1, $2, $3, $4, $5, $6, $7)', req);
    },
    // SQL Query to UPDATE
    async updateSql(req, res) {
        await db.none('UPDATE product SET (name, description, category, unitprice, stock, taxinfo) = ($1, $2, $3, $4, $5, $6) WHERE id = $7', req);
    },
    // SQL Query to DELETE
    async deleteSql(req, res) {
        await db.none('DELETE FROM product WHERE id = $1', req);
    },
    // SQL Query to find one registry
    async findSql(req, res) {
        res = await db.oneOrNone('SELECT id FROM product WHERE id = $1', req);
        return res;
    }
};
// function that checks price and stock values
function checkVars(price, stock) {
    if (price <= 0) { return 'Price can\'t be a negative number or 0' };
    if (stock <= 0) { return 'The number of stock has to be a valid number' };
    return 1;
}
// GET /api/products - Get all products
exports.getAllProduct = (req, res) => {
    // We call the sql function that queries all items from table
    const products = sqlFunc.selectAllSql();
    // If it returns something it shows it
    products.then(p => {
        res.json({ message: 'List of products ', products: p });
    });
    // Catch any errors that may arise
    products.catch(error => {
        res.json({ message: error })
    })
}

// GET /api/products:id - Get an especific product by id
exports.getProduct = (req, res) => {
    // We first get the product id from the parameters, then we pass it to the function and get the products information
    const product = sqlFunc.selectSql(req.params.id);
    // If there is a match with the id sent, it shows it, if not, it shows an error
    product.then(p => {
        if (product === null) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({ message: 'Product found ', product: p });
    });
};

// POST /api/products - Registers a new product 
exports.addProduct = (req, res) => {
    // We convert the js object that comes in the body into an array; object -> array
    const product = Object.values(req.body);
    const { unitprice, stock } = req.body;
    // We make a function that checks if any field is null for verification purposes
    const nullableField = (field) => field === null;
    if (nullableField(product)) {
        return res.status(400).json({ message: 'All information of the product must be provided' });
    };
    // Sends unitPrice and stock number to check function, if it returns an error it shows it
    let check = checkVars(parseFloat(unitprice), parseInt(stock));
    if (check !== 1) {
        return res.status(400).json({ message: check })
    }
    // We insert the product in the db and send the corresponding message.
    sqlFunc.insertSql(product);
    res.status(201).json({ message: 'Registration successful with ID: ' + product[0].toString() })
};

// PUT /api/products/id
exports.updateProduct = (req, res) => {
    // We do something similar to update products
    const id = parseInt(req.params.id, 10);
    // First we convert the body to an js object
    const { unitprice, stock } = req.body;
    // We convert it to an array and push the id
    const product = Object.values(req.body); product.push(id);
    // checks if product exists, if it doesn't it shows an error message
    const productFind = sqlFunc.findSql(id);
    if (!productFind) {
        return res.status(404).json({ message: 'Product not found' });
    }
    // Checks if there is any null field in the body requirements body
    const nullableField = (field) => field === null;
    if (nullableField(product)) {
        return res.status(400).json({ message: 'All information of the product must be provided' });
    };
    // Sends unitPrice and stock number to check function, if it returns an error it shows it
    let check = checkVars(parseFloat(unitprice), parseInt(stock));
    if (check !== 1) {
        return res.status(400).json({ message: check })
    };
    // If no error appears in any check, it goes through and updates
    sqlFunc.updateSql(product);
    return res.status(200).json({ message: 'Product updated' })
};

// DELETE /api/products/id
exports.deleteProduct = (req, res) => {
    // Gets the id from the requirements parameters
    const id = parseInt(req.params.id, 10);
    // checks if product exists, if it doesn't it shows an error message
    const productFind = sqlFunc.findSql(id);
    if (!productFind) {
        return res.status(404).json({ message: 'Product not found' });
    }
    // if successful, sends delete query
    sqlFunc.deleteSql(id);
    return res.status(200).json({ message: 'Product registry deleted' })
};

