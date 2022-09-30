/* Magic Mirror
 * Module: MMM-Ecowatt
 *
 * Magic Mirror By Michael Teeuw https://magicmirror.builders
 * MIT Licensed.
 *
 * Module MMM-Ecowatt By tttooommm56 https://github.com/tttooommm56
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var axios = require('axios');
var moment = require('moment');

module.exports = NodeHelper.create({
	fecthEcowatt: function() {
		var self = this;
		
		// Get Oauth2 token
		axios({
			url: self.config.apiOAuthPath, 
			baseURL: self.config.apiBaseUrl,
			headers: {'Authorization': 'Basic ' + self.config.apiTokenBase64},
			method: 'post'
		})
		.then(function (response) {
			if(response.status == 200 && response.data) {
				// Get signals data
				axios({
					url: self.config.apiSignalsPath, 
					baseURL: self.config.apiBaseUrl,
					headers: {'Authorization': 'Bearer ' + response.data.access_token},
					method: 'get'
				})
				.then(function (response) {
					if (response.status == 200 && response.data) {
						self.sendSocketNotification("DATA", response.data);
					} else {
						self.sendSocketNotification("ERROR", 'RTE Ecowatt error: ' + response.statusText);
					}
				})
				.catch(function (error) {
					self.sendSocketNotification("ERROR", error.message);
				});
			} else {
				self.sendSocketNotification("ERROR", 'RTE Oauth2 error: ' + response.statusText);
			}
		})
		.catch(function (error) {
			self.sendSocketNotification("ERROR", error.message);
		});
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;

		if (notification === "CONFIG") {
			self.config = payload;
			self.sendSocketNotification("STARTED", true);
			self.fecthEcowatt();
		}
	}
	
});
