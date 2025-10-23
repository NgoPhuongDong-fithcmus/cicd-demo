// File: server.js
const app = require('./app.js');
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server giỏ hàng đang chạy tại http://localhost:${PORT}`);
});