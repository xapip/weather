// 43bc780361de917fc7e7b8f889aee2ca - API key
// https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key} - API weather
// http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key} - API city

let city = 'Orenburg';
let country = 'ru'

let locInput = document.querySelector('.search__location_input');
let locBtn = document.querySelector('.search__location_btn');
let timeDataCalculation = document.querySelector('.time-data-calculation__value');
let temperature = document.querySelector('.temperature__value');
let feelsLike = document.querySelector('.feelsLike__value');
let sunrise = document.querySelector('.data__sunrise-value');
let sunset = document.querySelector('.data__sunset-value');
let sunriseSunset = document.querySelectorAll('.sunriseSunset');
let humidity = document.querySelector('.data__humidity-value');
let visibility = document.querySelector('.data__visibility-value');
let wind = document.querySelector('.data__wind-value');
let windArrow = document.querySelector('.fa-arrow-up');
let atmospherePressure = document.querySelector('.data__atmosphere-pressure-value');

let illustration = document.querySelector('.illustration');
let illustrationLand = illustration.querySelector('.illustration__land');
let illustrationClouds = illustration.querySelector('.illustration__clouds');
let weatherConditionSun = illustration.querySelector('.sun');
let weatherConditionMoon = illustration.querySelector('.moon');
let weatherConditionCloud = illustration.querySelector('.cloud');
let weatherConditionMist = illustration.querySelector('.mist');
let weatherConditionRain = illustration.querySelector('.rain');
let weatherConditionSnow = illustration.querySelector('.snow');
let weatherConditionThunder = illustration.querySelector('.thunder');


function coordsCity(city, country) {
  fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=3&appid=43bc780361de917fc7e7b8f889aee2ca&lang=ru`)
    .then(resp => resp.json())
    .then(data => {
      console.log(data[0]);
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${data[0].lat}&lon=${data[0].lon}&appid=43bc780361de917fc7e7b8f889aee2ca&units=metric&lang=ru`)
        .then(resp => resp.json())
        .then(data => {
          console.log(data);

          function getTime(data, fullDate) {
            let date = new Date();

            function zeroBeforeDigit(number) {
              return number<10?`0${number}`:`${number}`
            }

            date.setTime(data * 1000)

            let day = zeroBeforeDigit(date.getDate());
            let month = zeroBeforeDigit(date.getMonth() + 1);
            let year = date.getFullYear();
            let hours = zeroBeforeDigit(date.getHours());
            let minutes = zeroBeforeDigit(date.getMinutes());

            return `${hours}:${minutes}, ${day}.${month}.${year}`;
          }

          // date.setTime(data.dt * 1000)
          timeDataCalculation.textContent = /* `${hours}:${minutes}, ${day}.${month}.${year}` */getTime(data.dt, true);

          temperature.textContent = `${Math.round(data.main.temp)}°C`;
          feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;

          /* date.setTime(data.sys.sunrise * 1000);
          console.log(date);
          hours = zeroBeforeDigit(date.getHours());
          minutes = zeroBeforeDigit(date.getMinutes()); */
          sunrise.textContent = getTime(data.sys.sunrise, false);
          sunset.textContent = getTime(data.sys.sunset, false);

          humidity.textContent = `${data.main.humidity}%`;

          if (!Number.isInteger(data.visibility / 1000)) {
            visibility.textContent = `${(data.visibility / 1000).toFixed(3)}км.`;
          } else {
            visibility.textContent = `${data.visibility / 1000}км.`;
          }

          wind.textContent = `${data.wind.speed}м/сек.`;
          windArrow.style.transform = `rotate(${data.wind.deg + 180}deg)`;

          if(!data.main.grnd_level) {
            atmospherePressure.textContent = `${Math.round(data.main.grnd_level * 0.750062)}мм.рт.ст.`;
          } else {
            if(document.documentElement.clientWidth >= 768) {
              atmospherePressure.parentElement.style.maxWidth = `270px`;
              atmospherePressure.parentElement.style.textAlign = `right`;
            }
            atmospherePressure.innerHTML = ` на уровне моря ${Math.round(data.main.pressure * 0.750062)}мм.рт.ст.`;
          }

          switch (data.weather[0].main) {
            /* case 'Clear':
              weatherConditionSun.style.display = 'block';
              break; */
            case 'Clouds':
              switch (data.weather[0].id) {
                case 801:
                  weatherConditionSun.style.display = 'block';
                  weatherConditionCloud.style.display = 'block';
                  break;
                case 802:
                  weatherConditionCloud.style.display = 'block';
                  break;
                case 803:
                  weatherConditionCloud.style.display = 'block';
                  break;
                case 804:
                  weatherConditionCloud.style.display = 'block';
                  break;
              }
              break;
            case 'Snow':
              weatherConditionCloud.style.display = 'block';
              weatherConditionSnow.style.display = 'block';
              break;
            case 'Rain':
            case 'Drizzle':
              weatherConditionCloud.style.display = 'block';
              weatherConditionRain.style.display = 'block';
              if(data.weather[0].id === 511){
                weatherConditionSnow.style.display = 'block';
              }
              break;
            case 'Thunderstorm':
              weatherConditionCloud.style.display = 'block';
              weatherConditionThunder.style.display = 'block';
          }
        })
        .catch((error) => {
          console.log(error);
        })
    })
    .catch((error) => {
      console.log(error);
    })
}

coordsCity(city, country)