import { EntityRepository, Repository } from 'typeorm';
import Driver from '../entities/Driver';
import { IDriverWithoutPassword } from '../interfaces/IDriverWithoutPassword';

@EntityRepository(Driver)
export default class driverRepository extends Repository<Driver> {
    authenticate(email: string, password: string): Promise<Driver | undefined> {
        return this.createQueryBuilder()
            .where('email = :email AND password = :password', {
                email,
                password
            })
            .getOne();
    }
    async createDriver(driver: Driver): Promise<IDriverWithoutPassword> {
        const savedDriver = await this.save(driver);
        const { password, ...driverWithoutPassword } = savedDriver;
        return driverWithoutPassword;
    }
}
