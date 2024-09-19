const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/SDN301m_Assignment1';
mongoose.connect(url)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

const express = require('express');
const bodyParser = require('body-parser');

const Category = require('./models/category');
const Product = require('./models/product');

const app = express();
app.use(bodyParser.json());

app.post('/categories', (req, res) => {
    Category.create(req.body)
        .then(category => res.status(201).json(category))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/categories', (req, res) => {
    Category.find()
        .populate('products')
        .then(categories => res.json(categories))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/categories/:id', (req, res) => {
    Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(category => res.json(category))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/categories/:id', (req, res) => {
    Category.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({ error: err.message }));
});

app.post('/products', (req, res) => {
    Product.create(req.body)
        .then(product => {
            return Category.findByIdAndUpdate(product.category, { $push: { products: product._id } });
        })
        .then(() => res.status(201).json({ message: 'Product created successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/products', (req, res) => {
    Product.find()
        .populate('category')
        .then(products => res.json(products))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/products/:id', (req, res) => {
    Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
        .then(product => res.json(product))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/products/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).end())
        .catch(err => res.status(500).json({ error: err.message }));
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});