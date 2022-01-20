import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import ShipmentRepository from '../repositories/ShipmentRepository';
import Item from '../entities/Item';
import User from '../entities/User';
import Shipment from '../entities/Shipment';

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
        if (!req.user) {
            return res.status(403).json('Unauthorized');
        }
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
    public getValidShipments = async (
        req: Request,
        res: Response
    ): Promise<Response> => {
        if (!req.user) {
            return res.status(403).json('Unauthorized');
        }
        const shipments = await this.shipmentRepository.getValidShipments();
        if (shipments === undefined) {
            return res.status(200).json('No shipments available');
        }
        return res.status(200).json(shipments);
    };
}

export default ShipmentController;
