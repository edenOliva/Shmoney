let myCoins = [];
let checks = [];

$('document').ready(function () {
  $("#spinnerDiv").show();
  getCoins();
  $("#spinnerDiv").hide();
});

// ------------- home -------------

$("#homeLink").on("click", function(){
  $('#homeDiv').show();
  $("#aboutDiv").hide();
  $("#liveReportsDiv").hide();
});

function getCoins() {

  let localCoins = localStorage.getItem("localCoins");

  if (!localCoins) {
    fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
    )
      .then((data) => data.json())
      .then((coins) => renderCoins(coins))
      .catch((error) => console.log(error));
  } else {
    let coins = JSON.parse(localCoins);
    renderCoins(coins);
  }
  $("#spinnerDiv").hide();
}

function renderCoins(coins) {
  $("#homeDiv").show();
  $("#aboutDiv").hide();
  $("#liveReportsDiv").hide();
  $("#spinnerDiv").show();

  myCoins = [];

  $.each(coins, function (i, coin) {
    let btnId = coin.name.split(" ").join("");

    $("#homeDiv").append(`<div id="${i}" class="cardDiv">
            <div>
              <div class="form-check form-switch checkBtn">
                <input id="${
                  coin.id
                }Input" onchange="reportCheck(${i})" class="form-check-input" type="checkbox" >
              </div>
              <img class="coinDivImg mb-2" src="${coin.image}" alt="oops..."/>
              <h5 value="${coin.symbol}" class="card-title">${coin.symbol}</h5>
              <p class="card-text">${coin.name}</p> 
              <button id="${btnId}Btn" data-toggle="collapse"
              class="btn btn-outline-primary cardBtn" onClick="readMore(${i} , ${`${btnId}Btn`})">see more</button>
            </div>
            `);

    myCoins.push(coin);
  });

  localStorage.setItem("localCoins", JSON.stringify(myCoins));
  $("#spinnerDiv").hide();
}

// ------------- about -------------

$("#aboutLink").on("click", function () {
  $("#homeDiv").hide();
  $("#liveReportsDiv").hide();
  $("#aboutDiv").show();
});

// ------------- live reports -------------

let urlCoins;

$("#liveReportsLink").on("click", function () {
  $("#spinnerDiv").show();
  $("#homeDiv").hide();
  $("#aboutDiv").hide();
  $("#liveReportsDiv").show();


if (checks.length > 0 ){
  $('#liveReportsDiv p').hide();
  getCoinsPrice();
} else {
  $('#liveReportsDiv p').show();
  $("#chartContainer").html("");
  $("#spinnerDiv").hide();
}
$("#spinnerDiv").hide();

});

function getCoinsPrice () {
  
  let myChecks = [];

  $.each(checks , function (i){
      let myCheck = (checks[i].symbol).toUpperCase();
      myChecks.push(myCheck);
  })

  urlCoins = myChecks.join();

  fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${urlCoins}&tsyms=USD`)
  .then((data) => data.json())
  .then(coinsData => renderChart(coinsData))
  .catch(error => console.log(error))

}

function renderChart (coinsData) {
  $("#spinnerDiv").show();
  let options = {
    title: {
      text: urlCoins + " - USD Comparison"              
    },

    animationEnabled: true,

    data: [              
    {type: "column",
      dataPoints: []}
    ]
  };
  let coinObject = coinsData;

  $.each(coinObject , function(key, value){
    
    options.data[0].dataPoints.push({
      yValueFormatString: "#,###.#### $",
      label: `${key}` , y: value.USD})
  });

  $("#chartContainer").CanvasJSChart(options);

  $("#spinnerDiv").hide();
}


// ------------- search -------------

$("#searchInput").on("keyup", function () {
  searchValue = $(this).val().toLowerCase();
  findCoin(searchValue);
});

function findCoin(searchValue) {
  $.each(myCoins, function (i, coin) {
    const isVisible =
      coin.symbol.toLowerCase().includes(searchValue) ||
      coin.name.toLowerCase().includes(searchValue);
    $(`#${i}`).toggleClass("hide", !isVisible);
  });
}

// ------------- read more -------------

