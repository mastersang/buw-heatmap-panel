importScripts("./external/dynamic-time-warping.js"); //import DynamicTimeWarping from "./external/dynamic-time-warping";

onmessage = function (e) {
  var DTPList = [];

  try {
    var data = e.data[0];
    var metric = e.data[1];
    var metricIndex = e.data[2];
    data.forEach((instance, instanceIndex) => {
      var instanceMetric = instance.metricList[metricIndex];

      if (instanceMetric.data.length > 0) {
        for (var i = instanceIndex + 1; i < data.length; ++i) {
          var nextInstance = data[i];
          var nextInstanceMetric = nextInstance.metricList[metricIndex];

          if (nextInstanceMetric.data.length > 0) {
            var dtw = new DynamicTimeWarping(instanceMetric.data, nextInstanceMetric.data, DTPDistanceFunction);
            var dtp = {
              firstInstance: instance,
              secondInstance: nextInstance,
              distance: dtw.getDistance()
            };
            DTPList.push(dtp);
          }
        }
      }
    });
  } catch (e) {
    console.log(e);
  }

  DTPList.sort(function (first, second) {
    return first.distance - second.distance;
  });
  postMessage([DTPList]);
};

DTPDistanceFunction = function (firstPoint, secondPoint) {
  return Math.abs(firstPoint.value - secondPoint.value);
};
