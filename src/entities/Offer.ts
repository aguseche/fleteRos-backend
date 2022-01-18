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

@Entity({ name: 'offer' })
export default class Offer {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @CreateDateColumn({ name: 'registrationDate', type: 'timestamp' })
    registrationDate!: Date;

    @CreateDateColumn({ name: 'updateDate', type: 'timestamp' })
    updateDate!: Date;

    @Column('decimal', { name: 'price', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'boolean', name: 'confirmed' })
    confirmed: boolean;

    //Relationships
    @ManyToOne(() => Driver)
    @JoinColumn({ name: 'drivers', referencedColumnName: 'id' })
    driver: Driver;

    @ManyToOne(() => Shipment)
    @JoinColumn({ name: 'shipments', referencedColumnName: 'id' })
    shipment: Shipment;
}
