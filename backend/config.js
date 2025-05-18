module.exports = {
  database: {
    host: process.env.MYSQL_HOST || 'gondola.proxy.rlwy.net',
    port: process.env.MYSQL_PORT || 41895,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'AcidxSKHXcGXckKZcsHAEtyNOjuufpXI',
    database: process.env.MYSQL_DATABASE || 'railway',
  },
  connectionString: {
    mysql: process.env.MYSQL_URL || "mysql://root:AcidxSKHXcGXckKZcsHAEtyNOjuufpXI@gondola.proxy.rlwy.net:41895/railway",
  },
  "secret": "THIS IS USED TO SIGN AND VERIFY JWT TOKENS, REPLACE IT WITH YOUR OWN SECRET, IT CAN BE ANY STRING",
  "emailFrom": "info@node-mysql-signup-verification-api.com",
  "smtpOptions": {
    "host": "smtp.ethereal.email",
    "port": 587,
    "auth": {
      "user": "omari.rau3@ethereal.email",
      "pass": "vwA3fUfz4bYt7FukbH",
    },
  },
};