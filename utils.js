const stats = require("stats-lite");
const days = require('./days');
const { readTimetable } = require('./timetable')

const timetable = readTimetable();

function dayOff(sectionMapping, day) {
    var dayOff = true;
    for (let crs in sectionMapping) {
        dayOff =
            dayOff && timetable[crs]["timings"][sectionMapping[crs]][day] == null;
    }
    return dayOff;
}

function daySlots(sectionMapping, day) {
    let slots = [];
    for (let crs in sectionMapping) {
        let time = timetable[crs].timings[sectionMapping[crs]][day];
        if (time) {
            slots.push(time);
        }
    }

    return slots.sort((a, b) => a[0] - b[0]);
}

function timeForDay(sectionMapping, day) {
    let times = daySlots(sectionMapping, day);
    return times.length == 0
        ? [null, null]
        : [times[0][0], times[times.length - 1][1]];
}

function checkMappingClashForDay(mapping, day) {
    let times = daySlots(mapping, day);

    let clash = false;

    for (let i = 0; i < times.length - 1 && !clash; i++) {
        clash = times[i][1] > times[i + 1][0];
    }

    return clash;
}
function avgTimePerDay(sectionMapping) {
    return stats.mean(
        days.map((day) => {
            var times = timeForDay(sectionMapping, day);
            //console.log(times);
            if (times[0] == null) {
                return null;
            } else {
                return times[1] - times[0];
            }
        })
    );
}

function stdDevTimePerDay(sectionMapping) {
    return stats.stdev(
        days.map((day) => {
            var times = timeForDay(sectionMapping, day);
            //console.log(times);
            if (times[0] == null) {
                return null;
            } else {
                return times[1] - times[0];
            }
        })
    );
}
function printMapping(mappings) {
    mappings.forEach((mapping) => {
        //console.log(currentMapping)
        for (let course in mapping) {
            var out = timetable[course].name + ": " + mapping[course] + ": ";
            for (let day in timetable[course].timings[mapping[course]]) {
                if (timetable[course].timings[mapping[course]][day] != null) {
                    out =
                        out +
                        day +
                        "(" +
                        timetable[course].timings[mapping[course]][day][0] +
                        "-" +
                        timetable[course].timings[mapping[course]][day][1] +
                        "), ";
                }
            }
            console.log(out);
        }
        var out = "";
        days.forEach((day) => {
            var time = timeForDay(mapping, day);
            if (time[0] != null) {
                out = `${out}${day}: (${time[0]}-${time[1]}) ${
                    checkMappingClashForDay(mapping, day) ? "(CLASHES)" : ""
                    }, `;
            }
        });
        out = `${out} Avg Time/Day: ${avgTimePerDay(mapping)}, Stdev Time/Day: ${stdDevTimePerDay(mapping)}`;
        console.log(out);
        console.log(
            "-----------------------------------------------------------------"
        );
    });
}

module.exports = {
    printMapping,
    stdDevTimePerDay,
    avgTimePerDay,
    timeForDay,
    checkMappingClashForDay,
    daySlots,
    dayOff
}