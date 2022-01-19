import { EntityRepository, Repository } from 'typeorm';

import Shipment from '../entities/Shipment';
import Item from '../entities/Item';

@EntityRepository(Shipment)
export default class ShipmentRepository extends Repository<Shipment> {
    async registerShipment(shipment: Shipment, items: Item[]): Promise<void> {
        return this.manager.transaction(async transactionalManager => {
            const insertShipment = await transactionalManager.save(shipment);
            try {
                items.forEach(is => {
                    is.shipment = insertShipment;
                });
            } catch (error) {
                console.log(error);
            }

            await transactionalManager.save(items);
        });
    }
}
