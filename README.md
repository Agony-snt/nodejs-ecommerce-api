# E-commerce REST API

A backend REST API for an e-commerce application built with **Node.js, Express.js, and MongoDB**.

The project provides core e-commerce functionality, including user authentication, product management, shopping cart operations, and order processing.

## Features

- User authentication and authorization
- JWT-based authentication
- Access and refresh token handling
- Role-based access control
- User management
- Product management
- Product filtering
- Category management
- Shopping cart functionality
- Order management
- Product comments
- Input validation
- Centralized error handling
- API documentation with Swagger

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcrypt
- Multer
- Swagger
- Yup

## Project Structure

```text
public/
src/
├── configs/
├── v1/
│   ├── middlewares/
│   ├── models/
│   ├── modules/
│   └── utils/
├── app.js
└── server.js
```

## Installation

```bash
git clone https://github.com/Agony-snt/nodejs-ecommerce-api.git
cd nodejs-ecommerce-api
npm install
```

Create a `.env` file and configure the required environment variables, including your MongoDB connection settings and authentication secrets.

## Run the Project

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## API Documentation

Swagger documentation is included in the project.

## Purpose

This project was developed to practice building a more complete backend application, working with multiple related database models, authentication, authorization, and e-commerce business logic.
