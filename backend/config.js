module.exports = {
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "node-mysql-signup-verification-api"
  },
  secret: process.env.JWT_SECRET || "THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET",
  emailFrom: "info@node-mysql-signup-verification-api.com",
  smtpOptions: {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "dallin45@ethereal.email",
      pass: "4EHmznyxJFB8WpvGSB"
    }
  }
};
