import {
    EntityRepository,
    IsNull,
    MoreThan,
    MoreThanOrEqual,
    Not,
    Repository
} from 'typeorm';

import Shipment from '../entities/Shipment';
import Offer from '../entities/Offer';
import User from '../entities/User';
import Driver from '../entities/Driver';
import { OFFER_STATE, SHIPMENT_STATE } from '../utils/constants';

@EntityRepository(Offer)
export default class OfferRepository extends Repository<Offer> {
    async saveOffer(offer: Offer, shipment: Shipment): Promise<void> {
        return this.manager.transaction(async transactionalManager => {
            await transactionalManager.save(offer);
            await transactionalManager.save(shipment);
        });
    }

    async getConfirmedbyShipment(
        shipment: Shipment
    ): Promise<Offer | undefined> {
        return await this.findOne({
            relations: ['shipment'],
            where: {
                state: OFFER_STATE.confirmed,
                shipment: shipment
            }
        });
    }

    async getOffers(
        person: Express.User | undefined,
        dt: Date,
        state: string
    ): Promise<Offer[]> {
        if (person instanceof User) {
            return this.find({
                relations: ['shipment'],
                where: {
                    state: state,
                    // updatedDate: MoreThan(dt),
                    shipment: {
                        user: person
                        // deliveryDate: IsNull(),
                        // state: state
                    }
                }
            });
        } else if (person instanceof Driver) {
            return await this.find({
                relations: ['shipment'],
                where: {
                    driver: person,
                    state: state,
                    // updatedDate: MoreThan(dt),
                    shipment: {
                        // deliveryDate: IsNull(),
                        // state: state
                    }
                }
            });
        }
        return [];
    }

    async getSent(driver: Driver): Promise<Offer[]> {
        return await this.find({
            relations: ['shipment'],
            where: {
                // driver: driver,
                state: OFFER_STATE.sent,
                shipment: {
                    shipDate: MoreThanOrEqual(Date.now()),
                    state: SHIPMENT_STATE.waiting_offers
                }
            }
        });
    }

    async getAccepted(driver: Driver): Promise<Offer[]> {
        return await this.find({
            relations: ['shipment'],
            where: {
                driver: driver,
                state: OFFER_STATE.confirmed,
                shipment: {
                    state: SHIPMENT_STATE.confirmed,
                    deliveryDate: null
                }
            }
        });
    }
    async getDelivered(driver: Driver): Promise<Offer[]> {
        return await this.find({
            relations: ['shipment'],
            where: {
                driver: driver,
                state: OFFER_STATE.confirmed,
                shipment: {
                    state: SHIPMENT_STATE.confirmed,
                    deliveryDate: Not(null)
                }
            }
        });
    }
    //Estos dos se podrian juntar en uno
    async getDeleted(driver: Driver): Promise<Offer[]> {
        return await this.find({
            relations: ['shipment'],
            where: {
                driver: driver,
                state: OFFER_STATE.deleted
            }
        });
    }
    async getCancelled(driver: Driver): Promise<Offer[]> {
        return await this.find({
            relations: ['shipment'],
            where: {
                driver: driver,
                state: OFFER_STATE.cancelled
            }
        });
    }
}
