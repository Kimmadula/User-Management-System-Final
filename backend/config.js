module.exports = {
  database: {
    host: process.env.MYSQL_HOST || 'gondola.proxy.rlwy.net',
    port: process.env.MYSQL_PORT || 58293,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'qnrzhqBAsdQmMkQBOjZBuOXGBQWIJVJm',
    database: process.env.MYSQL_DATABASE || 'railway',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  connectionString: {
    mysql: process.env.MYSQL_URL || "mysql://root:qnrzhqBAsdQmMkQBOjZBuOXGBQWIJVJm@gondola.proxy.rlwy.net:58293/railway",
  },
  "secret": "THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING",
  "emailFrom": "info@node-mysql-signup-verification-api.com",
  "smtpOptions": {
    "host": "smtp.ethereal.email",
    "port": 587,
    "auth": {
      "user": "weldon.wyman96@ethereal.email",
      "pass": "d7DCqCD9hvWBK6FVkZ",
    },
  },
};