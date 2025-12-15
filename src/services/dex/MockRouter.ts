import { Quote } from '../../types';

export class MockRouter {
  // Simulate network delay
  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getQuotes(pair: string, amount: number): Promise<Quote[]> {
    await this.sleep(300); // Simulate RPC latency
    const base = 150.0; // Hardcoded base price for demo

    return [
      {
        dex: 'Raydium',
        price: base * (0.99 + Math.random() * 0.02), // 0.99x to 1.01x
        fee: 0.0025
      },
      {
        dex: 'Meteora',
        price: base * (0.985 + Math.random() * 0.03), 
        fee: 0.0015
      }
    ];
  }

  async executeSwap(dex: string, orderId: string) {
    await this.sleep(2000); // Simulate block time
    
    // 10% chance of random failure
    if (Math.random() < 0.1) throw new Error("Slippage Tolerance Exceeded");

    return {
      txHash: `tx_${Math.random().toString(36).substring(7)}`,
      confirmed: true
    };
  }
}