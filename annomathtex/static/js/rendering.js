var cellColorBasic = '#dddddd';
var cellColorSelectedGlobal = 'pink';
var cellColorSelectedLocal = 'blue';

var identifierColorBasic = '#c94f0c';
var formulaColorBasic = '#ffa500';
var annotationsColor = '#04B404';


/*
Setting colours
 */

function setAnnotatedColor(uIDs) {
    /*
    Set the color of annotations tokens.
     */
    for (var i=0 in uIDs) {
        document.getElementById(uIDs[i]).style.color = annotationsColor;
    }
}

function setBasicColor(uIDs) {
    /*
    Set the color of tokens back to basic, if the user changed his mind.
     */

    if (isFormula) {
        var fillColor = formulaColorBasic;
    } else {
        var fillColor = identifierColorBasic
    }

    for (var i=0 in uIDs) {
        document.getElementById(uIDs[i]).style.color = fillColor;
    }
}

function setCellColorBasic(cellID) {
    /*
    Set the color of the cell back to basic color (if the user changes his mind)
     */
    document.getElementById(cellID).style.backgroundColor = cellColorBasic;
}

function setCellColorSelectedLocal(cellID) {
    /*
    Set the color of the cell, if the user selected a local annotation
     */
    document.getElementById(cellID).style.backgroundColor = cellColorSelectedLocal;
}

function setCellColorSelectedGlobal(cellID) {
    /*
    Set the color of the cell, if the user selected a global annotation
     */
    document.getElementById(cellID).style.backgroundColor = cellColorSelectedGlobal;
}


function handlePopupTable() {
    /*
    Either the function handling the rendering of the table for identifiers or the corresponding function for formulae
    is called.
     */

    let counts = ratioRemaining();
    let annotatedIdentifiers = counts[0];
    let annotatedFormulae = counts[1];

    var annotationsCountTable = document.getElementById("annotationsCountTable");


    if (isFormula) {
        annotationsCountTable.innerHTML = 'Annotated Formulae: ' + annotatedFormulae + '/' + formulaCount;
        populateTableFormula();
    } else {
        annotationsCountTable.innerHTML = 'Annotated Identifiers: ' + annotatedIdentifiers + '/' + identifierCount;
        populateTableIdentifier();
    }
}


//todo: simplify these 2 methods
function populateTableFormula(random=true) {
    /*
    The entire table, containing the recommendations for a formula, that is shown to the user in the popup modal is
    created as html code in this function. The function createCell() is called upon, to create the individual cells in the table.

    random: The sources are shuffled and anonymized (The user does not know which recommendations come from which
    source, which is important for the evaluation)
     */

    window.tokenClickedTime = Date.now();
    if(!sourcesWithNums || Object.keys(sourcesWithNums).length === 0) sourcesWithNums = {};

    //let wikidataResults = recommendations['wikidataResults'];
    let wikidata1Results = recommendations['wikidata1Results'];
    let wikidata2Results = recommendations['wikidata2Results'];
    let wordWindow = recommendations['wordWindow'];
    let formulaConceptDB = recommendations['formulaConceptDB'];
    var existingManual = [...new Set(recommendations['manual'])];



    if (mathEnv in manualRecommendations) {
        var manual = manualRecommendations[mathEnv];
        for (var i in manual) {
            existingManual.unshift(manual[i]);
        }
        existingManual = existingManual.slice(0,10);
    } /*else {
        var manual = recommendations['manual']
    }*/

    var resultList = [[wikidata1Results, 'Wikidata1'],
                      [wikidata2Results, 'Wikidata2'],
                      [wordWindow, 'WordWindow'],
                      [formulaConceptDB, 'FormulaConceptDB'],
                      [existingManual, 'Manual']];



    tmpResultList = resultList[4][0];


    var table= "<table><tr><td>Source 1</td><td>Source 2</td><td>Source 3</td><td>Source 4</td><td>Source 5</td></tr>";

    if (preservedResultList) {
        resultList = preservedResultList;
        for (var i in resultList){
            if (resultList[i][1] == 'Manual') {
                resultList[i] = [existingManual, 'Manual'];
            }
        }
    } else if (random) {
        resultList = shuffle([[wikidata1Results, 'Wikidata1'],
                              [wikidata2Results, 'Wikidata2'],
                              [wordWindow, 'WordWindow'],
                              [formulaConceptDB, 'FormulaConceptDB'],
                              [existingManual, 'Manual']]);
        preservedResultList = resultList;
    } else {
        var table= "<table><tr><td>Wikidata1</td><td>Wikidata2</td><td>WordWindow</td><td>FormulaConceptDB</td><td>Manual</td></tr>";
    }


    let source0 = resultList[0][0];
    let source1 = resultList[1][0];
    let source2 = resultList[2][0];
    let source3 = resultList[3][0];
    let source4 = resultList[4][0];

    let name0 = resultList[0][1];
    let name1 = resultList[1][1];
    let name2 = resultList[2][1];
    let name3 = resultList[3][1];
    let name4 = resultList[4][1];


    for (let i = 0; i<10; i++) {
        if (source0.length >= i && source0.length > 0){
            var tdSource0 = createCell(source0[i], name0, i);
        }
        if (source1.length >= i && source1.length > 0) {
            var tdSource1 = createCell(source1[i], name1, i);
        }
        if (source2.length >= i && source2.length > 0) {
            var tdSource2 = createCell(source2[i], name2, i);
        }
        if (source3.length >= i && source3.length > 0) {
            var tdSource3 = createCell(source3[i], name3, i);
        }
        if (source4.length >= i && source4.length > 0) {
            var tdSource4 = createCell(source4[i], name4, i);
        }
        let tr = '<tr>' + tdSource0 + tdSource1 + tdSource2 + tdSource3 + tdSource4 + '</tr>';
        table += tr;
    }


    document.getElementById('tableholder').innerHTML = table;
    var modal = document.getElementById("popupModal");
    modal.style.display = "block";

    var span = document.getElementById("span");
    span.onclick = function () {
      modal.style.display = "none";
      preservedResultList = null;
    };

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
        preservedResultList = null;
      }
    };
}



