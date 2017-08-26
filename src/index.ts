import { Service } from './service';
import * as jsonFile from 'jsonfile';

function startService(args) 
{
    let service = new Service(args);
    service.start();
}

const args = process.argv.slice(2);
const configFile = args[0];
jsonFile.readFile(configFile, (err, data) => {
    startService(data);
});

