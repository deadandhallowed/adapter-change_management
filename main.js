// Import built-in Node.js package path.
const path = require('path');


const ServiceNowConnector = require(path.join(__dirname, '/connector.js'));

const EventEmitter = require('events').EventEmitter;

class ServiceNowAdapter extends EventEmitter {

  constructor(id, adapterProperties) {
    // Call super or parent class' constructor.
    super();
    // Copy arguments' values to object properties.
    this.id = id;
    this.props = adapterProperties;
    // Instantiate an object from the connector.js module and assign it to an object property.
    this.connector = new ServiceNowConnector({
      url: this.props.url,
      username: this.props.auth.username,
      password: this.props.auth.password,
      serviceNowTable: this.props.serviceNowTable
    });
  }


 connect() {
       
        this.healthcheck();
    }

    
    healthcheck(callback) {
        this.getRecord((result, error) => {
            
            if (error) {
             this.emitOffline();
            } else {
              
                this.emitOnline();
            }
        });
    }

  emitOffline() {
    this.emitStatus('OFFLINE');
    log.warn('ServiceNow: Instance is unavailable.');
  }

  /**
   * @memberof ServiceNowAdapter
   * @method emitOnline
   * @summary Emit ONLINE
   * @description Emits an ONLINE event to IAP indicating external
   *   system is available.
   */
  emitOnline() {
    this.emitStatus('ONLINE');
    log.info('ServiceNow: Instance is available.');
  }

 
  emitStatus(status) {
    this.emit(status, { id: this.id });
  }

  
  getRecord(callback) {
   
     this.connector.get(callback);
  }

  /**
   * @memberof ServiceNowAdapter
   * @method postRecord
   * @summary Create ServiceNow Record
   * @description Creates a record in ServiceNow.
   *
   * @param {ServiceNowAdapter~requestCallback} callback - The callback that
   *   handles the response.
   */
  postRecord(callback) {
    /**
     * Write the body for this function.
     * The function is a wrapper for this.connector's post() method.
     * Note how the object was instantiated in the constructor().
     * post() takes a callback function.
     */
     this.connector.post(callback);
  
  }


  test (){
      this.getRecord((data, error) => {
    if (error) {
      console.error(`\nError returned from GET request:\n${JSON.stringify(error)}`);
    }
    console.log(`\nResponse returned from GET request:\n${JSON.stringify(data)}`)
  });
     this.postRecord((data, error) => {
    if (error) {
      console.error(`\nError returned from GET request:\n${JSON.stringify(error)}`);
    }
    console.log(`\nResponse returned from GET request:\n${JSON.stringify(data)}`)
  });
}
}

const test = new ServiceNowAdapter('123', {
  url: 'https://dev100309.service-now.com',
  auth:{
  username: 'admin',
  password: '3ncryptM3'},
  serviceNowTable: 'change_request'
});
//test.test();
test.connect();
module.exports = ServiceNowAdapter;