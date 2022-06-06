import { Injectable } from '@nestjs/common';
import { BaseMongoRepository } from '@kotanicore/repo-orm/mongo/base-mongo.repository';

@Injectable()
export class RepositoryService extends BaseMongoRepository {}
