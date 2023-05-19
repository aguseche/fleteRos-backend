import { EntityManager, EntityRepository } from 'typeorm';

import Driver from '../entities/Driver';
import Shipment from '../entities/Shipment';
import Offer from '../entities/Offer';

import { OFFER_STATE } from '../utils/constants';

@EntityRepository()
export default class ReportRepository {
    constructor(private readonly entityManager: EntityManager) {}

    async getAverageRate(idDriver: number): Promise<number> {
        //Receives a driver
        //Returns the average rate of that driver
        const result = await this.entityManager
            .createQueryBuilder()
            .select('AVG(offer.rate)', 'average_rate')
            .from(Offer, 'offer')
            .where('offer.idDriver = :idDriver', { idDriver })
            .getRawOne();
        return parseFloat(result.average_rate);
    }
    async getTotalShipments(idDriver: number): Promise<number> {
        //Receives a driver
        //Returns the total of shipments delivered by that driver
        const result = await this.entityManager
            .createQueryBuilder()
            .select('count(shipment.id)', 'total_shipments')
            .from(Offer, 'offer')
            .innerJoinAndSelect(Shipment, 'shipment')
            .where('offer.idDriver = :idDriver', { idDriver })
            .andWhere('offer.state = :state', { state: OFFER_STATE.confirmed })
            .andWhere('shipment.deliveryDate is not null')
            .groupBy('shipment.id')
            .getRawOne();
        return parseFloat(result.total_shipments);
    }
    async getTotalShipmentsWithInterval(
        idDriver: number,
        startDate: string,
        finishDate: string
    ): Promise<number> {
        //Receives a driver
        //Returns the total of shipments delivered by that driver
        //Filtered by the startDate and the FinishDate with the deliveryDate atribute
        const queryBuilder = this.entityManager.createQueryBuilder(
            Shipment,
            'shipment'
        );
        const result = await queryBuilder
            .innerJoin(Offer, 'offer', 'offer.idShipment = shipment.id')
            .where('offer.idDriver = :idDriver', { idDriver })
            .andWhere('offer.state = :state', { state: OFFER_STATE.confirmed })
            .andWhere('shipment.deliveryDate >= :startDate', { startDate })
            .andWhere('shipment.deliveryDate <= :finishDate', { finishDate })
            .getCount();
        return result;
    }
    async getTotalProfit(idDriver: number): Promise<number> {
        //Receives a driver
        //Returns the total of profit by that driver
        const result = await this.entityManager
            .createQueryBuilder()
            .select('SUM(o.price)', 'total_price')
            .from('shipments', 's')
            .innerJoin('offers', 'o', 'o.idShipment = s.id')
            .where('o.idDriver = :idDriver', { idDriver })
            .andWhere('o.state = "CONFIRMED"')
            .andWhere('s.deliveryDate IS NOT NULL')
            .groupBy('o.idDriver')
            .getRawOne();
        return parseFloat(result.total_price);
    }
    async getTotalDistance(idDriver: number): Promise<number> {
        //Receives a driver
        //Returns the total of distance by that driver
        const result = await this.entityManager
            .createQueryBuilder()
            .select('SUM(s.distance)', 'total_distance')
            .from('shipments', 's')
            .innerJoin('offers', 'o', 'o.idShipment = s.id')
            .where('o.idDriver = :idDriver', { idDriver })
            .andWhere('o.state = "CONFIRMED"')
            .andWhere('s.deliveryDate IS NOT NULL')
            .groupBy('o.idDriver')
            .getRawOne();
        return parseFloat(result.total_distance);
    }
    async getTotalDuration(idDriver: number): Promise<number> {
        //Receives a driver
        //Returns the total of duration by that driver
        const result = await this.entityManager
            .createQueryBuilder()
            .select('SUM(s.duration)', 'total_duration')
            .from('shipments', 's')
            .innerJoin('offers', 'o', 'o.idShipment = s.id')
            .where('o.idDriver = :idDriver', { idDriver })
            .andWhere('o.state = "CONFIRMED"')
            .andWhere('s.deliveryDate IS NOT NULL')
            .groupBy('o.idDriver')
            .getRawOne();
        return parseFloat(result.total_duration);
    }
    async getTotalProfitWithInterval(
        idDriver: number,
        startDate: string,
        finishDate: string
    ): Promise<number> {
        //Receives a driver
        //Returns the total of profit by that driver
        //Filtered by the startDate and the FinishDate with the deliveryDate atribute
        const result = await this.entityManager
            .createQueryBuilder()
            .select('SUM(offer.price)', 'total_profit')
            .from(Shipment, 'shipment')
            .innerJoin(Offer, 'offer', 'offer.idShipment = shipment.id')
            .where('offer.idDriver = :idDriver', { idDriver })
            .andWhere('offer.state = :state', { state: OFFER_STATE.confirmed })
            .andWhere('shipment.deliveryDate >= :startDate', { startDate })
            .andWhere('shipment.deliveryDate <= :finishDate', { finishDate })
            .getRawOne();
        return parseFloat(result.total_profit);
    }
}