function readMore(i, btn) {
  $("#homeDiv").addClass("blur");
  $("#spinnerDiv").show();

  let coins = JSON.parse(localStorage.getItem("localCoins"));
  $(btn).attr("data-target", `#coinInfo${coins[i].name}`);

  let seeMoreDiv = $(`#${i}`);
  let thisCoin = JSON.parse(localStorage.getItem(`local${coins[i].id}`));
  let coinToFind = coins[i].id;

  if (thisCoin == null) {
    fetchCoin(coinToFind, seeMoreDiv);
  } else {
    if (new Date() - new Date(thisCoin.coinTime) > 120000) {
      fetchCoin(coinToFind, seeMoreDiv);
    } else {
      moreInfo(thisCoin, seeMoreDiv);
    }
  }
}

function fetchCoin(coinToFind, seeMoreDiv) {
  fetch(`https://api.coingecko.com/api/v3/coins/${coinToFind}`)
    .then((data) => data.json())
    .then((coinInfo) => moreInfo(coinInfo, seeMoreDiv))
    .catch((error) => console.log(error));
}

function moreInfo(coinInfo, seeMoreDiv) {
  const btnId = coinInfo.name.split(" ").join("");
  if ($(`#${btnId}Btn`).text() == "see more") {
    seeMoreDiv.append(`<div id="coinInfo${btnId}" class="collapse">
    <div class="card-body infoDiv ">
    <p>Current price: </p> 
      <ul>
        <li> ${coinInfo.market_data.current_price.usd}&dollar;</li>
        <li>${coinInfo.market_data.current_price.eur}&euro;</li>
        <li>${coinInfo.market_data.current_price.ils}&#8362;</li>
      </ul>
      </div>
    </div>`);

    coinInfo.coinTime = new Date();
    localStorage.setItem(`local${coinInfo.id}`, JSON.stringify(coinInfo));

    $(`#${btnId}Btn`).text("close");
    $("#spinnerDiv").hide();
    $("#homeDiv").removeClass("blur");
    $(".collapse").collapse();
  } else {
    $(`#coinInfo${btnId}`).remove();

    $(`#${btnId}Btn`).text("see more");
    $("#spinnerDiv").hide();
    $("#homeDiv").removeClass("blur");
  }
}
// ------------- checkbox popup-------------

let coinNumber6 = {};

function reportCheck(i) {
  let localCoins = localStorage.getItem("localCoins");
  let coins = JSON.parse(localCoins);
  let coin = coins[i];
  let id = coin.id;

  if (event.target.checked) {
    if (checks.length >= 0 && checks.length < 5) {
      checks.push(coin);
    } else {
      $("#coinNumber6Div").append(
        `If you want to add '${id}' to you'r list, <br>`
      );
      $("#homeDiv").addClass("blur");
      $.each(checks, function (i) {
        $("#coinsCheckList").append(` <br>
        <input id="${checks[i].id}popInput" name="popCheck" value="${checks[i].id}" class="form-check-input " type="radio" checked>
            <img src="${checks[i].image}" alt="..." class="popupImg"> </input>
            <label for="${checks[i].id}popInput">${checks[i].name}</label>`);
      });

      $("#modal").show();
      coinNumber6 = coin;
    }
  } else {
    let indexCheck = checks.findIndex((x) => x.id === id);
    checks.splice(indexCheck, 1);
  }
}

function doIt() {
  $.each($("input[name='popCheck']"), function () {
    if (this.checked === true) {
      $(`#${this.value}Input`).prop("checked", false);
    }
  });

  checkChecks();
  $("#coinsCheckList").html("");
  $("#coinNumber6Div").html("");
  $("#modal").hide();
  $("#homeDiv").removeClass("blur");

  function checkChecks() {
    $.each(checks, function (i) {
      if (!$(`#${checks[i].id}Input`).is(":checked")) {
        checks.splice(i, 1);
        checks.push(coinNumber6);
      }
    });
  }
}

$("#popupCloseBtn").on("click", function () {
  $(`#${coinNumber6.id}Input`).prop("checked", false);
  $("#coinsCheckList").html("");
  $("#coinNumber6Div").html("");
  $("#modal").hide();
  $("#homeDiv").removeClass("blur");
});
