/* Magic Mirror
 * Module: MMM-Ecowatt
 *
 * Magic Mirror By Michael Teeuw https://magicmirror.builders
 * MIT Licensed.
 *
 * Module MMM-Ecowatt By tttooommm56 https://github.com/tttooommm56
 * MIT Licensed.
 */

Module.register("MMM-Ecowatt", {

	// Default module config.
	defaults: {
		updateInterval: 20 * 60 * 1000, // every 20 minutes
		debug: 1,
		apiBaseUrl: "https://digital.iservices.rte-france.com",
		apiOAuthPath: "/token/oauth/",
		apiSignalsPath: "/open_api/ecowatt/v4/signals", 
		//apiSignalsPath: "/open_api/ecowatt/v4/sandbox/signals", //sandbox
		showText: true,
		showGraph: true,
		signals: [],
		hasData: false
	},

	getTemplate: function () {
		return "MMM-Ecowatt.njk"
	},

	getTemplateData: function () {
		return this.config;
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["MMM-Ecowatt.css"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale.
		moment.locale(config.language);

		this.loaded = false;
		this.error = false;
		this.errorDescription = "";
		this.getSignals();
		this.updateTimer = null;
		this.systemp = "";
	},

	getSignals: function() {
		if (this.config.debug === 1) {
			Log.info("Ecowatt: Getting info.");
		}
		this.sendSocketNotification("GET_ECOWATT", this.config);
	},

	/* processSignals(data)
	 * Uses the received data to set the various values.
	 *
	 * argument data object - Signals data received form ecowatt.
	 */
	processSignals: function(data) {
		if (this.config.debug === 1) {
			Log.info('ECOWATT processSignals data : ');
			Log.info(data);
		} 

		if (data) {
			this.config.hasData = data.signals != null && data.signals.length > 0;

			if (this.config.hasData) {
				// Graph data
				this.config.signals = data.signals.sort(function(a,b){
					return new Date(a.jour) - new Date(b.jour);
				});
				var momentToday = moment(new Date());
				var momentTomorrow = moment(new Date()).add(1, 'day');
				this.config.signals.forEach(signal => {
					var momentDay = moment(signal.jour);
					if (momentDay.startOf('day').diff((momentToday.startOf('day')), 'days') == 0) {
						signal.displayDay = "aujourd'hui"; 
					} else if (momentDay.startOf('day').diff((momentTomorrow).startOf('day'), 'days') == 0) {
						signal.displayDay = "demain"; 
					} else {
						signal.displayDay = momentDay.format('dddd');
					}
				});

				if (this.config.days) {
					this.config.signals.length = this.config.days;
				}
			}

			this.updateDom(this.config.animationSpeed);

		} else {
			this.config.hasData = false;
		}
	},

	socketNotificationReceived: function(notification, payload) {
		var self = this;

		if (this.config.debug === 1) {
			Log.info('ECOWATT received ' + notification);
		}

		if (notification === "ECOWATT") {
			if (this.config.debug === 1) {
				Log.info('received ECOWATT');
				Log.info(payload);
			}
			self.processSignals(payload);
		}

	}

});
