function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// ID of the Google Spreadsheet
var spreadsheetID = "1QV6e0xSJWv1HXqmPSmGaIFkdM3YCZkfXl67w06gnNuM";

// Make sure it is public or set to Anyone with link can view 
var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/1/public/values?alt=json";
var terms = [];

$('#quiz').hide();
$('#results').hide();

$.getJSON(url, function(data) {
  var items = data.feed.entry;
  items.forEach(function(item) {
    var term = item.title.$t.replace(/\s+$/, '');
    var definition = item.content.$t.slice(8).replace(/\s+$/, '');
    
    if (term && term != 'TERM' && definition && definition != 'DEFINITION' ) {
      terms.push({
        term: term,
        definition: definition
      });
    }
  });
  $('#start').on('click', function() {
    $(this).hide();
    startQuiz();
  })
});


function startQuiz() {
  $('#quiz').show();
  $('#start').on('click', startQuiz);
  $('#options').on('click', '.option', calculateResult);
  $('#next').on('click', nextQuestion);

  var waitingForAnswer = true;
  var currentQuestion = 0;  
  var rightAnswers = [];
  var wrongAnswers = [];

  function calculateResult(e) {
    var chosenAnswer = $(e.target).text();
    if (waitingForAnswer) {
      if (chosenAnswer === terms[currentQuestion].definition) {
        $(this).addClass('right');
        rightAnswers.push(terms[currentQuestion]);
      } else {
        $(this).addClass('wrong');
        wrongAnswers.push(terms[currentQuestion]);
      }
      waitingForAnswer = false;
    }
  }

  function updateStatus() {
    $('#current').text(currentQuestion + 1);
  }

  $('.total').text(terms.length);

  function firstQuestion() {
    updateStatus();
    var currentTerm = terms[currentQuestion];
    $('#term').text(currentTerm.term);
    findAnswers(currentTerm);
  }
  firstQuestion();

  function nextQuestion() {
    if (waitingForAnswer == false) {
      if ((currentQuestion + 1) < terms.length) {
        waitingForAnswer = true;
        currentQuestion += 1;
        updateStatus();
        var currentTerm = terms[currentQuestion]
        $('#term').text(currentTerm.term);
        findAnswers(currentTerm);
      } else {
        displayResults();
      }
    }
  }

  function findAnswers(currentTerm) {
    $('#options').empty();
      var otherAnswers = findOtherAnswers(currentTerm);
      otherAnswers.push(currentTerm);
      var allAnswers = shuffle(otherAnswers);
      allAnswers.forEach(function(answer){
        var option = $('<div class="option"></div>');
        option.text(answer.definition);
        $('#options').append(option);
      });
  }

  function displayResults() {
    $('#quiz').hide();
    $('#results').show();
    $('#total-right').text(rightAnswers.length);
    // console.log(rightAnswers);
    // rightAnswers.forEach(function(answer){
    //   console.log(answer);
    //   var answerDiv = $('<div></div>');
    //   answerDiv.append($('<div class="term">' + answer.term + '</div>'));
    //   answerDiv.append($('<div class="definition">' + answer.definition + '</div>'));
    //   $('#right-terms').append(answerDiv);
    // });
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function findOtherAnswers(term) {
  var otherAnswers = [];
  while (otherAnswers.length < 3) {
    var index = getRandomInt(0, terms.length);
    var term2 = terms[index];
    if (term != term2) {
      otherAnswers.push(term2)
    }
  }
  return otherAnswers;
}