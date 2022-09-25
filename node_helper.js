/* Magic Mirror
 * Module: MMM-Ecowatt
 *
 * By tttooommm56 https://github.com/tttooommm56
 * MIT Licensed.
 */
 

var NodeHelper = require('node_helper');
var axios = require('axios');
var moment = require('moment');

module.exports = NodeHelper.create({
  start: function () {
    console.log('MMM-Ecowatt helper started ...');
	  this.fetcherRunning = false;
  },

  fecthEcowatt: function() {
    var self = this;
    this.fetcherRunning = true; 

    // Get Oauth2 token
    axios({
      url: self.config.apiOAuthPath, 
      baseURL: self.config.apiBaseUrl,
      headers: {'Authorization': 'Basic ' + self.config.apiTokenBase64},
      method: 'post'
    })
    .then(function (response) {
        if (response.status == 200 && response.data) {
            // Get signals data
            axios({
              url: self.config.apiSignalsPath, 
              baseURL: self.config.apiBaseUrl,
              headers: {'Authorization': 'Bearer ' + response.data.access_token},
              method: 'get'
            })
            .then(function (response) {
                if (response.status == 200 && response.data) {
                  self.sendSocketNotification('ECOWATT', response.data);
                } else {
                  console.log('Ecowatt get signals error : ', response.statusText);
                }
            })
            .catch(function (error) {
              console.log('Ecowatt get signals error : ', error);
            });  
        } else {
            console.log('Ecowatt Oauth2 error : ', response.statusText);
        }
            
        setTimeout(function() {
            self.fecthEcowatt();
        }, self.config.updateInterval);
    })
    .catch(function (error) {
      console.log('Ecowatt Oauth2 error : ', error);
    });   
  },
  
  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    var self = this;
    
    if (notification === "GET_ECOWATT") {          
        this.config = payload;
        if (this.config.debug === 1) {
          console.log('Lets get Ecowatt signals data');
        }

        if (!this.fetcherRunning) {
            this.fecthEcowatt();
        } 			
    }
  }
});
