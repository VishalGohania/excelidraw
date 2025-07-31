import { PrismaClient } from "@prisma/client";
export type PrismaClientSingleton = ReturnType<() => PrismaClient>;