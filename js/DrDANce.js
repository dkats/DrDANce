var props = [
	'name', 
	'charstem', 
	'class', 
	'ind', 
	'moa', 
	'contra', 
	'se', 
	'avail',
	'elim', 
	'drugint', 
	'misc'
];
var propsString = [
	'Name', 
	'Characteristic stem(s)', 
	'Class', 
	'Indications', 
	'Mechanism of action', 
	'Contraindications', 
	'Side effects', 
	'Availability',
	'Elimination', 
	'Drug-drug interactions', 
	'Miscellanous'
];

var CASED = function (name) {
	this.name = name;
	for(var i in props) {
		if(props[i] !== 'name') {
			this[props[i]] = '';
		}
	}
	this.datemod = '';
};

function submitDrug() {
	newDrug = new CASED(document.getElementById("druginfo").elements["name"].value.trim());

	if(newDrug.name === "") {
		document.getElementById("druginfo").elements["name"].style.borderColor = "red";
		document.getElementById("nameerror").innerHTML = "Please enter a drug name.";
	} else {
		var basename = newDrug.name;
		var count = 1;
		while(findDrug(newDrug.name, drugs) !== -1) {
			newDrug.name = basename + " (" + count++ + ")";
			document.getElementById("druginfo").elements["name"].value = newDrug.name;
		}

		for(var i in props) {
			var element = document.getElementById("druginfo").elements[props[i]];
			newDrug[element.name] = element.value.trim();
		}
		newDrug.datemod = Date().toString();

		drugs[drugs.length] = newDrug;

		refreshDrugs();
		clearInfo();
	}
};

function refreshDrugs() {
	drugs.sort(function(a, b){
		if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
		if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
		return 0;
	})

	var drugList = "<ul>";
	printable = "<span class=\"printText\">";

	for(var i = 0; i < drugs.length; i++) {
		drugList += "<li id=\"" + drugs[i].name + "_LI\" onclick=\"viewDrug(\'" + drugs[i].name + "\')\">" + drugs[i].name + "</li>";

		printable += "<div class=\"card\"><div class=\"name\">" + drugs[i].name + "</div>";
		for(var propi in props) {
			if(props[propi] !== 'name' && drugs[i][props[propi]] !== '') {
				// printable += "<div class='property'><span class='label'>" + propsString[propi] + ":</span> " + drugs[i][props[propi]].replace(/[\n\r]/g,"<br>") + "</div>";
				if(drugs[i][props[propi]].indexOf("\n") === -1 && drugs[i][props[propi]].indexOf("\r") === -1) {
					printable += "<div class='property'><span class='label'>" + propsString[propi] + ":</span> " + drugs[i][props[propi]].replace(/[\n\r]/g,"<br>") + "</div>";
				} else {
					printable += "<div class='property'><span class='label'>" + propsString[propi] + ":</span><br>" + drugs[i][props[propi]].replace(/[\n\r]/g,"<br>") + "</div>";
				}
			}
		}
		printable += "</div>";
	}
	drugList += "</ul>";
	printable += "</span>";

	document.getElementById("drugList").innerHTML = drugList;
	localStorage.setItem("printable",printable);
}

function clearInfo() {
	document.getElementById("druginfo").reset();
	// Clear class of previous drug
	currDrugLI.className = "";
	clearErrors();
	currDrug = new CASED("");
}

function findDrug(name, drugs) {
	for(var i = 0; i < drugs.length; i++) {
		if(name.toLowerCase() === drugs[i].name.toLowerCase()) {
			return i;
		}
	}
	return -1;
}

function deleteDrug() {
	if(currDrug.name === "") {
		clearInfo();
	} else if(confirm("Are you sure that you want to delete " + currDrug.name + "?")) {
		drugs.splice(findDrug(currDrug.name, drugs),1);

		refreshDrugs();

		clearInfo();
	}
}

