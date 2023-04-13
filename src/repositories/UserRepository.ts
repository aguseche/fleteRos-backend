import { EntityRepository, Repository } from 'typeorm';
import User from '../entities/User';
import { INewUser } from '../interfaces/INewUser';
import { IUserWithoutPassword } from '../interfaces/IUserWithoutPassword';

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
    async createUser(user: INewUser): Promise<IUserWithoutPassword> {
        const savedUser = await this.save(user);
        const { password, ...userWithoutPassword } = savedUser;
        return userWithoutPassword;
    }
}
