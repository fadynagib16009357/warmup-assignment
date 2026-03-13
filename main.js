const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
  let [start, startPeriod] = startTime.split(" ");
  let [end, endPeriod] = endTime.split(" ");

  let [startHour, startMinute, startSecond] = start.split(":").map(Number);
  let [endHour, endMinute, endSecond] = end.split(":").map(Number);

  if (startPeriod === "pm" && startHour !== 12) {
    startHour += 12;
  }
  if (startPeriod === "am" && startHour === 12) {
    startHour = 0;
  }

  if (endPeriod === "pm" && endHour !== 12) {
    endHour += 12;
  }
  if (endPeriod === "am" && endHour === 12) {
    endHour = 0;
  }

  let startTotalSeconds = startHour * 3600 + startMinute * 60 + startSecond;
  let endTotalSeconds = endHour * 3600 + endMinute * 60 + endSecond;

  if (endTotalSeconds < startTotalSeconds) {
    endTotalSeconds += 24 * 3600;
  }

  let diff = endTotalSeconds - startTotalSeconds;

  let hours = Math.floor(diff / 3600);
  diff %= 3600;

  let minutes = Math.floor(diff / 60);
  let seconds = diff % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
  let [start, startPeriod] = startTime.split(" ");
  let [end, endPeriod] = endTime.split(" ");

  let [startHour, startMinute, startSecond] = start.split(":").map(Number);
  let [endHour, endMinute, endSecond] = end.split(":").map(Number);

  if (startPeriod === "pm" && startHour !== 12) {
    startHour += 12;
  }
  if (startPeriod === "am" && startHour === 12) {
    startHour = 0;
  }

  if (endPeriod === "pm" && endHour !== 12) {
    endHour += 12;
  }
  if (endPeriod === "am" && endHour === 12) {
    endHour = 0;
  }

  let startTotalSeconds = startHour * 3600 + startMinute * 60 + startSecond;
  let endTotalSeconds = endHour * 3600 + endMinute * 60 + endSecond;

  if (endTotalSeconds < startTotalSeconds) {
    endTotalSeconds += 24 * 3600;
  }

  let idleSeconds = 0;
  let morningLimit = 8 * 3600;
  let nightLimit = 22 * 3600;

  if (startTotalSeconds < morningLimit) {
    if (endTotalSeconds <= morningLimit) {
      idleSeconds += endTotalSeconds - startTotalSeconds;
    } else {
      idleSeconds += morningLimit - startTotalSeconds;
    }
  }

  if (endTotalSeconds > nightLimit) {
    if (startTotalSeconds >= nightLimit) {
      idleSeconds += endTotalSeconds - startTotalSeconds;
    } else {
      idleSeconds += endTotalSeconds - nightLimit;
    }
  }

  let hours = Math.floor(idleSeconds / 3600);
  idleSeconds %= 3600;
  let minutes = Math.floor(idleSeconds / 60);
  let seconds = idleSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
  let [shiftHours, shiftMinutes, shiftSeconds] = shiftDuration.split(":").map(Number);
  let [idleHours, idleMinutes, idleSeconds] = idleTime.split(":").map(Number);

  let shiftTotalSeconds = shiftHours * 3600 + shiftMinutes * 60 + shiftSeconds;
  let idleTotalSeconds = idleHours * 3600 + idleMinutes * 60 + idleSeconds;

  let activeSeconds = shiftTotalSeconds - idleTotalSeconds;
  if (activeSeconds < 0) {
    activeSeconds = 0;
  }

  let hours = Math.floor(activeSeconds / 3600);
  activeSeconds %= 3600;
  let minutes = Math.floor(activeSeconds / 60);
  let seconds = activeSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
  let [hours, minutes, seconds] = activeTime.split(":").map(Number);
  let activeTotalSeconds = hours * 3600 + minutes * 60 + seconds;

  let specialStart = "2025-04-10";
  let specialEnd = "2025-04-30";

  let requiredSeconds;
  if (date >= specialStart && date <= specialEnd) {
    requiredSeconds = 6 * 3600;
  } else {
    requiredSeconds = 8 * 3600 + 24 * 60;
  }

  return activeTotalSeconds >= requiredSeconds;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
  
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
  
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {

}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
}


// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
  
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
