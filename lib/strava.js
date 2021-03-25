'use strict';

const fetch = require('node-fetch');
const NodeCache = require('node-cache');
const apiCache = new NodeCache({ stdTTL: 60 * 60 });
const dotenv = require('dotenv');
dotenv.config();

/**
 * Grabs the remote data for studio images and returns back
 * an array of objects
 *
 * @returns {Array} Empty or array of objects
 */

const strApiUrl = 'https://www.strava.com/api/v3/';
const auth_link = 'oauth/token';

async function doFetch(strLink)
{

	const content = apiCache.get(strLink);
	if(content)
	{
		return content;
	}

	console.log('Calling strava API');

	try {
		// Get a new access token
		await reAuthorize();

		// Grabs either the fresh remote data or cached data (will always be fresh live)
		const response = await fetch(strLink, {
			method: 'get',
			headers: {
				'Accept': 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + process.env.ACCESS_TOKEN,
			}
		});

		if(!response.ok)
		{
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		let data = await response.json();
		apiCache.set(strLink, data);
		return data;

	} catch (ex)
	{
		// If failed, return back an empty array
		throw new Error(ex);
	}
}

async function getAthlete()
{
	// Return auth info
	try {
		// const objAuth = await reAuthorize();
		const objData = await doFetch(`${strApiUrl}athlete`);
		return objData;
	}
	catch(e)
	{
		return false;
	}
}

async function getActivities()
{
	// Return auth info
	try {
		// const objAuth = await reAuthorize();
		const objData = await doFetch(`${strApiUrl}athlete/activities?per_page=4`);
		return objData;
	}
	catch(e)
	{
		return false;
	}
}

const reAuthorize = async () => {
	return fetch(`${strApiUrl}${auth_link}`, {
		method: 'post',
		headers: {
			'Accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			refresh_token: process.env.REFRESH_TOKEN,
			grant_type: 'refresh_token'
		})
	})
	.then(res => res.json())
	.then(data => {

		process.env.ACCESS_TOKEN = data.access_token;
		process.env.REFRESH_TOKEN = data.refresh_token;

	});
};

module.exports = { getAthlete, getActivities };
