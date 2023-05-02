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
import Offer from './Offer';
import Vehicle from './Vehicle';
@Entity({ name: 'drivers' })
export default class Driver {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column('varchar', { name: 'name', nullable: false, length: 50 })
    name: string;

    @Column('varchar', { name: 'lastname', nullable: false, length: 50 })
    lastname: string;

    @Column('varchar', {
        name: 'email',
        unique: true,
        length: 150
    })
    email: string;

    @Column('varchar', { name: 'phone', nullable: false, length: 20 })
    phone: string;

    @Column('varchar', {
        name: 'gender',
        nullable: false,
        length: 20
    })
    gender: string;

    @Column('varchar', {
        name: 'password',
        nullable: false,
        length: 32,
        select: false
    })
    password: string;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    // @BeforeInsert()
    // @BeforeUpdate()
    // hashPassword() {
    //     if (this.password) {
    //         this.password = md5(this.password);
    //     }
    // }
    @Column('timestamp', { name: 'birthDate', nullable: false })
    birthDate: Date;

    @CreateDateColumn({ name: 'registrationDate', type: 'timestamp' })
    registrationDate!: Date;

    @Column('varchar', { name: 'license', length: 50, nullable: false })
    license: string;

    @Column('varchar', { name: 'greenCard', length: 50, nullable: false })
    greenCard: string;

    @Column('boolean', { name: 'isVerified' })
    isVerified: boolean;

    @Column('boolean', { name: 'active' })
    active: boolean;

    @Column('varchar', { name: 'token', length: 100 })
    token: string;

    @Column('timestamp', { name: 'token_expiration' })
    token_expiration: Date;

    //Relationships
    @OneToMany(() => Vehicle, vehicle => vehicle.driver)
    vehicles: Vehicle[];

    @OneToMany(() => Offer, offer => offer.driver)
    offers: Offer[];
}
