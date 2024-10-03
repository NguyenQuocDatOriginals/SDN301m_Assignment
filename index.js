const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Account = require('./models/account');
const Category = require('./models/category');
const Product = require('./models/product');

const app = express();

const url = 'mongodb://localhost:27017/SDN301m_Assignment';
mongoose.connect(url)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

app.use(bodyParser.json());

const JWT_SECRET = ' ';

Account.findOne({ username: 'admin' })
    .then(user => {
        if (!user) {
            Account.create({ username: 'admin', password: '123456' })
                .then(() => console.log('Admin account created'));
        }
    })
    .catch(err => console.log(err));

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    Account.create({ username, password })
        .then(() => res.status(201).json({ message: 'Account created successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    Account.findOne({ username })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }
            return user.comparePassword(password)
                .then(isMatch => {
                    if (!isMatch) {
                        return res.status(401).json({ error: 'Invalid username or password' });
                    }
                    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET);
                    res.json({ token });
                });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/categories', authenticateJWT, (req, res) => {
    Category.create(req.body)
        .then(category => res.status(201).json(category))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/categories', authenticateJWT, (req, res) => {
    Category.find()
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/categories/:id', authenticateJWT, (req, res) => {
    Category.findById(req.params.id)
        .then(category => {
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.json(category);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/categories/:id', authenticateJWT, (req, res) => {
    Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(category => res.json(category))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/categories/:id', authenticateJWT, (req, res) => {
    Category.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/products', authenticateJWT, (req, res) => {
    Product.create(req.body)
        .then(product => {
            return Category.findByIdAndUpdate(product.category, { $push: { products: product._id } });
        })
        .then(() => res.status(201).json({ message: 'Product created successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/products', authenticateJWT, (req, res) => {
    Product.find()
        .then(products => res.json(products))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/products/:id', authenticateJWT, (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.json(product);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/products/:id', authenticateJWT, (req, res) => {
    Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(product => res.json(product))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/products/:id', authenticateJWT, (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({ error: err.message }));
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});