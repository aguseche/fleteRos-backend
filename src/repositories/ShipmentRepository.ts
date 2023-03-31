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
            const itemsToSave = items.map(item => {
                item.shipment = insertShipment;
                return item;
            });
            await transactionalManager.save(Item, itemsToSave);
        });
    }
    async getAvailableShipments(): Promise<Shipment[] | undefined> {
        //     return this.createQueryBuilder('shipment')
        //         .leftJoinAndSelect('shipment.offers', 'offers')
        //         .leftJoinAndSelect('shipment.items', 'items')
        //         .leftJoin('offers.driver', 'driver')
        //         .where('shipment.shipDate >= Date.now()')
        //         .andWhere('shipment.confirmationDate is null')
        //         .andWhere('shipment.state =:state', { state: 'Waiting Offers' })
        //         .andWhere('driver.id != :id', { id: driver.id })
        //         .getMany();
        // }
        return this.find({
            relations: ['items', 'offers'],
            where: {
                shipDate: MoreThanOrEqual(Date.now()),
                confirmationDate: IsNull(),
                state: 'Waiting Offers'
            }
        });
    }
    async getMyShipments_User(user: User): Promise<Shipment[]> {
        return this.find({
            relations: ['user', 'items', 'offers', 'offers.driver'],
            where: {
                user: user,
                deliveryDate: IsNull(),
                state: Not('Canceled')
            }
        });
    }
    async getMyShipments_Driver(driver: Driver): Promise<Shipment[]> {
        return this.createQueryBuilder('shipment')
            .leftJoinAndSelect('shipment.offers', 'offers')
            .leftJoinAndSelect('shipment.items', 'items')
            .leftJoin('offers.driver', 'driver')
            .where('offers.confirmed =true')
            .andWhere('shipment.deliveryDate is null')
            .andWhere('driver.id =:id', { id: driver.id })
            .getMany();
    }
}
