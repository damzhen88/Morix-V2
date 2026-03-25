import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CrmDeal, DealStage } from './entities/crm-deal.entity';

@Injectable()
export class CrmRepository extends Repository<CrmDeal> {
  constructor(private dataSource: DataSource) {
    super(CrmDeal, dataSource.createEntityManager());
  }

  async findAllWithRelations(stage?: DealStage) {
    const qb = this.createQueryBuilder('deal')
      .orderBy('deal.created_at', 'DESC');
    
    if (stage) {
      qb.andWhere('deal.stage = :stage', { stage });
    }
    
    return qb.getMany();
  }

  async findById(id: string) {
    return this.findOne({ where: { id } });
  }

  async generateLeadId(): Promise<string> {
    const count = await this.count();
    return `LEAD-${String(count + 1).padStart(4, '0')}`;
  }

  async getPipelineStats() {
    const stages: DealStage[] = ['inquiry', 'quoted', 'paid', 'shipped'];
    const stats = await Promise.all(
      stages.map(async (stage) => {
        const deals = await this.findAllWithRelations(stage);
        const total = deals.reduce((sum, d) => sum + Number(d.deal_value), 0);
        return { stage, count: deals.length, total };
      })
    );
    return stats;
  }
}
