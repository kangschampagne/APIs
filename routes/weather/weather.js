var request = require('request');
var express = require('express');

var router = express.Router();

var weather = {
    weatherStatus: "",
    weatherMsg: "",
    date: "",
    location: {
        locationCity: "", //精确地点
        currentCity: "",
        longitude: "",
        latitude: ""
    },
    result: [{
        "currentCity": "",
        "pm25": "",
        "prompt": [{
            "title": "",
            "zs": "",
            "tipt": "",
            "des": ""
        }]
    }],
    currentWeather: "",
    weather_data: [{
        "date": "",
        // "dayPictureUrl" : "",
        // "nightPictureUrl" : "",
        "weather": "",
        "wind": "",
        "temperature": ""
    }],
    sun_data: [
        //     {
        //     "sunrise": "",
        //     "sunset": "",
        //     "solar_noon": "",
        //     "day_length_second": "",
        //     "day_length_format": ""
        // }
    ]
};

// var weather = {};

router.get('/:longitude/:latitude', function (req, res) {

    var _res = res;
    var latitude = req.params.latitude;
    var longitude = req.params.longitude;

    console.log(longitude, latitude);

    //依据经纬度，获取 实时天气情况
    var weather_options = {
        url: "http://api.map.baidu.com/telematics/v3/weather?location=" +
        longitude +  //经度 longitude
        "," +
        latitude +  //纬度 latitude
        "&output=json&ak=xwc9G09wF4vnWXVtm5WrXhf4KSbtPGiy",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.113 Safari/537.36",
            "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
        }
    };

    var location_options = {
        url: "http://api.map.baidu.com/geocoder/v2/?ak=xwc9G09wF4vnWXVtm5WrXhf4KSbtPGiy&location=" +
        latitude +
        "," +
        longitude +
        "&output=json&pois=1",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.113 Safari/537.36",
            "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
        }
    };

    var sun_options = {
        url: "",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.113 Safari/537.36",
            "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
        }
    };

    var next_sun_options = {
        url: "",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.113 Safari/537.36",
            "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
        }
    };

    request(weather_options, function (err, res, body) {

        if (!err && res.statusCode == 200) {
            try {
                var weather_parse = JSON.parse(body);
                weather.weatherStatus = "success";
                weather.weatherMsg = "GET_WEATHER_SUCCESS";

                //date
                weather.date = weather_parse.date;
                //location
                weather.location.locationCity = weather_parse.results[0].currentCity;
                weather.location.latitude = latitude;
                weather.location.longitude = longitude;
                //result
                // weather.result[0].currentCity = ""; //精確定位
                try {
                    weather.result[0].pm25 = weather_parse.results[0].pm25;
                } catch (err) {
                    weather.weatherStatus = "success";
                    weather.weatherMsg = "NONE_PM25";
                }
                try {
                    var result_index = weather_parse.results[0].index[0];
                    weather.result[0].prompt[0].title = result_index.title;
                    weather.result[0].prompt[0].zs = result_index.zs;
                    weather.result[0].prompt[0].tipt = result_index.tipt;
                    weather.result[0].prompt[0].des = result_index.des;
                } catch (err) {
                    weather.weatherStatus = "success";
                    weather.weatherMsg = "NONE_PROMPT";
                }
                //weather_data
                try {
                    var weatherdetail = [];
                    var weather_day = weather_parse.results[0].weather_data;
                    weather.currentWeather = weather_day[0].date.split("(实时：")[1].split("℃)")[0];
                    for (var i = 0; i < weather_day.length; i++) {
                        var day_detail = {};
                        day_detail.date = weather_day[i].date;
                        day_detail.weather = weather_day[i].weather;
                        day_detail.dayPictureUrl = selectdayPicUrl(day_detail.weather);
                        day_detail.nightPictureUrl = selectnightPicUrl(day_detail.weather);
                        day_detail.wind = weather_day[i].wind;
                        day_detail.temperature = weather_day[i].temperature;
                        weatherdetail.push(day_detail);
                    }
                    weather.weather_data = weatherdetail;
                } catch (err) {
                    weather.weatherStatus = "success";
                    weather.weatherMsg = "NONE_WEATHER_DETAIL";
                }
            } catch (err) {
                weather.weatherStatus = "fail";
                weather.weatherMsg = "LAT_OR_LNG_ERROR_WEATHER";
            }

        } else {
            weather.weatherStatus = "fail";
            weather.weatherMsg = "SEVER_ERROR";
        }

        request(location_options, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                try {
                    //精确定位
                    var location_parse = JSON.parse(body);
                    weather.location.currentCity = location_parse.result.formatted_address;
                    weather.result[0].currentCity = location_parse.result.formatted_address;
                } catch (err) {
                    weather.weatherStatus = "fail";
                    weather.weatherMsg = "LAT_OR_LNG_ERROR_LOCATION";
                }
            } else {
                weather.weatherStatus = "fail";
                weather.weatherMsg = "SEVER_ERROR";
            }

            //当天日出日落
            sun_options.url = "http://api.sunrise-sunset.org/json?" +
                "lat=" + latitude +
                "&lng=" + longitude +
                "&date=" + weather.date +
                "&formatted=0";

            request(sun_options, function (err, res, body) {

                if (!err && res.statusCode == 200) {
                    weather.sun_data = [];
                    try {
                        var sun_parse = JSON.parse(body).results;
                        var sun_data = {};
                        //sun_data
                        sun_data.sunrise = time_zone(sun_parse.sunrise);
                        sun_data.sunset = time_zone(sun_parse.sunset);
                        sun_data.solar_noon = time_zone(sun_parse.solar_noon);
                        sun_data.day_length_second = sun_parse.day_length;
                        sun_data.day_length_format = formatSeconds(sun_parse.day_length);
                        weather.sun_data.push(sun_data);
                    } catch (err) {
                        weather.weatherStatus = "fail";
                        weather.weatherMsg = "LAT_OR_LNG_ERROR_SUN";
                    }
                } else {
                    weather.weatherStatus = "fail";
                    weather.weatherMsg = "SEVER_ERROR";
                }


                //下一天日出日落
                var weather_date_prame = weather.date.split("-");
                var next_date = weather_date_prame[0] + "-" + weather_date_prame[1] + "-" + (Number(weather_date_prame[2]) + 1).toString();
                next_sun_options.url = "http://api.sunrise-sunset.org/json?" +
                    "lat=" + latitude +
                    "&lng=" + longitude +
                    "&date=" + next_date +
                    "&formatted=0";

                request(next_sun_options, function (err, res, body) {
                    if (!err && res.statusCode == 200) {
                        try {
                            var next_sun_parse = JSON.parse(body).results;
                            var next_sun_data = {};
                            //sun_da
                            next_sun_data.sunrise = time_zone(next_sun_parse.sunrise);
                            next_sun_data.sunset = time_zone(next_sun_parse.sunset);
                            next_sun_data.solar_noon = time_zone(next_sun_parse.solar_noon);
                            next_sun_data.day_length_second = next_sun_parse.day_length;
                            next_sun_data.day_length_format = formatSeconds(next_sun_parse.day_length);
                            weather.sun_data.push(next_sun_data);
                        } catch (err) {
                            weather.weatherStatus = "fail";
                            weather.weatherMsg = "LAT_OR_LNG_ERROR_NEXTSUN";
                        }
                    } else {
                        weather.weatherStatus = "fail";
                        weather.weatherMsg = "SEVER_ERROR";
                    }

                    _res.jsonp(weather);
                    // weather = {};
                    // console.log(weather);
                });

            });
        });

    });

});

