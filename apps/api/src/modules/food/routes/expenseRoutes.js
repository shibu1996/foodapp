import express from 'express';
import {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getExpenseSummary
} from '../controllers/expenseController.js';

const router = express.Router();

// Admin routes (authentication TEMPORARILY DISABLED for development)
router.get('/', getAllExpenses); // Get all expenses with filters
router.post('/', createExpense); // Create expense
router.put('/:id', updateExpense); // Update expense
router.delete('/:id', deleteExpense); // Delete expense
router.get('/stats', getExpenseStats); // Get expense statistics
router.get('/summary', getExpenseSummary); // Get expense summary by period

export default router;

