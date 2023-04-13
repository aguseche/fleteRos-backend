import User from '../entities/User';

export type IUserWithoutPassword = Omit<User, 'password'>;
