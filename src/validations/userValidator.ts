import { validateEmail } from './emailValidator';
import { validatePassword } from './passwordValidator';
import { INewUser } from '../interfaces/INewUser';

export const validateUser = (user: INewUser): boolean => {
    return validateEmail(user.email) && validatePassword(user.password);
};
