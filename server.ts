import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // In-memory secure store for connected financial accounts & ledger (proxied securely)
  let connectedAccounts = [
    {
      id: 'acc_stripe_01',
      provider: 'stripe',
      name: 'Global Enterprise Merchant (USD)',
      accountNumber: 'acct_1M******************',
      status: 'active',
      balance: 148290.50,
      currency: 'USD',
      payoutSchedule: 'daily',
      riskLevel: 'low',
      lastSynced: new Date().toISOString()
    },
    {
      id: 'acc_cashapp_02',
      provider: 'cashapp',
      name: 'Rapid Liquidity Pool (CashTag $CrypticPay)',
      accountNumber: '$CASH********************',
      status: 'active',
      balance: 32450.00,
      currency: 'USD',
      payoutSchedule: 'instant',
      riskLevel: 'guarded',
      lastSynced: new Date().toISOString()
    }
  ];

  let gatewayTransactions = [
    {
      id: 'tx_99182a',
      provider: 'stripe',
      type: 'charge',
      amount: 4500.00,
      currency: 'USD',
      status: 'succeeded',
      customer: 'cust_alpha_88',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
    },
    {
      id: 'tx_88371b',
      provider: 'cashapp',
      type: 'transfer',
      amount: 1250.00,
      currency: 'USD',
      status: 'completed',
      customer: '$LiquidityNode99',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    }
  ];

  // Secure Backend API Proxy Routes
  
  // GET connected accounts (never expose raw API keys or tokens to client)
  app.get('/api/payment/accounts', (req, res) => {
    res.json({
      success: true,
      accounts: connectedAccounts,
      timestamp: new Date().toISOString()
    });
  });

  // GET transaction ledger
  app.get('/api/payment/transactions', (req, res) => {
    res.json({
      success: true,
      transactions: gatewayTransactions,
      timestamp: new Date().toISOString()
    });
  });

  // POST Stripe secure proxy charge
  app.post('/api/payment/stripe/charge', (req, res) => {
    const { amount, currency = 'USD', customerId, sourceAccountId } = req.body;
    
    // Server-side credential check simulation (STRIPE_SECRET_KEY is kept securely on backend)
    const secretKeyConfigured = process.env.STRIPE_SECRET_KEY || 'sk_live_mock_secure_proxy_key';
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid charge amount' });
    }

    const account = connectedAccounts.find(a => a.id === sourceAccountId && a.provider === 'stripe');
    if (!account) {
      return res.status(404).json({ success: false, error: 'Stripe merchant account not found or inactive' });
    }

    // Simulate secure proxy interaction with Stripe API backend
    const newTx = {
      id: `tx_str_${Math.random().toString(36).substring(2, 8)}`,
      provider: 'stripe',
      type: 'charge',
      amount: Number(amount),
      currency,
      status: 'succeeded',
      customer: customerId || 'cust_anonymous',
      timestamp: new Date().toISOString()
    };

    gatewayTransactions.unshift(newTx);
    account.balance += Number(amount);

    console.log(`[SECURE BACKEND PROXY] Proxied Stripe charge via secret key: ${secretKeyConfigured.substring(0, 8)}... Amount: $${amount}`);

    res.json({
      success: true,
      transaction: newTx,
      updatedBalance: account.balance,
      message: 'Stripe charge executed securely via backend proxy.'
    });
  });

  // POST Cash App secure proxy transfer
  app.post('/api/payment/cashapp/transfer', (req, res) => {
    const { amount, currency = 'USD', recipientCashtag, sourceAccountId } = req.body;

    // Server-side credential check simulation (CASHAPP_ACCESS_TOKEN is kept securely on backend)
    const tokenConfigured = process.env.CASHAPP_ACCESS_TOKEN || 'ca_token_mock_secure_proxy_key';

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid transfer amount' });
    }

    const account = connectedAccounts.find(a => a.id === sourceAccountId && a.provider === 'cashapp');
    if (!account) {
      return res.status(404).json({ success: false, error: 'Cash App account not found or inactive' });
    }

    if (account.balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient funds in Cash App liquidity pool' });
    }

    // Simulate secure proxy interaction with Cash App API backend
    const newTx = {
      id: `tx_ca_${Math.random().toString(36).substring(2, 8)}`,
      provider: 'cashapp',
      type: 'transfer',
      amount: Number(amount),
      currency,
      status: 'completed',
      customer: recipientCashtag || '$CrypticRecipient',
      timestamp: new Date().toISOString()
    };

    gatewayTransactions.unshift(newTx);
    account.balance -= Number(amount);

    console.log(`[SECURE BACKEND PROXY] Proxied Cash App transfer via token: ${tokenConfigured.substring(0, 8)}... Amount: $${amount}`);

    res.json({
      success: true,
      transaction: newTx,
      updatedBalance: account.balance,
      message: 'Cash App transfer executed securely via backend proxy.'
    });
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Secure Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
