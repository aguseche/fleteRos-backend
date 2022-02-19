import { Request, Response } from 'express';
import { getCustomRepository, IsNull, MoreThan, Not } from 'typeorm';

import Driver from '../entities/Driver';
import Offer from '../entities/Offer';
import User from '../entities/User';
import OfferRepository from '../repositories/OfferRepository';
import ShipmentRepository from '../repositories/ShipmentRepository';

class OfferController {
    private offerRepository = getCustomRepository(OfferRepository);
    private shipmentRepository = getCustomRepository(ShipmentRepository);

    public registerOffer = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const driver = req.user as Driver;
        //validar que exista el shipment
        const shipment = await this.shipmentRepository.findOne(req.body.id);
        if (!shipment) {
            return res.status(403).json('Invalid shipment id');
        }
        //validar que no haya oferta del driver para ese shipment
        const oldOffer = await this.offerRepository.findOne({
            relations: ['shipment'],
            where: {
                shipment: shipment,
                driver: driver
            }
        });
        if (oldOffer) {
            return res.status(403).json('Already have offer');
        }
        //crear shipment
        const offer = new Offer();
        offer.driver = driver;
        offer.price = req.body.offer.price;
        offer.confirmed = false;
        offer.shipment = shipment;
        //response
        try {
            await this.offerRepository.save(offer);
            return res.status(200).json({ status: 'success' });
        } catch (error) {
            return res.status(500).json(error);
        }
    };

    public acceptOffer = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const user = req.user as User;
        const offer = await this.offerRepository.findOne({
            relations: ['shipment', 'shipment.user'],
            where: {
                id: req.body.id,
                shipment: {
                    user: user
                }
            }
        });
        if (!offer) {
            return res.status(403).json('Invalid offer id');
        }
        if (offer.confirmed === true) {
            return res.status(403).json('offer already confirmed');
        }
        try {
            offer.confirmed = true;
            offer.shipment.state = 'Offer Accepted';
            await this.offerRepository.saveOffer(offer, offer.shipment);
            return res.status(200).json('Success');
        } catch (error) {
            return res.status(500).json(error);
        }
    };

    public deleteOffer = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const driver = req.user as Driver;
        const oldOffer = await this.offerRepository.findOne({
            relations: ['driver'],
            where: {
                id: req.body.id,
                driver: driver
            }
        });
        if (!oldOffer) {
            return res.status(403).json('Invalid offer id');
        }
        if (oldOffer.confirmed === true) {
            // aca deberiamos ver alguna regla de negocio de cuando se puede cancelar y cuando no
            return res.status(403).json('offer already confirmed');
        }
        try {
            await this.offerRepository.delete(oldOffer);
            return res.status(200).json('Success');
        } catch (error) {
            return res.status(500).json(error);
        }
    };

    public getMyOffers = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const dt = new Date();
        dt.setDate(dt.getDate() - 3); // Poner 3 como variable en config
        let offers: Offer[] = [];
        if (req.user instanceof User) {
            const user = req.user as User;
            offers = await this.offerRepository.find({
                relations: ['shipment', 'shipment.user'],
                where: {
                    updatedDate: MoreThan(dt),
                    shipment: {
                        user: user,
                        deliveryDate: IsNull(),
                        state: Not('Canceled')
                    }
                }
            });
        }
        if (req.user instanceof Driver) {
            const driver = req.user as Driver;
            offers = await this.offerRepository.find({
                relations: ['driver', 'shipment'],
                where: {
                    driver: driver,
                    updatedDate: MoreThan(dt),
                    shipment: {
                        deliveryDate: IsNull(),
                        state: Not('Canceled')
                    }
                }
            });
        }
        if (!offers) {
            return res.status(200).json('User has no offers');
        }
        return res.status(200).json(offers);
    };
}

export default OfferController;
