import { Transaction, ImageTransaction } from './Transaction';
import { Block } from './Block';
import { sha256 } from 'js-sha256';
import fetch from 'node-fetch';

export type Chain = Array<Block>;
type NetworkNode = string;

export class Blockchain {
  private chain: Chain = [];
  private currentTransactions: Array<Transaction> = [];
  private nodes: Set<NetworkNode> = new Set();

  constructor() {
    this.genesis();
  }

  private genesis = () => {
    this.chain.push({
      header: {
        index: 0,
        prevBlockHash: '',
        timestamp: Date.now(),
      },
      transactions: [],
      proof: 100,
    });
  };

  getChain = (): Chain => this.chain.slice();

  getLastBlock = (): Block => this.chain[this.chain.length - 1];

  addTransaction = (tx: Transaction): number => {
    this.currentTransactions.push(tx);
    return this.chain.length;
  };

  addBlock = (proof: number): Block => {
    const block: Block = {
      header: {
        index: this.chain.length,
        prevBlockHash: sha256(JSON.stringify(this.getLastBlock())),
        timestamp: Date.now(),
      },
      transactions: this.currentTransactions.slice(),
      proof: proof,
    };
    this.currentTransactions = [];
    this.chain.push(block);
    return block;
  };

  private static validateProof = (
    lastProof: number,
    proof: number
  ): boolean => {
    let guessHash = sha256(`${lastProof}${proof}`);
    return guessHash.startsWith('0000');
  };

  proofOfWork = (lastProof: number): number => {
    let proof = 0;
    while (!Blockchain.validateProof(lastProof, proof)) {
      proof += 1;
    }
    return proof;
  };

  registerNode = (nodeAddr: NetworkNode): void => {
    this.nodes.add(nodeAddr);
  };

  public static validateChain = (chain: Chain): boolean => {
    let result = true;
    let lastBlock: Block = chain[0];
    let currentIndex = 1;
    while (currentIndex < chain.length) {
      const currentBlock: Block = chain[currentIndex];
      const jsonBlock = JSON.stringify(lastBlock);
      const lastBlockHash = sha256(jsonBlock);
      if (
        currentBlock.header.prevBlockHash != lastBlockHash ||
        !Blockchain.validateProof(lastBlock.proof, currentBlock.proof)
      ) {
        result = false;
      }
      lastBlock = currentBlock;
      currentIndex++;
    }
    return result;
  };

  resolveConsensus = (): Promise<any[]> => {
    const urls = Array.from(this.nodes).map(
      node => `http://${node}/api/v1/chain`
    );
    return Promise.all(
      urls.map(url =>
        fetch(url)
          .then(response => response.json())
          .catch(reason => {
            console.log({ reason });
          })
      )
    ).then(data => data);
  };

  replaceChain = (newChain: Chain) => {
    this.chain = newChain.slice()
  }
}