function populateTableIdentifier(random=true) {
    /*
    The entire table, containing the recommendations for an identifier, that is shown to the user in the popup modal is
    created as html code in this function. The function createCell() is called upon, to create the individual cells in the table.

    random: The sources are shuffled and anonymized (The user does not know which recommendations come from which
    source, which is important for the evaluation)
     */
    window.tokenClickedTime = Date.now();
    if(!sourcesWithNums || Object.keys(sourcesWithNums).length === 0) sourcesWithNums = {};

    var arXivEvaluationItems = recommendations['arXivEvaluationItems'];
    var wikipediaEvaluationItems = recommendations['wikipediaEvaluationItems'];
    var wikidataResults = recommendations['wikidata1Results'];
    var wordWindow = recommendations['wordWindow'];
    var existingManual = [...new Set(recommendations['manual'])];

    if (content in manualRecommendations) {
        var manual = manualRecommendations[content];
        for (var i in manual) {
            existingManual.unshift(manual[i]);
        }
        existingManual = existingManual.slice(0,10);
    }




    var resultList = [[arXivEvaluationItems, 'ArXiv'],
                      [wikipediaEvaluationItems, 'Wikipedia'],
                      [wikidataResults, 'Wikidata'],
                      [wordWindow, 'WordWindow'],
                      [existingManual, 'Manual']];

    var table= "<table><tr><td>Source 1</td><td>Source 2</td><td>Source 3</td><td>Source 4</td><td>Source 5</td></tr>";

    if (preservedResultList) {
        resultList = preservedResultList;
        for (var i in resultList){
            if (resultList[i][1] == 'Manual') {
                resultList[i] = [existingManual, 'Manual'];
            }
        }
    } else if (random) {
        resultList = shuffle([[arXivEvaluationItems, 'ArXiv'],
                                    [wikipediaEvaluationItems, 'Wikipedia'],
                                    [wikidataResults, 'Wikidata'],
                                    [wordWindow, 'WordWindow'],
                                    [existingManual, 'Manual']]);
        preservedResultList = resultList;
    } else {
        table= "<table><tr><td>arXiv</td><td>Wikipedia</td><td>Wikidata</td><td>WordWindow</td><td>Manual</td></tr>";
    }


    let source0 = resultList[0][0];
    let source1 = resultList[1][0];
    let source2 = resultList[2][0];
    let source3 = resultList[3][0];
    let source4 = resultList[4][0];

    let name0 = resultList[0][1];
    let name1 = resultList[1][1];
    let name2 = resultList[2][1];
    let name3 = resultList[3][1];
    let name4 = resultList[4][1];


    for (let i = 0; i<10; i++) {
        if (source0.length >= i && source0.length > 0){
            var tdSource0 = createCell(source0[i], name0, i);
        }
        if (source1.length >= i && source1.length > 0) {
            var tdSource1 = createCell(source1[i], name1, i);
        }
        if (source2.length >= i && source2.length > 0) {
            var tdSource2 = createCell(source2[i], name2, i);
        }
        if (source3.length >= i && source3.length > 0) {
            var tdSource3 = createCell(source3[i], name3, i);
        }
        if (source4.length >= i && source4.length > 0) {
            var tdSource4 = createCell(source4[i], name4, i);
        }
        let tr = '<tr>' + tdSource0 + tdSource1 + tdSource2 + tdSource3 + tdSource4 + '</tr>';
        table += tr;
    }


    document.getElementById('tableholder').innerHTML = table;
    var modal = document.getElementById("popupModal");
    modal.style.display = "block";

    var span = document.getElementById("span");
    span.onclick = function () {
      modal.style.display = "none";
      preservedResultList = null;
    };

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
        preservedResultList = null;
      }
    };
}
2

