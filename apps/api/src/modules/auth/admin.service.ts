import bcrypt from 'bcryptjs';
import type { AdminRepository } from './auth.repository.js';
import type { CreateAdminInput } from './auth.schemas.js';
export class AdminService {
  constructor(private readonly repository: AdminRepository) {}
  list() {
    return this.repository.list();
  }
  async create(data: CreateAdminInput) {
    return this.repository.create(data.email, await bcrypt.hash(data.password, 12));
  }
}
