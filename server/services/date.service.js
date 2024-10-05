const moment = require('moment-timezone');

const mapDate = (createdDate, updatedDate) => {
    moment.updateLocale('en', {
        relativeTime: {
            future: 'in %s',
            past: '%s ago',
            s: function (number, withoutSuffix) {
                return withoutSuffix ? 'now' : 'a few seconds';
            },
            m: '1m',
            mm: '%dm',
            h: '1h',
            hh: '%dh',
            d: '1d',
            dd: '%dd',
            M: '1mth',
            MM: '%dmth',
            y: '1y',
            yy: '%dy'
        }
    });

    const pkCreated = moment(createdDate).tz('Asia/Karachi');
    const pkUpdated = moment(updatedDate).tz('Asia/Karachi');

    return { created: pkCreated.format('YYYY-MM-DD HH:mm:ss'), updated: pkUpdated.fromNow(true) }
}

module.exports = { mapDate }