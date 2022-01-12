import { EntityRepository, Repository } from 'typeorm';
import User from '../entities/User';

@EntityRepository(User)
export default class userRepository extends Repository<User> {
    findByEmail(email: string): Promise<User | undefined> {
        return this.findOne({ email });
    }
    authenticate(email: string, password: string): Promise<User | undefined> {
        return this.createQueryBuilder()
            .where('email = :email AND password = :password', {
                email,
                password
            })
            .getOne();
    }
}
