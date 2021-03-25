// Default image width and height
const objDimensions = {
	width: 640,
	height: 480
};

// Define some positions for items that sit in the same column
const objPositions = {
	leftPane: {
		left: 25
	},
	rightPane: {
		left: 330,
		dayWidth: 70,
		mobile: {
			left: 20
		}
	}
};

const objColours = {
	primary: '#fc4c02',
	black: '#000',
	white: '#fff'
};

// Used to get the current day of the week
const arrDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const arrMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

// Cache time in milliseconds
const intCacheTime = 1000 * 60 * 10;

module.exports = { objColours, objDimensions, objPositions, arrDays, arrMonths, intCacheTime };
