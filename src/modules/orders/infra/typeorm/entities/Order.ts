import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';

@Entity(Order)
class Order {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne( () => Customer, customer => customer.id, {
    cascade: true,
    eager: true
  } )
  @JoinColumn()
  customer: Customer;

  @OneToMany(() => OrdersProducts, orderProduct => orderProduct.order)
  order_products: OrdersProducts[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Order;
