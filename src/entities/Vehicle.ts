import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import Driver from './Driver';
@Entity({ name: 'vehicle' })
export default class Vehicle {
    @PrimaryColumn({ name: 'plate', length: 10 })
    plate: string;
    @Column({ type: 'int', name: 'kilometers' })
    kilometers: number;
    @Column({ name: 'ensurance', length: 45 })
    ensurance: string;

    //Relationships
    @ManyToOne(() => Driver, driver => driver.vehicles)
    @JoinColumn({ name: 'idDriver', referencedColumnName: 'id' })
    driver: Driver;
}
