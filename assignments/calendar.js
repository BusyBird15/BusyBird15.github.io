function countWeekdays(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
    let weekdaysCount = 0;

    for (let currentDate = startDate; currentDate <= endDate; currentDate += oneDay) {
        const dayOfWeek = currentDate.getDay(); // 0 (Sunday) to 6 (Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            weekdaysCount++;
        }
    }

    return weekdaysCount;
}

var cal = {
  // (A) PROPERTIES
  // (A1) FLAGS & DATA
  sMon : false, // week start on monday
  data : null, // events for selected period
  sDay : 0, sMth : 0, sYear : 0, // selected day month year

  // (A2) MONTHS & DAY NAMES
  months : [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ],
  days : ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],

  // (A3) HTML ELEMENTS
  hMth : null, hYear : null, // month/year selector
  hWrap : null, // calendar wrapper
  hFormWrap : null, hForm : null, // event form
  hfDate : null, hfTxt : null, hfDel : null, // form fields

  // (B) INIT CALENDAR
  init : () => {
    // (B1) GET HTML ELEMENTS
    cal.hMth = document.getElementById("calMonth");
    cal.hYear = document.getElementById("calYear");
    cal.hWrap = document.getElementById("calWrap");
    cal.hFormWrap = document.getElementById("calForm");
    cal.hForm = cal.hFormWrap.querySelector("form");
    cal.hfDate = document.getElementById("evtDate");
    cal.hfTxt = document.getElementById("evtTxt");
    cal.hfDel = document.getElementById("evtDel");
    cal.lessonum = document.getElementById("lessonum");

    // (B2) APPEND MONTHS/YEAR
    let now = new Date(), nowMth = now.getMonth();
    cal.hYear.value = parseInt(now.getFullYear());
    for (let i=0; i<12; i++) {
      let opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = cal.months[i];
      if (i==nowMth) { opt.selected = true; }
      cal.hMth.appendChild(opt);
    }

    // (B3) ATTACH CONTROLS
    cal.hMth.onchange = cal.draw;
    cal.hYear.onchange = cal.draw;
    document.getElementById("calBack").onclick = () => cal.pshift();
    document.getElementById("calNext").onclick = () => cal.pshift(1);
    cal.hForm.onsubmit = cal.save;
    document.getElementById("evtClose").onclick = () => cal.hFormWrap.close();
    cal.hfDel.onclick = cal.del;

    // (B4) START - DRAW CALENDAR
    if (cal.sMon) { cal.days.push(cal.days.shift()); }
    cal.draw();
  },

  // (C) SHIFT CURRENT PERIOD BY 1 MONTH
  pshift : forward => {
    cal.sMth = parseInt(cal.hMth.value);
    cal.sYear = parseInt(cal.hYear.value);
    if (forward) { cal.sMth++; } else { cal.sMth--; }
    if (cal.sMth > 11) { cal.sMth = 0; cal.sYear++; }
    if (cal.sMth < 0) { cal.sMth = 11; cal.sYear--; }
    cal.hMth.value = cal.sMth;
    cal.hYear.value = cal.sYear;
    cal.draw();
  },

  // (D) DRAW CALENDAR FOR SELECTED MONTH
  draw : () => {
    // (D1) DAYS IN MONTH + START/END DAYS
    // note - jan is 0 & dec is 11
    // note - sun is 0 & sat is 6
    cal.sMth = parseInt(cal.hMth.value); // selected month
    cal.sYear = parseInt(cal.hYear.value); // selected year
    let daysInMth = new Date(cal.sYear, cal.sMth+1, 0).getDate(), // number of days in selected month
        startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // first day of the month
        endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(), // last day of the month
        now = new Date(), // current date
        nowMth = now.getMonth(), // current month
        nowYear = parseInt(now.getFullYear()), // current year
        nowDay = cal.sMth==nowMth && cal.sYear==nowYear ? now.getDate() : null ;

    // (D2) LOAD DATA FROM LOCALSTORAGE
    cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear);
    cal.lessonums = []
    cal.lessonums = localStorage.getItem("les-" + cal.sMth + "-" + cal.sYear);
    if (cal.data==null) {
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}");
      cal.data = {};
    } else {
        cal.data = JSON.parse(cal.data);
    }
    if (cal.lessonums==null || cal.lessonums == undefined){
        localStorage.setItem("les-" + cal.sMth + "-" + cal.sYear, '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]');
        cal.lessonums = '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]';
    }
    cal.lessonums = JSON.parse(cal.lessonums);

    // (D3) DRAWING CALCULATIONS
    // (D3-1) BLANK SQUARES BEFORE START OF MONTH
    let squares = [];
    if (cal.sMon && startDay != 1) {
      let blanks = startDay==0 ? 7 : startDay ;
      for (let i=1; i<blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && startDay != 0) {
      for (let i=0; i<startDay; i++) { squares.push("b"); }
    }

    // (D3-2) DAYS OF THE MONTH
    for (let i=1; i<=daysInMth; i++) { squares.push(i); }

    // (D3-3) BLANK SQUARES AFTER END OF MONTH
    if (cal.sMon && endDay != 0) {
      let blanks = endDay==6 ? 1 : 7-endDay;
      for (let i=0; i<blanks; i++) { squares.push("b"); }
    }
    if (!cal.sMon && endDay != 6) {
      let blanks = endDay==0 ? 6 : 6-endDay;
      for (let i=0; i<blanks; i++) { squares.push("b"); }
    }

    // (D4) "RESET" CALENDAR
    cal.hWrap.innerHTML = `<div class="calHead"></div>
    <div class="calBody">
      <div class="calRow"></div>
    </div>`;

    // (D5) CALENDAR HEADER - DAY NAMES
    wrap = cal.hWrap.querySelector(".calHead");
    for (let d of cal.days) {
      let cell = document.createElement("div");
      cell.className = "calCell";
      cell.innerHTML = d;
      wrap.appendChild(cell);
    }


    // (D6) CALENDAR BODY - INDIVIDUAL DAYS & EVENTS
    wrap = cal.hWrap.querySelector(".calBody");
    row = cal.hWrap.querySelector(".calRow");
    for (let i=0; i<squares.length; i++) {
      // (D6-1) GENERATE CELL
      let cell = document.createElement("div");
      cell.className = "calCell";
      if (nowDay==squares[i]) { cell.classList.add("calToday"); }
      if (squares[i]=="b") { cell.classList.add("calBlank"); }
      else {
        lessonum = cal.lessonums[squares[i]]
        if (cal.lessonums[squares[i]] == 0){
            lessonum = ""
        } else {
            lessonum = "L " + cal.lessonums[squares[i]]
        }
        cell.innerHTML = `<div style="display: flex; flex-direction: row;"><div class="cellDate">${squares[i]}</div><div class="cellLesson">${lessonum}</div></div>`;
        if (cal.data[squares[i]]) {
          cell.innerHTML += '<div class="evt" title="' + cal.data[squares[i]].replace(/<br>/g, "\n") + '">' + cal.data[squares[i]] + "</div>";
        }
        cell.onclick = () => { cal.show(cell); };
      }
      row.appendChild(cell);

      // (D6-2) NEXT ROW
      if (i!=(squares.length-1) && i!=0 && (i+1)%7==0) {
        row = document.createElement("div");
        row.className = "calRow";
        wrap.appendChild(row);
      }
    }
  },

  // (E) SHOW EDIT EVENT DOCKET FOR SELECTED DAY
  show : cell => {
    cal.hForm.reset();
    cal.sDay = cell.querySelector(".cellDate").innerHTML;
    cal.hfDate.value = `${cal.sDay} ${cal.months[cal.sMth]} ${cal.sYear}`;
    if (cal.data[cal.sDay] !== undefined) {
      cal.hfTxt.value = cal.data[cal.sDay].replace(/<br>/g, "\n");
      if(cal.lessonums[cal.sDay] || cal.lessonums[cal.sDay] !== 0){
        cal.lessonum.value = cal.lessonums[cal.sDay];
      } else {
        cal.lessonum.value = 0
      }
      if(cal.lessonum.value == 0){
        cal.lessonum.value = '';
      }
      cal.hfDel.classList.remove("hide");
      document.getElementById("evtTxt").focus();
    } else { cal.hfDel.classList.add("hide"); }
        cal.hFormWrap.show();
        document.getElementById("evtTxt").focus();
  },

  // (F) SAVE EVENT
  save : () => {
    cal.data[cal.sDay] = cal.hfTxt.value.replace(/\n/g, "<br>");
    if (cal.lessonum.value == ''){
        cal.lessonum.value = 0
    }
    if(cal.lessonum.value){
        cal.lessonums[cal.sDay] = cal.lessonum.value;
    }
    localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
    localStorage.setItem(`les-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.lessonums));
    cal.draw();
    cal.hFormWrap.close();
    return false;
  },

  // (G) DELETE EVENT FOR SELECTED DATE
  del : () => { if (confirm("Clear event?")) {
    delete cal.data[cal.sDay];
    cal.lessonums[cal.sDay] = 0;
    localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
    localStorage.setItem(`les-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.lessonums));
    cal.draw();
    cal.hFormWrap.close();
  }}
};
window.onload = cal.init;