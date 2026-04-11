const mysql = require("mysql2/promise");
let pool;
const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      socketPath: "/tmp/mysql.sock",
      user: "u518768974_amshine_user",
      password: "SandeepShweta@23",
      database: "u518768974_amshine",
      waitForConnections: true,
      connectionLimit: 10,
      timezone: "Z",
    });
  }
  return pool;
};
module.exports = getPool;
