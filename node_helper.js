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

module.exports = NodeHelper.create({
	fecthEcowatt: async function() {
		var self = this;
		
		try {
			// Get Oauth2 token
			var tokenResponse = await fetch(new URL(self.config.apiOAuthPath, self.config.apiBaseUrl), {
				headers: {'Authorization': 'Basic ' + self.config.apiTokenBase64},
				method: 'post'
			});
			var tokenData = tokenResponse.status === 200 ? await tokenResponse.json() : null;

			if (tokenResponse.status !== 200 || !tokenData) {
				self.sendSocketNotification("ECOWATT_ERROR", 'RTE Oauth2 error: ' + tokenResponse.statusText);
				return;
			}

			// Get signals data
			var signalsResponse = await fetch(new URL(self.config.apiSignalsPath, self.config.apiBaseUrl), {
				headers: {'Authorization': 'Bearer ' + tokenData.access_token},
				method: 'get'
			});
			var signalsData = signalsResponse.status === 200 ? await signalsResponse.json() : null;

			if (signalsResponse.status === 200 && signalsData) {
				self.sendSocketNotification("ECOWATT_DATA", signalsData);
			} else {
				self.sendSocketNotification("ECOWATT_ERROR", 'RTE Ecowatt error: ' + signalsResponse.statusText);
			}
		} catch (error) {
			self.sendSocketNotification("ECOWATT_ERROR", error.message);
		}
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;

		if (notification === "ECOWATT_CONFIG") {
			self.config = payload;
			self.sendSocketNotification("ECOWATT_STARTED", true);
			self.fecthEcowatt();
		}
	}
	
});
