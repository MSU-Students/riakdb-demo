var RiakClient = require('basho-riak-client').Client;

var riakNodes = ['localhost:8087'];

async function main() {
  var client = await createClientConnection();
  stopClientConnection(client);
}
main();

async function createClientConnection() {
  return new Promise((resolve, reject) => {
    var riakClient = new RiakClient(riakNodes, (err, client) => {
      if (err) {
        reject(err);
      }
      console.log("connection is established");
      riakClient.ping((err) => {
        if (err) {
          reject(err);
        }
        console.log("ping is successful");
        resolve(riakClient);
      });
    })
  })

}

function stopClientConnection(client) {
  client.stop((err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("connection is closed");
    }
  })
}