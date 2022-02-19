import { EntityRepository, Repository } from 'typeorm';

import Shipment from '../entities/Shipment';
import Offer from '../entities/Offer';

@EntityRepository(Offer)
export default class OfferRepository extends Repository<Offer> {
    async saveOffer(offer: Offer, shipment: Shipment): Promise<void> {
        return this.manager.transaction(async transactionalManager => {
            await transactionalManager.save(offer);
            await transactionalManager.save(shipment);
        });
    }
}
