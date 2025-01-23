
localStorage.clear();

document.addEventListener("DOMContentLoaded", function () {
    const errors = {
        "IP-18cSZÁMEA1G": [1, 2, 12], //számításelmélet Gy
        "IP-18cNM1G": [1, 2, 3], //numerikus módszerek Gy
        "IP-18AB1G": [1, 2, 3, 4, 5, 9, 10, 11, 12], //adatbázisok Gy
        "IP-18OPREG": [1, 2, 3, 4, 5, 6, 7, 8, 9], //operációs rendszerek Gy
        "IP-18cSZTEG": [1, 2, 3] //Szoftvertechnologia Ea+Gy
    }

    var dp = new DayPilot.Calendar("dp");

    // Naptár nézet beállítása
    dp.days = 5;
    dp.dayBeginsHour = 8;
    dp.dayEndsHour = 20;
    dp.businessBeginsHour = 8;
    dp.businessEndsHour = 20;
    dp.cellDuration = 15;
    dp.cellHeight = 15;
    dp.startDate = getDay("Hétfo");

    dp.onBeforeHeaderRender = function (args) {
        var date = args.header.start;
        args.header.html = date.toString("dddd"); // Nap neve (pl. hétfő, kedd)
    };
    dp.onBeforeTimeHeaderRender = function (args) {
        const hour = DayPilot.Date.today().addTime(args.header.time);
        args.header.html = hour.toString("H:mm");
        args.header.cssClass = "hourheader";
    };
    // Esemény létrehozása
    dp.onTimeRangeSelected = function (args) {
        var name = prompt("Új esemény neve:", "Esemény");
        if (!name) return;
        var e = new DayPilot.Event({
            start: args.start,
            end: args.end,
            id: DayPilot.guid(),
            text: name
        });
        dp.events.add(e);
        dp.clearSelection();
    };

    dp.onEventClick = function (args) {
        // Az esemény kezdő időpontja és az esemény adatai
        var clickedEvent = args.e;
        var clickedStart = clickedEvent.data.start;
        var clickedEnd = clickedEvent.data.end;
        var clickedId = clickedEvent.data.id;
        var clickedBarColor = clickedEvent.data.barColor;
        // Ellenőrizzük, hogy az események már a localStorage-ban vannak-e
        console.log(clickedEvent.data);
        if (localStorage.getItem(clickedId)) {
            // Ha az események már tárolva vannak, visszaállítjuk őket a naptárba
            var eventsToRestore = JSON.parse(localStorage.getItem(clickedId))["deletedEvents"];
            localStorage.removeItem(clickedId);

            deletedColors = new Set();
            Object.keys(localStorage).forEach(key => {
                var deletedEvents = JSON.parse(localStorage.getItem(key))["deletedEvents"][0];
                deletedEvents.forEach(event => {
                    deletedColors.add(event.barColor);
                });
            })
    

            
            eventsToRestore[0].forEach(event => {
                if(!(deletedColors.has(event.barColor))) {
                    dp.events.add(event);
                }
                else{
                    Object.keys(localStorage).forEach(key => {
                        var color = JSON.parse(localStorage.getItem(key))["clickedColor"];
                        if(color == event.barColor) {
                            var keyevents = JSON.parse(localStorage.getItem(key));
                            keyevents["deletedEvents"][0].push(event);
                            localStorage.setItem(key, JSON.stringify(keyevents));
                        }
                    })
                }
            });
            // Visszaállítjuk a kattintott esemény eredeti színét és eltávolítjuk a kijelölést
            clickedEvent.data.backColor = clickedEvent.data.originalColor || "";
            clickedEvent.data.isSelected = false;
            dp.events.update(clickedEvent);
    
        } else {
            // Tároljuk az összes eseményt, kivéve a kattintottat
            //&& (event.start == clickedStart || event.barColor == clickedBarColor) 
            var eventsToStore = dp.events.list.filter(event => event.id != clickedId && (event.start == clickedStart || event.end == clickedEnd || event.barColor == clickedBarColor) );
            var datas = {
                "clickedEvent" : clickedEvent,
                "clickedColor" : clickedBarColor,
                "deletedEvents" : [eventsToStore]
            }
            localStorage.setItem(clickedId, JSON.stringify(datas));
            
            // Töröljük az eseményeket a naptárból, kivéve a kattintottat
            dp.events.list = dp.events.list.filter(e => !eventsToStore.some(ev => ev.id === e.id));
            
    
            // Megváltoztatjuk a kattintott esemény színét és kijelöljük
            clickedEvent.data.originalColor = clickedEvent.data.backColor; // Eredeti szín mentése
            clickedEvent.data.backColor = clickedBarColor;
            clickedEvent.data.isSelected = true;
            dp.events.update(clickedEvent);
    
        }

    };
    




    dp.init();

    // Lekérdezési adatfeldolgozó
    window.fetchData = function () {
        var name = document.getElementById("name").value;
        var semester = document.getElementById("semester").value;
        var apiUrl = "get_data.php?name=" + encodeURIComponent(name) + "&semester=" + encodeURIComponent(semester);

        if (!name) {
            alert("Kérlek, add meg a tantárgy nevét vagy kódját!");
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("GET", apiUrl, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                try {
                    var response = JSON.parse(xhr.responseText);

                    if (response.error) {
                        alert(response.error);
                        return;
                    }

                    updateTable(response);
                    updateCalendar(response);
                } catch (e) {
                    alert("Hiba a válasz feldolgozása közben: " + e.message);
                }
            }
        };

        xhr.send();
    };
    var colorNameMapping = {};


    function nameColorEvent() {
        var colorList = document.getElementById("colorList");
        colorList.innerHTML = '';
        for (var color in colorNameMapping) {
            var listItem = document.createElement("li");

            // Create a color box
            var colorBox = document.createElement("span");
            colorBox.className = "color-box";
            colorBox.style.backgroundColor = color; // Set background color to the event color

            listItem.appendChild(colorBox); // Add the color box to the list item
            listItem.appendChild(document.createTextNode(colorNameMapping[color])); // Add text to the list item

            colorList.appendChild(listItem); // Add the list item to the list
        }

    }
    // Táblázat frissítése
    function updateTable(data) {
        var tableBody = document.getElementById("resulttable").getElementsByTagName('tbody')[0];
        tableBody.innerHTML = "";

        data.forEach(function (item) {
            var row = tableBody.insertRow();
            row.innerHTML = "<td>" + item.idopont + "</td><td>" + item.kodok + "</td>";
        });
    }
    function getColor() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    // Naptár frissítése
    function updateCalendar(data) {
        //dp.events.list = [];
        var color = getColor();
        data.forEach(function (item) {
            const kurzuskod = parseInt(item.kodok.split('-')[2].split(' ')[0]);
            const targykod = item.kodok.split(' ')[0].replace(/-\d+$/, "");
            if (!(targykod in errors) || !errors[targykod].includes(kurzuskod) &&  item.idopont.split(" ").length > 1) {
                console.log(item.idopont.split(" ").length);
                var [start, end] = item.idopont.split(" ")[1].split("-");
                var day = item.idopont.split(" ")[0];
                start = start.split(":");
                end = end.split(":");
                dp.events.add({
                    start: getDay(day).addHours(start[0]).addMinutes(start[1]),
                    end: getDay(day).addHours(end[0]).addMinutes(end[1]),
                    id: DayPilot.guid(),
                    text: "#" + kurzuskod,
                    barColor: color
                });
            }
        });
        colorNameMapping[color] = data[0].tantargy;
        nameColorEvent();
        dp.update();
    }

    function getDay(day) {
        var i = 0;
        switch (day) {
            case "Hétfo":
                i = 1;
                break;
            case "Kedd":
                i = 2;
                break;
            case "Szerda":
                i = 3;
                break;
            case "Csütörtök":
                i = 4;
                break;
            case "Péntek":
                i = 5;
                break;
        }
        return new DayPilot.Date.today().firstDayOfWeek().addDays(i);
    }
});
