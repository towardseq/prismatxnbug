import { startPrismaTransaction } from "./index";

it('Allows two tx clients to work independently', async () => {
  // const prismaTx = getTxClient();
  // const prismaTx = new PrismaClient();
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  await startPrismaTransaction(1000);
  await sleep(100);
  await startPrismaTransaction(0);

  // const tx = prismaTx.$transaction(async txClient => {
  //   await sleep(1000);
  //   console.log('tx1 finish');
  // });
  // @ts-ignore
  // await tx1.commit();

  // const tx2 = prismaTx.$transaction(async txClient => {
  //   await txClient.user.count();
  //   console.log('tx2 finish');
  // });
  // const transactionClient1 = await prismaTx.$begin();
  // const transactionClient2 = await prismaTx.$begin();
  //
  // await transactionClient1.user.create({ data: { email: TEST_EMAIL } });
  // await transactionClient1.$commit();
  // const users = await transactionClient2.user.findMany({
  //   where: { email: TEST_EMAIL },
  // });
  // expect(users.length).toBe(1);
});