import Expense from '../models/Expense.js';

// Get all expenses with filters
export const getAllExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      startDate,
      endDate,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { paidTo: { $regex: search, $options: 'i' } }
      ];
    }

    const expenses = await Expense.find(query)
      .populate('addedBy', 'name email')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Expense.countDocuments(query);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expenses',
      error: error.message
    });
  }
};

// Create expense
export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message
    });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message
    });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message
    });
  }
};

// Get expense statistics
export const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const matchStage = Object.keys(dateFilter).length > 0 
      ? { date: dateFilter }
      : {};

    // Total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Expenses by category
    const byCategory = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Monthly expenses (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalExpenses: totalExpenses[0]?.total || 0,
        expenseCount: totalExpenses[0]?.count || 0,
        byCategory,
        monthlyExpenses
      }
    });
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense statistics',
      error: error.message
    });
  }
};

// Get expenses summary for date range
export const getExpenseSummary = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;

    let groupBy;
    let dateFormat;

    switch (period) {
      case 'daily':
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'monthly':
        groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
        dateFormat = 'YYYY-MM';
        break;
      case 'yearly':
        groupBy = { $dateToString: { format: "%Y", date: "$date" } };
        dateFormat = 'YYYY';
        break;
      default:
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
    }

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const matchStage = Object.keys(dateFilter).length > 0 
      ? { date: dateFilter }
      : {};

    const summary = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupBy,
          totalExpenses: { $sum: '$amount' },
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: summary,
      period,
      dateFormat
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch expense summary',
      error: error.message
    });
  }
};

