'use strict';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { timeSince } from './myfuncs';

dayjs.extend(utc);

export function prepare_event(event)
{
    return event
}

export function make_refresh_func(url, row_preparer, afterRefreshHandler)
{
    return function(params) {
	let pstr = '&' + new URLSearchParams(params.data).toString();
	fetch(url + pstr).then(response => {
	    if ( response.ok ) return response.json();
	    else throw response;
	}).then(resp => {
	    console.log('resp = %O', resp);
	    let events;
	    if ( 'total' in resp ) {
		resp.rows = resp.rows.map(row_preparer)
		events = resp
	    } else {
		events = resp.map(row_preparer)
	    }
	    params.success(events)
	    if ( afterRefreshHandler ) afterRefreshHandler();
	});
    }
}
