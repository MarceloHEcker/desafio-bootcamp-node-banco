import { inject, injectable } from 'tsyringe';
import { classToClass } from 'class-transformer';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(

    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {  }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {

    const customer = await this.customersRepository.findById(
      customer_id
    );

    if (!customer) {
      throw new AppError('Customer not found', 400);
    }

    //verificar se há produtos invalidos

    const productsList = await this.productsRepository.findAllById(products);

    const mappedProducts = products.map(product => {

      const currentProduct = productsList.find(item => item.id === product.id);

      if(currentProduct && currentProduct?.quantity < product.quantity)
        throw new AppError('Insuficient quantity of a product', 400);

      if(currentProduct){
        return {
          product_id: currentProduct.id,
          quantity: product.quantity,
          price: currentProduct.price
        }
      } else {
        throw new AppError('Invalid product', 400);
      }

    });

    const order = await this.ordersRepository.create({
      customer,
      products: mappedProducts
    });

    const { order_products } = order;

    const ordersProductsQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        productsList.filter(p => p.id === product.product_id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(ordersProductsQuantity);

    return classToClass(order);

  }
}

export default CreateOrderService;
