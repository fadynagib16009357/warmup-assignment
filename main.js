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
  let fileContent = fs.readFileSync(textFile, { encoding: "utf8" }).trim();
  let lines = fileContent.split("\n");
  let header = lines[0];
  let dataLines = lines.slice(1).filter(line => line.trim() !== "");

  let duplicate = dataLines.some(line => {
    let parts = line.split(",");
    return parts[0] === shiftObj.driverID && parts[2] === shiftObj.date;
  });

  if (duplicate) {
    return {};
  }

  let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
  let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
  let activeTime = getActiveTime(shiftDuration, idleTime);
  let metQuotaValue = metQuota(shiftObj.date, activeTime);

  let newRecordObj = {
    driverID: shiftObj.driverID,
    driverName: shiftObj.driverName,
    date: shiftObj.date,
    startTime: shiftObj.startTime,
    endTime: shiftObj.endTime,
    shiftDuration: shiftDuration,
    idleTime: idleTime,
    activeTime: activeTime,
    metQuota: metQuotaValue,
    hasBonus: false
  };

  let newLine = [
    newRecordObj.driverID,
    newRecordObj.driverName,
    newRecordObj.date,
    newRecordObj.startTime,
    newRecordObj.endTime,
    newRecordObj.shiftDuration,
    newRecordObj.idleTime,
    newRecordObj.activeTime,
    String(newRecordObj.metQuota),
    String(newRecordObj.hasBonus)
  ].join(",");

  dataLines.push(newLine);
  dataLines.sort((a, b) => {
    let aParts = a.split(",");
    let bParts = b.split(",");

    if (aParts[0] !== bParts[0]) {
      return aParts[0].localeCompare(bParts[0]);
    }

    if (aParts[2] !== bParts[2]) {
      return aParts[2].localeCompare(bParts[2]);
    }

    return aParts[3].localeCompare(bParts[3]);
  });

  let output = [header, ...dataLines].join("\n");
  fs.writeFileSync(textFile, output, { encoding: "utf8" });

  return newRecordObj;
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
  let fileContent = fs.readFileSync(textFile, { encoding: "utf8" }).trim();
  let lines = fileContent.split("\n");
  let header = lines[0];
  let dataLines = lines.slice(1);

  let updatedLines = dataLines.map(line => {
    if (line.trim() === "") {
      return line;
    }

    let parts = line.split(",");
    if (parts[0] === driverID && parts[2] === date) {
      parts[9] = String(newValue);
      return parts.join(",");
    }

    return line;
  });

  fs.writeFileSync(textFile, [header, ...updatedLines].join("\n"), { encoding: "utf8" });
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
  let normalizedMonth = String(month).padStart(2, "0");
  let fileContent = fs.readFileSync(textFile, { encoding: "utf8" }).trim();
  let lines = fileContent.split("\n").slice(1).filter(line => line.trim() !== "");

  let driverLines = lines.filter(line => line.split(",")[0] === driverID);
  if (driverLines.length === 0) {
    return -1;
  }

  let bonusCount = 0;

  for (let line of driverLines) {
    let parts = line.split(",");
    let recordMonth = parts[2].split("-")[1];
    let hasBonus = parts[9] === "true";

    if (recordMonth === normalizedMonth && hasBonus) {
      bonusCount += 1;
    }
  }

  return bonusCount;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
  let normalizedMonth = String(month).padStart(2, "0");
  let fileContent = fs.readFileSync(textFile, { encoding: "utf8" }).trim();
  let lines = fileContent.split("\n").slice(1).filter(line => line.trim() !== "");
  let totalSeconds = 0;

  for (let line of lines) {
    let parts = line.split(",");
    let recordDriverID = parts[0];
    let recordMonth = parts[2].split("-")[1];

    if (recordDriverID === driverID && recordMonth === normalizedMonth) {
      let [hours, minutes, seconds] = parts[7].split(":").map(Number);
      totalSeconds += hours * 3600 + minutes * 60 + seconds;
    }
  }

  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
  let normalizedMonth = String(month).padStart(2, "0");
  let shiftsContent = fs.readFileSync(textFile, { encoding: "utf8" }).trim();
  let shiftLines = shiftsContent.split("\n").slice(1).filter(line => line.trim() !== "");

  let ratesContent = fs.readFileSync(rateFile, { encoding: "utf8" }).trim();
  let rateLines = ratesContent.split("\n").filter(line => line.trim() !== "");
  let dayOff = "";

  for (let line of rateLines) {
    let parts = line.split(",");
    if (parts[0] === driverID) {
      dayOff = parts[1];
      break;
    }
  }

  let requiredSeconds = 0;

  for (let line of shiftLines) {
    let parts = line.split(",");
    let recordDriverID = parts[0];
    let recordDate = parts[2];
    let recordMonth = recordDate.split("-")[1];

    if (recordDriverID !== driverID || recordMonth !== normalizedMonth) {
      continue;
    }

    let recordDayName = new Date(`${recordDate}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "UTC"
    });

    if (recordDayName === dayOff) {
      continue;
    }

    if (recordDate >= "2025-04-10" && recordDate <= "2025-04-30") {
      requiredSeconds += 6 * 3600;
    } else {
      requiredSeconds += 8 * 3600 + 24 * 60;
    }
  }

  requiredSeconds -= bonusCount * 2 * 3600;
  if (requiredSeconds < 0) {
    requiredSeconds = 0;
  }

  let hours = Math.floor(requiredSeconds / 3600);
  requiredSeconds %= 3600;
  let minutes = Math.floor(requiredSeconds / 60);
  let seconds = requiredSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
  let ratesContent = fs.readFileSync(rateFile, { encoding: "utf8" }).trim();
  let rateLines = ratesContent.split("\n").filter(line => line.trim() !== "");
  let basePay = 0;
  let tier = 0;

  for (let line of rateLines) {
    let parts = line.split(",");
    if (parts[0] === driverID) {
      basePay = Number(parts[2]);
      tier = Number(parts[3]);
      break;
    }
  }

  let [actualHrs, actualMins, actualSecs] = actualHours.split(":").map(Number);
  let [requiredHrs, requiredMins, requiredSecs] = requiredHours.split(":").map(Number);

  let actualTotalSeconds = actualHrs * 3600 + actualMins * 60 + actualSecs;
  let requiredTotalSeconds = requiredHrs * 3600 + requiredMins * 60 + requiredSecs;
  let missingSeconds = requiredTotalSeconds - actualTotalSeconds;

  if (missingSeconds <= 0) {
    return basePay;
  }

  let missingHours = missingSeconds / 3600;
  let allowedMissingHours = 0;

  if (tier === 1) {
    allowedMissingHours = 50;
  } else if (tier === 2) {
    allowedMissingHours = 20;
  } else if (tier === 3) {
    allowedMissingHours = 10;
  } else if (tier === 4) {
    allowedMissingHours = 3;
  }

  if (missingHours <= allowedMissingHours) {
    return basePay;
  }

  let excessMissingHours = Math.floor(missingHours - allowedMissingHours);
  let deductionRatePerHour = Math.floor(basePay / 185);
  let salaryDeduction = excessMissingHours * deductionRatePerHour;

  return basePay - salaryDeduction;
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
