module.exports = {
  database: {
    host: process.env.DB_HOST || "gondola.proxy.rlwy.net",
    port: process.env.DB_PORT || 58293,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "qnrzhqBAsdQmMkQBOjZBuOXGBQWIJVJm",
    database: process.env.DB_NAME || "railway"
  },
  connectionString: {
    mysql: process.env.MYSQL_URL || "mysql://root:qnrzhqBAsdQmMkQBOjZBuOXGBQWIJVJm@gondola.proxy.rlwy.net:58293/railway"
  },
  secret: process.env.JWT_SECRET || "THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET",
  emailFrom: "info@node-mysql-signup-verification-api.com",
  smtpOptions: {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "colin.morar@ethereal.email",
      pass: "AAPwTyBe5B8xZd3f6e"
    }
  }
};
