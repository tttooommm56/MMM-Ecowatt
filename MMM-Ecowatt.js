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
		apiTokenBase64: "",
		updateInterval: 20 * 60 * 1000, // every 20 minutes
		animationSpeed: 1000, // 1 second
		maximumEntries: 1,
		showText: true,
		showGraph: true,
		useColorLegend: true,
		
		initialLoadDelay: 0, // 0 seconds delay
		
		debug: 1,
		apiBaseUrl: "https://digital.iservices.rte-france.com",
		apiOAuthPath: "/token/oauth/",
		apiSignalsPath: "/open_api/ecowatt/v4/signals", 
		//apiSignalsPath: "/open_api/ecowatt/v4/sandbox/signals", //sandbox
	},

	getTemplate: function () {
		return "MMM-Ecowatt.njk";
	},

	getTemplateData: function () {
		return {
			config: this.config,
			signals: this.signals,
			loaded: this.loaded
		};
	},

	// Define required scripts.
	getScripts: function() {
		return ["moment.js"];
	},

	// Define required scripts.
	getStyles: function() {
		return ["MMM-Ecowatt.css", "font-awesome.css"];
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		// Set locale
		moment.locale(config.language);
		
		// Add custom filters
		this.addFilters();
		
		this.signals = [];

		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	processSignals: function(data) {
		if(!data || typeof data.signals === "undefined") {
			Log.error(this.name + ": Do not receive usable data.");
			return;
		}

		this.signals = data.signals.sort(function(a,b){
			return new Date(a.jour) - new Date(b.jour);
		});
		
		this.signals.forEach(signal => {
			var momentDay = moment(signal.jour);
			if (moment().isSame(momentDay, 'day')) {
				signal.displayDay = "Aujourd'hui"; 
			} else if (moment().add(1, 'day').isSame(momentDay, 'day')) {
				signal.displayDay = "Demain"; 
			} else {
				signal.displayDay = this.capFirst(momentDay.format('dddd'));
			}
		});

		if(this.config.maximumEntries >= 1 && this.config.maximumEntries <= 4) {
			this.signals = this.signals.slice(0, this.config.maximumEntries);
		}
	
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
		this.scheduleUpdate();
	},
	
	
	// Request new data from rte-france.com with node_helper
	socketNotificationReceived: function(notification, payload) {
		if(notification === "STARTED") {
			this.updateDom(this.config.animationSpeed);
		} else if(notification === "DATA") { Log.error(payload);
			this.processSignals(payload);
		} else if(notification === "ERROR") {
			Log.error(this.name + ": Do not access to data (" + payload + ").");
		} else if(notification === "DEBUG") {
			Log.log(payload);
		}
	},

	// Schedule next update
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if(typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		clearInterval(this.timerUpdate);

		var self = this;
		this.timerUpdate = setTimeout(function() {
			self.sendSocketNotification('CONFIG', self.config);
		}, nextLoad);
	},
	
	// Convert risk's level to color
	level2color: function(level) {
		switch(level) {
			case 1:
				return "#007b3d";
				break;
			case 2:
				return "#ee750c";
				break;
			case 3:
				return "#b30000";
				break;
		}
	},
	
	// Capitalize the first letter of a string
	capFirst: function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	
	addFilters() {
		this.nunjucksEnvironment().addFilter(
			"level2color",
			function (value) {
				return this.level2color(value);
			}.bind(this)
		);
	}

});
