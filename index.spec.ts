import { startPrismaTransaction } from "./index";
import {PrismaClient} from "@prisma/client";

it('Local', async () => {
  const prismaTx = new PrismaClient();
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // @ts-ignore
  const tx = await prismaTx.$transaction(async txClient => {
    await sleep(1000);
    console.log('tx1 finish');
  });

  const tx2 = await prismaTx.$transaction(async txClient => {
    await txClient.user.count();
    console.log('tx2 finish');
  });

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