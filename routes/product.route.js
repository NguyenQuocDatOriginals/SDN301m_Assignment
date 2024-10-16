require("dotenv").config();
var express = require("express");
var router = express.Router();
const ProductSchema = require("../model/product.model");
const CategorySchema = require("../model/category");
const { verifyToken } = require("../middleware/verifyToken_EJS");

// ----- PRIVATE ROUTES ------
router.use(verifyToken);

/* LIST API - EJS */
router.get("/dashboard", async (req, res) => {
  const products = await ProductSchema.find().populate('category').exec(); // Sử dụng populate để lấy tên danh mục
  res.render("product/dashboard", { products: products });
});

// Route để bật/tắt isFeature của sản phẩm
router.get("/:id/toggle-main-task", async (req, res) => {
  try {
    const product = await ProductSchema.findById(req.params.id).exec();
    if (!product) {
      return res.status(404).send("product not found");
    }
    product.isFeature = !product.isFeature;
    await product.save();
    res.redirect("/product/dashboard");
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error.message);
  }
});

// Route để đi tới giao diện tạo sản phẩm
router.get("/create", async (req, res) => {
  const categories = await CategorySchema.find();
  res.render("product/createproduct", { categories });
});

// Route để tạo sản phẩm
router.post("/create", async (req, res) => {
  try {
    const { productName, productDescription, price, category } = req.body;

    const newProduct = new ProductSchema({
      productName,
      productDescription,
      price,
      category
    });
    await newProduct.save();
    res.redirect("/product/dashboard");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Route để đi tới giao diện cập nhật sản phẩm
router.get("/:id/edit", async (req, res) => {
  const product = await ProductSchema.findById(req.params.id).populate('category');
  const categories = await CategorySchema.find();
  res.render("product/editproduct", { product, categories });
});

// Route để cập nhật sản phẩm
router.post("/:id/edit", async (req, res) => {
  try {
    const { productName, productDescription, price, category } = req.body;
    await ProductSchema.findByIdAndUpdate(req.params.id, {
      productName,
      productDescription,
      price,
      category,
    });
    res.redirect("/product/dashboard");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Route để xóa sản phẩm
router.get("/:id/delete", async (req, res) => {
  await ProductSchema.findByIdAndDelete(req.params.id);
  res.redirect("/product/dashboard");
});

module.exports = router;
