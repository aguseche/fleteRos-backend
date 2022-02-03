import {
    EntityRepository,
    IsNull,
    MoreThanOrEqual,
    Not,
    Repository
} from 'typeorm';

import Shipment from '../entities/Shipment';
import Item from '../entities/Item';
import User from '../entities/User';
import Driver from '../entities/Driver';

@EntityRepository(Shipment)
export default class ShipmentRepository extends Repository<Shipment> {
    async registerShipment(shipment: Shipment, items: Item[]): Promise<void> {
        return this.manager.transaction(async transactionalManager => {
            const insertShipment = await transactionalManager.save(shipment);
            items.forEach(is => {
                is.shipment = insertShipment;
            });
            await transactionalManager.save(items);
        });
    }
    async getAvailableShipments(): Promise<Shipment[] | undefined> {
        return this.find({
            relations: ['items'],
            where: {
                shipDate: MoreThanOrEqual(Date.now()),
                confirmationDate: IsNull()
            }
        });
    }
    async getMyShipments_User(user: User): Promise<Shipment[]> {
        return this.find({
            relations: ['user'],
            where: {
                user: user,
                deliveryDate: IsNull(),
                state: Not('Canceled')
            }
        });
    }
    async getMyShipments_Driver(driver: Driver): Promise<Shipment[]> {
        return this.createQueryBuilder('shipment')
            .leftJoin('shipment.offers', 'offers')
            .leftJoin('offers.driver', 'driver')
            .where('offers.confirmed =true')
            .andWhere('shipment.deliveryDate is null')
            .andWhere('driver.id =:id', { id: driver.id })
            .getMany();
    }
}
