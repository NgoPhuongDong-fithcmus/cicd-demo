// File: app.test.js
const request = require('supertest');
const app = require('./app.js');
const cart = require('./cartStore.js'); // Import "database" giả

// === Mocking Database ===
// TRƯỚC MỖI TEST, "database" giỏ hàng sẽ được reset
beforeEach(() => {
  cart.length = 0; // Xóa sạch giỏ hàng
});

// === Bắt đầu Test ===
describe('API Giỏ hàng', () => {

  // Test 1: Test thêm sản phẩm mới
  test('POST /cart: Nên thêm sản phẩm mới vào giỏ', async () => {
    const newItem = { productId: 101, name: 'Laptop', quantity: 1 };
    
    const response = await request(app)
      .post('/cart')
      .send(newItem);
      
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Laptop');
    expect(cart.length).toBe(1); // Database phải có 1 item
    expect(cart[0].quantity).toBe(1);
  });

  // Test 2: Test cập nhật số lượng
  test('POST /cart: Nên cập nhật số lượng nếu sản phẩm đã tồn tại', async () => {
    // 1. "Dàn cảnh": Thêm 1 item vào database trước
    cart.push({ productId: 101, name: 'Laptop', quantity: 1 });
    
    // 2. Gửi request POST để thêm CÙNG SẢN PHẨM đó
    const updateItem = { productId: 101, name: 'Laptop', quantity: 2 };
    const response = await request(app)
      .post('/cart')
      .send(updateItem);
      
    expect(response.statusCode).toBe(200); // Status là 200 (OK), không phải 201
    expect(cart.length).toBe(1); // Database vẫn chỉ có 1 item
    expect(cart[0].quantity).toBe(3); // Số lượng đã được cộng dồn (1 + 2 = 3)
  });

  // Test 3: Test validation
  test('POST /cart: Nên trả về 400 nếu dữ liệu không hợp lệ', async () => {
    const badItem = { productId: 102 }; // Thiếu 'name' và 'quantity'
    
    const response = await request(app)
      .post('/cart')
      .send(badItem);
      
    expect(response.statusCode).toBe(400);
    expect(cart.length).toBe(0); // Database không được thêm gì
  });

  // Test 4: Test GET
  test('GET /cart: Nên trả về giỏ hàng', async () => {
    // Dàn cảnh: Thêm 2 item
    cart.push({ productId: 101, name: 'Laptop', quantity: 1 });
    cart.push({ productId: 102, name: 'Mouse', quantity: 2 });
    
    const response = await request(app).get('/cart');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[1].name).toBe('Mouse');
  });
  
  // Test 5: Test DELETE
  test('DELETE /cart/:id: Nên xóa item khỏi giỏ', async () => {
    // Dàn cảnh: Thêm 2 item
    cart.push({ productId: 101, name: 'Laptop', quantity: 1 });
    cart.push({ productId: 102, name: 'Mouse', quantity: 2 });
    
    // Gửi request xóa item 101
    const response = await request(app).delete('/cart/101'); 
    
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Laptop'); // Trả về item đã xóa
    expect(cart.length).toBe(1); // Giỏ hàng chỉ còn 1
    expect(cart[0].name).toBe('Mouse'); // Item còn lại là 'Mouse'
  });
  
  // Test 6: Test DELETE (không tìm thấy)
  test('DELETE /cart/:id: Nên trả về 404 nếu item không tồn tại', async () => {
    const response = await request(app).delete('/cart/999'); // Xóa item không có
    
    expect(response.statusCode).toBe(404);
  });

});