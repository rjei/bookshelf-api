const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

// Cross Origin Resource Sharing
app.use(cors());

app.use(express.json());

// Pencarian Buku
app.get("/books", async (req, res) => {
  const { title, author, publisher } = req.query;
  // title = Laskar pelangi
  // publisher = gramedia
  let query = "SELECT * FROM books";
  let conditions = [];
  let values = [];

  if (title) {
    conditions.push(`title ILIKE $${values.length + 1}`);
    values.push(`%${title}%`);
  }
  // condition = [title ILIKE $1]
  // values = [Laskar pelangi]
  if (author) {
    conditions.push(`author ILIKE $${values.length + 1}`);
    values.push(`%${author}%`);
  }
  if (publisher) {
    conditions.push(`publisher ILIKE $${values.length + 1}`);
    values.push(`%${publisher}%`);
  }
  // condition = [title ILIKE $1,  publisher ILIKE $2]
  // values = [Laskar pelangi, Gramedia]
  

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  // SELECT * FROM books WHERE title ILIKE $1 AND  publisher ILIKE $2
  // values = [Laskar pelangi, Gramedia]

  try {
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(200).json({
        error: false,
        message: "Tidak ada hasil yang ditemukan",
        data: [],
      });
    }

    res.status(200).json({
      error: false,
      message: "Data berhasil ditemukan",
      data: result.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});

// Menampilkan buku berdasarkan ID
app.get("/books/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM books WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Buku tidak ditemukan" });
    }

    res.status(200).json({
      error: false,
      message: "Data berhasil ditemukan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});

// Tambah buku
app.post("/books", async (req, res) => {
  const { title, author, publish_date, publisher } = req.body;

  if (!title || !author || !publish_date || !publisher) {
    return res.status(400).json({
      error: true,
      message: "Semua field wajib diisi",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO books (title, author, publish_date, publisher) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, author, publish_date, publisher]
    );

    res.status(201).json({
      error: false,
      message: "Buku berhasil ditambahkan",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});

// Update buku berdasarkan ID
app.put("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, publish_date, publisher } = req.body;

    const result = await pool.query(
      `UPDATE books SET title = $1, author = $2, publish_date = $3, publisher = $4 
       WHERE id = $5 RETURNING *`,
      [title, author, publish_date, publisher, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Buku tidak ditemukan" });
    }

    res.status(200).json({
      error: false,
      message: "Buku berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});

// Menghapus buku berdasarkan ID
app.delete("/books/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM books WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: true, message: "Buku tidak ditemukan" });
    }
    res.status(200).json({
      error: false,
      message: "Buku berhasil dihapus",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});
module.exports = app;