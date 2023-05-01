import Driver from '../entities/Driver';
import User from '../entities/User';
import { validateEmail } from './personValidators/emailValidator';
import { validatePassword } from './personValidators/passwordValidator';

export const validateBasicPerson = (person: Driver | User): boolean => {
    return validateEmail(person.email) && validatePassword(person.password);
};
