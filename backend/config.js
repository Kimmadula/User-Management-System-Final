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
  "secret": process.env.JWT_SECRET || "b75e6f50c2333a5b13ae5f79bfc88b3e0a4e5dc4126de8e1a789ae0d5cf7251a",
  "emailFrom": "pat.fadel35@ethereal.email",
  "smtpOptions": {
    "host": "smtp.ethereal.email",
    "port": 587,
    "auth": {
      "user": "pat.fadel35@ethereal.email",
      "pass": "UsXwhTQSY9pmYGGrSC"
    }
  }
};
