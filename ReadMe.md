ShieldPay – Secure API Gateway for Digital Wallets

ShieldPay is a full-stack digital wallet application built to demonstrate how modern payment systems can be secured using industry-standard API security practices. The project serves as both a learning resource and a working prototype, showcasing the implementation of authentication, transaction security, and payment processing in a realistic environment.

Overview

This project was developed as my final-year Software Engineering project at Wellspring University. Its primary goal is to provide a secure API gateway for digital wallet transactions while addressing common security challenges faced by modern payment systems, including unauthorized access, duplicate transactions, API abuse, and insufficient audit logging.

Rather than focusing solely on payment functionality, ShieldPay emphasizes security by design, ensuring that every transaction passes through multiple layers of validation before being processed.

Key Features

1 JWT-based user authentication and authorization
2 Secure digital wallet with balance management
3 Peer-to-peer (P2P) money transfers with transaction PIN verification
4 API rate limiting to prevent brute-force attacks and abuse
6 Idempotency protection to prevent duplicate transactions
7 Complete transaction history and audit logging
8 Password and transaction PIN hashing using bcrypt
9 RESTful API built with Node.js and Express
10 React dashboard for user interaction
11 PostgreSQL database powered by Supabase

Tech Stack

Frontend

- React.js
- Tailwind CSS

Backend

- Node.js
- Express.js
- JWT Authentication
- bcrypt
- Express Rate Limit

Database

- Supabase (PostgreSQL)

Project Goal

ShieldPay was built as an educational and practical implementation of a secure payment gateway. While it uses simulated payments and is not intended for production use, it demonstrates how secure authentication, rate limiting, idempotency, transaction logging, and wallet management can be integrated into a modern fintech application.

This project is intended to help students, developers, and researchers understand the core security concepts behind digital payment systems and API gateway design.

Contributions, suggestions, and feedback are always welcome.
