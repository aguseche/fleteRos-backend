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
import Offer from '../entities/Offer';
import { OFFER_STATE, SHIPMENT_STATE } from '../utils/constants';

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

    async deliverShipment(shipment: Shipment, offer: Offer): Promise<void> {
        return this.manager.transaction(async transactionalManager => {
            await transactionalManager.save(shipment);
            await transactionalManager.save(offer);
        });
    }

    async getWithDriver(
        id: number,
        driver: Driver
    ): Promise<Shipment | undefined> {
        return await this.createQueryBuilder('shipment')
            .leftJoinAndSelect('shipment.user', 'user')
            .leftJoin('shipment.offers', 'offers')
            .where('offers.driver.id = :driverId', { driverId: driver.id })
            .andWhere('shipment.id = :shipmentId', { shipmentId: id })
            .getOne();
    }
    async getAvailable(driver: Driver): Promise<Shipment[] | undefined> {
        //Devuelve los shipments disponibles al dia de la fecha que no hayan sido ofertados por el driver
        //Por disponible se entiende que no estan confirmados ni eliminados, su estado es 'Waiting Offers'
        //Ademas, tampoco tiene que haber ofertas activas del driver en el shipment

        const subQuery = await this.createQueryBuilder('shipment')
            .select('shipment.id')
            .leftJoin('shipment.offers', 'offers')
            .where('offers.driver.id = :driverId', { driverId: driver.id })
            .getQuery();
        return await this.createQueryBuilder('shipment')
            .leftJoinAndSelect('shipment.items', 'items')
            .leftJoin('shipment.offers', 'offers')
            .where('shipment.shipDate >= :now', { now: Date.now() })
            .andWhere('shipment.confirmationDate IS NULL')
            .andWhere('shipment.state =:state', {
                state: SHIPMENT_STATE.waiting_offers
            })
            .andWhere(`shipment.id NOT IN (${subQuery})`)
            .setParameter('driverId', driver.id)
            .getMany();
    }

    async getActive_driver(driver: Driver): Promise<Shipment[]> {
        return this.createQueryBuilder('shipment')
            .leftJoinAndSelect('shipment.offers', 'offers')
            .leftJoinAndSelect('shipment.items', 'items')
            .leftJoin('offers.driver', 'driver')
            .where('offers.state =:state', { state: OFFER_STATE.sent })
            .andWhere('shipment.deliveryDate is null')
            .andWhere('driver.id =:id', { id: driver.id })
            .getMany();
    }
    async getActive_user(user: User): Promise<Shipment[]> {
        return this.find({
            relations: ['user', 'items', 'offers', 'offers.driver'],
            where: {
                user: user,
                deliveryDate: IsNull(),
                state: SHIPMENT_STATE.confirmed
            }
        });
    }

    async getWaitingOffers(user: User): Promise<Shipment[]> {
        return this.find({
            relations: ['user', 'items', 'offers', 'offers.driver'],
            where: {
                user: user,
                state: SHIPMENT_STATE.waiting_offers,
                shipDate: MoreThanOrEqual(Date.now())
            }
        });
    }

    async getCancelled(user: User): Promise<Shipment[]> {
        return this.find({
            relations: ['user', 'items', 'offers', 'offers.driver'],
            where: {
                user: user,
                state: SHIPMENT_STATE.cancelled
            }
        });
    }

    async getDelivered(user: User): Promise<Shipment[]> {
        return this.find({
            relations: ['user', 'items', 'offers', 'offers.driver'],
            where: {
                user: user,
                state: SHIPMENT_STATE.confirmed,
                deliveryDate: Not(null),
                confirmationDate: Not(null)
            }
        });
    }

    async getAllActive(person: Express.User | undefined): Promise<Shipment[]> {
        if (person instanceof User) {
            return this.find({
                relations: ['user', 'items', 'offers', 'offers.driver'],
                where: {
                    user: person,
                    deliveryDate: IsNull(),
                    state: Not('Canceled')
                }
            });
        } else if (person instanceof Driver) {
            return this.createQueryBuilder('shipment')
                .leftJoinAndSelect('shipment.offers', 'offers')
                .leftJoinAndSelect('shipment.items', 'items')
                .leftJoin('offers.driver', 'driver')
                .where('offers.state =:state', { state: 'sent' })
                .andWhere('shipment.deliveryDate is null')
                .andWhere('driver.id =:id', { id: person.id })
                .getMany();
        }
        return [];
    }
}
