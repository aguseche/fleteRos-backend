import md5 from 'md5';
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import Shipment from './Shipment';

@Entity({ name: 'users' })
export default class User {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column('varchar', { name: 'name', nullable: false, length: 50 })
    name: string;

    @Column('varchar', { name: 'lastname', nullable: false, length: 50 })
    lastname: string;

    @Column('varchar', {
        name: 'email',
        unique: true,
        length: 150,
        nullable: false
    })
    email: string;

    @Column('varchar', { name: 'phone', nullable: false, length: 20 })
    phone: string;

    @Column('varchar', {
        name: 'gender',
        length: 20,
        nullable: false
    })
    gender: string;

    @Column('varchar', {
        name: 'password',
        length: 32,
        select: false,
        nullable: false
    })
    password: string;

    @Column('timestamp', { name: 'birthDate', nullable: false })
    birthDate: Date;

    @CreateDateColumn({ name: 'registrationDate', type: 'timestamp' })
    registrationDate!: Date;

    //Relationships
    @OneToMany(() => Shipment, shipment => shipment.user)
    shipments: Shipment[];
}
