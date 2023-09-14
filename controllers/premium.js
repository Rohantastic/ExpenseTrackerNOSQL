const User = require('../models/User');
const Expense = require('../models/expense');

exports.getLeaderBoard = async (req, res, next) => {
  try {
    const premiumUsersExpenses = await User.aggregate([
      {
        $match: { ispremiumuser: true }, // Filter premium users
      },
      {
        $lookup: {
          from: 'expenses',
          localField: '_id',
          foreignField: 'userId',
          as: 'expenses',
        },
      },
      {
        $unwind: '$expenses', // Flatten the expenses array
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          ExpenseAmount: { $sum: '$expenses.expense' },
        },
      },
      {
        $match: { ExpenseAmount: { $gt: 0 } }, // Filter users with expenses
      },
      {
        $sort: { ExpenseAmount: -1 }, // Sort by descending expense amount
      },
    ]);

    return res.status(200).json(premiumUsersExpenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching premium user expenses.' });
  }
};
