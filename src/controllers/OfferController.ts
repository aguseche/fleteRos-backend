import { Request, Response } from 'express';
import { getCustomRepository, IsNull, MoreThan, Not } from 'typeorm';

import Driver from '../entities/Driver';
import Offer from '../entities/Offer';
import User from '../entities/User';
import OfferRepository from '../repositories/OfferRepository';
import ShipmentRepository from '../repositories/ShipmentRepository';

import { StatusCodes } from 'http-status-codes';
import { validateOffer } from '../validations/offerValidator';

class OfferController {
    private offerRepository = getCustomRepository(OfferRepository);
    private shipmentRepository = getCustomRepository(ShipmentRepository);

    public registerOffer = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const driver = req.user as Driver;
            //validar que exista el shipment
            const shipment = await this.shipmentRepository.findOne(req.body.id);
            if (!shipment) {
                throw new Error('Invalid shipment id');
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
                throw new Error('Already have offer');
            }
            //crear offer
            const offer = new Offer();
            offer.driver = driver;
            offer.price = Number(req.body.offer.price);
            offer.state = 'sent';
            offer.shipment = shipment;
            //Valida la oferta
            if (!validateOffer(offer)) {
                throw new Error('Invalid Offer');
            }
            await this.offerRepository.save(offer);
            return res.status(StatusCodes.OK).json({ status: 'success' });
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };

    public acceptOffer = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const user = req.user as User;
        try {
            const offer = await this.offerRepository.findOne({
                relations: ['shipment', 'shipment.user'],
                where: {
                    id: req.body.id,
                    shipment: {
                        user: user
                    }
                }
            });
            //Valida que exista la oferta (relacion Shipment - User)
            if (!offer) {
                throw new Error('Invalid Offer');
            }
            //Valida que la oferta no este confirmada
            if (offer.state === 'confirmed') {
                throw new Error('offer already confirmed');
            }
            offer.state = 'confirmed';
            offer.shipment.state = 'Offer Accepted';
            //Valida la oferta en general
            if (!validateOffer(offer)) {
                throw new Error('Invalid Offer');
            }
            await this.offerRepository.saveOffer(offer, offer.shipment);
            return res.status(StatusCodes.OK).json('Success');
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
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
            return res.status(StatusCodes.BAD_REQUEST).json('Invalid offer id');
        }
        if (oldOffer.state === 'confirmed') {
            // aca deberiamos ver alguna regla de negocio de cuando se puede cancelar y cuando no
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json('offer already confirmed');
        }
        try {
            await this.offerRepository.delete(oldOffer);
            return res.status(StatusCodes.OK).json('Success');
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };

    public getMyOffers = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        //Busca las ofertas (ya sea User o Driver) validando que
        //updatedDate >= hoy - 3 dias
        //deliveryDate IS NULL
        //state != Cancelled
        //Devuelve Offer con su Shipment
        const dt = new Date();
        dt.setDate(dt.getDate() - 3); // Poner 3 como variable en config
        try {
            const offers: Offer[] = await this.offerRepository.getOffers(
                req.user,
                dt
            );
            return res.status(StatusCodes.OK).json(offers);
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
}

export default OfferController;
