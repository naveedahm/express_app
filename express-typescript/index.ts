
import express from 'express';
import fs from 'fs';
import session from 'express-session';

declare module 'express-session' {
    export interface SessionData {
      user: { [key: string]: any };
    }
  }

const app = express();
app.use(session({secret: 'some_secret_key'}));


// An example middleware function
let read_middleware_function = function(req: any, res: any) {
    // ... perform some operations
    if(req.session.user == {"user-id":"12345678"}) {
        let file_name = req.params.id + ".json";

        fs.readFile(file_name, 'utf8' , (err, data) => {
            if (err) {
              console.error(err)
              res.status(404).send('JSON file could not be read');
              throw err
            } else {
                console.log(data);
                res.status(200).send(data);
            }
          })    
    } else {
       res.status(404).send("Session not found");
    }    
  }

let write_middleware_function = function(req:any, res:any, next:any) {
    // console.log(req.session.user);
    if(req.session.user == {"user-id":"12345678"}) {

        let id = req.params.id;
        console.log(req.body);
        var body = '';

        req.on('data', function (data:any) {
            body += data;
    
            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                req.connection.destroy();
        });
    
        req.on('end', function () {
            let jsonObject = JSON.parse(body);
            console.log(jsonObject["param1"]);
    
            let param1_value = jsonObject["param1"];
            let param2_value = jsonObject["param2"];
            let param3_value = jsonObject["param3"];
    
            let json = {"param1":"", "param2": "", "param3":""};
    
            json["param1"] = param1_value;
            json["param2"] = param2_value;
            json["param3"] = param3_value;
        
            let file_name = id + ".json";
    
            fs.writeFile(file_name, JSON.stringify(json), (err) => {
                // throws an error, you could also catch it here
                if (err) {
                    res.status(404).send('JSON could not be saved');
                    throw err
                };
            
                // success case, the file was saved
                console.log('JSON saved!');
                res.status(200).send("JSON saved");
            });
    
        });
    
    } else {
       res.status(404).send("Session not found");
    }    
}

app.get('/', (req, res) => {
    // Generate and use some unique uuid here
    req.session.user = {"user-id":"12345678"};
    res.send('Well done!');
})

app.get('/pub/proxy/read/:id', read_middleware_function);
app.get('/api/proxy/read/:id', read_middleware_function);

app.post('/pub/proxy/save/:id', write_middleware_function);
app.post('/api/proxy/save/:id', write_middleware_function);

app.listen(3000, () => {
    console.log('The application is listening on port 3000!');
});

