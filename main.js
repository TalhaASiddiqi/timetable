const { setSelectedIds } = require('./selectdIds')
const { singleSection, laidback, daysoff } = require('./selectionAlgos')


const selectedIds = ["CS301", "CS327", "CS324", "CS325", "SS153", "CL327"];


//THIS FUNCTION MUST BE CALLED OR BAD THINGS WILL HAPPEN 
setSelectedIds(selectedIds)




//Uncomment following functions as needed

//All of the following functions have optional parameter which allows us to fix the sections of some courses

// singleSection("C", { CS301: "A" });

// laidback({ CS301: "A" });

// daysoff(1);
