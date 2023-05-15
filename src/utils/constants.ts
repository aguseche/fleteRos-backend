export const OFFER_STATE = {
    confirmed: 'CONFIRMED',
    cancelled: 'CANCELLED',
    sent: 'SENT',
    deleted: 'DELETED',
    shipment_deleted: 'SHIPMENT_DELETED'
};

export const SHIPMENT_STATE = {
    waiting_offers: 'WAITING_OFFERS',
    confirmed: 'CONFIRMED',
    cancelled: 'CANCELLED'
};

export const DAYS_SINCE_UPDATED = 3;

export const TOKEN_EXPIRATION_TIME = 86400; //1 day

export const TOKEN_EMAIL_EXPIRATION_TIME = 3600; //1 hour

export const SEND_MAIL = false;

export const LINK = 'localhost:3000/user/confirm_email/';

export const URL_IMG = 'https://i.ibb.co/1Z32m2t/ros4.png';
