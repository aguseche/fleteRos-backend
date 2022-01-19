import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';

import Shipment from './Shipment';

@Entity({ name: 'items' })
export default class Item {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column({ name: 'description', length: 100 })
    description: string;

    @Column('decimal', { name: 'weight', precision: 10, scale: 2 })
    weight: number;

    @Column({ name: 'size', length: 50 })
    size: string;

    @Column({ name: 'image_1', length: 50 })
    image_1: string;

    @Column({ name: 'image_2', length: 50 })
    image_2: string;

    @ManyToOne(() => Shipment, shipment => shipment.items)
    @JoinColumn({ name: 'idShipment', referencedColumnName: 'id' })
    shipment: Shipment;
}
