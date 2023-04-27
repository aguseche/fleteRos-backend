import { Request, Response } from 'express';
import { getCustomRepository, IsNull, MoreThan, Not } from 'typeorm';

import { StatusCodes } from 'http-status-codes';
import {
    SHIPMENT_STATE,
    DAYS_SINCE_UPDATED,
    OFFER_STATE,
    SEND_MAIL
} from '../utils/constants';
import Mailer from '../utils/mailer';
import offer_template from '../templates/offer_template';

import Driver from '../entities/Driver';
import Offer from '../entities/Offer';
import User from '../entities/User';

import OfferRepository from '../repositories/OfferRepository';
import ShipmentRepository from '../repositories/ShipmentRepository';
import { validateOffer } from '../validations/offerValidator';
import { validateState } from '../validations/offerValidators/stateValidator';

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
            const shipment = await this.shipmentRepository.findOne(
                req.body.id,
                { relations: ['user'] }
            );
            if (!shipment) {
                throw new Error('Invalid shipment id');
            }
            //validar que el state del shipment sea WAITING_OFFERS
            if (shipment.state !== SHIPMENT_STATE.waiting_offers) {
                throw new Error('Shipment not waiting for offers');
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
            offer.state = OFFER_STATE.sent;
            offer.shipment = shipment;
            //Valida la oferta
            if (!validateOffer(offer)) {
                throw new Error('Invalid Offer');
            }
            await this.offerRepository.save(offer);
            //Send mail
            if (SEND_MAIL) {
                const template = offer_template(
                    shipment.user.name,
                    shipment.user.lastname,
                    offer.price,
                    shipment,
                    'You have received a new Offer for your shipment. Here you have the details'
                );
                const mailer = new Mailer();
                await mailer.sendMail(
                    shipment.user.email,
                    'New Offer Received',
                    template.html
                );
            }
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
            if (offer.state === OFFER_STATE.confirmed) {
                throw new Error('offer already confirmed');
            }
            offer.state = OFFER_STATE.confirmed;
            offer.shipment.state = SHIPMENT_STATE.confirmed;
            //Valida la oferta en general
            if (!validateOffer(offer)) {
                throw new Error('Invalid Offer');
            }
            await this.offerRepository.saveOffer(offer, offer.shipment);

            //Send mail
            if (SEND_MAIL) {
                const template = offer_template(
                    offer.shipment.user.name,
                    offer.shipment.user.lastname,
                    offer.price,
                    offer.shipment,
                    'Your offer has been accepted !'
                );
                const mailer = new Mailer();
                await mailer.sendMail(
                    offer.shipment.user.email,
                    'Offer Accepted',
                    template.html
                );
            }
            return res.status(StatusCodes.OK).json('Success');
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public cancelOffer = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const user = req.user as User;
        if (!req.user || !req.body.id) {
            throw new Error('You are missing user or offer id');
        }
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
            if (offer.state !== OFFER_STATE.sent) {
                throw new Error('Offer state is not "SENT"');
            }
            offer.state = OFFER_STATE.cancelled;
            //Valida la oferta en general
            if (!validateOffer(offer)) {
                throw new Error('Invalid Offer');
            }
            await this.offerRepository.save(offer);
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
        const offer = await this.offerRepository.findOne({
            relations: ['driver'],
            where: {
                id: req.body.id,
                driver: driver
            }
        });

        try {
            if (!offer) {
                throw new Error('Invalid Offer');
            }
            // if (offer.state === OFFER_STATE.confirmed) {
            //     // aca deberiamos ver alguna regla de negocio de cuando se puede cancelar y cuando no
            //     throw new Error('Offer Already Confirmed');
            // }
            if (offer.state !== OFFER_STATE.sent) {
                throw new Error('Offer State is not sent');
            }
            offer.state = OFFER_STATE.deleted;
            if (!validateOffer(offer)) {
                throw new Error('Invalid Offer');
            }
            await this.offerRepository.save(offer);
            return res.status(StatusCodes.OK).json('Success');
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };

    public rateOffer = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const user = req.user as User;
        try {
            if (!req.user || req.body.rate) {
                throw new Error('You are missing user or rate');
            }
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
            if (offer.state !== OFFER_STATE.confirmed) {
                throw new Error('offer not confirmed');
            }
            offer.rate = req.body.rate;
            //Valida la oferta en general
            if (!validateOffer(offer)) {
                throw new Error('Invalid Offer');
            }
            await this.offerRepository.save(offer);
            return res.status(StatusCodes.OK).json('Success');
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public getMyOffers = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        //Busca las ofertas (ya sea User o Driver) validando que tenga el mismo state que se le indica
        //Devuelve Offer con su Shipment

        //Comentado por ahora
        //updatedDate >= hoy - 3 dias -> No se porque esto pero lo deje
        //deliveryDate IS NULL

        const state = req.body.state;
        const date = new Date();
        date.setDate(date.getDate() - DAYS_SINCE_UPDATED);
        try {
            if (!validateState(state)) {
                throw new Error('Invalid State');
            }
            const offers: Offer[] = await this.offerRepository.getOffers(
                req.user,
                date,
                state
            );
            return res.status(StatusCodes.OK).json(offers);
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
}

export default OfferController;
