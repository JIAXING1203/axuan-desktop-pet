const DEFAULT_SCHEDULE = Object.freeze({
  weekdays: Object.freeze([1, 2, 3, 4, 5]),
  startHour: 10,
  endHour: 22,
  minute: 0,
  title: "阿璇喝水提醒",
  message: "阿璇提醒你：快去喝水和活动！！",
});

function isReminderTime(date, schedule = DEFAULT_SCHEDULE) {
  return (
    schedule.weekdays.includes(date.getDay()) &&
    date.getHours() >= schedule.startHour &&
    date.getHours() <= schedule.endHour &&
    date.getMinutes() === schedule.minute
  );
}

function reminderKey(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
  ].join("-");
}

module.exports = { DEFAULT_SCHEDULE, isReminderTime, reminderKey };
