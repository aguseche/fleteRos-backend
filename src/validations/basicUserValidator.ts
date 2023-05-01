import { validateName } from './personValidators/nameValidator';
import { validateGender } from './personValidators/genderValidator';
import User from '../entities/User';

export const validateBasicUser = (user: User): boolean => {
    //Does not validate user y pass, combite with BasicDriverValidator for both
    return (
        validateName(user.name) &&
        validateName(user.lastname) &&
        validateGender(user.gender) &&
        validateGender(user.phone)
    );
};
