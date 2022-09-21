import { startPrismaTransaction } from "./index";
import {PrismaClient} from "@prisma/client";

it('Local', async () => {
  const prismaTx = new PrismaClient();
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // @ts-ignore
  const tx1 = prismaTx.$transaction(async txClient1 => {
    await sleep(1000);
    await txClient1.user.count();
    console.log('tx1 finish');
  });

  // @ts-ignore
  const tx2 = prismaTx.$transaction(async txClient2 => {
    throw new Error('foo')
  });

  await Promise.all([tx1, tx2])
});

it('Importing', async () => {
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  //
  await startPrismaTransaction(1000);
  await sleep(100);
  await startPrismaTransaction(0);

});