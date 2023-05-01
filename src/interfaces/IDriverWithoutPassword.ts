import Driver from '../entities/Driver';

export type IDriverWithoutPassword = Omit<Driver, 'password'>;
