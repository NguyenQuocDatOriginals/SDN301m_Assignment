require("dotenv").config();
var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AccountSchema = require("../model/user.model");

/* LIST API - AUTH */

// LOGIN MEMBER
router.post("/api/members/login", async function (req, res) {
  try {
    const member = await AccountSchema.findOne({
      username: req.body.username,
    });

    if (!member) {
      return res.status(404).json({
        status: 404,
        message: "Tài khoản không đúng",
        data: null,
      });
    }

    // So sánh mật khẩu thay vì tên người dùng
    const isMatch = await bcrypt.compare(req.body.password, member.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 400,
        message: "Mật khẩu không đúng",
        data: null,
      });
    }

    // Tạo payload cho token dùng JWT.
    const payload = {
      username: member.username,
      _id: member._id,
    };

    // Tạo token với payload và secret key, thời hạn token (ví dụ: 1h)
    const token = jwt.sign(payload, process.env.TOKEN_SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({
      status: 200,
      message: "Đăng nhập thành công",
      token: "Bearer " + token,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Lỗi server",
      data: null,
    });
  }
});

// REGISTER MEMBER
router.post("/api/members/register", async function (req, res) {
  try {
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({
        status: 400,
        message: "Thiếu thông tin cần thiết",
        data: null,
      });
    }

    // Kiểm tra xem tài khoản đã tồn tại chưa
    const isExist = await AccountSchema.findOne({
      username: req.body.username,
    });

    if (isExist) {
      return res.status(400).json({
        status: 400,
        message: "Tài khoản đã tồn tại",
        data: null,
      });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Tạo tài khoản mới
    const newUser = new AccountSchema({
      username: req.body.username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      status: 201,
      message: "Đăng ký tài khoản thành công",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Lỗi server",
      data: null,
    });
  }
});

/* LIST FUNC TO DISPLAY VIEW EJS */

// LOGIN MEMBER EJS
router.get("/", async (req, res) => {
  res.render("auth/login");
});

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  const user = await AccountSchema.findOne({ username });

  if (!user) {
    return res.status(401).render("auth/login", {
      message: "Tài khoản hoặc mật khẩu không chính xác",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).render("auth/login", {
      message: "Tài khoản hoặc mật khẩu không chính xác",
    });
  }

  const token = jwt.sign(
    { _id: user._id, username: user.username },
    process.env.TOKEN_SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.cookie("access_token", token);
  res.redirect("/product/dashboard");
});

// REGISTER MEMBER EJS
router.get("/register", async (req, res) => {
  res.render("auth/register");
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const user = await AccountSchema.findOne({ username });
  if (user) {
    return res
      .status(400)
      .render("auth/register", { message: "Tài khoản đã tồn tại" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new AccountSchema({
    username,
    password: hashedPassword,
  });

  await newUser.save();
  res.redirect("/");
});

// LOGOUT
router.get("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.redirect("/");
});

module.exports = router;
