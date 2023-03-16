import { validateEmail } from './emailValidator';
import { validatePassword } from './passwordValidator';
import { INewDriver } from '../interfaces/INewDriver';

export const validateDriver = (driver: INewDriver): boolean => {
    return validateEmail(driver.email) && validatePassword(driver.password);
};
