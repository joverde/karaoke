/**
 * Begins a stream with rev.ai using the AudioContext from the browser. Stream will continue until the websocket 
 * connection is closed. Follows the protocol specficied in our documentation:
 * https://www.rev.ai/docs/streaming
 */
function doStream() {
    statusElement = document.getElementById("status");
    tableElement = document.getElementById("messages");
    finalsReceived = 0;
    currentCell = null;
    audioContext = new (window.AudioContext || window.WebkitAudioContext)();

    const access_token = '028LIvlsz0o77im7Cq50tKGywypy5utzdLuDtxyXjbxVgN0pXsHXQT5VcBpvwDMaeTApjqKvGoSPsWVXNyVpgO1jhyNeE';
    const content_type = `audio/x-raw;layout=interleaved;rate=${audioContext.sampleRate};format=S16LE;channels=1`;
    const baseUrl = 'wss://api.rev.ai/speechtotext/v1alpha/stream';
    const query = `access_token=${access_token}&content_type=${content_type}`;
    websocket = new WebSocket(`${baseUrl}?${query}`);

    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
    websocket.onerror = console.error;

    var button = document.getElementById("streamButton");
    button.onclick = endStream;
    button.innerHTML = "Stop";
}

/**
 * Gracefully ends the streaming connection with rev.ai. Signals and end of stream before closing and closes the 
 * browser's AudioContext
 */
function endStream() {
    if (websocket) {
        websocket.send("EOS");
        websocket.close();
    }
    if (audioContext) {
        audioContext.close();
    }

    var button = document.getElementById("streamButton");
    button.onclick = doStream;
    button.innerHTML = "Record";
}

/**
 * Updates the display and creates the link from the AudioContext and the websocket connection to rev.ai
 * @param {Event} event 
 */
function onOpen(event) {
    resetDisplay();
    statusElement.innerHTML = "Opened";
    navigator.mediaDevices.getUserMedia({ audio: true }).then((micStream) => {
        audioContext.suspend();
        var scriptNode = audioContext.createScriptProcessor(4096, 1, 1 );
        var input = input = audioContext.createMediaStreamSource(micStream);
        scriptNode.addEventListener('audioprocess', (event) => processAudioEvent(event));
        input.connect(scriptNode);
        scriptNode.connect(audioContext.destination);
        audioContext.resume();
    });
}

/**
 * Displays the close reason and code on the webpage
 * @param {CloseEvent} event
 */
function onClose(event) {
    statusElement.innerHTML = `Closed with ${event.code}: ${event.reason}`;
}

/**
 * Handles messages received from the API according to our protocol
 * https://www.rev.ai/docs/streaming#section/Rev.ai-to-Client-Response
 * @param {MessageEvent} event
 */
function onMessage(event) {
    var data = JSON.parse(event.data);
    switch (data.type){
        case "connected":
            statusElement.innerHTML =`Connected, job id is ${data.id}`;
            break;
        case "partial":
            currentCell.innerHTML = parseResponse(data);
            break;
        case "final":
            currentCell.innerHTML = parseResponse(data);
            if (data.type == "final"){
                finalsReceived++;
                var row = tableElement.insertRow(finalsReceived);
                currentCell = row.insertCell(0);
            }
            break;
        default:
            // We expect all messages from the API to be one of these types
            console.error("Received unexpected message");
            break;
    }
}

/**
 * Transform an audio processing event into a form suitable to be sent to the API. (S16LE or Signed 16 bit Little Edian).
 * Then send.
 * @param {AudioProcessingEvent} e 
 */
function processAudioEvent(e) {
    if (audioContext.state === 'suspended' || audioContext.state === 'closed' || !websocket) {
        return;
    }

    let inputData = e.inputBuffer.getChannelData(0);

    // The samples are floats in range [-1, 1]. Convert to PCM16le.
    let output = new DataView(new ArrayBuffer(inputData.length * 2));
    for (let i = 0; i < inputData.length; i++) {
        let multiplier = inputData[i] < 0 ? 0x8000 : 0x7fff; // 16-bit signed range is -32768 to 32767
        output.setInt16(i * 2, inputData[i] * multiplier | 0, true); // index, value, little edian
    }

    let intData = new Int16Array(output.buffer);
    let index = intData.length;
    while (index-- && intData[index] === 0 && index > 0) { }
    websocket.send(intData.slice(0, index + 1));
}

function parseResponse(response) {
    var message = "";
    for (var i = 0; i < response.elements.length; i++){
        message += response.type == "final" ?  response.elements[i].value : `${response.elements[i].value} `;
        checkSimilarity();
    }
    return message;
}

function resetDisplay() {
    finalsReceived = 0;
    while(tableElement.hasChildNodes())
    {
        tableElement.removeChild(tableElement.firstChild);
    }
    var row = tableElement.insertRow(0);
    currentCell = row.insertCell(0);
}

function checkSimilarity(){
    var str1 = document.getElementById("messages").textContent;
    var str2 = document.getElementById("lyrics2").textContent;
    document.getElementById("output").innerHTML = Math.round(similarity(str1,str2)*10000)/100;
    
  }
  //var perc=Math.round(similarity(str1,str2)*10000)/100;

  function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;


    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  }
  
  function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