function createCell(item, source, rowNum) {
    /*
    The cells, that populate the table in the popup modal are created in this method.
     */

    if (item) {
        var name = item['name'];
        var qid = item['qid'];
    } else {
        var name = '';
        var qid = '';
    }

    var backgroundColor = cellColorBasic;
    var containsHighlightedName = false;
    if (content in annotations['global']) {
        if (annotations['global'][content]['name'] == name) {
            backgroundColor = cellColorSelectedGlobal;
            containsHighlightedName = true;
        }

    } else if (content in annotations['local']) {
        if (uniqueID in annotations['local'][content]) {
            if (annotations['local'][content][uniqueID]['name'] == name) {
                backgroundColor = cellColorSelectedLocal;
            } else {
                backgroundColor = cellColorBasic;
            }
        }
    }
    rowNum += 1;
    var cellID = "cell" + source + rowNum;
    var args = [
        name,
        qid,
        source,
        backgroundColor,
        cellID,
        containsHighlightedName,
        rowNum
    ];


    if (name in sourcesWithNums){
        sourcesWithNums[name][source] = rowNum;
    } else {
        sourcesWithNums[name] = {};
        sourcesWithNums[name][source] = rowNum;
    }



    //not possible to pass multiple arguments, that's why they are concatenated to one argument string
    var argsString = args.join('---');

    var td = "<td id=" + cellID;
    td += " style='background-color:" + backgroundColor + "'";
    td += "onclick='selected(\"" + argsString + "\")' >";
    if (name) {
        td += name.replace(new RegExp('__APOSTROPH__', 'g'), '\'') + ' (' + qid + ')';
    }
    //td += name + ' (' + qid + ')';
    td += "</td>";


    return td;
}

function selected(argsString){
    /*
    This function is called when the user annotates a token with an element from the created table (e.g. from the
    retrieved wikidata results).
     */

    var recommendationSelectedTime = Date.now() - window.tokenClickedTime;


    var argsArray = argsString.split('---');
    var name = argsArray[0];
    var qid = argsArray[1];
    var source = argsArray[2];
    var backgroundColor = argsArray[3];
    var cellID = argsArray[4];
    var containsHighlightedName = (argsArray[5] === 'true');
    var rowNum = argsArray[6];

    var local = document.getElementById('localSwitch').checked;


    if (local) {
        //local annotations
        switch (backgroundColor) {
            case cellColorBasic:
                //make local annotation
                setCellColorSelectedLocal(cellID);
                addToAnnotations(uniqueID, name, source, rowNum, qid, recommendationSelectedTime);
                setAnnotatedColor([uniqueID]);
                break;
            case cellColorSelectedLocal:
                //reverse local annotation
                setCellColorBasic(cellID);
                setBasicColor([uniqueID]);
                deleteLocalAnnotation(content, uniqueID);
                break;
        }

    } else {
        //global annotations
        switch (backgroundColor) {
            case cellColorBasic:
                setCellColorSelectedGlobal(cellID);
                //tokenAssignedItemGlobal[content] = name;
                if (content in annotations['global']) {
                    deleteGlobalAnnotation(content);
                }
                var uIDs = getLinkedIDs(content);
                if (uIDs.length == 0) {
                    uIDs.push(uniqueID)
                }

                addToAnnotations(uniqueID, name, source, rowNum, qid, recommendationSelectedTime, -1, false, uIDs);
                setAnnotatedColor([uniqueID]);
                setAnnotatedColor(uIDs);
                break;

            case cellColorSelectedGlobal:
                setCellColorBasic(cellID);
                var uIDs = annotations['global'][content]['uniqueIDs'];
                setBasicColor([uniqueID]);
                setBasicColor(uIDs);
                deleteGlobalAnnotation(content);
                break;
        }
    }

    handlePopupTable();
    renderAnnotationsTable();
}

