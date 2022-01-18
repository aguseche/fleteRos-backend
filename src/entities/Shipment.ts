import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import Driver from './Driver';
import Item from './Item';
import User from './User';

@Entity({ name: 'shipment' })
export default class Shipment {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;
    @Column('decimal', { name: 'price', precision: 10, scale: 2 })
    price: number;
    @Column('boolean', { name: 'payment' })
    payment: boolean;
    @Column({ name: 'receipt', length: 45 })
    receipt: string;
    @Column({ name: 'state', length: 45 })
    state: string;
    @Column('timestamp', { name: 'shipDate' })
    shipDate: Date;
    @Column('timestamp', { name: 'deliveryDate' })
    deliveryDate: Date;
    @CreateDateColumn({ name: 'registrationDate', type: 'timestamp' })
    registrationDate!: Date;

    //Relationships
    @ManyToOne(() => Driver)
    @JoinColumn({ name: 'drivers', referencedColumnName: 'id' })
    driver: Driver;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'users', referencedColumnName: 'id' })
    user: User;

    @OneToMany(() => Item, item => item.shipment)
    items: Item[];
}
