import md5 from 'md5';
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity({ name: 'users' })
export default class User {
    constructor(password?: string, email?: string, ...args: any) {
        if (password !== undefined && email !== undefined) {
            this.password = password;
            this.email = email;
        }
    }

    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column('varchar', { name: 'name', length: 50 })
    name: string | null;

    @Column('varchar', { name: 'lastname', length: 50 })
    lastname: string | null;

    @Column('varchar', { name: 'email', unique: true, length: 150 })
    email: string | null;

    @Column('varchar', { name: 'phone', nullable: true, length: 20 })
    phone: string | null;

    @Column('varchar', {
        name: 'gender',
        length: 20,
        // eslint-disable-next-line quotes
        default: () => "'Not Revealed'"
    })
    gender: string;

    @Column('varchar', { name: 'password', length: 32 })
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
}