function renderAnnotationsTable() {
    /*
    The table at the top of the document, that is constantly being updated with the latest annotations is generated in
    this function.
     */

    let counts = ratioRemaining();
    let annotatedIdentifiers = counts[0];
    let annotatedFormulae = counts[1];

    console.log('Annotated Identifiers: ' + annotatedIdentifiers + '/' + identifierCount);
    console.log('Annotated Formulae: ' + annotatedFormulae + '/' + formulaCount);



    document.getElementById("identifierAnnotationsCount").innerHTML = 'Annotated Identifiers: ' + annotatedIdentifiers + '/' + identifierCount;
    document.getElementById("formulaAnnotationsCount").innerHTML = 'Annotated Formulae: ' + annotatedFormulae + '/' + formulaCount;


    function createRow(token, name, local, uIDs, type, qid) {
        var bold = true ? type=='Identifier' : false;
        var args = [
                token,
                local,
                uIDs
            ];
        var type = local ? 'Local' : 'Global';
        var argsString = args.join('----');
        argsString = argsString.split('\\').join('\\\\');

        var tr = "<tr><td>";
        if (bold){
            tr += "<b><strong>" + token + "</b></strong>";
        } else {
            tr += token;
        }
        tr += "</td><td>" + name.replace(new RegExp('__APOSTROPH__', 'g'), '\'') + ' (' + qid + ')' + "</td><td>" + type + "</td>";

        //var tr ="<tr><td>" + token + "</td><td>" + name.replace(new RegExp('__APOSTROPH__', 'g'), '\'') + "</td><td>" + type + "</td>";
        tr += "<td onclick='deleteFromAnnotations(\"" + argsString + "\")'>x</td></tr>";
        return tr;
    }

    var annotationsTable = "</br><table><tr><td><b>Identifier</b>/Formula</td><td>Annotated with</td><td>Type</td><td>Delete</td></tr>";


    var l = annotations['local'];
    for (var token in l) {
        for (var uID in l[token]){
            tr = createRow(token, l[token][uID]['name'], true, [uID], l[token][uID]['type'], l[token][uID]['qid']);
            annotationsTable += tr;
        }
    }

    var g = annotations['global'];
    for (var token in g) {
        tr = createRow(token, g[token]['name'], false, g[token]['uniqueIDs'], g[token]['type'], g[token]['qid']);
        annotationsTable += tr;
    }

    document.getElementById("annotationsHolder").innerHTML = annotationsTable;
}


function renderWikipediaResultsTable(wikipediaResults) {


    var annotationsTable = "<table><tr><td><strong><b>Available Wikipedia Articles</b></strong></td></tr>";
    for (var r in wikipediaResults) {
        //var tr = "<tr><td>" + wikipediaResults[r] + "</td></tr>";
        var tr = "<tr><td onclick='selectedWikipediaResult(\"" + wikipediaResults[r] + "\")' >";
        tr += wikipediaResults[r];
        tr += "</td>";
        tr += "</tr>";
        annotationsTable += tr;
    }


    document.getElementById('wikipediaTableHolder').innerHTML = annotationsTable;
    var modal = document.getElementById("popupWikipedia");
    modal.style.display = "block";

    var span = document.getElementById("spanW");
    span.onclick = function () {
      modal.style.display = "none";
    };

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
}


function selectedWikipediaResult(name){
    document.getElementById('wikipediaInput').value = name;
    var modal = document.getElementById("popupWikipedia");
    modal.style.display = "none";
    //getWikipediaArticle(name);
}

function resetSourceWithNums(sourceData) {
    sourcesWithNums = {}
    const rowNum = null

    sourceData.forEach(recommendation => {
        const { name, source} = recommendation

        if (name in sourcesWithNums){
            sourcesWithNums[name][source] = rowNum;
        } else {
            sourcesWithNums[name] = {};
            sourcesWithNums[name][source] = rowNum;
        }
    })
}

/**
 * Function that handles the auto annotate click event.
 */
function autoAnnotate(){    
    console.log('Auto annotations begin')

    const filteredAnnotations = [];
    let searchStringSet = new Set();

    /**
     * Remove repeated annotation of identifiers. We only want to globally annotate
     * for the moment.
     */
    annotationsList.forEach(obj => {
    if (obj.searchString !== "" && !searchStringSet.has(obj.searchString)) {
        searchStringSet.add(obj.searchString);
        filteredAnnotations.push(obj);
    }
    });

    const data_dict = { 
        'csrfmiddlewaretoken': getCookie("csrftoken"),
        'action': 'autoAnnotate',
        'annotations_list': JSON.stringify(filteredAnnotations)
    }

    $.ajax({
        url : "auto-annotate/", // the endpoint
        type : "POST", // http method
        data : data_dict, // data sent with the post request
  
        //successful response
        success : function(annotation_recommendations) {
            deleteAllAnnotations()

            resetSourceWithNums(annotation_recommendations)

            addGlobalAnnotations(annotation_recommendations)

            renderAnnotationsTable()

            console.log('Auto annotation complete.')
        },
  
        //non-successful response
        error : function(xhr, errmsg, err) {
            $('#results').html("<div class='alert-box alert radius' data-alert>error: "+errmsg+
                " <a href='#' class='close'>&times;</a></div>");
            console.log(xhr.status + ": " + xhr.responseText);
        }
      });  
}