import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemsControllerTsController } from './order-items.controller';

describe('OrderItemsControllerTsController', () => {
  let controller: OrderItemsControllerTsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderItemsControllerTsController],
    }).compile();

    controller = module.get<OrderItemsControllerTsController>(OrderItemsControllerTsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
