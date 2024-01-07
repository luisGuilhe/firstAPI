const http = require('http'); 
const { URL } = require('url'); 
const routes = require('./routes');
const bodyParser = require('./helpers/bodyParser');

const server = http.createServer((request, response) => {
    const parsedUrl = new URL(`http://localhost:3000${request.url}`);
    console.log(`Request Method: ${request.method} | Request EndPoint: ${parsedUrl.pathname}`);

    let { pathname } = parsedUrl;
    let id = null;

    const splitEndPoint = pathname.split('/').filter(Boolean);

    if (splitEndPoint.length > 1) {
        pathname = `/${splitEndPoint[0]}/:id`;
        id = splitEndPoint[1];
    }

    const route = routes.find((routeObj) => (
        routeObj.endpoint === pathname && routeObj.method === request.method
    ));

    if (route) {
        request.query = Object.fromEntries(parsedUrl.searchParams);
        request.params = { id };

        response.send = (statusCode, body) => {
            response.writeHead(statusCode, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(body));
        };

        if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
            bodyParser(request, () => route.handler(request, response));
        } else {
            route.handler(request, response);
        }

    } else {
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.end(`Cannot url: ${parsedUrl.pathname} and method: ${request.method}`);
    }
});

server.listen(3000, () => console.log("🔥 Servidor iniciado em http://localhost:3000"));
