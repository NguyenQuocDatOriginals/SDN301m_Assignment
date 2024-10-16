const jwt = require("jsonwebtoken");
// Middleware to validate token
exports.authenticate = (req, res, next) => {
  const token = req.header("Authorization")
    ? req.header("Authorization").replace("Bearer ", "")
    : null;

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: "Mời bạn đăng nhập tài khoản trước khi thực hiện thao tác",
      data: null,
    });
  }

  try {
    // Thay "secretkey" bằng khóa bí mật thực sự của bạn.
    // Trong môi trường sản xuất, nên lưu trữ khóa bí mật này trong biến môi trường hoặc một nơi an toàn khác.

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: "Invalid token." });
  }
};

// Middleware to authorize based on user role
exports.authorize = (role) => (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(403).json({
      status: 403,
      message: "Mời bạn đăng nhập tài khoản trước khi thực hiện thao tác",
      data: null,
    });
  }
};
