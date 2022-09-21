import express from 'express';
import { PrismaClient } from "@prisma/client";
const app = express()
const port = 3002
const prisma = new PrismaClient();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const startPrismaTransaction = (timeToSleep: number) => {
  // @ts-ignore
  return prisma.$transaction(async (txClient) => {
    await sleep(timeToSleep);
    return await txClient.user.create({ data: { email: 'test' } });
  });
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})