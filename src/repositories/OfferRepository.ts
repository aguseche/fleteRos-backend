import { EntityRepository, IsNull, MoreThan, Not, Repository } from 'typeorm';

import Shipment from '../entities/Shipment';
import Offer from '../entities/Offer';
import User from '../entities/User';
import Driver from '../entities/Driver';

@EntityRepository(Offer)
export default class OfferRepository extends Repository<Offer> {
    async saveOffer(offer: Offer, shipment: Shipment): Promise<void> {
        return this.manager.transaction(async transactionalManager => {
            await transactionalManager.save(offer);
            await transactionalManager.save(shipment);
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
                    updatedDate: MoreThan(dt),
                    shipment: {
                        user: person,
                        deliveryDate: IsNull(),
                        state: Not(state)
                    }
                }
            });
        } else if (person instanceof Driver) {
            return await this.find({
                relations: ['shipment'],
                where: {
                    driver: person,
                    updatedDate: MoreThan(dt),
                    shipment: {
                        deliveryDate: IsNull(),
                        state: Not(state)
                    }
                }
            });
        }
        return [];
    }
}
