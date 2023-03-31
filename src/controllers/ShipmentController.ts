import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import ShipmentRepository from '../repositories/ShipmentRepository';
import Item from '../entities/Item';
import User from '../entities/User';
import Shipment from '../entities/Shipment';
import Driver from '../entities/Driver';
import { IItem } from '../interfaces/IItem';
import { StatusCodes } from 'http-status-codes';
import { validateItem } from '../validations/itemValidator';
import { validateShipment } from '../validations/shipmentValidator';
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
            //falta diferenciar los try catch con los errores que tiran las validaciones. no se como se hace
            const items: Item[] = interfaceItems.map(
                ({ description, weight, size, quantity, image_1, image_2 }) => {
                    const newItem = new Item({
                        description,
                        weight,
                        size,
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
                if (error.message === 'Invalid Item') {
                    return res
                        .status(StatusCodes.BAD_REQUEST)
                        .json('One or more items are invalid');
                } else if (error.message === 'Invalid Shipment') {
                    return res
                        .status(StatusCodes.BAD_REQUEST)
                        .json('The Shipment is invalid');
                } else {
                    return res
                        .status(StatusCodes.INTERNAL_SERVER_ERROR)
                        .json(error);
                }
            }
            return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json('Unknown error occurred');
        }
    };
    public getAvailableShipments = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        /*
        Devuelve los shipments disponibles para un driver
        Por disponible decimos:
        -shipDate >= hoy
        -confirmationDate null
        */
        // const driver = req.user as Driver;
        const shipments =
            await this.shipmentRepository.getAvailableShipments(/* driver*/);
        if (shipments === undefined) {
            return res.status(200).json('No shipments available');
        }
        return res.status(200).json(shipments);
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
            return res.status(403).json('Invalid shipment id');
        }
        try {
            this.shipmentRepository.merge(oldShipment, req.body.shipment);
            await this.shipmentRepository.save(oldShipment);
            return res.status(200).json('Success');
        } catch (error) {
            return res.status(500).json(error);
        }
    };

    public getMyShipments = async (
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
        let shipments: Shipment[] = [];
        if (req.user instanceof User) {
            shipments = await this.shipmentRepository.getMyShipments_User(
                req.user
            );
        } else if (req.user instanceof Driver) {
            shipments = await this.shipmentRepository.getMyShipments_Driver(
                req.user
            );
        }
        if (!shipments) {
            return res.status(403).json('This user has no shipments');
        }
        return res.status(200).json(shipments);
    };
}

export default ShipmentController;
