# Expense_Tracker_2.0

Expense Tracker is a web application that helps users manage their expenses. It allows users to sign up, log in, and record their expenses. The application provides additional premium features, such as downloading expense data and viewing a leaderboard of users' expenses.

## Features

- User authentication with Bcrypt password hashing algorithm
- Token-based authentication using JSON Web Tokens (JWT)
- Email notifications with Nodemailer SMTP
- Razorpay integration for premium membership purchases
- Expense recording with amount and category selection
- Dashboard to view recorded expenses
- Premium features:
  - Downloading expense data
  - Leaderboard displaying users and their total expenses
  - Daily, monthly, and yearly expense breakdowns
- Responsive design with pagination for an optimal user experience on any screen size

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed
- MySQL database set up
- Razorpay API credentials (for premium membership)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/expense-tracker.git
   cd expense-tracker

2. Install Dependencies
    ```bash
     npm install

3. Configure your environment variables by creating a .env file in the project root and specifying the following
    - PORT=3000
    - MONGODB_URI=your_mongodb_connection_string
    - JWT_SECRET=your_jwt_secret
    - SMTP_EMAIL=your_email_address
    - SMTP_PASSWORD=your_email_password
    - RAZORPAY_KEY_ID=your_razorpay_key_id
    - RAZORPAY_KEY_SECRET=your_razorpay_key_secret

4. Run the application
    ```bash
    npm start


## Usage
- Sign up for an account using your name, email, and password.
- Log in to access your dashboard.
- Add expenses by providing the amount and selecting a category.
- Premium users can click "Buy Premium" to upgrade their account using Razorpay(DEMO).
- Premium features will become available upon successful premium membership purchase.

## Contributing
Contributions are welcome! Please follow these guidelines:

- Fork the repository.
- Create a new branch: git checkout -b feature/your-feature-name.
- Commit your changes: git commit -m 'Add some feature'.
- Push to the branch: git push origin feature/your-feature-name.
- Submit a pull request.


## Screenshots:

### Signup Page
![signup](https://github.com/Rohantastic/Expense_Tracker_2.0/assets/50244302/48efe19d-e685-4cf1-8e29-f3de7e589985)

### Login Page
![login](https://github.com/Rohantastic/Expense_Tracker_2.0/assets/50244302/99cb4960-1b42-4085-864e-9f0600042b54)

### Forgot Password Page
![forgotpassword](https://github.com/Rohantastic/Expense_Tracker_2.0/assets/50244302/9b9e6901-7929-43c7-ad71-dda3c3f66855)

### View Expense Page/ DashBoard Page
![expense](https://github.com/Rohantastic/Expense_Tracker_2.0/assets/50244302/df26d044-27ae-4899-bc8b-17dafae0fb65)

### Buy Premium Membership Page
![BuyPremium](https://github.com/Rohantastic/Expense_Tracker_2.0/assets/50244302/de8cc1a0-b8d7-4175-b271-8e553317d9a0)
