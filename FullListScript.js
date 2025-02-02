var button = document.getElementById('button_csv');
button.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission and download
});

document.querySelector('input[name=commoGranularity][value="Wafer-Chamber"]').click();
document.querySelector('input[name=identity_type][value="LOTNO"]').click();

// Unchecks all checkboxes
document.querySelectorAll("input[type='checkbox']:checked").forEach((element) => {
    element.click();
});

// Check specific checkboxes
var counter = 0;
document.querySelectorAll("input[type='checkbox']").forEach((element) => {
    if (counter === 0 || counter === 3 || counter === 5 || counter === 6 || counter === 13) {
        element.click();
    }
    counter += 1;
});

var date = prompt("Please paste the OQA inspection times"); // Pop up text box for user
var slicedDateFirst = date.slice(0, 13);
var slicedDateLast = date.slice(-13);

var fromDat = new Date(slicedDateFirst);
fromDat.setDate(fromDat.getDate() - 7);
var toDat = new Date(slicedDateLast);

document.getElementById('from-date').value = fromDat;
document.getElementById('to-date').value = toDat;

var lotIDs = prompt("Please paste the OQA Lot IDs").split('\r\n'); // Pop up text box for user
var RDlotIDs = [...new Set(lotIDs)];

for (var i = 0; i < RDlotIDs.length; i++) {
    if (!RDlotIDs[i].includes(".")) {
        RDlotIDs[i] += ".000";
    }
}

var noSear = Math.ceil(RDlotIDs.length / 20);
var allTools = [];

async function performSearch() {
    for (let s = 0; s < noSear; s++) {
        let tool20 = await splitSearch(s);
        allTools.push(...tool20);

        let progress = ((s + 1) / noSear) * 100;
        console.log(`Progress: ${progress.toFixed(2)}%`);
    }

    var Output = [...new Set(allTools)].filter(item => item.trim() !== '');
    console.log(Output);
		downloadCSV(Output);
}

async function splitSearch(n) {
    document.getElementById('bad').value = '';
    for (var i = 0; i < 20 && (n * 20 + i) < RDlotIDs.length; i++) {
        document.getElementById('bad').value += RDlotIDs[n * 20 + i] + '\n';
    }
    document.getElementById('button_csv').click();
    find();
    await waitForLoadingToComplete();
   
    var csvt = document.getElementById('csvtext').value;
  	var rows = csvt.split('\r\n');
  	var values1 = rows.slice(1, rows.length-1);
  	var values2 = [];
		for(var h = 0; h < values1.length; h++) {
    		values2[h] = values1[h].split('\",\"');
		}
  	//values2 to be used for each function
  	var stepIDsF = stepID(values2);
  	var stepNamesF = stepName(values2);
  	var eqmtF = eqmtList(values2);
  	var procTimesF = procTime(values2);
  	var lotIDsF = lotID(values2);
  	var OutputFinal = [];
  OutputFinal[0] = "Step IDs" + ',' + "Step Name" + ',' + "Equipment" + ',' + "Process Time" + ',' + "Lot ID";
  	for(var f = 1; f < rows.length; f++) {    
				OutputFinal[f] = stepIDsF[f] + ',' + stepNamesF[f] + ',' + eqmtF[f] + ',' + procTimesF[f] + ',' + lotIDsF[f];
    }
  	return OutputFinal;
}

function stepID(stepIDs) {
  var stepIDsa = [];
  var stepIDsb = [];
	for(var q = 0; q < stepIDs.length; q++) {
  		stepIDsa[q] = stepIDs[q][0];
  }
	for(var i = 0; i < stepIDsa.length; i++){
  		stepIDsb[i] = stepIDsa[i].slice(1);
	}
  return stepIDsb;
}

function stepName(stepNames) {
  	var stepNamesa = [];
  	for(var w = 0; w < stepNames.length; w++) {
    		stepNamesa[w] = stepNames[w][1];
    }
  	return stepNamesa;
}

function eqmtList(eqmtL) {
   	var eqmta = [];
  	for(var e = 0; e < eqmtL.length; e++) {
    		 eqmta[e] = eqmtL[e][2];
    }
  	return eqmta;
}

function procTime(procTimes) {
		var procTimesa = [];
  	for(var r = 0; r < procTimes.length; r++) {
    		procTimesa[r] = procTimes[r][3];
  	}
  	return procTimesa;
}

function lotID(lotIDs) {
		var lotIDsa = [];
		var lotIDsb = [];
		for(var t = 0; t < lotIDs.length; t++) {
    		lotIDsa[t] = lotIDs[t][10];
}
		for(var y = 0; y < lotIDsa.length; y++) {
    		lotIDsb[y] = lotIDsa[y].substring(lotIDsa[y].lastIndexOf('"') + 1, lotIDsa[y].lastIndexOf(";"));
}
		return lotIDsb;
}



function find(){
    var badElement = document.getElementById('bad');
    badElement.value = badElement.value.replaceAll('undefined', '').replaceAll('**undefined', '');
    document.getElementById('find').click();
}

async function waitForLoadingToComplete() {
    const loadingBar = document.getElementById('cover');

    function isLoadingComplete() {
        return loadingBar.style.display === 'none';
    }

    while (!isLoadingComplete()) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

function downloadCSV(data) {
    const csvContent = "data:text/csv;charset=utf-8," + data.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'FullList.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
performSearch();
