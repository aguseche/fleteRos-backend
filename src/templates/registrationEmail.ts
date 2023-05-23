import { URL_IMG } from '../utils/constants';
const registrationEmail = function (
    name: string | null,
    lastname: string | null,
    typeUser: string | null,
    link: string | null
) {
    const html = `
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <title>Confirmation Email</title>
            <style>
                /* Define the colors using inline CSS styles */
                .primary-color {
                    color: #2962ff;
                }
                .secondary-color {
                    color: #6c757d;
                }
                .background-color {
                    background-image: url(${URL_IMG});
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: cover;
                    height: 400px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .content {
                    background-color: #fff;
                    padding: 40px;
                    margin: 40px auto;
                    text-align: center;
                    min-width: 500px;
                }
            </style>
        </head>
        <body>
            <div class="background-color">
                <div class="content">
                    <h1 class="primary-color" style="margin-bottom: 0"> ${typeUser} Creado</h1>
                    <p class="secondary-color" style="margin-top: 0">
                        Bienvenido, ${name} ${lastname} !
                    </p>
                    <p class="secondary-color">
                        Gracias por crear una cuenta en FleteRos.
                    </p>
                    <p class="secondary-color">
                        Para confirmar tu mail por favor ve a: <a href=${link}>Click Aqui</a>
                    </p>
                </div>
            </div>
        </body>
        </html>

    `;
    return {
        html: html
    };
};

export default registrationEmail;
