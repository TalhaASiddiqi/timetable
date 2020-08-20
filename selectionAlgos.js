const { getAllPossibleSections } = require('./timetable')
const { printMapping, dayOff, avgTimePerDay, stdDevTimePerDay } = require('./utils')
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
    var fridaysOff = getAllPossibleSections()
        .filter(mapping =>
            Object
                .entries(mapping)
                .every(([course, section]) => !overrides[course] || overrides[course] == section)
        )
        .filter((val) => avgTimePerDay(val) < 6)
        .sort((first, second) => stdDevTimePerDay(first) - stdDevTimePerDay(second));
    var short = fridaysOff.filter((val, ind) => ind < 20);
    printMapping(short);
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

module.exports = {
    singleSection,
    laidback,
    daysoff
}