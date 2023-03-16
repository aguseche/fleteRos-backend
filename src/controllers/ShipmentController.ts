import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import ShipmentRepository from '../repositories/ShipmentRepository';
import Item from '../entities/Item';
import User from '../entities/User';
import Shipment from '../entities/Shipment';
import Driver from '../entities/Driver';

interface IItem {
    description: string;
    weight: number;
    size: string;
    quantity: number;
    image_1: string;
    image_2: string;
}
class ShipmentController {
    private shipmentRepository = getCustomRepository(ShipmentRepository);

    public registerShipment = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        if (!req.body.items) {
            return res.status(404).json('Must have at least one item');
        }
        const interfaceitems = req.body.items as IItem[];
        const user = req.user as User;
        const shipment = new Shipment();
        shipment.user = user;
        shipment.state = 'Waiting Offers';
        shipment.shipDate = req.body.shipment.shipDate;
        shipment.locationFrom = req.body.shipment.locationFrom;
        shipment.locationTo = req.body.shipment.locationTo;
        const items: Item[] = [];
        interfaceitems.forEach(
            ({ description, weight, size, quantity, image_1, image_2 }) => {
                const newItem = new Item();
                newItem.description = description;
                newItem.weight = weight;
                newItem.size = size;
                newItem.quantity = quantity;
                newItem.image_1 = image_1;
                newItem.image_2 = image_2;
                items.push(newItem);
            }
        );
        try {
            await this.shipmentRepository.registerShipment(shipment, items);
            return res.status(200).json({ status: 'success' });
        } catch (error) {
            return res.status(500).json(error);
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
        const driver = req.user as Driver;
        const shipments = await this.shipmentRepository.getAvailableShipments(/* driver*/);
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
