import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import ShipmentRepository from '../repositories/ShipmentRepository';
import Item from '../entities/Item';
import User from '../entities/User';
import Shipment from '../entities/Shipment';
import { IItem } from '../interfaces/IItem';
import { StatusCodes } from 'http-status-codes';
import { validateItem } from '../validations/itemValidator';
import { validateShipment } from '../validations/shipmentValidator';
import Driver from '../entities/Driver';
class ShipmentController {
    private shipmentRepository = getCustomRepository(ShipmentRepository);

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
                state: 'Waiting Offers',
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
}

export default ShipmentController;
