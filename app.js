// File: app.js
const express = require('express');
const cart = require('./cartStore.js'); // Import "database" giỏ hàng
const app = express();

app.use(express.json()); // Middleware để đọc JSON

// === API 1: GET /cart ===
// Lấy toàn bộ giỏ hàng
app.get('/cart', (req, res) => {
  res.status(200).json(cart);
});

// === API 2: POST /cart ===
// Thêm sản phẩm vào giỏ
app.post('/cart', (req, res) => {
  const { productId, name, quantity } = req.body;

  // Validation
  if (!productId || !name || !quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ (cần productId, name, quantity > 0)' });
  }

  // Logic nghiệp vụ:
  // 1. Kiểm tra xem sản phẩm đã có trong giỏ chưa
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    // 2. Nếu có rồi -> Cập nhật số lượng
    existingItem.quantity += quantity;
    res.status(200).json(existingItem);
  } else {
    // 3. Nếu chưa có -> Thêm mới vào giỏ
    const newItem = { productId, name, quantity };
    cart.push(newItem);
    res.status(201).json(newItem); // 201 = Created
  }
});

// === API 3: DELETE /cart/:id ===
// Xóa sản phẩm khỏi giỏ
app.delete('/cart/:id', (req, res) => {
  const productIdToRemove = parseInt(req.params.id, 10); // Lấy ID từ URL

  // Tìm vị trí của sản phẩm
  const indexToRemove = cart.findIndex(item => item.productId === productIdToRemove);

  if (indexToRemove !== -1) {
    // Nếu tìm thấy -> Xóa khỏi mảng
    const [removedItem] = cart.splice(indexToRemove, 1);
    res.status(200).json(removedItem); // Trả về item đã xóa
  } else {
    // Nếu không tìm thấy -> Báo lỗi
    res.status(404).json({ error: 'Sản phẩm không tìm thấy trong giỏ' });
  }
});

module.exports = app;