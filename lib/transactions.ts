import { parseEther } from 'viem';
import { Transaction } from '../app/types';
import { nanoid } from 'nanoid';
import { redis } from './redis';

/**
 * Calculate commission for a transaction
 * 
 * @param amount - The transaction amount
 * @param commissionRate - The commission rate (default: 0.025 or 2.5%)
 * @returns The commission amount
 */
export function calculateCommission(amount: number, commissionRate = 0.025): number {
  return amount * commissionRate;
}

/**
 * Create a new transaction record
 * 
 * @param gigId - The ID of the gig being paid for
 * @param fromUserId - The user ID of the payer
 * @param toUserId - The user ID of the payee
 * @param amount - The transaction amount
 * @returns The created transaction
 */
export async function createTransaction(
  gigId: string,
  fromUserId: string,
  toUserId: string,
  amount: number
): Promise<Transaction> {
  const transactionId = nanoid();
  const commission = calculateCommission(amount);
  const now = new Date().toISOString();
  
  const transaction: Transaction = {
    transactionId,
    gigId,
    fromUserId,
    toUserId,
    amount,
    commission,
    status: 'pending',
    createdAt: now,
  };
  
  await redis.set(`transaction:${transactionId}`, transaction);
  return transaction;
}

/**
 * Update a transaction with completion details
 * 
 * @param transactionId - The ID of the transaction to update
 * @param txHash - The transaction hash from the blockchain
 * @returns The updated transaction
 */
export async function completeTransaction(
  transactionId: string,
  txHash: string
): Promise<Transaction | null> {
  try {
    const transaction = await redis.get<Transaction>(`transaction:${transactionId}`);
    
    if (!transaction) {
      return null;
    }
    
    const updatedTransaction: Transaction = {
      ...transaction,
      status: 'completed',
      txHash,
      completedAt: new Date().toISOString(),
    };
    
    await redis.set(`transaction:${transactionId}`, updatedTransaction);
    return updatedTransaction;
  } catch (error) {
    console.error('Error completing transaction:', error);
    return null;
  }
}

/**
 * Get all transactions for a user
 * 
 * @param userId - The user ID to get transactions for
 * @returns Array of transactions
 */
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    // Get all transactions
    const transactionKeys = await redis.keys('transaction:*');
    
    if (transactionKeys.length === 0) {
      return [];
    }
    
    const transactions = await redis.mget<Transaction>(...transactionKeys);
    
    // Filter transactions for the specified user (either as sender or receiver)
    return Object.values(transactions).filter(
      (tx) => tx.fromUserId === userId || tx.toUserId === userId
    );
  } catch (error) {
    console.error('Error getting user transactions:', error);
    return [];
  }
}

/**
 * Format transaction parameters for blockchain transaction
 * 
 * @param toAddress - The recipient's wallet address
 * @param amount - The amount to send
 * @param commission - The commission to deduct
 * @returns The formatted transaction parameters
 */
export function formatTransactionParams(
  toAddress: `0x${string}`,
  amount: number,
  commission = 0.025
) {
  // Calculate the amount after deducting commission
  const amountAfterCommission = amount * (1 - commission);
  
  // Convert to wei (or the smallest unit of the blockchain's native currency)
  const valueInEther = parseEther(amountAfterCommission.toString());
  
  return {
    to: toAddress,
    value: valueInEther,
  };
}

