import * as express from 'express';
import * as bodyParser from 'body-parser';
import { ServiceRouter } from './servicerouter';
import * as cors from 'cors';
import * as expressSession from 'express-session';
import * as cookieParser from 'cookie-parser';
import * as ConnectRedis from 'connect-redis';
import * as Redis from 'redis';

interface ServiceInfo
{
    name:string;
    port:number;
}

interface ServiceConfig 
{
    service: ServiceInfo
}
class Service 
{
    constructor(config : ServiceConfig)
    {
        this.d_config = config;
        this.d_serviceRouter = new ServiceRouter();
        this.d_app = express();
    }

    public start() : void
    {
        this.setupMiddlewareConfiguration();
        this.d_serviceRouter.setupRoutes(this.d_app);
        this.startListening();
    }

    private startListening() : void 
    {
        const port =  this.d_config.service.port;
        if(port)
        {
            this.d_app.listen(port, (err : any) => {
                if(err)
                {
                    console.log('something bad has happened:', err);
                }
                console.log(`Server is listening on ${port}`);
            });
        }    
    }

    private setupMiddlewareConfiguration() : void
    {
        const RedisStore = ConnectRedis(expressSession);
        //TODO: Investigate express app set('trust proxy', 1);
        
        this.d_app.use(cookieParser());
        this.d_app.use(expressSession({
            store: new RedisStore({
                client: Redis.createClient()
            }),
            secret: "Foobar", 
            resave: false,
            saveUninitialized: true,
            cookie: { secure: false }
        }));
        this.d_app.use(cors({
            origin: true,
            credentials: true
        }));
        this.d_app.use(bodyParser.urlencoded({ extended: false }));
        this.d_app.use(bodyParser.json());
    }


    private d_config : ServiceConfig;
    private d_serviceRouter : ServiceRouter;
    private d_app: express.Application;
}

export { Service };