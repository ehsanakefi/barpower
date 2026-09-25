import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test(){
  const user = await prisma.user.findByUsername("admin");
  // const user = await prisma.user.findUnique({
  //   where:{
  //     username:"admin"
  //   }
  // });

  console.log(user);
}

test();