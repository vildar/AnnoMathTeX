function noMatchInputListener() {
    /*
    Starts the timer when the user starts inputting a manual recommendation
     */

    window.manualRecommendationStartTime = Date.now();
    window.manualSelectionTime = Date.now() - window.tokenClickedTime;
    //var manualRecommendationStartTime = Date.now();
}

function rejectHighlightingListener() {
    /*
    Starts the timer when the user starts inputting a manual recommendation
     */

    var name = 'N/A';
    var qid = 'N/A';
    var uIDs = getLinkedIDs(content);


    if (!checkIfAnnotationExists(name)) {
        addToAnnotations(uniqueID, name, 'user', '-', qid, false, false, true, uIDs);
        //addToMannualRecommendations(name, qid);

    }

    if (! name in manualRecommendations) {
        addToMannualRecommendations(name, qid);
    }


    var local = document.getElementById('localSwitch').checked;

    if (local) {
        setAnnotatedColor([uniqueID]);
    } else {
        setAnnotatedColor(uIDs);
    }

    handlePopupTable();
    renderAnnotationsTable();


}

function addNoMatchToAnnotations(result) {


    let qid = result['qid'];
    let name = result['name'];


    name = name.replace(new RegExp('\'', 'g'), '__APOSTROPH__');
    var uIDs = getLinkedIDs(content); //+ [uniqueID];
    uIDs.push(uniqueID);

    addToAnnotations(uniqueID, name, 'user', '-', qid, manualRecommendationsSubmitTime, manualSelectionTime, true, uIDs);
    addToMannualRecommendations(name, qid);
    var local = document.getElementById('localSwitch').checked;

    if (local) {
        setAnnotatedColor([uniqueID]);
    } else {
        setAnnotatedColor(uIDs);

    }

    handlePopupTable();
    renderAnnotationsTable();

}

function handleNoMatch(){
    /*
    The user did not find any of the recommendations to be fitting and added his own suggestion.
    This means that this information has to be added to the "annotations" dictionary, which will later be written to the
    evaluation csv file, along with the other annotations.
     */
    window.manualRecommendationsSubmitTime = Date.now() - window.manualRecommendationStartTime;
    var name = document.getElementById('noMatchInput').value;

    document.getElementById("noMatchInput").value = "";

    checkManualRecommendationQID(name);


}

function addToMannualRecommendations(name, qid) {


    if (content in manualRecommendations) {
        manualRecommendations[content].push({'name': name, 'qid': qid});
    } else {
        manualRecommendations[content] = [{'name': name, 'qid': qid}];
    }

}

function addToAnnotations(uID, name, source, rowNum, qid, selectionTime, manualSelectionTime=-1, noMatch=false, uIDs = null, mathEnvCustom) {
    /*
    manualSelectionTime: the time from when the token was clicked until MANUAL INSERTION was selected
    (only for manual annotation)

    An annotation was made and the information is added to the annotations dictionary
     */
    if (isFormula) {
        var type = 'Formula';
    } else {
        var type = 'Identifier';
    }

    function localDict() {
        return {
                'name': name,
                'mathEnv': mathEnv,
                'source': source,
                'rowNum': rowNum,
                'qid': qid,
                'time': selectionTime,
                'manualSelectionTime': manualSelectionTime,
                'sourcesWithNums': noMatch ? {} : sourcesWithNums[name],
                'type': type //identifier or formula
            };
    }

    var local = document.getElementById('localSwitch').checked;
    if (local) {
        if (content in annotations['local']){
            annotations['local'][content][uID] = localDict();
        } else {
            annotations['local'][content] = {};
            annotations['local'][content][uID] = localDict();
        }
    } else {


        //todo: unify with function localDict()
        annotations['global'][content] = {
        'name': name,
        'mathEnv': mathEnv || mathEnvCustom,
        'uniqueIDs': uIDs,
        'qid': qid,
        'time': selectionTime,
        'manualSelectionTime': manualSelectionTime,
        'sourcesWithNums': noMatch ? {} : sourcesWithNums[name],
        'type': type
        };
        //annotations['global'][content] = {localDict};
    }
}

function deleteAllAnnotations() {
    // Delete all local annotations
    for (const annotation in annotations['local']) delete annotations['local'][annotation] 

    // Delete all global annotations
    for (const annotation in annotations['global']) delete annotations['global'][annotation]
}

function deleteLocalAnnotation(token, uID) {
    delete annotations['local'][token][uID];
}

function deleteGlobalAnnotation(token) {
    delete annotations['global'][token];
}

function deleteFromAnnotations(argsString) {

    var argsArray = argsString.split('----');

    var token = argsArray[0];
    var local = (argsArray[1] == 'true');
    var uIDs = argsArray[2].split(',');
    if (local) {
        deleteLocalAnnotation(token, uIDs[0]);
        setBasicColor(uIDs);
    } else {
        deleteGlobalAnnotation(token);
        setBasicColor(uIDs);
    }

    renderAnnotationsTable();
}

function handleExistingAnnotations(existing_annotations) {
    /*
    If any previous annotations for the same document exist, a number of actions are made:
        - The annotations are added to the dictionary "annotations".
        - The table at the top of the document containing the current annotations is filled with the existing ones.
        - The tokens that were annotated are colored accordingly.
     */
    //annotations = JSON.parse(existing_annotations)['existingAnnotations'];
    tmp = JSON.parse(existing_annotations)['existingAnnotations'];
    annotations = JSON.parse(tmp);
    if (annotations) {
        uIDs = getLocalUniqueIDs().concat(getGlobalUniqueIDs());
        setAnnotatedColor(uIDs);
        renderAnnotationsTable();
    } else {
        annotations = {};
    }

    if ('global' in annotations) {
        var g = true;
    } else {
        var g = false;
    }

    if ('local' in annotations) {
        var l = true;
    } else {
        var l = false;
    }

    if (!g) {
        annotations['global'] = {};
    }

    if (!l) {
        annotations['local'] = {};
    }

}

function checkIfAnnotationExists(name) {

    var exists = false;



    if (content in annotations['global']) {
        if (annotations['global'][content]['name'] == name) {
            exists = true;
        }

    } else if (content in annotations['local']) {
        if (uniqueID in annotations['local'][content]) {
            if (annotations['local'][content][uniqueID]['name'] == name) {
                exists = true;

            }
        }
    } else {
        exists = false;
    }


    return exists;

}

/**
 * Function that appends identifiers and formulae to global variable.
 * @param {string} jsonContent Name of the token.
 * @param {string} jsonMathEnv Mathematical formula of the token.
 * @param {string} tokenUniqueId Unique ID for the token.
 * @param {string} tokenType Type of token (Formula or Identifier)
 */
function addToAllAnnotations(jsonContent, jsonMathEnv, tokenUniqueId, tokenType){
    const tokenContent = JSON.parse(jsonContent)['content'];
    const mathEnv = JSON.parse(jsonMathEnv)['math_env'];

    content = 
        tokenType == 'Identifier' && allIdentifiers.includes(tokenContent) 
            ? tokenContent 
            : mathEnv;

    annotationsList.push({ 
        the_post : $("#" + tokenUniqueId).val(),
        'searchString': content,
        'tokenType': tokenType,
        'mathEnv': $.param({'dummy': mathEnv}),
        'uniqueId': tokenUniqueId,
        'annotations': $.param(replaceAllEqualsPlusAnn(annotations))
    })
}
