require('dotenv').config();
const express = require('express'),
  massive = require('massive'),
  moment = require('moment'),
  CronJob = require('cron').CronJob,
  PORT = 4001;

const app = express();
// Massive Connection
massive(process.env.CONNECTION_STRING).then(db => {
  app.set('db', db);
  app.listen(PORT, _ => console.log(`Running on port: ${PORT}`));
})

// Global label variable that will change depending on the CRON job currently running
let label = '';

// Function to create a moment timestamp and run DB insert query. To be called in CRON jobs
function timePunch() {
  let date = new Date();
  let stamp = moment(date).format('MMM D YYYY ddd H:mm:ss');
  app.get('db').enter_time([label, stamp])
    .then(data => console.log(data))
}

// Interval style CRON jobs. One for every 5 min and one for every 20
let shortInterval = new CronJob({
  cronTime: '0 */5 * * * *',
  onTick: _ => {
    console.log('short tick')
    timePunch();
  }
})
let longInterval = new CronJob({
  cronTime: '0 */20 * * * *',
  onTick: _ => {
    console.log('long tick')
    timePunch();
  }
})

// Scheduling CRON jobs to start the interval CRON jobs
let busyScheduleStart = new CronJob({
  cronTime: '0 15 8,12,16 * * 1-5',
  onTick: _ => {
    label = 'busy';
    shortInterval.start();
  },
  start: true
})
let busyScheduleStop = new CronJob({
  cronTime: '0 45 9,13,17 * * 1-5',
  onTick: _ => {
    shortInterval.stop();
  },
  start: true
})


let slowScheduleStart = new CronJob({
  cronTime: '0 40 9,13 * * 1-5',
  onTick: _ => {
    label = 'slow';
    longInterval.start();
  },
  start: true
})
let slowScheduleStop = new CronJob({
  cronTime: '0 20 12,16 * * 1-5',
  onTick: _ => {
    longInterval.stop();
  },
  start: true
})

// After hours and weekend jobs
let afterHours = new CronJob({
  cronTime: '0 0 0-7,18-23 * * 1-5',
  onTick: _ => {
    label = 'after hours';
    timePunch();
  },
  start: true
})
let weekend = new CronJob({
  cronTime: '0 0 * * * 0,6',
  onTick: _ => {
    label = 'weekend';
    timePunch();
  },
  start: true,
})








  // let testInterval = new CronJob({
  //   cronTime: '*/10 * * * * *',
  //   onTick: _ => {
  //     label = 'test tick'
  //     timePunch();
  //   }
  // })
  // let test = new CronJob({
  //   cronTime: '0 34 * * * *',
  //   onTick: _ => {
  //    console.log('test start');
  //     testInterval.start();
  //   },
  //   start: true,
  //   timeZone: 'America/Boise'
  // })
  // let teststop = new CronJob({
  //   cronTime: '0 35 * * * *',
  //   onTick: _ => {
  //     console.log('teststop')
  //     testInterval.stop();
  //   },
  //   start: true,
  //   timeZone: 'America/Boise'
  // })

