import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import Shipment from './Shipment';
import User from './User';
import Vehicle from './Vehicle';
@Entity({ name: 'drivers' })
export default class Driver extends User {
    @Column('varchar', { name: 'license', length: 50 })
    license: string | null;

    @Column('varchar', { name: 'greenCard', length: 50 })
    greenCard: string | null;

    //Relationships
    @ManyToOne(() => Vehicle, vehicle => vehicle.drivers)
    vehicle: Vehicle;

    @OneToMany(() => Shipment, shipment => shipment.driver)
    shipments: Shipment[];
}
