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

  /**
   * @memberof ServiceNowAdapter
   * @method connect
   * @summary Connect to ServiceNow
   * @description Complete a single healthcheck and emit ONLINE or OFFLINE.
   *   IAP calls this method after instantiating an object from the class.
   *   There is no need for parameters because all connection details
   *   were passed to the object's constructor and assigned to object property this.props.
   */
  connect() {
    this.healthcheck();
  }

  /**
    * @memberof ServiceNowAdapter
    * @method healthcheck
    * @summary Check ServiceNow Health
    * @description Verifies external system is available and healthy.
    *   Calls method emitOnline if external system is available.
    *
    * @param {ServiceNowAdapter~requestCallback} [callback] - The optional callback
    *   that handles the response.
    */
    healthcheck(callback) {
      this.getRecord((result, error) => {
          
        if (error) {
          this.emitOffline();
        } else {
          
          this.emitOnline();
        }
      });
    }
  /**
    * @memberof ServiceNowAdapter
    * @method emitOffline
    * @summary Emit OFFLINE
    * @description Emits an OFFLINE event to IAP indicating the external
    *   system is not available.
    */
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

  /**
  * @memberof ServiceNowAdapter
  * @method emitStatus
  * @summary Emit an Event
  * @description Calls inherited emit method. IAP requires the event
  *   and an object identifying the adapter instance.
  *
  * @param {string} status - The event to emit.
  */
  emitStatus(status) {
    this.emit(status, { id: this.id });
  }

// TO DO: Refactor code so getRecord and postRecord call
// a method that handles their similar logic.

  /**
  * @memberof ServiceNowAdapter
  * @method getRecord
  * @summary Get ServiceNow Record
  * @description Retrieves a record from ServiceNow.
  *
  * @param {ServiceNowAdapter~requestCallback} callback - The callback that
  *   handles the response.
  */
  getRecord(callback) {
    let dataError = null;
    let dataReturn = null;

    this.connector.get((data, error) => {
        if (error) {
            console.error(`\nError returned from GET request:\n${JSON.stringify(error)}`);
        }

        else if (data.body) {
            let body = JSON.parse(data.body).result;
            let tickets = [];

            for (let x=0; x<body.length; x++) {
                tickets[x] = {
                  "change_ticket_number": body[x].number,
                  "active": body[x].active,
                  "priority": body[x].priority,
                  "description": body[x].description,
                  "work_start": body[x].work_start,
                  "work_end": body[x].work_end,
                  "change_ticket_key": body[x].sys_id
                };
            }
            dataReturn = JSON.stringify(tickets);
            callback(dataReturn, dataError);
        }
      });
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

    let dataError = null;
    let dataReturn = null;
    
    this.connector.post((data, error) => {
        if (error) {
            console.error(`\nError returned from GET request:\n${JSON.stringify(error)}`);
        }
        if (data.body) {
            let body = JSON.parse(data.body).result;
            let ticket = {};

            ticket = {
                "change_ticket_number": body.number,
                "active": body.active,
                "priority": body.priority,
                "description": body.description,
                "work_start": body.work_start,
                "work_end": body.work_end,
                "change_ticket_key": body.sys_id
            }
            dataReturn = ticket;
            callback(dataReturn, dataError);
        }
    });
  
  }
}
module.exports = ServiceNowAdapter;