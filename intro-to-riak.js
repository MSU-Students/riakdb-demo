var RiakClient = require('basho-riak-client').Client;

var riakNodes = ['localhost:8087'];

async function main() {
  var client = await createClientConnection();
  await createActivity(client, "key-value-store-demo", "Demo with Riak");
  var activity = await getActivity(client, "key-value-store-demo");
  console.log('activity is ', activity);
  await deleteActivity(client, "key-value-store-demo");
  var activityExist = await isActivityExist(client, "key-value-store-demo");
  console.log('activity exist ', activityExist);
  stopClientConnection(client);
}
main();

/**
 * @returns {Promise<RiakClient>}
 */
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

/**
 * 
 * @param {RiakClient} client 
 */
function stopClientConnection(client) {
  client.stop((err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("connection is closed");
    }
  })
}
/**
 * 
 * @param {RiakClient} client 
 * @param {string} name 
 * @param {string} description 
 */
function createActivity(client, name, description) {
  var activity = {
    name: name,
    desc: description
  };
  return new Promise((resolve, reject) => {
    client.storeValue({
      bucket: 'activities',
      key: name,
      value: activity,
      returnBody: true,
      convertToJs: true
    }, (err, result) => {
      if (err) {
        reject(err);
      }
      var riakObj = result.values.shift();
      console.log('activity is saved', riakObj.value);
      resolve(riakObj.value);
    })
  })
}
/**
 * 
 * @param {RiakClient} client 
 * @param {string} name 
 */
async function getActivity(client, name) {
  return new Promise((resolve, reject) => {
    client.fetchValue({
      bucket: 'activities',
      key: name,
      convertToJs: true
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        var riakObj = result.values.shift();
        if (!riakObj) {
          reject("Activity does not exist");          
        } else {
          var activity = riakObj.value;
          resolve(activity);

        }
      }
    })
  })
}
/**
 * 
 * @param {RiakClient} client 
 * @param {string} name 
 */
async function deleteActivity(client, name) {
  return new Promise((resolve, reject) => {
    client.deleteValue({
      bucket: 'activities',
      key: name
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        console.log('activity is deleted ', name );
        resolve(name);
      }
    })
  })
}
/**
 * 
 * @param {RiakClient} client 
 * @param {string} name 
 */
async function isActivityExist(client, name) {
  try {
    var activity = await getActivity(client, name);
    return activity;
  } catch(e) {
    return false;
  }
}