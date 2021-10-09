const i_info = document.getElementById("i_info");
const n_info = document.getElementById("n_info");
const in_info = document.getElementById("in_info");
const ctx1 = document.getElementById("myChart1").getContext("2d");
const ctx2 = document.getElementById("myChart2").getContext("2d");
const ctx3 = document.getElementById("myChart3").getContext("2d");
const canvas1 = document.getElementById("myChart1");
const canvas2 = document.getElementById("myChart2");
const canvas3 = document.getElementById("myChart3");
const ratio_btn = document.getElementById("ratio_btn");
const data_btn = document.getElementById("data_btn");
const plot_btn = document.getElementById("plot_btn");
const coordinate = [];
let start;
let prevTime;
let currentTime;
let timeFlag = false;
let I = 0;
const data = [];

const socket = new WebSocket("wss://coding-ws.astrome.co:2096");

socket.onopen = (e) => {
  start = Date.now();
  console.log("Connection open");
};
socket.onmessage = (e) => {
  let ob = JSON.parse(e.data);
  ob = { ...ob, time: getTime() };
  coordinate.push(ob);
  if (isInside(ob)) {
    I = I + 1;
    let ratio = I / coordinate.length;
    data.push({
      time: Date.now() - start,
      ratio: ratio,
    });
  }
  console.log("Live data count: ", coordinate.length);
  i_info.value = I;
  n_info.value = coordinate.length;
  in_info.value = data[data.length - 1].ratio;
  if (coordinate.length === 1000) socket.close();
};
socket.onerror = (e) => {
  console.log(e.error);
};
socket.onclose = (e) => {
  console.log(data);
  console.log("Connection Terminated");
  render_chart();
};
//Event Handling
const handleClick = (id) => {
  if (id === "ratio_btn") {
    canvas1.style.zIndex = "100";
    canvas2.style.zIndex = "0";
    canvas3.style.zIndex = "0";
    ratio_btn.classList.add("active");
  }
  if (id === "data_btn") {
    canvas2.style.zIndex = "100";
    canvas1.style.zIndex = "0";
    canvas3.style.zIndex = "0";
  }
  if (id === "plot_btn") {
    canvas3.style.zIndex = "100";
    canvas2.style.zIndex = "0";
    canvas1.style.zIndex = "0";
  }
};
//Helper functions

const getTime = () => {
  if (!timeFlag) {
    prevTime = start;
    return Date.now() - prevTime;
  }
  return Date.now() - prevTime;
};
const extractTime = (arr) => {
  let time = arr.map((item) => item.time);
  return time;
};
const extractRatio = (arr) => {
  let ratio = arr.map((item) => item.ratio);
  return ratio;
};
const extractX = () => {
  let x = coordinate.map((item) => item.x);
  return x;
};
const extractY = () => {
  let y = coordinate.map((item) => item.y);
  return y;
};
const isInside = (ob) => {
  const rad = 1;
  if (ob.x * ob.x + ob.y * ob.y <= rad * rad) return true;
  else return false;
};

//Redering Chart
const render_chart = () => {
  //For ratio graph
  const myChart1 = new Chart(ctx1, {
    type: "line",
    data: {
      labels: extractTime(data),
      datasets: [
        {
          label: "I/N ratio",
          data: extractRatio(data),
          backgroundColor: "red",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Ratio Graph",
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
        },
      },
    },
  });
  //For data graph
  const myChart2 = new Chart(ctx2, {
    type: "line",
    data: {
      labels: extractTime(coordinate),
      datasets: [
        {
          label: "x-coordinates",
          data: extractX(),
          backgroundColor: "red",
          borderColor: "red",
        },
        {
          label: "y-coordinates",
          data: extractY(),
          backgroundColor: "blue",
          borderColor: "blue",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Data Graph",
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
        },
      },
    },
  });
  //For plot graph
  const myChart3 = new Chart(ctx3, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "x-y values plot",
          data: coordinate,
          backgroundColor: "lightgreen",
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "linear",
          position: "bottom",
        },
      },
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Plot Graph",
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            mode: "x",
          },
        },
      },
    },
  });
  //Making ratio graph as the default graph
  canvas1.style.zIndex = "100";
};