function viewDrug(name) {
	// Saving open drug (if one is open)
	updateDrug();

	// Clear class of previous drug
	currDrugLI.className = "";

	// Change class of current drug
	currDrugLI = document.getElementById(name + "_LI");
	currDrugLI.className = "active";

	// Loading selected drug
	currDrug = drugs[findDrug(name, drugs)];
	var elements = document.getElementById("druginfo").elements;
	for(var i in elements) {
		elements[i].value = currDrug[elements[i].name];
	}
}

function updateDrug() {
	// Saving open drug (if one is open)
	if(currDrug.name !== "" && findDrug(currDrug.name, drugs) !== -1) {
		drugs.splice(findDrug(currDrug.name, drugs),1);
		submitDrug();
	}
}

function clearErrors() {
	document.getElementById("nameerror").innerHTML = "";
	document.getElementById('druginfo').elements['name'].style.borderColor = 'initial';
}

function save() {
	// Saving open drug (if one is open)
	updateDrug();

	var out = Date().toString() + "\n";

	for(var i = 0; i < drugs.length; i++) {
		out += "\n";
		for(var property in drugs[i]) {
			out += property.toUpperCase() + ": " + drugs[i][property].replace(/[\n\r]/g,"\\") + "\n";
		}
	}

	myWindow = window.open("data:text," + encodeURIComponent(out), "_blank");
	myWindow.focus();
}

function loadFile(inTxt) {
	var lines = inTxt.split("\n");

	// lines[0] contains a timestamp, start at lines[2]
	var newDrug = new CASED("");
	for(var i = 2; i < lines.length; i++) {
		if(lines[i] === "" && newDrug.name !== "") {
			drugs[drugs.length] = newDrug;
			newDrug = new CASED("");
		} else {
			var line = lines[i].split(": ");
			var prop = line[0];
			var data = line.slice(1).join(": ").replace(/\\/g,"\n");
			console.log(data);
			for(var property in newDrug) {
				if(property.toLowerCase() === prop.toLowerCase()) {
					newDrug[property] = data;
				}
			}
			var basename = newDrug.name;
			var count = 1;
			while(findDrug(newDrug.name, drugs) !== -1) {
				newDrug.name = basename + " (" + count++ + ")";
			}
		}
	}

	refreshDrugs();
}

function load() {
	var file = document.getElementById("loadfile").files[0];
	if(file) {
		if(isTxt(file.name)) {
			var reader = new FileReader();
			reader.readAsText(file, "UTF-8");
			reader.onload = function (evt) {
				loadFile(evt.target.result);
			}
			reader.onerror = function (evt) {
				alert("The file could not be read.");
			}
		} else {
			alert("Please select a text file.");
		}
	}

	clearInfo();
	document.getElementById("loadfile").value = document.getElementById("loadfile").defaultValue;
}

function isTxt(filename) {
	if(filename.split(".").reverse()[0].toLowerCase() === "txt") {
		return true;
	}
	return false;
}

function example() {
	if(findDrug("*EXAMPLE* Rivaroxaban (Xarelto)", drugs) === -1) {
		exampleDrug = new CASED("*EXAMPLE* Rivaroxaban (Xarelto)");
		exampleDrug["class"] = "Anti-coagulant"
		exampleDrug["moa"] = "Direct factor Xa inhibitor"
		exampleDrug["avail"] = "F0 ~ 80-100% (dose dependent) - take with food"
		exampleDrug["se"] = "Bleeding complications, spinal/epidural hematoma, GI upset"
		exampleDrug["elim"] = "Hepatic > Kidney, low intrinsic clearance"
		exampleDrug["drugint"] = "Strong CYP3A4/P-gp inhibitors/inducers, other drugs affecting coagulation, platelet fxn"
		exampleDrug["misc"] = "Taken from the \"Intro to Pharmacology\" lecture on 2/6/17"

		drugs[drugs.length] = exampleDrug;

		refreshDrugs();
	} else {
		alert("The example drug (*EXAMPLE* Rivaroxaban (Xarelto)) was already added")
	}
}

// TODO: Get rid of global variables
var drugs = [];
var currDrug = new CASED("");
var currDrugLI = "";
var printable = "";