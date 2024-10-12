
const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Middleware to parse JSON request body
app.use(express.json());

// MySQL connection configuration
// Create connection to MySQL database
const db = mysql.createConnection({
    host: 'sql12.freesqldatabase.com', // Your MySQL host, usually localhost for local development
    user: 'sql12737186', // Your MySQL username
    password: 'CD1P8iRHUs', // Your MySQL password
    database: 'sql12737186' // The database name you want to connect to
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL database');
  });
  //API to retrieve a single product
  app.get('/api/products/:id', (req, res) => {
    const { id } =  req.params;
  
    // Query to fetch product details by ID
    const query = `
      SELECT products.product_id, products.product_name, products.price, categories.category_name 
      FROM products 
      JOIN categories ON products.category_id = categories.category_id
      WHERE products.product_id = ?`;
  
    db.query(query,  [id],  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send({ error: 'Database query failed' });
      }
  
      if (results.length === 0) {
        return res.status(404).send({ message: 'No products found..' });
      }
  
      res.status(200).json(results[0]);
    });
  });

  // API to retrieve products under a given category
  app.get('/api/products', (req, res) => {
    const categoryName = req.query.category;
  
    if (!categoryName) {
      return res.status(400).send({ error: 'Category is required in query parameters' });
    }
  
    const query = `
      SELECT products.product_id, products.product_name, products.price, categories.category_name 
      FROM products 
      JOIN categories ON products.category_id = categories.category_id
      WHERE categories.category_name = ?`;
  
    db.query(query, [categoryName], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send({ error: 'Database query failed' });
      }
  
      if (results.length === 0) {
        return res.status(404).send({ message: 'No products found for this category' });
      }
  
      res.status(200).json(results);
    });
  });
  
  // API to add a new product under a given category
  app.post('/api/products', (req, res) => {
    const { product_name, price, category_name } = req.body;
  
    // Validate the input data
    if (!product_name || !price || !category_name) {
      return res.status(400).send({ error: 'Product name, price, and category name are required' });
    }
  
    // First, check if the category exists
    const categoryQuery = 'SELECT category_id FROM categories WHERE category_name = ?';
  
    db.query(categoryQuery, [category_name], (err, results) => {
      if (err) {
        console.error('Error querying categories:', err);
        return res.status(500).send({ error: 'Database query failed' });
      }
  
      if (results.length === 0) {
        // Category does not exist
        return res.status(404).send({ error: 'Category not found' });
      }
  
      const category_id = results[0].category_id;
  
      // Now insert the new product
      const insertQuery = 'INSERT INTO products (product_name, price, category_id) VALUES (?, ?, ?)';
  
      db.query(insertQuery, [product_name, price, category_id], (err, result) => {
        if (err) {
          console.error('Error inserting product:', err);
          return res.status(500).send({ error: 'Failed to add product' });
        }
  
        res.status(201).send({ message: 'Product added successfully', product_id: result.insertId });
      });
    });
  });
  
  // API to update an existing product
  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const { product_name, price, category_name } = req.body;
  
    // Validate the input data
    if (!product_name || !price || !category_name) {
      return res.status(400).send({ error: 'Product name, price, and category name are required' });
    }
  
    // First, check if the category exists
    const categoryQuery = 'SELECT category_id FROM categories WHERE category_name = ?';
  
    db.query(categoryQuery, [category_name], (err, results) => {
      if (err) {
        console.error('Error querying categories:', err);
        return res.status(500).send({ error: 'Database query failed' });
      }
  
      if (results.length === 0) {
        // Category does not exist
        return res.status(404).send({ error: 'Category not found' });
      }
  
      const category_id = results[0].category_id;
  
      // Update the product
      const updateQuery = 'UPDATE products SET product_name = ?, price = ?, category_id = ? WHERE product_id = ?';
  
      db.query(updateQuery, [product_name, price, category_id, id], (err, result) => {
        if (err) {
          console.error('Error updating product:', err);
          return res.status(500).send({ error: 'Failed to update product' });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).send({ error: 'Product not found' });
        }
  
        res.status(200).send({ message: 'Product updated successfully' });
      });
    });
  });
  
  // API to delete a product by its ID
  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
  
    // Delete the product
    const deleteQuery = 'DELETE FROM products WHERE product_id = ?';
  
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error('Error deleting product:', err);
        return res.status(500).send({ error: 'Failed to delete product' });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).send({ error: 'Product not found' });
      }
  
      res.status(200).send({ message: 'Product deleted successfully' });
    });
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });