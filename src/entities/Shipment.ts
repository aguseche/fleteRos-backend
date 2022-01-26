import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import Item from './Item';
import Offer from './Offer';
import User from './User';

@Entity({ name: 'shipments' })
export default class Shipment {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;
    @Column('boolean', { name: 'payment' })
    payment: boolean;
    @Column({ name: 'receipt', length: 45 })
    receipt: string;
    @Column({ name: 'state', length: 45 })
    state: string;
    @Column({ name: 'locationFrom', length: 100 })
    locationFrom: string;
    @Column({ name: 'locationTo', length: 100 })
    locationTo: string;
    //Dates
    @Column('timestamp', { name: 'shipDate' })
    shipDate: Date;
    @Column('timestamp', { name: 'deliveryDate' })
    deliveryDate: Date;
    @Column('timestamp', { name: 'confirmationDate' })
    confirmationDate: Date;
    @CreateDateColumn({ name: 'registrationDate', type: 'timestamp' })
    registrationDate!: Date;

    //Relationships
    @ManyToOne(() => User, {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    })
    @JoinColumn({ name: 'idUser', referencedColumnName: 'id' })
    user: User;

    @OneToMany(() => Item, item => item.shipment)
    items: Array<Item>;

    @OneToMany(() => Offer, offer => offer.shipment)
    offers: Offer[];
}
