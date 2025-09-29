# 📚 Library CRUD API

A simple Node.js + Express REST API that connects to a MySQL database and performs CRUD operations for **Books** and **Authors**.

---

## 🚀 Features
- CRUD endpoints for **Authors**
- CRUD endpoints for **Books**
- Books linked with multiple Authors (many-to-many)
- MySQL + `mysql2/promise` for DB connection
- Ready-to-use with Postman or `curl`

---

## 🛠️ Prerequisites
- Node.js (v16+ recommended)
- MySQL server running with `LibraryManagement` database created
- Import your `LibraryManagement.sql` schema

---

## ⚙️ Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR-USERNAME/library-crud-api.git
   cd library-crud-api
