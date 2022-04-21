import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BuildsEntity } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class BuildsService {
  @InjectRepository(BuildsEntity)
  private readonly buildsRepository: Repository<BuildsEntity>;
}
