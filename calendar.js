document.addEventListener("DOMContentLoaded", function () {
    const errors = {
        "IP-18cSZÁMEA1G": [1,2,12], //számításelmélet Gy
        "IP-18cNM1G": [1,2,3], //numerikus módszerek Gy
        "IP-18AB1G": [1,2,3,4,5,9,10,11,12], //adatbázisok Gy
        "IP-18OPREG": [1,2,3,4,5,6,7,8,9], //operációs rendszerek Gy
        "IP-18cSZTEG": [1,2,3] //Szoftvertechnologia Ea+Gy
    }

    var dp = new DayPilot.Calendar("dp");

    // Naptár nézet beállítása
    dp.days = 5;
    dp.dayBeginsHour = 8;
    dp.dayEndsHour = 18;
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

    // Esemény kattintás esemény kezelése
    dp.onEventClick = function (args) {
        // Megjelenít egy megerősítő párbeszédablakot
        var confirmation = confirm("Biztosan törölni szeretnéd ezt az eseményt?");

        // Ha a felhasználó rákattintott az 'Igen' gombra
        if (confirmation) {
            // Az esemény törlése a DayPilot-ból
            dp.events.remove(args.e); // args.e az esemény objektum
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
            if (!(targykod in errors) || !errors[targykod].includes(kurzuskod)) {
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
