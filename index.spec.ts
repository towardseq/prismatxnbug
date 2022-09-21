import { startPrismaTransaction } from "./index";
import {PrismaClient} from "@prisma/client";
import {getTxClient} from "./prisma/prismaHelper";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

it('Local', async () => {
  const prismaTx = new PrismaClient();
  
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
});

it('Importing', async () => {
  const promise1 = startPrismaTransaction(1000);
  await sleep(100);
  const promise2 = startPrismaTransaction(0);

  await Promise.all([promise1, promise2])
});

it('failure with helper', async () => {
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

it('Allows two tx clients to work independently', async () => {
  const prismaTx = getTxClient();

  const transactionClient1 = await prismaTx.$begin();
  const transactionClient2 = await prismaTx.$begin();

  await transactionClient1.user.create({ data: { email: 'noobar' } });
  await transactionClient1.$commit();
  const users = await transactionClient2.user.findMany({
    where: { email: 'foobar' },
  });

});