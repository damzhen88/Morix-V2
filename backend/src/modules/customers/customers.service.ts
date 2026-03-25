import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class CustomersService {
  constructor(private supabase: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('customers')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase.client
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new NotFoundException('Customer not found');
    return data;
  }

  async create(createCustomerDto: any) {
    const { data, error } = await this.supabase.client
      .from('customers')
      .insert(createCustomerDto)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: string, updateCustomerDto: any) {
    const { data, error } = await this.supabase.client
      .from('customers')
      .update(updateCustomerDto)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.client
      .from('customers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
}
