import * as express from 'express'
import {RequestProcessor} from './requestprocessor';

class ServiceRouter 
{
    constructor() 
    {
        this.d_requestProcessor = new RequestProcessor();
    }

    public setupRoutes(app : express.Application)
    {
        app.use('/', this.getRequestRouter());
    }

    private getRequestRouter() : express.Router
    {
        const router = express.Router();

        const requests = this.d_requestProcessor.getSupportedRequests();
        requests.forEach((reqInfo) => {
            const routeName = "/" + reqInfo.name;
            const routeHandler = reqInfo.handler;
            if(reqInfo.type === "GET") {
                router.get( routeName, (req, resp, next) => {
                    routeHandler(req, resp);
                });
            }
            else if(reqInfo.type === "POST") {
                router.post(routeName, (req, resp, next) => {
                    routeHandler(req, resp);
                });
            }
        });
        return router;
    }

    //Properties
    private d_requestProcessor : RequestProcessor;
}

export { ServiceRouter };