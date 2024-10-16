require("dotenv").config();
const jwt = require("jsonwebtoken");
const { TokenExpiredError } = jwt;

const verifyToken = (req, res, next) => {
  // Lấy token từ cookie. Giả sử tên cookie chứa token là 'access_token'
  const token = req.cookies["access_token"];
  if (!token) return res.redirect("/");

  jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, user) => {
    if (err) {
      if (err instanceof TokenExpiredError) {
        // Xử lý trường hợp token hết hạn
        return res.redirect("/"); // Chuyển hướng người dùng về trang đăng nhập
      } else {
        // Xử lý trường hợp token không hợp lệ
        return res
          .status(403)
          .json({ message: "Access Denied: Token is invalid or expired." });
      }
    }
    req.user = user; // Lưu thông tin người dùng vào đối tượng request để sử dụng ở các middleware tiếp theo
    next(); // Tiếp tục xử lý request
  });
};

module.exports = { verifyToken };
