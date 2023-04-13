import { validateEmail } from './personValidators/emailValidator';
import { validatePassword } from './personValidators/passwordValidator';
import { INewUser } from '../interfaces/INewUser';

export const validateUser = (user: INewUser): boolean => {
    return validateEmail(user.email) && validatePassword(user.password);
};
