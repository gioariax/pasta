import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
} from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: import.meta.env.VITE_APP_USER_POOL_ID || 'dummy_pool_id',
    ClientId: import.meta.env.VITE_APP_CLIENT_ID || 'dummy_client_id',
};

export const userPool = new CognitoUserPool(poolData);

export const signUp = (email: string, password: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const attributeList = [
            new CognitoUserAttribute({ Name: 'email', Value: email }),
        ];

        userPool.signUp(email, password, attributeList, [], (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

export const confirmRegistration = (email: string, code: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const userData = { Username: email, Pool: userPool };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

export const signIn = (email: string, password: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const authenticationDetails = new AuthenticationDetails({
            Username: email,
            Password: password,
        });

        const userData = { Username: email, Pool: userPool };
        const cognitoUser = new CognitoUser(userData);

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (session) => {
                resolve(session);
            },
            onFailure: (err) => {
                reject(err);
            },
            newPasswordRequired: (userAttributes) => {
                // User was created by an admin and needs to choose a new password
                resolve({
                    status: 'NEW_PASSWORD_REQUIRED',
                    cognitoUser,
                    userAttributes
                });
            }
        });
    });
};

export const completeNewPassword = (cognitoUser: CognitoUser, newPassword: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
            onSuccess: (result) => resolve({ status: 'SUCCESS', result }),
            onFailure: (err) => reject(err),
        });
    });
};

export const signOut = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
        cognitoUser.signOut();
    }
};

export const getCurrentUserToken = (): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        const cognitoUser = userPool.getCurrentUser();

        if (!cognitoUser) {
            resolve(null);
            return;
        }

        cognitoUser.getSession((err: any, session: any) => {
            if (err) {
                reject(err);
                return;
            }
            if (session.isValid()) {
                resolve(session.getIdToken().getJwtToken());
            } else {
                resolve(null);
            }
        });
    });
};
