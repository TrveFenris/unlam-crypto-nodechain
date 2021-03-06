import { RequestHandler, response } from 'express';
import { Chain, Blockchain } from '../blockdata/Blockchain';
import { Transaction } from '../blockdata/Transaction';

const nodechain = new Blockchain();

export const createTransaction: RequestHandler = (req, res) => {
  const { body } = req;
  let msg: string = '';
  if (!body.sender) {
    msg = 'Sender is required.';
  } else if (!body.recipient) {
    msg = 'Recipient is required.';
  } else if (!body.image) {
    msg = 'Image is required.';
  }
  if (msg) {
    return res.status(400).send({
      success: 'false',
      message: msg,
    });
  }
  const tx: Transaction = {
    sender: body.sender,
    recipient: body.recipient,
    image: body.image,
  };
  const blockIndex = nodechain.addTransaction(tx);
  return res.status(200).send({
    success: 'true',
    message: 'Transaction added successfully.',
    blockIndex,
  });
};

export const getChain: RequestHandler = (req, res) => {
  return res.status(200).send({
    chain: nodechain.getChain(),
  });
};

export const createBlock: RequestHandler = (req, res) => {
  const lastBlock = nodechain.getLastBlock();
  const lastProof = lastBlock.proof;
  const proof = nodechain.proofOfWork(lastProof);
  const newBlock = nodechain.addBlock(proof);
  return res.status(200).send({
    success: 'true',
    message: 'Block created successfully.',
    block: newBlock,
  });
};

export const resolveConsensus: RequestHandler = async function(req, res) {
  let responseMessage = '';
  const ourChain = nodechain.getChain();
  const isOurChainValid = Blockchain.validateChain(ourChain);
  await nodechain
    .resolveConsensus()
    .then(data => {
      let newChain: Chain | null = null;
      let maxLength = (isOurChainValid && ourChain.length) || 0;
      console.log('Chain max length: ', maxLength)
      data.map(value => {
        const chain = value.chain;
        if (
          chain &&
          chain.length > maxLength &&
          Blockchain.validateChain(chain)
        ) {
          maxLength = chain.length;
          newChain = chain;
        }
      });
      if (newChain) {
        nodechain.replaceChain(newChain);
        responseMessage = 'Our chain was replaced.';
        return true;
      }
      responseMessage = 'Our chain is authoritative.';
      return false;
    })
    .catch(reason => {
      console.log('Error during consensus: ', reason);
      responseMessage = `Error during consensus: ${reason}`;
    });
  if (!isOurChainValid) {
    console.log('WARNING: Our chain was invalid.');
    responseMessage = responseMessage + ' WARNING: Our chain was invalid.';
  }
  res.status(200).send({
    message: responseMessage,
    chain: nodechain.getChain(),
  });
};

export const registerNode: RequestHandler = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      success: 'false',
      message: 'Node list is required.',
    });
  }
  if (!Array.isArray(req.body)) {
    return res.status(400).send({
      success: 'false',
      message: 'Node list must be an array.',
    });
  }
  req.body.map(node => {
    nodechain.registerNode(node);
  });
  return res.status(200).send({
    success: 'true',
    message: 'Node registered successfully.',
  });
};

export const hackChainContent: RequestHandler = (req, res) => {
  nodechain.alterOwnBlocks();
  return res.status(200).send({
    success: 'true',
    message: 'Blockchain has been pwnd',
  });
};

export const notFound: RequestHandler = (req, res, next) =>
  res.status(404).send({ message: `Route ${req.url} not found.` });
