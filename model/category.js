const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true, unique: true },
    categoryDescription: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema); 
