'use strict';

const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { objColours, objDimensions } = require('./config');
const { calculateRadius } = require('./helpers');

/**
 * Create the layout (including backgrounds and sections) based on the
 * user agent string from the request. Mobile is stacked, basically.
 *
 * @param  {Object} req Express rewquest parameters
 * @return {Object}     The created canvas and context
 */
function createLayout()
{
	return new Promise((resolve, reject) => {
		let canvas;
		let context;

		canvas = createCanvas(objDimensions.width, objDimensions.height);
		context = canvas.getContext('2d');

		context.fillStyle = objColours.white;
		roundRect(context, 0, 70, objDimensions.width, objDimensions.height - 70, { bl: 10, br: 10 }, true);

		context.fillStyle = objColours.primary;
		roundRect(context, 0, 0, objDimensions.width, 80, { tl: 10, tr: 10 }, true);

		loadImage(path.join(__dirname, '..', 'assets', 'logo-full.svg')).then(icon => {
			context.drawImage(icon, 20, 20, 196, 40);
			resolve({ canvas, context });
		}).catch(err => reject(err));

	});
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 *
 * @param {CanvasRenderingContext2D} context
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
const roundRect = (context, x, y, width, height, radius = 0, fill = false, stroke = false) => {

	radius = calculateRadius(radius);

	context.beginPath();
	context.moveTo(x + radius.tl, y);
	context.lineTo(x + width - radius.tr, y);
	context.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	context.lineTo(x + width, y + height - radius.br);
	context.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	context.lineTo(x + radius.bl, y + height);
	context.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	context.lineTo(x, y + radius.tl);
	context.quadraticCurveTo(x, y, x + radius.tl, y);
	context.closePath();

	if (fill) {
		context.fill();
	}

	if (stroke) {
		context.stroke();
	}

};

/**
 * Add a text layer to the canvas
 *
 * @param {Object} context           The canvas 2D context
 * @param {String} strText           The text to put on the canvas
 * @param {Object} objPos            left and top positions for the text
 * @param {String} [strFont='16px    Montserrat']  The font to use
 * @param {String} [strAlign='left'] Text alignment (left or right)
 * @param {String} [strFill='#fff']  Fill text colour
 */
const addText = (context, strText, objPos, strFont = '16px Montserrat', strAlign = 'left', strFill = '#000') => {
	context.font = strFont;
	context.fillStyle = strFill;
	context.textAlign = strAlign;
	context.fillText(strText, objPos.left, objPos.top);
};

/**
 * Loads a weather icon and adds it to the canvas
 *
 * @param  {Object} req 	Express rewquest parameters
 * @param  {Object} context The canvas context
 * @param  {Integer} intI   When used in a loop this is the loop key
 * @param  {Object} objDay  The day information
 * @return {Promise}        Promise filfilled when the icon as been added
 */
const loadIcon = (context, intI, objActivity) => {
	return new Promise((resolve, reject) => {
		loadImage(path.join(__dirname, '..', 'assets', 'icons', `${objActivity.type.toLowerCase()}.svg`)).then(image => {
			const intLeft = 30;
			const intTop = 100 + (intI * 94) + 10;
			context.fillStyle = objColours.white;
			context.strokeStyle = objColours.black;
			roundRect(context, intLeft, intTop, 60, 60, 8, true, true);
			context.drawImage(image, intLeft + 5, intTop + 5, 50, 50);
			resolve();
		}).catch(err => reject(err));
	});
};

/*
{% if item.type == "Run" %} {% include "partials/running.svg" %} {% endif %}
{% if item.type == "WeightTraining" %} {% include "partials/weight.svg" %} {% endif %}
{% if item.type == "Walk" %} {% include "partials/walking.svg" %} {% endif %}
{% if item.type == "Ride" %} {% include "partials/ride.svg" %} {% endif %}
{% if item.type == "Workout" %} {% include "partials/workout.svg" %} {% endif %}
{% if item.type == "Yoga" %} {% include "partials/yoga.svg" %} {% endif %}
*/
module.exports = { createLayout, roundRect, addText, loadIcon };
