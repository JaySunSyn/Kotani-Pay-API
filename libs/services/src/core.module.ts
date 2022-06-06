import { Module } from '@nestjs/common';
import { CoreService } from '@kotanicore/services/core.service';
import { BlockchainService } from '@kotanicore/blockchain';
import { RepositoryModule } from '@kotanicore/repository';

@Module({
  imports: [RepositoryModule],
  providers: [CoreService, BlockchainService],
  exports: [CoreService, BlockchainService],
})
export class CoreModule {}
