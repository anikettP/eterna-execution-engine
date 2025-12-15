export interface OrderPayload {
  pair: string;
  amount: number;
  side: 'buy' | 'sell';
}

export interface Quote {
  dex: 'Raydium' | 'Meteora';
  price: number;
  fee: number;
}