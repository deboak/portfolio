import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import type { CreateAdminInput } from './auth.schemas.js';

const select={id:true,email:true,createdAt:true} as const;
export const adminService={
  list:()=>prisma.admin.findMany({select,orderBy:{createdAt:'asc'}}),
  async create(data:CreateAdminInput){return prisma.admin.create({data:{email:data.email,passwordHash:await bcrypt.hash(data.password,12)},select})}
};
