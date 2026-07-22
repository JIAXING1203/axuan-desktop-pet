const test = require("node:test");
const assert = require("node:assert/strict");
const { DEFAULT_SCHEDULE, isReminderTime, reminderKey } = require("../src/reminder");

function localDate(year, month, day, hour, minute) {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

test("reminds at every weekday hour from 10 through 22", () => {
  const monday = 27;
  for (let hour = 10; hour <= 22; hour += 1) {
    assert.equal(isReminderTime(localDate(2026, 7, monday, hour, 0)), true);
  }
});

test("does not remind outside the configured window or on weekends", () => {
  assert.equal(isReminderTime(localDate(2026, 7, 27, 9, 0)), false);
  assert.equal(isReminderTime(localDate(2026, 7, 27, 23, 0)), false);
  assert.equal(isReminderTime(localDate(2026, 7, 27, 10, 1)), false);
  assert.equal(isReminderTime(localDate(2026, 7, 25, 10, 0)), false);
  assert.equal(isReminderTime(localDate(2026, 7, 26, 10, 0)), false);
});

test("uses the requested reminder copy", () => {
  assert.equal(DEFAULT_SCHEDULE.message, "阿璇提醒你：快去喝水和活动！！");
});

test("deduplication key changes once per hour", () => {
  assert.equal(reminderKey(localDate(2026, 7, 27, 10, 0)), "2026-07-27-10");
  assert.equal(reminderKey(localDate(2026, 7, 27, 10, 59)), "2026-07-27-10");
  assert.notEqual(reminderKey(localDate(2026, 7, 27, 10, 59)), reminderKey(localDate(2026, 7, 27, 11, 0)));
});
