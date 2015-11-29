// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* global mainPage, deviceList, refreshButton */
/* global detailPage, resultDiv, messageInput, sendButton, disresultdiv */
/* global ble  */
/* jshint browser: true , devel: true*/
// 'use strict';

// ASCII only
// var currentWeather;
// var cityName;

var deviceId;

var title = "";
var type = "";
var category = "";
var topic = [];
var people = [];
var month = 11;
var day = 1;
var period = false;
var startH = 0;
var startM = 0;
var endH = 0;
var endM = 0;
var emotion = "";
var description = "";
var language = "";
var shared = false;
var audience = [];
var media = [];
var feedback = "";
var resource = [];
var attitude = "";
var reason = "";
var url = "";
var tookAction = false;
var action = "";
var finished = true;

function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

function sendMsg(message) {
    console.log("start send");
    var success = function() {
        console.log("success");
        resultDiv.innerHTML = "";
        resultDiv.scrollTop = resultDiv.scrollHeight;
    };

    var failure = function(err) {
        alert("Failed writing data to the bluefruit le");
        console.log(err);

    };

    console.log(message);
    ble.writeWithoutResponse(deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes(message), success, failure);
    console.log("send!");
}

// this is Nordic's UART service
var bluefruit = {
    serviceUUID: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
    txCharacteristic: "6E400002-B5A3-F393-E0A9-E50E24DCCA9E", // transmit is from the phone's perspective
    rxCharacteristic: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E" // receive is from the phone's perspective
};