//时区处理
function time_zone(data) {
    var data_ymd = data.split("T")[0].split("-"),
        data_gms = data.split("T")[1].split("+")[0].split(":");
    var data_filter = {};
    data_filter.year = NumbertoString(Number(data_ymd[0]));
    data_filter.month = NumbertoString(Number(data_ymd[1]));
    data_filter.day = Number(data_ymd[2]);
    data_filter.hour = Number(data_gms[0]);
    data_filter.minute = NumbertoString(Number(data_gms[1]));
    data_filter.second = NumbertoString(Number(data_gms[2]));

    if (data_filter.hour >= 16) {
        data_filter.day = NumbertoString(data_filter.day + 1);
        data_filter.hour = NumbertoString(8 - (24 - data_filter.hour));
    } else {
        data_filter.day = NumbertoString(data_filter.day);
        data_filter.hour = NumbertoString(8 + data_filter.hour);
    }

    function NumbertoString(num) {
        return num < 10 ? "0" + num.toString() : num.toString();
    }

    return data_filter;
}
//秒時转换
function formatSeconds(value) {
    var theTime = parseInt(value);// 秒
    var theTime1 = 0;// 分
    var theTime2 = 0;// 小时
    // alert(theTime);
    if (theTime > 60) {
        theTime1 = parseInt(theTime / 60);
        theTime = parseInt(theTime % 60);
        // alert(theTime1+"-"+theTime);
        if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60);
            theTime1 = parseInt(theTime1 % 60);
        }
    }
    var result = "" + parseInt(theTime);
    if (theTime1 > 0) {
        result = "" + parseInt(theTime1) + ":" + result;
    }
    if (theTime2 > 0) {
        result = "" + parseInt(theTime2) + ":" + result;
    }
    return result;
}

