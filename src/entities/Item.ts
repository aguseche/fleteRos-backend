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

    @Column({ type: 'int', name: 'height' })
    height: number;

    @Column({ type: 'int', name: 'width' })
    width: number;

    @Column({ type: 'int', name: 'depth' })
    depth: number;

    @Column({ type: 'int', name: 'quantity' })
    quantity: number;

    @Column({ name: 'image_1', length: 50, nullable: true, default: null })
    image_1: string;

    @Column({ name: 'image_2', length: 50, nullable: true, default: null })
    image_2: string;

    @ManyToOne(() => Shipment, {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    })
    @JoinColumn({ name: 'idShipment', referencedColumnName: 'id' })
    shipment: Shipment;

    constructor(partial: Partial<Item> = {}) {
        Object.assign(this, partial);
    }
}
