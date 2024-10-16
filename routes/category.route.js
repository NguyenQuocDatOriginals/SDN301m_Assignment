require("dotenv").config();
var express = require("express");
var router = express.Router();
const CategorySchema = require("../model/category");
const { authenticate } = require("../middleware/verifyToken");
const { verifyToken } = require("../middleware/verifyToken_EJS");

// ----- PRIVATE ROUTES ------
// Sử dụng verifyToken cho tất cả các route sau
router.use(verifyToken);

/* LIST API - EJS */
router.get("/dashboard", async function (req, res) {
  try {
    const categories = await CategorySchema.find();
    res.render("category/categorydashboard", { categories });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// GET CREATE CATEGORY PAGE
router.get("/create", (req, res) => {
  res.render("category/createcategory");
});

// CREATE CATEGORY
router.post("/", async function (req, res) {
  try {
    const { categoryName, categoryDescription } = req.body;

    // Kiểm tra xem categoryName có được cung cấp không
    if (!categoryName) {
      return res.status(400).json({
        status: 400,
        message: "Thiếu thông tin categoryName",
      });
    }

    // Tạo mới category
    const newCategory = new CategorySchema({ categoryName, categoryDescription });
    await newCategory.save();

    // Chuyển hướng đến trang danh sách category
    res.redirect("/category/dashboard");
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// GET EDIT CATEGORY PAGE
router.get("/:id/edit", async function (req, res) {
  try {
    const category = await CategorySchema.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: 404,
        message: "Category không tồn tại",
      });
    }
    res.render("category/editcategory", { category });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// UPDATE CATEGORY
router.post("/:id", async function (req, res) {
  try {
    const { categoryName, categoryDescription } = req.body;

    // Kiểm tra xem categoryName có được cung cấp không
    if (!categoryName) {
      return res.status(400).json({
        status: 400,
        message: "Thiếu thông tin categoryName",
      });
    }

    // Cập nhật category
    const category = await CategorySchema.findByIdAndUpdate(req.params.id, { categoryName, categoryDescription }, { new: true });
    if (!category) {
      return res.status(404).json({
        status: 404,
        message: "Category không tồn tại",
      });
    }

    // Chuyển hướng đến trang danh sách category
    res.redirect("/category/dashboard");
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// DELETE CATEGORY
router.get("/:id/delete", async function (req, res) {
  try {
    const category = await CategorySchema.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        status: 404,
        message: "Category không tồn tại",
      });
    }

    // Chuyển hướng đến trang danh sách category
    res.redirect("/category/dashboard");
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Lỗi server",
      error: error.message,
    });
  }
});


module.exports = router;
