/* поиск всех необходимых элементов DOM */
let locInput = document.querySelector('.search__location_input');
let locBtn = document.querySelector('.search__location_btn');
let locDot = document.querySelector('.fa-location-dot');
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
let weatherConditionAll = illustration.querySelectorAll('.illustration__weather-condition');
let weatherConditionSun = illustration.querySelector('.sun');
let weatherConditionMoon = illustration.querySelector('.moon');
let weatherConditionCloud = illustration.querySelector('.cloud');
let weatherConditionMist = illustration.querySelector('.mist');
let weatherConditionRain = illustration.querySelector('.rain');
let weatherConditionSnow = illustration.querySelector('.snow');
let weatherConditionThunder = illustration.querySelector('.thunder');

/* 2-ая группа облаков летающих над иллюстрацией */
let illustrationClouds2 = illustrationClouds.cloneNode(true);
illustrationClouds2.classList.remove('clouds-0');
illustrationClouds2.classList.add('clouds-1');
illustrationClouds2.style.animationDelay = '25s';
illustration.append(illustrationClouds2);

/* вызов функции определения координат города по умолчанию */
let city = "Москва";
locInput.value = city;
getCoordsCity(city)

/* вызов функции определения координат по названию населенного пункта */
locBtn.addEventListener('click', (e) => {
  city = locInput.value;
  coords = getCoordsCity(city);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && locInput.value !== '') {
    city = locInput.value;
    coords = getCoordsCity(city);
  }
})

/* определение текущего местоположения устройства пользователя.
  Примечание: запрос на получение названия города реализован, в связи с тем, что сервис openweather при непосредственной передаче координат устройства определяет название населенного пункта с большой погрешностью */
locDot.addEventListener('click', (e) => {
    navigator.geolocation.getCurrentPosition(position => {
      let {coords: {latitude, longitude}} = position;

      fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&appid=43bc780361de917fc7e7b8f889aee2ca`)
        .then(resp => resp.json())
        .then(data => {
          let {local_names: {ru, en}, name} = data[0];
          if(ru) {
            getCoordsCity(ru);
          } else if(en) {
            getCoordsCity(en);
          } else {
            getCoordsCity(name);
          }
        })
    });
})

/* получение координат по названию города */
function getCoordsCity(city) {
  fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=43bc780361de917fc7e7b8f889aee2ca&lang=ru`)
    .then(resp => resp.json())
    .then(data => {
      let {lat, lon} = data[0];
      getWeather(lat, lon);
    })
    .catch((error) => {
      console.log(error);
      alert(
        `Похоже, что такого города, ${locInput.value}, нет.
        Попробуйте еще раз!`
      )
    })
}

/* получение погодных данных по координатам */
function getWeather(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=43bc780361de917fc7e7b8f889aee2ca&units=metric&lang=ru`)
    .then(resp => resp.json())
    .then(data => {
      locInput.value = data.name;

      /* функция для расчета местного времени, а также восхода и заката солнца относительно него*/
      function getLocalTime(data, timezone, fullDate) {
        let date = new Date()
        function zeroBeforeDigit(number) {
          return number<10?`0${number}`:`${number}`
        }
        date.setTime(data * 1000)
        
        let minutes = zeroBeforeDigit(date.getUTCMinutes());
        let hours = date.getUTCHours() + timezone / 3600;
        if (hours<0) {
          hours += 24;
        } else if(hours>24) {
          hours -= 24;
        }
        hours = zeroBeforeDigit(hours);
        
        
        
        if(fullDate) {
          let day = zeroBeforeDigit(date.getUTCDate());
          let month = zeroBeforeDigit(date.getUTCMonth() + 1);
          let year = date.getUTCFullYear();
          return `${hours}:${minutes}, ${day}.${month}.${year}`;
        } else {
          return `${hours}:${minutes}`;
        }
      }
      /* вывод времени на которое произведены расчеты, времени восхода и заката солнца */
      timeDataCalculation.textContent = getLocalTime(data.dt, data.timezone, true);
      sunrise.textContent = getLocalTime(data.sys.sunrise, data.timezone);
      sunset.textContent = getLocalTime(data.sys.sunset, data.timezone)
      
      /* определение текущего времени суток */
      if (data.dt>=data.sys.sunrise && data.dt<=data.sys.sunset) {
        timesOfDay = 'day';
        illustrationLand.style.filter = '';
        illustrationClouds.style.filter = '';
        illustrationClouds2.style.filter = '';

      } else {
        timesOfDay = 'night';
        illustrationLand.style.filter = 'brightness(50%)';
        illustrationClouds.style.filter = 'brightness(50%)';
        illustrationClouds2.style.filter = 'brightness(50%)';
      }

      /* вывод метероологических данных */
      temperature.textContent = `${Math.round(data.main.temp)}°C`;
      feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
      
      humidity.textContent = `${data.main.humidity}%`
      if (!Number.isInteger(data.visibility / 1000)) {
        visibility.textContent = `${(data.visibility / 1000).toFixed(3)}км.`;
      } else {
        visibility.textContent = `${data.visibility / 1000}км.`;
      }
      
      wind.textContent = `${data.wind.speed}м/сек.`;
      windArrow.style.transform = `rotate(${data.wind.deg + 180}deg)`;

      if(data.main.grnd_level) {
        atmospherePressure.textContent = `${Math.round(data.main.grnd_level * 0.750062)}мм.рт.ст.`;
      } else {
        if(document.documentElement.clientWidth >= 768) {
          atmospherePressure.parentElement.style.maxWidth = `270px`;
          atmospherePressure.parentElement.style.textAlign = `right`;
        }
        atmospherePressure.innerHTML = ` на уровне моря ${Math.round(data.main.pressure * 0.750062)}мм.рт.ст.`;
      }
      
      /* отображение текущих погодных условий */
      weatherConditionAll.forEach(e => {
        e.style.display = 'none';
      });
      switch (data.weather[0].main) {
        case 'Clear':
          if (timesOfDay === 'day') {
            weatherConditionSun.style.display = 'block';
          } else {
            weatherConditionMoon.style.display = 'block';
          }
          break;
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
          break;
        case 'Mist':
        case 'Smoke':
        case 'Haze':
        case 'Fog':
        case 'Sand':
        case 'Ash':
        case 'Squall':
        case 'Tornado':
        case 'Dust':
          weatherConditionMist.style.display = 'block';
          break;
      }
    })
    .catch((error) => {
      console.log(error);
    })
}