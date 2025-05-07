# Flat Expense Tracker

A full-featured expense tracking application for flatmates, built with Next.js, MongoDB, and Tailwind CSS.

## Features

- **User Authentication**
  - Register with email verification
  - Login/Logout functionality
  - Forgot password and reset password
  
- **Expense Management**
  - Add expenses with receipts (image upload)
  - Edit and delete expenses
  - View all expenses in a dashboard
  
- **Expense Balancing**
  - Calculate balance between flatmates
  - Show who owes whom and how much
  - One-click settlement of all expenses

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB database (local or Atlas)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# MongoDB URI
MONGODB_URI=mongodb+srv://your_mongodb_username:your_mongodb_password@cluster0.mongodb.net/expense-tracker?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# App URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email credentials (for nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create the `uploads` directory for storing images
   ```bash
   mkdir -p public/uploads
   ```
4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Register a new account and verify your email
2. Log in to the application
3. Add expenses with descriptions, amounts, and optional receipt images
4. Include flatmates who shared the expense
5. View the current balance between flatmates on the dashboard
6. When everyone agrees, click the "Adjust" button to settle all expenses

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [React Hook Form](https://react-hook-form.com/) - Form validation
- [Nodemailer](https://nodemailer.com/) - Email sending

## License

This project is licensed under the MIT License.
