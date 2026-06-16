import { FulfillmentModule } from '@ecommerce/fulfillment';
import { OrderingModule } from '@ecommerce/ordering';
import { ReturnsModule } from '@ecommerce/returns';
import { ShoppingModule } from '@ecommerce/shopping';
import { Module } from '@nestjs/common';

@Module({
  imports: [ShoppingModule, OrderingModule, FulfillmentModule, ReturnsModule],
})
export class AppModule {}
