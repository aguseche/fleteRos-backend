import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import Item from '../entities/Item';
import User from '../entities/User';
import Driver from '../entities/Driver';
import Shipment from '../entities/Shipment';
import { IItem } from '../interfaces/IItem';

import { StatusCodes } from 'http-status-codes';
import { SEND_MAIL, SHIPMENT_STATE } from '../utils/constants';
import basic_template from '../templates/basic_template';
import Mailer from '../utils/mailer';

import DriverRepository from '../repositories/DriverRepository';
import ShipmentRepository from '../repositories/ShipmentRepository';
import OfferRepository from '../repositories/OfferRepository';
import { validateItem } from '../validations/itemValidator';
import { validateShipment } from '../validations/shipmentValidator';
import { validateOffer } from '../validations/offerValidator';

class ShipmentController {
    private shipmentRepository = getCustomRepository(ShipmentRepository);
    private driverRepository = getCustomRepository(DriverRepository);
    private offerRepository = getCustomRepository(OfferRepository);

    public registerShipment = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const interfaceItems = req.body.items as IItem[];
        const user = req.user as User;
        if (!user.isVerified) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json('User not verified');
        }
        if (!interfaceItems || interfaceItems.length === 0) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json('Must have at least one item');
        }
        try {
            const items: Item[] = interfaceItems.map(
                ({
                    description,
                    weight,
                    height,
                    width,
                    depth,
                    quantity,
                    image_1,
                    image_2
                }) => {
                    const newItem = new Item({
                        description,
                        weight,
                        height,
                        width,
                        depth,
                        quantity,
                        image_1,
                        image_2
                    });
                    const itemValidation = validateItem(newItem);
                    if (!itemValidation.valid) {
                        throw new Error(itemValidation.errorMessage);
                    }
                    return newItem;
                }
            );
            const shipment = new Shipment({
                user,
                state: SHIPMENT_STATE.waiting_offers,
                shipDate: new Date(req.body.shipment.shipDate),
                delivery_shift: req.body.shipment.delivery_shift,
                locationFrom: req.body.shipment.locationFrom,
                locationTo: req.body.shipment.locationTo,
                distance: req.body.shipment.distance,
                duration: req.body.shipment.duration
            });
            const shipment_validation = validateShipment(shipment);
            if (!shipment_validation.valid) {
                throw new Error(shipment_validation.errorMessage);
            }
            await this.shipmentRepository.registerShipment(shipment, items);
            return res.status(StatusCodes.CREATED).json({ status: 'success' });
        } catch (error: unknown) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public getAvailable = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        /*
        Devuelve los shipments disponibles para un driver
        Por disponible decimos:
        -shipDate >= hoy
        -No fue ofertado por el driver
        */
        const driver = req.user as Driver;
        const shipments = await this.shipmentRepository.getAvailable(driver);
        return res.status(StatusCodes.OK).json(shipments);
    };

    public updateShipment = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const user = req.user as User;
        const shipment = req.body.shipment;
        const shipment_id = req.body.id;

        if (!user.isVerified) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json('User not verified');
        }
        const oldShipment = await this.shipmentRepository.findOne({
            relations: ['user'],
            where: {
                user: user,
                id: shipment_id
            }
        });
        if (!oldShipment) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json('Invalid shipment id');
        }
        try {
            this.shipmentRepository.merge(oldShipment, shipment);
            await this.shipmentRepository.save(oldShipment);
            return res.status(StatusCodes.OK).json('Success');
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public deliverShipment = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const driver = req.user as Driver;
            const shipment_id = req.body.id;
            if (!driver || !req.body.id) {
                throw new Error('You are missing driver or shipment id');
            }
            if (!driver.isVerified || !driver.active) {
                return res
                    .status(StatusCodes.UNAUTHORIZED)
                    .json('Driver not verified');
            }
            const shipment = await this.shipmentRepository.getWithDriver(
                shipment_id,
                driver
            );
            if (!shipment) {
                throw new Error('Invalid shipment id');
            }
            if (shipment.state !== SHIPMENT_STATE.confirmed) {
                throw new Error(
                    'You can not deliver a shipment that is not confirmed '
                );
            }
            if (shipment.deliveryDate) {
                throw new Error('Shipment already delivered');
            }
            shipment.deliveryDate = new Date();
            await this.shipmentRepository.save(shipment);

            //Send mail
            if (SEND_MAIL) {
                //user
                const template = basic_template(
                    shipment.user.name,
                    shipment.user.lastname,
                    'Shipment Delivered'
                );
                const mailer = new Mailer();
                await mailer.sendMail(
                    shipment.user.email,
                    'You have received your shipment ! please confirm it.',
                    template.html
                );

                //driver
                const template_2 = basic_template(
                    driver.name,
                    driver.lastname,
                    'You have delivered the shipment succesfully. Wait for the user confirmation'
                );
                await mailer.sendMail(
                    shipment.user.email,
                    'Shipment Delivered',
                    template_2.html
                );
            }

            return res.status(StatusCodes.OK).json('Success');
        } catch (error: unknown) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    // public receiveShipment = async (
    //     req: Request,
    //     res: Response
    // ): Promise<Response> => {
    //     try {
    //         if (!req.user || !req.body.id) {
    //             throw new Error('You are missing user id, shipment id');
    //         }
    //         const shipment = await this.shipmentRepository.findOne({
    //             relations: ['user'],
    //             where: {
    //                 user: req.user,
    //                 id: req.body.id
    //             }
    //         });
    //         if (!shipment) {
    //             throw new Error('Invalid shipment id');
    //         }
    //         if (shipment.state !== SHIPMENT_STATE.confirmed) {
    //             throw new Error(
    //                 'You can not receive a shipment that is not confirmed '
    //             );
    //         }
    //         if (!shipment.deliveryDate) {
    //             throw new Error(
    //                 'You can not receive a shipment that does not have a delivery date '
    //             );
    //         }
    //         const rate = parseInt(req.body.rate, 10);
    //         if (rate) {
    //             const offer = await this.offerRepository.getConfirmedbyShipment(
    //                 shipment
    //             );
    //             if (offer) {
    //                 offer.rate = rate;
    //                 if (validateOffer(offer)) {
    //                     await this.shipmentRepository.deliverShipment(
    //                         shipment,
    //                         offer
    //                     );
    //                 }
    //             }
    //         } else {
    //             await this.shipmentRepository.save(shipment);
    //         }
    //         //Send mail
    //         if (SEND_MAIL) {
    //             const template = basic_template(
    //                 shipment.user.name,
    //                 shipment.user.lastname,
    //                 'Shipment Reception Confirmed'
    //             );
    //             const mailer = new Mailer();
    //             await mailer.sendMail(
    //                 shipment.user.email,
    //                 'You have conmfirmed the reception of your shipment succesfully',
    //                 template.html
    //             );
    //         }
    //         return res.status(StatusCodes.OK).json('Success');
    //     } catch (error: unknown) {
    //         console.log(error);
    //         if (error instanceof Error) {
    //             return res.status(StatusCodes.BAD_REQUEST).json(error.message);
    //         }
    //         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    //     }
    // };

    public deleteShipment = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const user = req.user as User;
        const shipment_id = req.body.id;
        if (!user.isVerified) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json('User not verified');
        }
        try {
            const shipment = await this.shipmentRepository.findOne({
                relations: ['user'],
                where: {
                    user: user,
                    id: shipment_id
                }
            });
            if (!shipment) {
                throw new Error('Invalid shipment id');
            }
            // if (shipment.state === SHIPMENT_STATE.confirmed) {
            //     //agregar RN
            //     throw new Error('Shipment state confirmed or cancelled');
            // }
            if (shipment.state !== SHIPMENT_STATE.waiting_offers) {
                throw new Error('Shipment state confirmed or cancelled');
            }
            shipment.state = SHIPMENT_STATE.cancelled;
            if (!validateShipment(shipment)) {
                throw new Error('Invalid Shipment');
            }
            await this.shipmentRepository.save(shipment);
            return res.status(StatusCodes.OK).json('Success');
        } catch (error) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
}

export default ShipmentController;
