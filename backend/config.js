module.exports = {
  database: {
    DB_HOST="mysql.railway.internal",
    DB_PORT=3306,
    DB_USER="root",
    DB_PASSWORD="qnrzhqBAsdQmMkQBOjZBuOXGBQWIJVJm",
    DB_NAME="railway"
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
