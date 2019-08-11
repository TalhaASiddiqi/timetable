const jetpack = require('fs-jetpack');
const stats = require('stats-lite')

const selectedIds = ["CS211", "MT104", "EE229", "EL229", "CS218", "CL218", "MG103"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

var out = []; // [{"MG101": "A", "CS203": "B"}, {"MG101", "D", "CS203": "F"}]

const timetable = jetpack.read('./temp.json', 'json')

const sectionMappingTemplate = selectedIds.reduce((obj, section) => Object.assign(obj, {
    [section]: null
}), {});

var currentSectionMappings = Object.assign({}, sectionMappingTemplate);

allPossibleSections(0);
//printMapping(daysoff(2))

// printMapping([{
//     "CS211": "E",
//     "MT104": "E",
//     "EE229": "E",
//     "EL229": "E1",
//     "CS218": "E",
//     "CL218": "E1",
//     "MG103": "A"
//     },
// ])

//laidback();


function checkClash(course_index, section) {
    var tempTimings, curr, temp;
    var crsTimings = timetable[selectedIds[course_index]].timings[section];
    var clashing = false;
    for (let i of days) {
        curr = crsTimings[i]
        if (curr != null) { //selected course has a class on the current day
            selectedIds.forEach((val, ind) => {
                if (ind < course_index && !clashing) {
                    tempTimings = timetable[val].timings[currentSectionMappings[val]][i];
                    //console.log(tempTimings, curr);
                    if (tempTimings != null) {
                        if ((tempTimings[0] > curr[0] && tempTimings[0] < curr[1]) || (tempTimings[1] > curr[0] && tempTimings[1] < curr[1] || tempTimings[0] == curr[0] && tempTimings[0] == curr[0])) {
                            clashing = true;
                        }
                    }
                }
            })
        }
    }
    return clashing; 
}

function allPossibleSections(index) {
    if (index == selectedIds.length)
        out.push(Object.assign({}, currentSectionMappings));
    else {
        var clashed;
        if (selectedIds[index].charAt(1) == 'L') {
            var labSection;
            for (var i = 1; i <= 1; i++) { //select proper section for lab classes
                labSection = currentSectionMappings[selectedIds[index - 1]] + '' + i;
                if (!checkClash(index, labSection)) {
                    currentSectionMappings[selectedIds[index]] = labSection;
                    allPossibleSections(index + 1);
                }
            }
        } else {
            //console.log(timetable[selectedIds[index]]);
            for (let section in timetable[selectedIds[index]]["timings"]) {
                clashed = checkClash(index, section);
                if (!clashed) {
                    currentSectionMappings[selectedIds[index]] = section;
                    allPossibleSections(index + 1);
                }
            }
        }
    }
}


jetpack.write('./output.json', out);

function daysoff(n) {
    var output = [];
    out.forEach(sectionMapping => {
        var daysFree = 0;
        days.forEach(day => { 
            if (dayOff(sectionMapping, day))
                daysFree++;
        }) 
        if (daysFree >= n) {
            output.push(sectionMapping);
        }
    })
    return output
}

function printMapping(mappings) {
    mappings.forEach(mapping => {
        //console.log(currentMapping)
        for (let course in mapping) {
            var out = timetable[course].name + ': ' + mapping[course] + ': ';
            for (let day in timetable[course].timings[mapping[course]]) {
                if (timetable[course].timings[mapping[course]][day] != null) {
                    out = out + day + '(' + timetable[course].timings[mapping[course]][day][0] + '-' + timetable[course].timings[mapping[course]][day][1] + '), ';
                }
            }
            console.log(out)
        }
        var out = "";
        days.forEach(day => {
            var time = timeForDay(mapping, day);
            if (time[0] != null) {
                out = out + day + ": (" + time[0] + "-" + time[1] + "), ";
            }
        })
        out = out + avgTimePerDay(mapping) + ' ' + stdDevTimePerDay(mapping);
        console.log(out);
        console.log('-----------------------------------------------------------------');
    })
}

function laidback() {
    // var fridaysOff = out.filter((val) => {
    //     return dayOff(val, "Friday");
    // })
    var fridaysOff = out.filter(val => (stdDevTimePerDay(val) < 1.4)).sort((first, second) => {
        var firstTime = avgTimePerDay(first)
        var secondTime = avgTimePerDay(second);

        //console.log(firstTime, secondTime)

        if (firstTime == secondTime) return 0;
        if (firstTime < secondTime) return -1;
        if (firstTime > secondTime) return 1;
    })
    var short = fridaysOff.filter((val, ind) => ind < 20)
    printMapping(short)
}

function dayOff(sectionMapping, day) {
    var dayOff = true;
    for (let crs in sectionMapping) {
        dayOff = dayOff && timetable[crs]["timings"][sectionMapping[crs]][day] == null;
    }
    return dayOff
}

function timeForDay(sectionMapping, day) {
    var curr;
    var max = null, min = null;
    selectedIds.forEach((crsId) => {
        curr = timetable[crsId].timings[sectionMapping[crsId]][day];
        if (curr != null) {
            if (max == null) {
                max = curr[1];
                min = curr[0]
            }
            else {
                if (curr[1] > max)
                    max = curr[1]
                if (curr[0] < min)
                    min = curr[0]
            }
        }
    })
    return [min, max];
}

function avgTimePerDay(sectionMapping) {
    return stats.mean(days.map(day => {
        var times = timeForDay(sectionMapping, day);
        //console.log(times);
        if (times[0] == null) {
            return null
        }
        else {
            return times[1] - times[0];
        }
    }))
}

function stdDevTimePerDay(sectionMapping) {
    return stats.stdev(days.map(day => {
        var times = timeForDay(sectionMapping, day);
        //console.log(times);
        if (times[0] == null) {
            return null
        }
        else {
            return times[1] - times[0];
        }
    }))
}


function correctTimetable() {
    for (let crs in timetable) {
        for (let section in timetable[crs].timings) {
            for (let day in timetable[crs].timings[section]) {
                if (timetable[crs].timings[section][day] != null) {
                    timetable[crs].timings[section][day].forEach((hour, index) => {
                        if (hour < 8) {
                            timetable[crs].timings[section][day][index] = hour + 12;
                        }
                    })
                }
            }
        }
    }
}

//correctTimetable();

//jetpack.write('./temp.json', timetable);