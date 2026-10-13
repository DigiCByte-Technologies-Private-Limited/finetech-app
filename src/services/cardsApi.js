/**
 * Credit Cards API Service.
 * Manages credit cards retrieval, transactions, and bill payment simulation.
 */
import { userCards } from '../data/userProducts';
import { banks } from '../data/banks';
import { transactions } from '../data/transactions';

const DELAY_MS = 300;

// In-memory copy of cards for mutable mock payment updates
let localCards = [...userCards];

/**
 * Fetches user credit cards enriched with bank information.
 */
export async function getCards() {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  return localCards.map((card) => {
    const bank = banks.find((b) => b.id === card.bankId) || {
      id: card.bankId,
      name: card.bankId.toUpperCase() + ' Bank',
      icon: 'fa-solid fa-credit-card'
    };

    return {
      ...card,
      bankName: bank.name,
      bankIcon: bank.icon
    };
  });
}

/**
 * Fetches transactions, optionally filtered by cardId.
 */
export async function getTransactions(cardId = null) {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  if (!cardId || cardId === 'all') {
    return [...transactions];
  }
  return transactions.filter((tx) => tx.cardId === cardId);
}

/**
 * Simulates a card bill payment.
 */
export async function payCardBill(cardId, amount = null) {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  localCards = localCards.map((card) => {
    if (card.id === cardId) {
      const payAmount = amount !== null ? amount : card.totalDue;
      const updatedTotalDue = Math.max(0, card.totalDue - payAmount);
      const updatedUsed = Math.max(0, card.used - payAmount);
      const updatedMinDue = updatedTotalDue === 0 ? 0 : Math.min(card.minDue, updatedTotalDue);

      return {
        ...card,
        totalDue: updatedTotalDue,
        used: updatedUsed,
        minDue: updatedMinDue
      };
    }
    return card;
  });

  return {
    success: true,
    message: 'Bill payment processed successfully.'
  };
}
