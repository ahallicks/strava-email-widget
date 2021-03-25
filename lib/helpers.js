'use strict';

/**
 * Formats the radius of each corner of a rectangle to output a rectangle
 * with rounded corners
 * @param  {Mixed} radius The radius, or object radius
 * @return {Object}       The radius of all for sides
 */
function calculateRadius(radius)
{
	const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
	if(typeof radius === 'number')
	{
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else if(typeof radius === 'object' && radius !== null) {

		for(const side in defaultRadius)
		{
			radius[side] = radius[side] || defaultRadius[side];
		}

	} else {
		radius = defaultRadius;
	}

	return radius;
}

/**
 * Given a number in seconds this function formats it to a proper string
 * in the format HH:MM:SS
 * @param  {Integer} time Time in seconds
 * @return {String}       Formatted time
 */
function formatTime(time)
{

	if(typeof time !== 'number' || time === 0)
	{
		return '00:00:00';
	}

	// Hours, minutes and seconds
	const hrs = ~~(time / 3600);
	const mins = ~~((time % 3600) / 60);
	const secs = ~~time % 60;

	// Output like "1:01" or "4:03:59" or "123:03:59"
	let ret = `${hrs < 10 ? '0' : ''}${hrs}h ${mins < 10 ? '0' : ''}${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
	return ret;

}

module.exports = { calculateRadius, formatTime };
