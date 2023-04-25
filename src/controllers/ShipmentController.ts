import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import Item from '../entities/Item';
import User from '../entities/User';
import Driver from '../entities/Driver';
import Shipment from '../entities/Shipment';
import { IItem } from '../interfaces/IItem';

import { StatusCodes } from 'http-status-codes';
import { SHIPMENT_STATE } from '../utils/constants';
import basic_template from '../templates/basic_template';
import Mailer from '../utils/mailer';

import DriverRepository from '../repositories/DriverRepository';
import ShipmentRepository from '../repositories/ShipmentRepository';
import { validateItem } from '../validations/itemValidator';
import { validateShipment } from '../validations/shipmentValidator';

class ShipmentController {
    private shipmentRepository = getCustomRepository(ShipmentRepository);
    private driverRepository = getCustomRepository(DriverRepository);

    public registerShipment = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const interfaceItems = req.body.items as IItem[];
        const user = req.user as User;

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
                    if (!validateItem(newItem)) {
                        throw new Error('Invalid Item');
                    }
                    return newItem;
                }
            );
            const shipment = new Shipment({
                user,
                state: SHIPMENT_STATE.waiting_offers,
                shipDate: new Date(req.body.shipment.shipDate),
                locationFrom: req.body.shipment.locationFrom,
                locationTo: req.body.shipment.locationTo
            });
            if (!validateShipment(shipment)) {
                throw new Error('Invalid Shipment');
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
        -confirmationDate null
        -No fue ofertado por el driver
        */
        const driver = req.user as Driver;
        const shipments = await this.shipmentRepository.getAvailable(driver);
        if (shipments === undefined) {
            return res.status(StatusCodes.OK).json('No shipments available');
        }
        return res.status(StatusCodes.OK).json(shipments);
    };

    public updateShipment = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        const oldShipment = await this.shipmentRepository.findOne({
            relations: ['user'],
            where: {
                user: req.user,
                id: req.body.id
            }
        });
        if (!oldShipment) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json('Invalid shipment id');
        }
        try {
            this.shipmentRepository.merge(oldShipment, req.body.shipment);
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
            if (!driver || !req.body.id) {
                throw new Error('You are missing driver or shipment id');
            }
            const shipment = await this.shipmentRepository.getWithDriver(
                req.body.id,
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

            return res.status(StatusCodes.OK).json('Success');
        } catch (error: unknown) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public receiveShipment = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            if (!req.user || !req.body.id) {
                throw new Error('You are missing user or shipment id');
            }
            const shipment = await this.shipmentRepository.findOne({
                relations: ['user'],
                where: {
                    user: req.user,
                    id: req.body.id
                }
            });
            if (!shipment) {
                throw new Error('Invalid shipment id');
            }
            if (shipment.state !== SHIPMENT_STATE.confirmed) {
                throw new Error(
                    'You can not receive a shipment that is not confirmed '
                );
            }
            if (!shipment.deliveryDate) {
                throw new Error(
                    'You can not receive a shipment that does not have a delivery date '
                );
            }
            if (shipment.confirmationDate) {
                throw new Error('Shipment already received');
            }
            shipment.confirmationDate = new Date();
            await this.shipmentRepository.save(shipment);
            //Send mail
            const template = basic_template(
                shipment.user.name,
                shipment.user.lastname,
                'Shipment Reception Confirmed'
            );
            const mailer = new Mailer();
            await mailer.sendMail(
                shipment.user.email,
                'You have conmfirmed the reception of your shipment succesfully',
                template.html
            );

            return res.status(StatusCodes.OK).json('Success');
        } catch (error: unknown) {
            console.log(error);
            if (error instanceof Error) {
                return res.status(StatusCodes.BAD_REQUEST).json(error.message);
            }
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };

    public getAllActive = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        /* 
        Devuelve shipments
        Si es usuario:
        -No estan cancelados, pertenecen al usuario y deliveryDate es null
        Si es driver:
        -Estan confirmados, pertenecen al driver y deliveryDate es null
        */
        try {
            const shipments: Shipment[] =
                await this.shipmentRepository.getAllActive(req.user);
            return res.status(StatusCodes.OK).json(shipments);
        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
        }
    };
    public deleteShipment = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        try {
            const shipment = await this.shipmentRepository.findOne({
                relations: ['user'],
                where: {
                    user: req.user,
                    id: req.body.id
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
