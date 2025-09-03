import { NextResponse } from 'next/server';
import { redis } from '../../../lib/redis.js';
import { Transaction } from '../../types.js';
import { createTransaction, completeTransaction, getUserTransactions } from '../../../lib/transactions.js';

/**
 * @api {get} /api/transactions Get transactions
 * @apiName GetTransactions
 * @apiGroup Transactions
 * @apiDescription Retrieves transactions for a user
 * 
 * @apiQuery {String} userId User ID to get transactions for
 * 
 * @apiSuccess {Object[]} transactions List of transactions
 * @apiError {Object} error Error message
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  try {
    const transactions = await getUserTransactions(userId);
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

/**
 * @api {post} /api/transactions Create transaction
 * @apiName CreateTransaction
 * @apiGroup Transactions
 * @apiDescription Creates a new transaction
 * 
 * @apiBody {String} gigId ID of the gig being paid for
 * @apiBody {String} fromUserId User ID of the payer
 * @apiBody {String} toUserId User ID of the payee
 * @apiBody {Number} amount Transaction amount
 * 
 * @apiSuccess {Object} transaction Created transaction
 * @apiError {Object} error Error message
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { gigId, fromUserId, toUserId, amount } = body;

  if (!gigId || !fromUserId || !toUserId || amount === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const transaction = await createTransaction(gigId, fromUserId, toUserId, amount);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

/**
 * @api {put} /api/transactions Update transaction
 * @apiName UpdateTransaction
 * @apiGroup Transactions
 * @apiDescription Updates a transaction (typically to mark as completed)
 * 
 * @apiBody {String} transactionId ID of the transaction to update
 * @apiBody {String} txHash Transaction hash from the blockchain
 * 
 * @apiSuccess {Object} transaction Updated transaction
 * @apiError {Object} error Error message
 */
export async function PUT(request: Request) {
  const body = await request.json();
  const { transactionId, txHash } = body;

  if (!transactionId || !txHash) {
    return NextResponse.json({ error: 'transactionId and txHash required' }, { status: 400 });
  }

  try {
    const transaction = await completeTransaction(transactionId, txHash);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

