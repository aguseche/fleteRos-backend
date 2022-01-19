import { EntityRepository, Repository } from 'typeorm';

import Shipment from '../entities/Shipment';
import Item from '../entities/Item';

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
    async getValidShipments(): Promise<Shipment[] | undefined> {
        return this.createQueryBuilder()
            .where('shipDate >= NOW()')
            .andWhere('confirmationDate is null')
            .getMany();
    }
}
