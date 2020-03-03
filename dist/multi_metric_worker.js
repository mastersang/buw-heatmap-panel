importScripts("./external/lodash.js");

onmessage = function (e) {
  var param = e.data[0];
  var tab = param.tab;
  var config = param.config;
  var thresholdGroupListMap = new Map();

  for (var groupingThreshold = 0; groupingThreshold <= config.groupingThresholdCount; ++groupingThreshold) {
    postMessage([{
      message: "Grouping " + (groupingThreshold + 1) + "/" + (config.groupingThresholdCount + 1)
    }]);
    var groupList = populateMultiMetricGroupList(tab, groupingThreshold);
    setGroupNames(groupList);
    thresholdGroupListMap.set(groupingThreshold, groupList);
  }

  initialiseMultiMetricGroupsColor(tab, config, thresholdGroupListMap);
  postMessage([{
    isCompleted: true,
    data: thresholdGroupListMap
  }]);
};

populateMultiMetricGroupList = function (tab, groupingThreshold) {
  var groupNameIndex = {
    value: 0
  };
  var firstMetric = tab.overviewModel.metricList[0];
  var groupList = firstMetric.thresholdGroupListMap.get(groupingThreshold);
  var finalGroupList = [];
  separateCurrentGroupToSubgroups(tab, groupList, finalGroupList, 1, groupingThreshold, groupNameIndex);
  return finalGroupList;
};

separateCurrentGroupToSubgroups = function (tab, currentGroupList, finalGroupList, metricIndex, groupingThreshold, groupNameIndex) {
  var nextMetric = tab.overviewModel.metricList[metricIndex];
  var nextMetricGroupList = nextMetric.thresholdGroupListMap.get(groupingThreshold);
  currentGroupList.forEach(group => {
    var subgroupList = [];
    group.instanceList.forEach(instance => {
      checkAndAddNewSubgroup(group, instance, subgroupList, nextMetricGroupList, groupNameIndex);
    });

    if (metricIndex < tab.overviewModel.metricList.length - 1) {
      separateCurrentGroupToSubgroups(tab, subgroupList, finalGroupList, metricIndex + 1, groupingThreshold, groupNameIndex);
    } else {
      subgroupList.forEach(subgroup => {
        finalGroupList.push(subgroup);
      });
    }
  });
};

checkAndAddNewSubgroup = function (group, instance, subgroupList, nextMetricGroupList, groupNameIndex) {
  for (var nextMetricGroupIndex = 0; nextMetricGroupIndex < nextMetricGroupList.length; ++nextMetricGroupIndex) {
    var nextMetricGroup = nextMetricGroupList[nextMetricGroupIndex];

    if (checkInstanceIsInGroup(instance, nextMetricGroup)) {
      var subgroup = getExistingSubgroup(subgroupList, nextMetricGroup);

      if (!subgroup) {
        subgroup = initialiseNewMultiMetricGroup(groupNameIndex, group.singleGroupList, nextMetricGroup);
        subgroupList.push(subgroup);
      }

      subgroup.instanceList.push(instance);
      break;
    }
  }
};

checkInstanceIsInGroup = function (instance, group) {
  var existing = _.find(group.instanceList, search => {
    return search.instance == instance.instance;
  });

  return existing;
};

getExistingSubgroup = function (subgroupList, nextMetricGroup) {
  for (var subgroupIndex = 0; subgroupIndex < subgroupList.length; ++subgroupIndex) {
    var currentSubgroup = subgroupList[subgroupIndex];

    var check = _.find(currentSubgroup.singleGroupList, search => {
      return search.name == nextMetricGroup.name;
    });

    if (check) {
      return currentSubgroup;
    }
  }

  return null;
};

initialiseNewMultiMetricGroup = function (groupNameIndex, currentSingleGroupList, singleMetricGroup) {
  var group = {};
  group.instanceList = [];
  group.markerX = 0;

  if (currentSingleGroupList) {
    group.singleGroupList = currentSingleGroupList.slice();
  } else {
    group.singleGroupList = [];
  }

  group.singleGroupList.push(singleMetricGroup);
  return group;
};

initialiseMultiMetricGroupsColor = function (tab, config, thresholdGroupListMap) {
  thresholdGroupListMap.forEach(groupList => {
    var luminanceChange = (config.startingGreyColor - config.endingGrayColor) / groupList.length;
    groupList.forEach((group, groupIndex) => {
      var greyValue = Math.round(config.startingGreyColor - luminanceChange * groupIndex);
      group.color = "rgba(" + greyValue + ", " + greyValue + ", " + greyValue + ", 1)";
    });
  });
};

setGroupNames = function (groupList) {
  groupList.forEach((group, groupIndex) => {
    group.name = "Group " + (groupIndex + 1);
  });
};
