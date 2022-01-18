import { Column, Entity, OneToMany } from 'typeorm';
import Offer from './Offer';
import User from './User';
import Vehicle from './Vehicle';
@Entity({ name: 'drivers' })
export default class Driver extends User {
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
