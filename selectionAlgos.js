const { getAllPossibleSections } = require('./timetable')
const { printMapping, dayOff, avgTimePerDay, stdDevTimePerDay, getAvgFreeTime, getNumberOfSameSections } = require('./utils')
const days = require('./days');
const { getSelectedIds } = require('./selectdIds');

function daysoff(n, overrides = {}) {
    var output = [];
    getAllPossibleSections()
        .filter(mapping =>
            Object
                .entries(mapping)
                .every(([course, section]) => !overrides[course] || overrides[course] == section)
        )
        .forEach((sectionMapping) => {
            var daysFree = 0;
            days.forEach((day) => {
                if (dayOff(sectionMapping, day)) daysFree++;
            });
            if (daysFree >= n) {
                output.push(sectionMapping);
            }
        });
    printMapping(output);
}



function laidback(overrides = {}) {
    printMapping(getAllPossibleSections()
        .filter(mapping =>
            Object
                .entries(mapping)
                .every(([course, section]) => !overrides[course] || overrides[course] == section)
            &&
            avgTimePerDay(mapping) < 6
        )
        .sort((first, second) => stdDevTimePerDay(first) - stdDevTimePerDay(second))
        .slice(0, 20)
    )
}



function singleSection(section, overrides = {}) {
    printMapping([{
        ...getSelectedIds().reduce((mapping, course) =>
            ({ ...mapping, [course]: course.indexOf('L') == 1 ? section + "1" : section }),
            {}
        ),
        ...overrides
    }])
}

function idealFreeTime(overrides = {}) {
    printMapping(
        getAllPossibleSections()
            .filter(mapping =>
                Object
                    .entries(mapping)
                    .every(([course, section]) => !overrides[course] || overrides[course] == section)
            )
            .filter(val => getAvgFreeTime(val) > 0.5 && getAvgFreeTime(val) < 2 && getNumberOfSameSections(val) >= 4)
            .sort((a, b) => {
                let diff = getNumberOfSameSections(b) - getNumberOfSameSections(a);
                if (diff == 0)
                    return (getAvgFreeTime(a) - 1.5) - (getAvgFreeTime(b) - 1.5);
                else
                    return diff
            })
            .slice(0, 30)
    )
}

module.exports = {
    singleSection,
    laidback,
    daysoff,
    idealFreeTime,
}