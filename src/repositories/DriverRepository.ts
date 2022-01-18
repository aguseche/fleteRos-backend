import { EntityRepository, Repository } from 'typeorm';
import Driver from '../entities/Driver';

@EntityRepository(Driver)
export default class userRepository extends Repository<Driver> {
    findByEmail(email: string): Promise<Driver | undefined> {
        return this.findOne({ email });
    }
    authenticate(email: string, password: string): Promise<Driver | undefined> {
        return this.createQueryBuilder()
            .where('email = :email AND password = :password', {
                email,
                password
            })
            .getOne();
    }
}
