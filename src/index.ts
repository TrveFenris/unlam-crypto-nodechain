import express from 'express';
import cors, { CorsOptions } from 'cors';
import * as api from './api';

const DEFAULT_PORT = (process.argv[2] && parseInt(process.argv[2])) || 1337;

const corsOptions: CorsOptions = {
  origin: '*',
  methods: 'GET,POST',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const expressApp = express();

expressApp
  .use(cors(corsOptions))
  .use(express.json())
  .get('/api/v1/chain', api.getChain)
  .post('/api/v1/transactions/new', api.createTransaction)
  //.options('/api/v1/transactions/new', () => {})
  .get('/api/v1/blocks/new', api.createBlock)
  .post('/api/v1/nodes/register', api.registerNode)
  .get('/api/v1/nodes/consensus', api.resolveConsensus)
  .use(api.notFound);
// TODO 500 server errors handler

expressApp.listen(DEFAULT_PORT, () => {
  console.log(
    `Welcome to nodechain server. Currently listening on port ${DEFAULT_PORT}`
  );
});
