import { Transaction } from './Transaction';

export interface Block {
  header: BlockHeader;
  transactions: Array<Transaction>;
  proof: number;
}

interface BlockHeader {
  index: number;
  prevBlockHash: string;
  timestamp: number;
}