//天气图标获取
var selectPicUrl = "http://roundups.roundups.top/weather_icon/";
function selectdayPicUrl(weather) {
    switch (weather) {
        case "晴" :
            return selectPicUrl + "Weather_day_sunny.png";
            break;
        case "多云" :
            return selectPicUrl + "Weather_day_cloudy.png";
            break;
        case "阴" :
            return selectPicUrl + "Weather_day_overcast.png";
            break;
        case "阵雨" :
            return selectPicUrl + "Weather_day_showers.png";
            break;
        case "雷阵雨" :
            return selectPicUrl + "Weather_day_thunderstorm.png";
            break;
        case "小雨" :
            return selectPicUrl + "Weather_day_light_rain.png";
            break;
        case "中雨" :
            return selectPicUrl + "Weather_day_moderate_rain.png";
            break;
        case "大雨" :
            return selectPicUrl + "Weather_day_heavy_rain.png";
            break;
        case "暴雨" :
            return selectPicUrl + "Weather_day_rainstorm.png";
            break;
        case "大暴雨" :
            return selectPicUrl + "Weather_day_heavy_rainstorm.png";
            break;
        case "特大暴雨" :
            return selectPicUrl + "Weather_day_extraordinary_rainstorm.png";
            break;
        case "阵雪" :
            return selectPicUrl + "Weather_day_snow_shower.png";
            break;
        case "小雪" :
            return selectPicUrl + "Weather_day_light_snow.png";
            break;
        case "中雪" :
            return selectPicUrl + "Weather_day_moderate_snow.png";
            break;
        case "大雪" :
            return selectPicUrl + "Weather_day_heavy_snow.png";
            break;
        case "暴雪" :
            return selectPicUrl + "Weather_day_snowstorm.png";
            break;
        case "雾" :
            return selectPicUrl + "Weather_day_fog.png";
            break;
        case "冻雨" :
            return selectPicUrl + "Weather_day_ice_rain.png";
            break;
        case "沙尘暴" :
            return selectPicUrl + "Weather_day_.png";
            break;
        default :
            return selectPicUrl + "Weather_day_.png";
    }
}
function selectnightPicUrl(weather) {
    switch (weather) {
        case "晴" :
            return selectPicUrl + "Weather_night_sunny.png";
            break;
        case "多云" :
            return selectPicUrl + "Weather_night_cloudy.png";
            break;
        case "阴" :
            return selectPicUrl + "Weather_night_overcast.png";
            break;
        case "阵雨" :
            return selectPicUrl + "Weather_night_showers.png";
            break;
        case "雷阵雨" :
            return selectPicUrl + "Weather_night_thunderstorm.png";
            break;
        case "小雨" :
            return selectPicUrl + "Weather_night_light_rain.png";
            break;
        case "中雨" :
            return selectPicUrl + "Weather_night_moderate_rain.png";
            break;
        case "大雨" :
            return selectPicUrl + "Weather_night_heavy_rain.png";
            break;
        case "暴雨" :
            return selectPicUrl + "Weather_night_rainstorm.png";
            break;
        case "大暴雨" :
            return selectPicUrl + "Weather_night_heavy_rainstorm.png";
            break;
        case "特大暴雨" :
            return selectPicUrl + "Weather_night_extraordinary_rainstorm.png";
            break;
        case "阵雪" :
            return selectPicUrl + "Weather_night_snow_shower.png";
            break;
        case "小雪" :
            return selectPicUrl + "Weather_night_light_snow.png";
            break;
        case "中雪" :
            return selectPicUrl + "Weather_night_moderate_snow.png";
            break;
        case "大雪" :
            return selectPicUrl + "Weather_night_heavy_snow.png";
            break;
        case "暴雪" :
            return selectPicUrl + "Weather_night_snowstorm.png";
            break;
        case "雾" :
            return selectPicUrl + "Weather_night_fog.png";
            break;
        case "冻雨" :
            return selectPicUrl + "Weather_night_ice_rain.png";
            break;
        case "沙尘暴" :
            return selectPicUrl + "Weather_night_.png";
            break;
        default :
            return selectPicUrl + "Weather_night_.png";
    }
}
module.exports = router;