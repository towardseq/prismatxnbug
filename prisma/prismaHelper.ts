import { PrismaClient } from '@prisma/client';

type TxClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];
export type TestPrismaClient = PrismaClient & {
  $begin: () => Promise<void>;
  $rollback: () => Promise<void>;
};
export const PRISMA_ROLLBACK_MSG = 'prisma.client.extension.rollback';
const ROLLBACK = { [Symbol.for(PRISMA_ROLLBACK_MSG)]: true };

// From https://github.com/prisma/prisma/issues/12458
export async function $begin(client: PrismaClient) {
  let captureInnerPrismaTxClient: (txClient: TxClient) => void;
  let commit: () => void;
  let rollback: () => void;

  // a promise for getting the tx inner client
  const txClient = new Promise < TxClient > (res => {
    captureInnerPrismaTxClient = txClient => res(txClient);
  });

  // a promise for controlling the transaction
  const controlTxPromise = new Promise((_res, _rej) => {
    commit = () => _res(undefined);
    rollback = () => _rej(ROLLBACK);
  });

  // opening a transaction to control externally
  const prismaTranactionResult = client.$transaction((innerPrismaTxClient: TxClient) => {
    captureInnerPrismaTxClient(innerPrismaTxClient);
    console.log('waiting for control promise to resolve or reject...')
    return controlTxPromise.catch(e => {
      if (e === ROLLBACK) throw new Error(PRISMA_ROLLBACK_MSG);
      throw e;
    });
  });

  const capturedPrismaTxClient = await txClient;
  return Object.assign(capturedPrismaTxClient, {
    $commit: async () => {
      commit();
      await prismaTranactionResult;
    },
    $rollback: async () => {
      rollback();
      await prismaTranactionResult.catch(err => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (err.message !== PRISMA_ROLLBACK_MSG) {
          console.log(`Rollback txn, cause: ${err}`);
        }
      });
    },
  } as TxClient & { $commit: () => Promise<void>; $rollback: () => Promise<void> });
}

// patches the prisma client with a $begin method
const client = new PrismaClient({ log: ['query', 'info'] });

export function getTxClient() {
  return Object.assign(client, {
    $begin: () => $begin(client),
  }) as PrismaClient & { $begin: () => ReturnType<typeof $begin> };
}
