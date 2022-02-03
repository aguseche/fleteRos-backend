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
    @ManyToOne(() => Driver, {
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    })
    @JoinColumn({ name: 'idDriver', referencedColumnName: 'id' })
    driver: Driver;
}
