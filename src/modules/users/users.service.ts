import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UsersEntity from './users.entity';

@Injectable()
export class UsersService {
  @InjectRepository(UsersEntity)
  private readonly usersRepository: Repository<UsersEntity>;
  async findOneById(username: string): Promise<any> {
    return await this.usersRepository.findOne({ username });
  }
}