var app = {
    initialize: function() {
        alert("init");
        this.bindEvents();
        mainPage.hidden = true;
        detailPage.hidden = false;
        $("#input-category-other").hide();
        $('#input-endH').hide();
        $('#input-endM').hide();
        $("#input-emotion-other").hide();
        $('#input-audience').hide();
        $('#input-audience-btn').hide();
        $('#input-media').hide();
        $('#input-media-btn').hide();
        $('#input-feedback').hide();
        $("#input-attitude-other").hide();
        $('#input-action').hide();
        this.checkForm();
        //app.showDetailPage();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchend', this.refreshDeviceList, false);
        // sendButton.addEventListener('touchend', function() {
        //     cityName = $('#messageInput').val();
        //     if (cityName) {
        //         console.log(cityName);
        //     } else {
        //         cityName = "New York";
        //     }

        //     var url = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial";
        //     $.get(url, function(response) {
        //         // console.log(response.weather[0].description);
        //         if (response.weather[0].id >= 800 && response.weather[0].id < 900) {
        //             currentWeather = 'c';
        //         } else if (response.weather[0].id >= 300 && response.weather[0].id < 600) {
        //             currentWeather = 'z';
        //         } else if (response.weather[0].id >= 900 && response.weather[0].id < 1000) {
        //             currentWeather = 'w';
        //         } else {
        //             currentWeather = 'r';
        //         }
        //         console.log(currentWeather);
        //         $("#resultDiv").html("Weather in " + cityName + " is " + response.weather[0].description + ".");
        //         $("#messageInput").html("");
        //     });
        //     sendMsg(currentWeather);
        // }, false);
        //disconnectButton.addEventListener('touchend', this.disconnect, false);
        deviceList.addEventListener('touchend', this.connect, false); // assume not scrolling
        submitButton.addEventListener('touchend', this.submitForm, false);
        // offButton.addEventListener('touchend', function() {
        //     sendMsg("f");
        // }, false);
        // weatherButton.addEventListener('touchend', this.connectWeather, false);
        // icecreamButton.addEventListener('touchend', function() {
        //     sendMsg("i");
        // }, false);
        // movieButton.addEventListener('touchend', function() {
        //     sendMsg("h");
        // }, false);
        // coffeeButton.addEventListener('touchend', function() {
        //     sendMsg("b");
        // }, false);
        // beerButton.addEventListener('touchend', function() {
        //     sendMsg("r");
        // }, false);
        // backButton.addEventListener('touchend', this9.backDetail, false);

    },
    onDeviceReady: function() {
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        console.log("refresh");
        deviceList.innerHTML = ''; // empties the list
        if (cordova.platformId === 'android') { // Android filtering is broken
            ble.scan([], 5, app.onDiscoverDevice, app.onError);
        } else {
            ble.scan([bluefruit.serviceUUID], 5, app.onDiscoverDevice, app.onError);

        }
    },
    onDiscoverDevice: function(device) {
        console.log("device discovered");
        var listItem = document.createElement('li'),
            // html = '<b>' + device.name + '</b><br/>' +
            //     'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
            //     device.id;
            html = "Connect Dress";

        listItem.dataset.deviceId = device.id;
        listItem.innerHTML = html;
        listItem.id = 'dressButton';
        deviceList.appendChild(listItem);
    },
    connect: function(e) {
        console.log("connect");
        deviceId = e.target.dataset.deviceId,
            onConnect = function() {
                console.log("onConnect");
                // subscribe for incoming data
                ble.startNotification(deviceId, bluefruit.serviceUUID, bluefruit.rxCharacteristic, app.onData, app.onError);
                sendButton.dataset.deviceId = deviceId;
                disconnectButton.dataset.deviceId = deviceId;
                //app.showDetailPage();
            };

        ble.connect(deviceId, onConnect, app.onError);
    },
    onData: function(data) { // data received from Arduino
        console.log(data);
        // resultDiv.innerHTML = resultDiv.innerHTML + "Received: " + bytesToString(data) + "<br/>";
        // resultDiv.scrollTop = resultDiv.scrollHeight;
    },
    sendData: function(event) { // send data to Arduino

        var success = function() {
            console.log("success");
            // resultDiv.innerHTML = messageInput.value + "is raining";
            // resultDiv.scrollTop = resultDiv.scrollHeight;
        };

        var failure = function(err) {
            alert("Failed writing data to the bluefruit le");
            console.log(err);

        };

        var data = stringToBytes(messageInput.value);
        var deviceId = event.target.dataset.deviceId;
        ble.writeWithoutResponse(deviceId, bluefruit.serviceUUID, bluefruit.txCharacteristic, stringToBytes('e'), success, failure);
    },

    checkForm: function(event) {
        //type
        $('#input-type .btn').on("touchstart", function() {
            $('#input-type .btn').removeClass("active");
            $(this).addClass('active');
            type = this.innerHTML;
        });

        //category
        $('#input-category .btn').on("touchstart", function() {
            $('#input-category .btn').removeClass("active");
            $(this).addClass('active');
            if (this.innerHTML == "Other") {
                $("#input-category-other").show();
                category = "";
            } else {
                category = this.innerHTML;
                $("#input-category-other").hide();
            }
        });

        //topic
        $('#input-topic-btn .btn').on("touchstart", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                var removeIndex = topic.indexOf(this.innerHTML);
                topic.splice(removeIndex, 1);
                $('#input-topic').val(topic.toString());
                return;
            } else {
                $(this).addClass('active');
                topic.push(this.innerHTML);
                $('#input-topic').val(topic.toString());
            }
        });

        //people
        $('#input-people-btn .btn').on("touchstart", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                var removeIndex = people.indexOf(this.innerHTML);
                people.splice(removeIndex, 1);
                $('#input-people').val(topic.toString());
                return;
            } else {
                $(this).addClass('active');
                people.push(this.innerHTML);
                $('#input-people').val(people.toString());
            }
        });

        $('#input-month').val(11);

        //period
        $('#input-period').on("touchstart", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                period = false;
                $('#input-endH').hide();
                $('#input-endM').hide();
                return;
            } else {
                $(this).addClass('active');
                period = true;
                $('#input-endH').show();
                $('#input-endM').show();
            }
        });

        //emotion
        $('#input-emotion .btn').on("touchstart", function() {
            $('#input-emotion .btn').removeClass("active");
            $(this).addClass('active');
            if (this.innerHTML == "Other") {
                $("#input-emotion-other").show();
                emotion = "";
            } else {
                emotion = this.innerHTML;
                $("#input-emotion-other").hide();
            }
        });

        $('#input-language .btn').on("touchstart", function() {
            $('#input-language .btn').removeClass("active");
            $(this).addClass('active');
            language = this.innerHTML;
        });

        //shared
        $('#input-shared').on("touchstart", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                shared = false;
                $('#input-audience').hide();
                $('#input-audience-btn').show();
                $('#input-media').hide();
                $('#input-feedback').hide();
                $('#input-media-btn').hide();
                return;
            } else {
                $(this).addClass('active');
                shared = true;
                $('#input-audience').show();
                $('#input-audience-btn').show();
                $('#input-media').show();
                $('#input-media-btn').show();
                $('#input-feedback').show();
            }
        });

        //audience
        $('#input-audience-btn .btn').on("touchstart", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                var removeIndex = audience.indexOf(this.innerHTML);
                audience.splice(removeIndex, 1);
                $('#input-audience').val(audience.toString());
                return;
            } else {
                $(this).addClass('active');
                audience.push(this.innerHTML);
                $('#input-audience').val(audience.toString());
            }
        });

        //media
        $('#input-media-btn .btn').on("touchstart", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                var removeIndex = media.indexOf(this.innerHTML);
                media.splice(removeIndex, 1);
                $('#input-media').val(topic.toString());
                return;
            } else {
                $(this).addClass('active');
                media.push(this.innerHTML);
                $('#input-media').val(media.toString());
            }
        });

        //resource
        $('#input-resource-btn .btn').on("touchstart", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                var removeIndex = resource.indexOf(this.innerHTML);
                resource.splice(removeIndex, 1);
                $('#input-resource').val(topic.toString());
                return;
            } else {
                $(this).addClass('active');
                resource.push(this.innerHTML);
                $('#input-resource').val(resource.toString());
            }
        });

        //attitude
        $('#input-attitude .btn').on("touchstart", function() {
            $('#input-attitude .btn').removeClass("active");
            $(this).addClass('active');
            if (this.innerHTML == "Other") {
                $("#input-attitude-other").show();
                attitude = "";
            } else {
                attitude = this.innerHTML;
                $("#input-attitude-other").hide();
            }
        });

        //take action
        $('#input-tookAction').on("touchstart", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                tookAction = false;
                $('#input-action').hide();
                return;
            } else {
                $(this).addClass('active');
                tookAction = true;
                $('#input-action').show();
            }
        });

    },

    disconnect: function(event) {
        var deviceId = event.target.dataset.deviceId;
        ble.disconnect(deviceId, app.showMainPage, app.onError);
    },
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    },
    submitForm: function() {
        var location = "";

        if (!$("#input-topic").val()) {
            topic = "";
        } else {
            topic = jQuery("#input-topic").val();
        }

        if (!$("#input-people").val()) {
            people = "";
        } else {
            people = jQuery("#input-people").val();
        }

        if (!$("#input-audience").val()) {
            audience = "";
        } else {
            audience = jQuery("#input-audience").val();
        }

        if (!$("#input-media").val()) {
            media = "";
        } else {
            media = jQuery("#input-media").val();
        }
        if (!$("#input-resource").val()) {
            resource = "";
        } else {
            resource = jQuery("#input-resource").val();
        }
        if (!$("#input-month").val()) {
            month = 11;
        } else {
            month = parseInt(jQuery("#input-month").val());
        }
        if (!$("#input-day").val()) {
            day = 1;
        } else {
            day = parseInt(jQuery("#input-day").val());
        }
        if (!$("#input-startH").val()) {
            startH = 0;
        } else {
            startH = parseInt(jQuery("#input-startH").val());
        }
        if (!$("#input-startM").val()) {
            startM = 0;
        } else {
            startM = parseInt(jQuery("#input-startM").val());
        }
        if (!$("#input-endH").val()) {
            endH = 0;
        } else {
            endH = parseInt(jQuery("#input-endH").val());
        }
        if (!$("#input-endM").val()) {
            endM = 0;
        } else {
            endM = parseInt(jQuery("#input-endM").val());
        }


        title = jQuery("#input-title").val();
        var location = jQuery("#input-location").val();
        description = jQuery("#input-description").val();
        feedback = jQuery("#input-feedback").val();
        reason = jQuery("#input-reason").val();
        url = jQuery("#input-url").val();
        action = jQuery("#input-action").val();

        if (category == "") {
            category = $("#input-category-other").val();
        }

        if (emotion == "") {
            emotion = $("#input-emotion-other").val();
        }

        if (attitude == "") {
            attitude = $("#input-attitude-other").val();
        }

        // make sure we have a location
        //if (!title || title == "") return alert('We need a title!');

        // POST the data from above to our API create route
        jQuery.ajax({
            url: 'https://every-little-thing.herokuapp.com/api/create',
            dataType: 'json',
            type: 'POST',
            // we send the data in a data object (with key/value pairs)
            data: {
                title: title,
                type: type,
                category: category,
                topic: topic,
                people: people,
                month: month,
                day: day,
                period: period,
                startH: startH,
                startM: startM,
                endH: endH,
                endM: endM,
                location: location,
                emotion: emotion,
                description: description,
                language: language,
                shared: shared,
                audience: audience,
                media: media,
                feedback: feedback,
                resource: resource,
                attitude: attitude,
                reason: reason,
                url: url,
                tookAction: tookAction,
                action: action,
                finished: finished
            },
            success: function(response) {
                if (response.status == "OK") {
                    // success
                    console.log(response);
                    // now, clear the input fields
                    jQuery("form input").val('');
                    $('#myForm .btn').removeClass("active");


                } else {
                    alert("something went wrong");
                }
            },
            error: function(err) {
                // do error checking
                alert("something went wrong");
                console.error(err);
            }
        });
    }
};