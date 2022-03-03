import dayjs from 'dayjs';

/* https://stackoverflow.com/a/9462382 */
function nFormatter(si, num, digits) {
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
	if (num >= si[i].value) {
	    break;
	}
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

export function format_num(num, digits) {
    return nFormatter([
	{ value: 1, symbol: "" },
	{ value: 1E3, symbol: "k" },
	{ value: 1E6, symbol: "M" },
	{ value: 1E9, symbol: "G" },
	{ value: 1E12, symbol: "T" },
	{ value: 1E15, symbol: "P" },
	{ value: 1E18, symbol: "E" }
    ], num, digits);
}

export function format_money(num, digits) {
    return nFormatter([
	{ value: 1, symbol: "" },
	{ value: 1E3, symbol: "k" },
	{ value: 1E6, symbol: "Mn" },
	{ value: 1E9, symbol: "Bn" },
	{ value: 1E12, symbol: "Tn" },
	{ value: 1E15, symbol: "P" },
	{ value: 1E18, symbol: "E" }
    ], num, digits);
}

// https://stackoverflow.com/a/3177838
export function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
	return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
	return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
	return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
	return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
	return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}

/* Adapted from: https://stackoverflow.com/a/6109105 */
export function timeDiff(previous)
{
    let current = new Date();
    let msPerMinute = 60 * 1000;
    let msPerHour = msPerMinute * 60;
    let msPerDay = msPerHour * 24;
    let msPerMonth = msPerDay * 30;
    let msPerYear = msPerDay * 365;
    let elapsed = current - previous;

    if (elapsed < msPerMinute) {
        let x = Math.round(elapsed/1000);
	return `${x} second${x===1?"":"s"} ago`;
    }

    else if (elapsed < msPerHour) {
        let x = Math.floor(elapsed/msPerMinute);
	return `about ${x} minute${x===1?"":"s"} ago`;
    }

    else if (elapsed < msPerDay ) {
        let x = Math.floor(elapsed/msPerHour);
	return `about ${x} hour${x===1?"":"s"} ago`;
    }

    else if (elapsed < msPerMonth) {
        let x = Math.floor(elapsed/msPerDay);
        return `about ${x} day${x===1?"":"s"} ago`;
    }

    else if (elapsed < msPerYear) {
	let x = Math.floor(elapsed/msPerMonth);
        return `about ${x} month${x===1?"":"s"} ago`;
    }

    else {
	let x = Math.floor(elapsed/msPerYear);
        return `about ${x} year${x===1?"":"s"} ago`;
    }
}

// https://stackoverflow.com/a/51506718
export function wordwrap(s, w) {
    return s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'), '$1\n')
}

/* based on https://day.js.org/docs/en/display/difference */
export function datediff(date1, date2, unit)
{
    if ( date1 === null || date1 === undefined || date2 === null || date2 === undefined ) return null;
    return dayjs(date1).diff(dayjs(date2), unit);
}
