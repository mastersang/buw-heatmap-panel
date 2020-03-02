importScripts("./external/dynamic-time-warping.js");
importScripts("./external/lodash.js");

onmessage = function (e) {
  var param = e.data[0];
  var tab = param.tab;
  var metric = param.metric;
  var metricIndex = param.metricIndex;
  var metricName = param.metricName;
  var colorList = param.colorList;
  var config = param.config;
  initialiseDTPList(tab, metric, metricIndex);
  sortDTPListAndSetMaxDTP(metric);
  initialiseSingleMetricGroups(tab, metric, metricIndex, metricName, config, colorList);
  postMessage([{
    isCompleted: true,
    data: metric
  }]);
};

initialiseDTPList = function (tab, metric, metricIndex) {
  metric.DTPList = [];
  var data = tab.overviewModel.data;
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
          metric.DTPList.push(dtp);
        }
      }
    }
  });
};

sortDTPListAndSetMaxDTP = function (metric) {
  metric.DTPList.sort(function (first, second) {
    return first.distance - second.distance;
  });

  if (metric.DTPList.length > 0) {
    metric.maxDTP = metric.DTPList[metric.DTPList.length - 1].distance;
  } else {
    metric.maxDTP = 0;
  }
};

DTPDistanceFunction = function (firstPoint, secondPoint) {
  return Math.abs(firstPoint.value - secondPoint.value);
};

initialiseSingleMetricGroups = function (tab, metric, metricIndex, metricName, config, colorList) {
  this.initialiseSingleMetricGroupsByMetric(tab, config, metric, metricIndex, metricName);
  this.initialiseSingleMetricGroupsColor(metric, config, colorList);
};

initialiseSingleMetricGroupsByMetric = function (tab, config, metric, metricIndex, metricName) {
  metric.thresholdGroupListMap = new Map();

  for (var groupingThreshold = 0; groupingThreshold <= config.groupingThresholdCount; ++groupingThreshold) {
    var groupList = [];
    this.populateSingleMetricGroupList(tab, groupList, metric, metricIndex, groupingThreshold);
    groupList.sort((first, second) => {
      return first.total - second.total;
    });

    for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
      var group = groupList[groupIndex];
      group.name = metricName + " group " + (groupIndex + 1);
    }

    metric.thresholdGroupListMap.set(groupingThreshold, groupList);
  }
};

populateSingleMetricGroupList = function (tab, groupList, metric, metricIndex, groupingThreshold) {
  if (metric.DTPList.length > 0) {
    this.populateSingMetricGroupListFromDTPList(tab, groupList, metric, metricIndex, groupingThreshold);
  }

  this.groupInstancesWithNoDataToOneGroup(tab, groupList, metricIndex);
  tab.overviewModel.data.forEach(instance => {
    var group = this.searchExistingSingleMetricGroup(groupList, instance);

    if (!group) {
      group = this.initialiseNewSingleMetricGroup(instance, metricIndex);
      groupList.push(group);
    }
  });
};

populateSingMetricGroupListFromDTPList = function (tab, groupList, metric, metricIndex, groupingThreshold) {
  var threshold = metric.maxDTP * groupingThreshold / 100;
  var DTPIndex = 0;
  var DTP;

  do {
    DTP = metric.DTPList[DTPIndex];
    var firstInstance = DTP.firstInstance;
    var secondInstance = DTP.secondInstance;
    var firstGroup = this.searchExistingSingleMetricGroup(groupList, firstInstance);
    var secondGroup = this.searchExistingSingleMetricGroup(groupList, secondInstance);
    this.processSingleMetricGroups(tab, groupList, metricIndex, firstInstance, secondInstance, firstGroup, secondGroup);
    ++DTPIndex;
  } while (DTP.distance <= threshold && DTPIndex < metric.DTPList.length);
};

groupInstancesWithNoDataToOneGroup = function (tab, groupList, metricIndex) {
  var emptyGroup;
  tab.overviewModel.data.forEach(instance => {
    var instanceMetric = instance.metricList[metricIndex];

    if (instanceMetric.data == null || instanceMetric.data.length == 0) {
      if (emptyGroup) {
        emptyGroup.instanceList.push(instance);
      } else {
        emptyGroup = this.initialiseNewSingleMetricGroup(instance, metricIndex);
      }
    }
  });

  if (emptyGroup) {
    groupList.push(emptyGroup);
  }
};

searchExistingSingleMetricGroup = function (groupList, instance) {
  for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
    var group = groupList[groupIndex];

    for (var instanceIndex = 0; instanceIndex < group.instanceList.length; ++instanceIndex) {
      var groupInstance = group.instanceList[instanceIndex];

      if (groupInstance.instance == instance.instance) {
        return group;
      }
    }
  }

  return null;
};

processSingleMetricGroups = function (tab, groupList, metricIndex, firstInstance, secondInstance, firstGroup, secondGroup) {
  if (firstGroup == null) {
    if (secondGroup == null) {
      var group = this.initialiseNewSingleMetricGroup(firstInstance, metricIndex);
      group.instanceList.push(secondInstance);
      groupList.push(group);
    } else {
      secondGroup.instanceList.push(firstInstance);
    }
  } else if (secondGroup == null) {
    firstGroup.instanceList.push(secondInstance);
  } else if (firstGroup != secondGroup) {
    this.mergeGroups(firstGroup, secondGroup);

    _.remove(groupList, search => {
      return search == secondGroup;
    });
  }
};

mergeGroups = function (firstGroup, secondGroup) {
  secondGroup.instanceList.forEach(instance => {
    var existing = _.find(firstGroup.instanceList, search => {
      return search.instance == instance.instance;
    });

    if (!existing) {
      firstGroup.instanceList.push(instance);
    }
  });
};

initialiseNewSingleMetricGroup = function (instance, metricIndex) {
  var group = {};
  group.metricIndex = metricIndex;
  group.instanceList = [instance];
  group.markerX = 0;
  group.total = instance.metricList[metricIndex].total;
  return group;
};

initialiseSingleMetricGroupsColor = function (metric, config, colorList) {
  var originalColor = colorList[0];
  metric.thresholdGroupListMap.forEach(groupList => {
    var luminanceChange = -config.maxLuminanceChange / groupList.length;
    groupList.forEach((group, groupIndex) => {
      group.color = this.changeColorLuminance(originalColor, groupIndex * luminanceChange);
    });
  });
};

changeColorLuminance = function (hex, lum) {
  hex = String(hex).replace(/[^0-9a-f]/gi, '');

  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  lum = lum || 0;
  var rgb = "#",
      c,
      i;

  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }

  return rgb;
};
