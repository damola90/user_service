import UserDataAccessor, { AuthIdentity, AuthResponse, AuthErrorCode } from './authservice_userdataaccessor';
import * as uuid1 from 'uuid/v1';
import * as mysql from 'mysql';
import { sprintf } from 'sprintf';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 20;

interface UserAuthRow {
    userid: Buffer,
    username: string,
    password: Buffer
}

export default class AkomoUserDataAccessor extends UserDataAccessor {

    constructor()
    {
        super();
        this.d_database = mysql.createConnection({
            host: 'localhost',
            user: 'komodoapp',
            password: 's`B:283eRAz+L-s!',
            database: 'akomodb'
        });
        this.d_database.connect();
    }
    addUser(identity: AuthIdentity): Promise<AuthResponse>
    {
        return new Promise<AuthResponse> ( (resolve, reject) => {
            if(!identity.username && !identity.password)
            {
                resolve({
                    errorCode: AuthErrorCode.INVALID_CREDENTIALS,
                    errorMessage: "Username/Password must be provided",
                    userUuid: ""
                });
            }
            else
            {
                bcrypt.hash(identity.password, SALT_ROUNDS)
                .then( (passHash) => {
                    const userIdStr = this.generateNewUserId();
                    this.insertNewUserAuthInfo(userIdStr, identity.username, passHash);
                })
                .catch(err => {
                    reject(err);
                });
            }
        });

    }

    loginUser(username: string, password: string) : Promise<AuthResponse>
    {
        return new Promise<AuthResponse> ( (resolve, reject) => {
            this.searchAuthInfoByUsername(username)
            .then( authInfoRow => {
                const hashedPassword = authInfoRow.password.toString();
                bcrypt.compare(password, hashedPassword)
                .then( success => {
                    resolve({
                        errorCode: success ? AuthErrorCode.OK : AuthErrorCode.INVALID_CREDENTIALS,
                        errorMessage: success ? "" : "Incorrect username/password",
                        userUuid: success ? authInfoRow.userid.toString("hex"): ""
                    });
                });
            })
            .catch( err => {
                reject(err)
            });
        });

    }

    private generateNewUserId() : string
    {
        const uuidByteArr = [];
        uuid1(null, uuidByteArr, 0);
        return Buffer.from(uuidByteArr).toString('hex'); 
    }

    private insertNewUserAuthInfo(userId: string, username: string, passwordHash: string)
    {
        return new Promise<AuthResponse>( (resolve, reject) => {
            const query = this.generateNewUserAuthInsertQuery(
                userId, username, passwordHash
            );
            this.d_database.query(query, (err) => {    
                if(err) {
                    reject(err);
                }
                else {
                    resolve({
                        errorCode: AuthErrorCode.OK,
                        errorMessage: "",
                        userUuid: userId
                    }); 
                }   
            });
        });
    }

    private searchAuthInfoByUsername(username: string)
    {
        return new Promise<UserAuthRow>( (resolve, reject) => {
            const query = this.generateSearchAuthInfoByUsernameQuery(username);
            this.d_database.query(query, (err, results, fields) => {
                if(err) {
                    reject(err);
                }
                else {
                    if(results.length == 0) {
                        resolve(undefined);
                    }
                    if(results.length == 1) {
                        resolve(results[0]);
                    }
                    else {
                        reject("Error: Multiple users with the same username");
                    }
                }

            })
        });
    }

    private generateNewUserAuthInsertQuery(userId: string, username: string, passwordHash: string)
    {
        return sprintf(
            "INSERT INTO user_auth(userid, username, password) "
            + "VALUES(x'%s', '%s', '%s')", 
            userId, 
            username, 
            passwordHash);
    }
    
    private generateSearchAuthInfoByUsernameQuery(username: string)
    {
        return sprintf(
            "SELECT userid, username, password FROM user_auth WHERE username='%s'",
            username
        );
    }

    private d_database: mysql.IConnection;
}
