import { Injectable, NotFoundException } from '@nestjs/common';
import { CrmRepository } from './crm.repository';
import { CrmDeal, DealStage } from './entities/crm-deal.entity';

@Injectable()
export class CrmService {
  constructor(private readonly crmRepository: CrmRepository) {}

  async findAll(stage?: DealStage) {
    return this.crmRepository.findAllWithRelations(stage);
  }

  async findOne(id: string) {
    const deal = await this.crmRepository.findById(id);
    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }
    return deal;
  }

  async create(data: Partial<CrmDeal>) {
    const leadId = await this.crmRepository.generateLeadId();
    const deal = this.crmRepository.create({
      ...data,
      lead_id: leadId,
      last_interaction_at: new Date(),
    });
    return this.crmRepository.save(deal);
  }

  async update(id: string, data: Partial<CrmDeal>) {
    await this.findOne(id);
    await this.crmRepository.update(id, { ...data, last_interaction_at: new Date() });
    return this.findOne(id);
  }

  async updateStage(id: string, stage: DealStage) {
    return this.update(id, { stage });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.crmRepository.delete(id);
  }

  async getPipelineStats() {
    return this.crmRepository.getPipelineStats();
  }
}
