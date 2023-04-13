import { validateEmail } from './personValidators/emailValidator';
import { validatePassword } from './personValidators/passwordValidator';
import { INewDriver } from '../interfaces/INewDriver';

export const validateDriver = (driver: INewDriver): boolean => {
    return validateEmail(driver.email) && validatePassword(driver.password);
};
