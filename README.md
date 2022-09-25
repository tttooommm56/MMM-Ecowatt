# MMM-Ecowatt
A <a href="https://github.com/MichMich/MagicMirror">MagicMirror</a> module to display Ecowatt informations.


## Requirement
Register to https://data.rte-france.com/catalog/-/api/consumption/Ecowatt/v4.0 and subscribe to Ecowatt API to get your client id with secret.
In your application, you get a button "Copier en base 64".
You will just have to paste it in module configuration.


## Installation
1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/tttooommm56/MMM-Ecowatt.git`.
2. Enter the new `MMM-Ecowatt` directory and execute `npm install`.
3. Add the module inside `config.js` placing it where you prefer 


## Configuration


|Option|Description|
|---|---|
|`apiTokenBase64`|Your client id with secret (base-64 encoded)<br>**Type:** `string`
|`days`|Number of days to display (optional).<br>**Type:** `number`
|`showText`|Display ecowatt message.<br>**Type:** `boolean`<br>**Default:** <i>true</i>|
|`showGraph`|Display ecowatt detail graph for each day.<br>**Type:** `boolean`<br>**Default:** <i>true</i>|

Here is an example of an entry in `config.js`
```
{
	module: 'MMM-Ecowatt',
	position: 'bottom_right',
	header: 'Ecowatt',
	config: {
		apiTokenBase64: "xxxxx",
		days: 2,
		showText: true,
		showGraph: true
	}
}
```

## Screenshot

![Screenshot of Ecowatt](screenshotEcowatt.png?raw=true "Ecowatt")



## Notes
Data provided by <a href="https://data.rte-france.com/catalog/-/api/consumption/Ecowatt/v4.0">Ecowatt (RTE France)</a> and updated every 20 minutes.
