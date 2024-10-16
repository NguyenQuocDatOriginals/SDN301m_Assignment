const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        productName: { type: String, required: true, unique: true },
        productDescription: { type: String, required: true },
        price: { type: Number, required: true, min: 0, max: 999999 },
        isFeature: { type: Boolean, default: false },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
