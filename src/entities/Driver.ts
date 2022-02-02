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

    @Column('varchar', { name: 'name', length: 50 })
    name: string | null;

    @Column('varchar', { name: 'lastname', length: 50 })
    lastname: string | null;

    @Column('varchar', {
        name: 'email',
        unique: true,
        length: 150
    })
    email: string | null;

    @Column('varchar', { name: 'phone', nullable: true, length: 20 })
    phone: string | null;

    @Column('varchar', {
        name: 'gender',
        length: 20
    })
    gender: string;

    @Column('varchar', { name: 'password', length: 32, select: false })
    password: string;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    @BeforeInsert()
    @BeforeUpdate()
    hashPassword() {
        if (this.password) {
            this.password = md5(this.password);
        }
    }
    @Column('timestamp', { name: 'birthDate' })
    birthDate: Date;

    @CreateDateColumn({ name: 'registrationDate', type: 'timestamp' })
    registrationDate!: Date;

    @Column('varchar', { name: 'license', length: 50 })
    license: string | null;

    @Column('varchar', { name: 'greenCard', length: 50 })
    greenCard: string | null;

    //Relationships
    @OneToMany(() => Vehicle, vehicle => vehicle.driver)
    vehicles: Vehicle[];

    @OneToMany(() => Offer, offer => offer.driver)
    offers: Offer[];
}
