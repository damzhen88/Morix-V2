import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './entities/customers.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(CustomerEntity) private customersRepository: Repository<CustomerEntity>,
  ) {}

  async findAll() {
    return this.customersRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(createCustomerDto: any) {
    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  async update(id: string, updateCustomerDto: any) {
    await this.customersRepository.update(id, updateCustomerDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.customersRepository.delete(id);
    return { success: true };
  }
}
