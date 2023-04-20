const registrationEmail = function (
    name: string | null,
    lastname: string | null,
    typeUser: string | null
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
                    background-image: url(https://i.ibb.co/7YF8kGZ/ros4.png);
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
                    <h1 class="primary-color" style="margin-bottom: 0"> ${typeUser} Created</h1>
                    <p class="secondary-color" style="margin-top: 0">
                        Hi, ${name} ${lastname} 
                    </p>
                    <p class="secondary-color">
                        Thank you for creating an account in FleteRos.
                    </p>
                    <p class="secondary-color">
                        Your account has been successfully created 
                    </p>
                    <p class="secondary-color">
                        You can now login to our website and start using our services.
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
