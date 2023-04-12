import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import Driver from './Driver';
import Shipment from './Shipment';

@Entity({ name: 'offers' })
export default class Offer {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @CreateDateColumn({ name: 'registrationDate', type: 'timestamp' })
    registrationDate!: Date;

    @CreateDateColumn({ name: 'updatedDate', type: 'timestamp' })
    updatedDate!: Date;

    @Column('decimal', { name: 'price', precision: 10, scale: 2 })
    price: number;

    @Column({ name: 'state', length: 50 })
    state: string;

    //Relationships
    @ManyToOne(() => Driver, {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    })
    @JoinColumn({ name: 'idDriver', referencedColumnName: 'id' })
    driver: Driver;

    @ManyToOne(() => Shipment, {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    })
    @JoinColumn({ name: 'idShipment', referencedColumnName: 'id' })
    shipment: Shipment;
}
