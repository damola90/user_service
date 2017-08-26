import * as express from 'express';
import UserDataAccessor, {AuthErrorCode} from './authservice_userdataaccessor';
import AkomoUserDataAccessor from './authservice_akomouserdataaccessor';
import * as uuid4 from 'uuid/v4';

interface RequestInfo {
    name: string;
    type: "GET" | "POST";
    handler: (req: express.Request, resp: express.Response) => void;
}

class RequestProcessor
{
    constructor()
    {
        this.d_userDataAccessor = new AkomoUserDataAccessor();
        this.initialiseRequestInfoList();
    }

    processLoginUserRequest(req: express.Request, resp: express.Response)
    {
        this.d_userDataAccessor.loginUser(
            req.body.username, 
            req.body.password)
        .then( (loginResp) => {
            if(loginResp.errorCode === AuthErrorCode.OK)
            {
                const authToken = uuid4();
                req.session.userUuid = loginResp.userUuid;
                req.session.authToken = authToken;
                resp.status(200);
                resp.send({
                    authToken: authToken
                });
            }
            else
            {
                resp.status(401);
                resp.send({
                    errorMessage: loginResp.errorMessage
                });
            }
        })
        .catch((err) => {
            resp.status(401);
            resp.send({
                errorMessage: "Login request failed"
            });
        });

    }

    processRegisterUserRequest(req: express.Request, resp: express.Response)
    {
        this.d_userDataAccessor.addUser(req.body.userInfo)
        .then( registerResp =>{
            if(registerResp.errorCode === AuthErrorCode.OK)
            {
                const authToken = uuid4();
                req.session.userUuid = registerResp.userUuid;
                req.session.authToken = authToken;
                resp.status(200);
                resp.send({
                    authToken: authToken
                });
            }
            else
            {
                resp.status(401);
                resp.send({
                    errorMessage: registerResp.errorMessage
                });
            }
        })
        .catch( err => {
            resp.status(401);
            resp.send({
                errorMessage: "Register request failed"
            });
        });
    }

    processLogoutUserRequest(req: express.Request, resp: express.Response)
    {
        req.session.destroy( (err) => {
            resp.send("");
        });
    }
    processValidateAuthTokenRequest(req: express.Request, resp: express.Response)
    {
        if (req.session.authToken && 
            req.session.authToken === req.headers.authorization)
        {
            resp.status(200);
            resp.send({
                authToken: req.session.authToken 
            });
        }
        else {
            resp.status(401);
            resp.send({
                errorMessage: 'Invalid auth token'
            });
        }
    }
    initialiseRequestInfoList() 
    {
        const requests : RequestInfo[] = [
            {
                name: "loginUser",
                type: "POST",
                handler: (req, resp) => { this.processLoginUserRequest(req, resp); }
            },
            {
                name: "registerUser",
                type: "POST",
                handler: (req, resp) => { this.processRegisterUserRequest(req, resp); }
            },
            {
                name: "logoutUser",
                type: "POST",
                handler: (req, resp) => { this.processLogoutUserRequest(req, resp); }
            },
            {
                name: "validateAuthToken",
                type: "POST",
                handler: (req, resp) => { this.processValidateAuthTokenRequest(req, resp); }
            }
        ];
        this.d_requestInfoList.push(...requests);
    }

    public getSupportedRequests(): RequestInfo[]
    {
        return this.d_requestInfoList;
    }

    private d_requestInfoList : RequestInfo [] = [];
    private d_userDataAccessor : UserDataAccessor;
}

export {RequestProcessor}