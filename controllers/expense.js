const path = require('path');
const ExpenseModel = require('../models/expense');
const UserModel = require('../models/User');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

exports.addExpense = (req, res, next) => {
  const string = path.join(__dirname, '../', '/views/addExpense.html');
  res.sendFile(string);
};

exports.postExpense = async (req, res, next) => {
  const { expense, category, description } = req.body;
  
  
  const userId = new mongoose.Types.ObjectId(req.user._id);

  console.log('>>>>>>>>>>>>userId in postExpenses', userId);
  try {
      const newExpense = await ExpenseModel.create({ expense, category, description, userId });
      return res.status(201).json({ success: "Expense Data has been created", expenseId: newExpense._id });
  } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "An error occurred" });
  }
};


exports.getExpenses = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const ITEMS_PER_PAGE = parseInt(req.query.items) || 10;
  const userId = new mongoose.Types.ObjectId(req.user._id);
  console.log(">>>userId in getExpenses ", userId);
  try {
      const totalItems = await ExpenseModel.countDocuments({ userId });
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const expenses = await ExpenseModel.find({ userId })
          .skip(offset)
          .limit(ITEMS_PER_PAGE);

      res.json({
          expenses,
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          nextPage: page + 1,
          hasPreviousPage: page > 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
  } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error occurred" });
  }
};


exports.deleteExpense = async (req, res, next) => {
  const id = req.params._id;
  const userId = req.user._id;

  console.log('.>>>>>>>>>>>id', id);
  console.log('>>>>>>>>>>>userId', userId);
  console.log('Before try block in delete');
  try {
    const hasDeleted = await ExpenseModel.deleteOne({ _id: id, userId});
    console.log("hasDeleted???????????", hasDeleted);
    if (hasDeleted.deletedCount === 1) {
      return res.status(204).json({ success: true });
    } else {
      return res.status(401).json({ error: "User is not authorized to delete the expense" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error in delete Expense" });
  }
};

exports.getMonthlyExpense = async (req, res, next) => {
  const userId = req.user._id;
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  console.log("req.user._id", userId);
  console.log("firstDayOfMonth: ", firstDayOfMonth);
  console.log("lastDayOfMonth: ", lastDayOfMonth);
  console.log("firstDayOfMonth: ", firstDayOfMonth.toISOString());
  console.log("lastDayOfMonth: ", lastDayOfMonth.toISOString());

  try {
    const monthlyExpenses = await ExpenseModel.find({
      userId,
      createdAt: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth
      },
    });

    console.log("data.>>>>", monthlyExpenses);
    return res.status(200).json({ data: monthlyExpenses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching monthly expenses.' });
  }
};



exports.getDailyExpense = async (req, res, next) => {
  const userId = req.user._id;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1); 

  try {
    const dailyExpenses = await ExpenseModel.find({
      userId,
      createdAt: {
        $gte: yesterday,
        $lte: today
      },
    });

    return res.status(200).json({ data: dailyExpenses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching daily expenses.' });
  }
};


exports.getYearlyExpense = async (req, res, next) => {
  const userId = req.user._id;
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1); 

  try {
    const yearlyExpenses = await ExpenseModel.find({
      userId,
      createdAt: {
        $gte: oneYearAgo,
        $lte: today
      },
    });

    return res.status(200).json({ data: yearlyExpenses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while fetching yearly expenses.' });
  }
};


async function uploadToS3(data, filename) { 
  const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  const s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
      Bucket: BUCKET_NAME
  });

  const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: data,
      ACL: 'public-read' 
  };

  try {
      const s3response = await s3bucket.upload(params).promise(); //it returns promise, first we uploading and then returning promise
      console.log('success', s3response); //printing if we get successful response
      return s3response.Location; //getting the link returning it
  } catch (err) {
      console.log(err); //else get the error
  }

}

exports.downloadExpense = async (req, res, next) => {
  const userId = req.user._id; // Fetching user ID from auth middleware

  try {
      const expenses = await ExpenseModel.find({ userId }); // Find all expenses for the user

      if (expenses) {
          const stringifiedExpenses = JSON.stringify(expenses);
          const filename = `Expense${userId}/${new Date()}.txt`;

          const object = [];
          object.push(filename);

          
          const fileURL = await uploadToS3(stringifiedExpenses, filename);

          return res.status(200).json({ fileURL, success: true, fileHistory: object });
      }
  } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Error in downloading" });
  }
};
