'use strict';

// Import packages for express
const http = require('http');
const { getAthlete, getActivities } = require('./lib/strava');

// Node internals
const fs = require('fs-extra');
const path = require('path');

// Setup the express server
const express = require('express');
const useragent = require('express-useragent');
const app = express();
app.use(useragent.express());
const port = 5051;

// Serve the API
const httpServer = http.createServer(app);

httpServer.listen(port, () => {
	console.log(`HTTP Server running on port ${port}`);
});

// Canvas details
const { objColours, intCacheTime, arrMonths } = require('./lib/config');
const { registerFont, loadImage } = require('canvas');
const { createLayout, roundRect, addText, loadIcon } = require('./lib/canvas');
const { formatTime } = require('./lib/helpers');

// Register the fonts for the canvas
registerFont(path.join(__dirname, 'assets', 'Montserrat-Regular.ttf'), { family: 'Montserrat' });
registerFont(path.join(__dirname, 'assets', 'Montserrat-Bold.ttf'), { family: 'Montserrat Bold' });

/**
 * Get the last modified time of a given file
 * @param  {String} path The path to the file
 * @return {Integer}     The time the file was last modified
 */
const getFileUpdatedDate = path => {
  const stats = fs.statSync(path);
  return stats.mtime;
};

// Ignore favicon requests
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// No data to process, show an error
app.get('/', (req, res) => {

	const now = new Date();
	const strPath = path.join(__dirname, 'cache');
	const strFilename = path.join(strPath, `strava.png`);

	// Firsly check to see if we have a cached image
	if(fs.ensureDir(strPath) && fs.existsSync(strFilename) && now.getTime() - getFileUpdatedDate(strFilename).getTime() < intCacheTime)
	{
		console.log('Found cache, returning image');
		fs.readFile(strFilename, (_err, buffer) => {

			res.contentType('png');
			res.end(buffer, 'binary');

		});
	} else {

		console.log('No cache, creating new image');

		let objAthlete = {};
		let arrActivities = [];

		getAthlete().then(data => {
			objAthlete = data;
			return getActivities();
		}).then(data => {
			arrActivities = data;
			return createLayout(req);
		}).then(objCanvas => {

			const { canvas, context } = objCanvas;

			loadImage(objAthlete.profile).then(image => {

				context.strokeStyle = objColours.black;
				roundRect(context, 580, 20, 40, 40, 0, false, true);
				context.drawImage(image, 580, 20, 40, 40);
				addText(context, `${objAthlete.firstname} ${objAthlete.lastname} (${objAthlete.username})`, { left: 565, top: 45 }, '16px Montserrat Bold', 'right', '#fff');

				if(arrActivities.length)
				{

					arrActivities.map((objActivity, intI) => {

						if(intI < 4)
						{

							const intLeft = 20;
							const intIcon = 60;
							const intOffset = 20;
							const intTextLeft = intLeft + intIcon + intOffset;
							const intTop = 100 + (intI * 94);
							const objDate = new Date(objActivity.start_date);

							context.strokeStyle = objColours.primary;
							context.fillStyle = objColours.white;
							roundRect(context, intLeft, intTop, 400, 80, 10, true, true);

							addText(context, objActivity.name, { left: intTextLeft, top: (intTop + 25) }, '16px Montserrat', 'left');
							addText(context, `${objDate.getDate()} ${arrMonths[objDate.getMonth()]}, ${objDate.getFullYear()} at ${objDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, { left: intTextLeft, top: (intTop + 45) }, '16px "Montserrat Bold"');
							addText(context, `${Math.round((objActivity.distance * 0.000621371192) * 10) / 10} miles / ${formatTime(objActivity.moving_time)} / ${objActivity.total_elevation_gain}m elevation`, { left: intTextLeft, top: (intTop + 65) }, '14px "Montserrat"');

						}

					});

					const arrProms = [];
					arrActivities.map((objActivity, intI) => {
						if(intI < 4)
						{
							arrProms.push(loadIcon(context, intI, objActivity));
						}
					});

					Promise.all(arrProms).then(() => {

						const out = fs.createWriteStream(strFilename);
						const stream = canvas.createPNGStream();
						stream.pipe(out);
						out.on('finish', () => {
							const buffer = canvas.toBuffer('image/png');

							res.contentType('png');
							res.end(buffer, 'binary');
						});

					});

				} else {

					const out = fs.createWriteStream(strFilename);
					const stream = canvas.createPNGStream();
					stream.pipe(out);
					out.on('finish', () => {
						const buffer = canvas.toBuffer('image/png');

						res.contentType('png');
						res.end(buffer, 'binary');
					});

				}
			});
		}).catch(err => {
			console.log(err);
			console.log(typeof err);
		});

	}

});
