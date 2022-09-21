import { startPrismaTransaction } from "./index";
import { PrismaClient } from "@prisma/client";
import { getTxClient } from './prisma/prismaHelper'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

it('Local', async () => {
  const prismaTx = getTxClient();

  // // @ts-ignore
  const tx1 = prismaTx.$transaction(async txClient1 => {
    console.log('Tx1 start, sleeping 1000s then querying')
    txClient1.txId = 1234
    console.log(await txClient1.user.count());
    await sleep(1000);
    console.log('Tx1 continuing...')
    console.log(await txClient1.user.findMany({ where: { name: 'foo' } }));
    console.log('tx1 finish');
  });
  await sleep(100)
  // @ts-ignore
  const tx2 = prismaTx.$transaction(async txClient2 => {
    console.log(`TX2 start with txid: ${txClient2.txId}`)
    await txClient2.user.create({ data: { name: 'foo bardoe' } });
    console.log('tx2 committing');
  });

  try {
    await tx2
    console.log('Tx2 is done!')
    await tx1
  } catch (err) {
    console.error(err)
  }


});

it('Using helper', async () => {
  const prismaTx = getTxClient();

  const txClient1 = await prismaTx.$begin();
  txClient1.txId = 1234

  const txClient2 = await prismaTx.$begin();
  console.log(await txClient1.user.count());

  console.log(`TX2 start with txid: ${txClient2.txId}`)
  await txClient1.user.create({ data: { name: 'foo bardoe' } });
  await txClient1.$commit();
  console.log('tx1 committing')

  console.log(await txClient2.user.findMany({ where: { name: 'foo' } }));
  console.log('tx2 finish');
  await txClient2.$commit();
})

it.skip('Importing', async () => {
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  //
  await startPrismaTransaction(1000);
  await sleep(100);
  await startPrismaTransaction(0);

});


it.skip('failure with helper', async () => {
  const prismaTx = getTxClient();
  // @ts-ignore
  const tx1 = prismaTx.$transaction(async txClient1 => {
    await sleep(1000);
    await txClient1.user.count();
    console.log('tx1 finish');
  });

  // @ts-ignore
  const tx2 = prismaTx.$transaction(async txClient2 => {
    await txClient2.user.count();
    console.log('tx2 finish');
  });

  await Promise.all([tx1, tx2])
}
)

it.skip('Allows two tx clients to work independently', async () => {
  const prismaTx = getTxClient();

  const transactionClient1 = await prismaTx.$begin();
  const transactionClient2 = await prismaTx.$begin();

  await transactionClient1.user.create({ data: { email: 'noobar' } });
  await transactionClient1.$commit();
  const users = await transactionClient2.user.findMany({
    where: { email: 'foobar' },
  });

});