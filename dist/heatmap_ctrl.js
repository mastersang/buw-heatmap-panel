"use strict";

System.register(["app/plugins/sdk", "./heatmap.css!", "moment", "lodash"], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, moment, relativeTimeThreshold, _, HeatmapCtrl;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_heatmapCss) {}, function (_moment) {
      moment = _moment.default;
      relativeTimeThreshold = _moment.relativeTimeThreshold;
    }, function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _export("HeatmapCtrl", HeatmapCtrl =
      /*#__PURE__*/
      function (_MetricsPanelCtrl) {
        _inherits(HeatmapCtrl, _MetricsPanelCtrl);

        function HeatmapCtrl($scope, $injector, $timeout, variableSrv, timeSrv) {
          var _this;

          _classCallCheck(this, HeatmapCtrl);

          _this = _possibleConstructorReturn(this, _getPrototypeOf(HeatmapCtrl).call(this, $scope, $injector));
          _this.$timeout = $timeout;
          _this.variableSrv = variableSrv;
          _this.timeSrv = timeSrv;

          _this.events.on("data-received", _this.onDataReceived.bind(_assertThisInitialized(_this)));

          _this.overviewModel = {};
          _this.scope.ctrl.focusModel = {};
          _this.scope.ctrl.focusModel.groupList = [];

          _this.initialiseConfig();

          return _this;
        }

        _createClass(HeatmapCtrl, [{
          key: "initialiseConfig",
          value: function initialiseConfig() {
            this.config = {
              apiAddress: "http://localhost:3000/api/datasources/proxy/1/api/v1/query_range?query=",
              dateFormat: "DD/MM/YY hh:mm:ss",
              marginBetweenOverviewAndFocus: 50,
              // color schemes for metrics
              metricLabelList: ["CPU", "Memory", "Disk"],
              // color schemes for metrics
              colors: [["f2d9e6", "d98cb3", "bf4080", "73264d"], // red
              ["ccddff", "6699ff", "0055ff", "003399"], // blue
              ["eeeedd", "cccc99", "aaaa55", "666633"]],
              // determines which the order of attributes to use for sorting
              sortOrder: [0, 1, 2]
            };
            this.initialiseOverviewConfig();
            this.initialiseFocusAreaConfig();
            this.initialiseFocusGraphConfig();
          }
        }, {
          key: "initialiseOverviewConfig",
          value: function initialiseOverviewConfig() {
            this.config.overview = {
              metricFontSize: 15,
              timeFontSize: 10,
              marginBetweenLabelsAndOverview: 10,
              pointWidth: 1,
              groupedPointHeight: 5,
              ungroupedPointHeight: 1,
              verticalMarginBetweenMetrics: 2,
              horizontalMarginBetweenMetrics: 30,
              marginBetweenInstances: 6,
              startingGreyColor: 240,
              endingGrayColor: 80,
              groupBarWidth: 9,
              singleAttributeGroupSizeWidth: 1,
              multipleAttributeGroupSizeWidth: 2,
              marginBetweenMarkerAndGroup: 10,
              marginBetweenMetricAndGroupSize: 10
            };
          }
        }, {
          key: "initialiseFocusAreaConfig",
          value: function initialiseFocusAreaConfig() {
            this.config.focusArea = {
              color: "Aqua",
              size: 20,
              xCrossSize: 15
            };
          }
        }, {
          key: "initialiseFocusGraphConfig",
          value: function initialiseFocusGraphConfig() {
            this.config.focusGraph = {
              groupedPointWidth: 3,
              ungroupedPointWidth: 20,
              metricMaxHeight: 30,
              marginBetweenMetrics: 10,
              maxWidth: 10000,
              maxHeight: 10000
            };
          }
        }, {
          key: "link",
          value: function link(scope, elem) {
            this.scope = scope;
            this.elem = elem;
            this.initialiseControl();
            this.initialiseUIFunctions();
            this.initialiseUIElements();
          }
        }, {
          key: "initialiseControl",
          value: function initialiseControl() {
            this.scope.ctrl.enumList = {
              linkingMode: {
                X_CROSS: "1",
                NORMAL_CROSS: "2",
                CHANGE_COLOR: "3"
              },
              groupingMode: {
                SINGLE: "1",
                MULTIPLE: "2"
              }
            };
            this.scope.ctrl.linkingMode = this.scope.ctrl.enumList.linkingMode.X_CROSS;
            this.scope.ctrl.groupingMode = this.scope.ctrl.enumList.groupingMode.SINGLE;
            this.scope.ctrl.isGrouped = true;
            this.initialiseOverviewCanvasCursor();
          }
        }, {
          key: "initialiseOverviewCanvasCursor",
          value: function initialiseOverviewCanvasCursor() {
            this.scope.ctrl.overviewCursor = "crosshair";
          }
        }, {
          key: "initialiseUIFunctions",
          value: function initialiseUIFunctions() {
            var parent = this;

            this.scope.selectOverviewMode = function () {
              parent.selectOverviewMode();
            };

            this.scope.selectLinker = function () {
              parent.selectLinker();
            };

            this.scope.selectGroupingMode = function () {
              parent.selectGroupingMode();
            };

            this.scope.groupUngroup = function () {
              parent.groupUngroup();
            };

            this.scope.moveMouseOnOverview = function (evt) {
              parent.moveMouseOnOverview.bind(parent, evt)();
            };

            this.scope.clickOnOverView = function (evt) {
              parent.clickOnOverView.bind(parent, evt)();
            };

            this.scope.showNodes = function (group, event) {
              parent.showNodes.bind(parent, group, event)();
            };

            this.scope.selectNode = function (instance) {
              parent.selectNode.bind(parent, instance)();
            };
          }
        }, {
          key: "initialiseUIElements",
          value: function initialiseUIElements() {
            // overview
            this.overviewCanvas = this.getElementByID("overviewCanvas");
            this.overviewContext = this.getCanvasContext(this.overviewCanvas); // focus area

            this.focusAreaCanvas = this.getElementByID("focusAreaCanvas");
            this.focusAreaContext = this.getCanvasContext(this.focusAreaCanvas); // focus graph

            this.scope.ctrl.focusGraphWidth = this.config.focusGraph.maxWidth;
            this.scope.ctrl.focusGraphHeight = this.config.focusGraph.maxHeight;
            this.focusGraphContainer = this.getElementByID("focusGraphContainer");
          }
        }, {
          key: "getElementByID",
          value: function getElementByID(id) {
            var find = this.elem.find("#" + id);
            return find[0];
          }
        }, {
          key: "getCanvasContext",
          value: function getCanvasContext(canvas) {
            return canvas.getContext("2d");
          }
        }, {
          key: "onDataReceived",
          value: function onDataReceived(data) {
            if (!this.loaded) {
              this.load();
            }
          }
        }, {
          key: "load",
          value: function load() {
            var _this2 = this;

            this.$timeout(function () {
              _this2.scope.ctrl.isLoading = true;

              _this2.scope.$apply();

              _this2.overviewModel.metricList = [null, null, null];
              _this2.loadCount = 0;
              _this2.fromDate = _this2.getDateInSeconds(_this2.timeSrv.timeRange().from._d);
              _this2.toDate = _this2.getDateInSeconds(_this2.timeSrv.timeRange().to._d);

              _this2.getDataFromAPI("node_load1{job='node'}", 0);

              _this2.getDataFromAPI("\n                        100 - (node_memory_MemFree_bytes{job='node'} - node_memory_Cached_bytes{job='node'}) \n                                * 100 / \n                                (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'})\n                    ", 1);

              _this2.getDataFromAPI("\n                    100 - (sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)',\n                                                                            mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})) \n                                * 100 / \n                            (sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'}))\n                ", 2);

              _this2.loaded = true;

              _this2.processRawData();
            });
          }
        }, {
          key: "getDateInSeconds",
          value: function getDateInSeconds(date) {
            return Math.round(date.getTime() / 1000);
          }
        }, {
          key: "getDataFromAPI",
          value: function getDataFromAPI(metric, index) {
            var _this3 = this;

            var xmlHttp = new XMLHttpRequest();

            xmlHttp.onreadystatechange = function () {
              // received response
              if (xmlHttp.readyState == 4) {
                ++_this3.loadCount;

                if (xmlHttp.status == 200) {
                  var metric = {};
                  metric.data = JSON.parse(xmlHttp.responseText).data.result;
                  _this3.overviewModel.metricList[index] = metric;
                }
              }
            };

            var url = this.config.apiAddress + encodeURIComponent(metric) + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=60";
            xmlHttp.open("GET", url, true);
            xmlHttp.send(null);
          }
        }, {
          key: "processRawData",
          value: function processRawData() {
            var _this4 = this;

            this.$timeout(function () {
              if (_this4.loadCount < _this4.overviewModel.metricList.length) {
                _this4.processRawData.bind(_this4)();
              } else {
                _this4.scope.ctrl.isLoading = false;

                if (!_this4.overviewModel.metricList.includes(null)) {
                  _this4.convertDataToFloat();

                  _this4.initialiseMetricMinMaxTotal();

                  _this4.initialiseColorMap();

                  _this4.initiliseOverviewData();

                  _this4.initialiseOverviewGroups();

                  _this4.renderOverview();
                }
              }
            }, 100);
          }
        }, {
          key: "convertDataToFloat",
          value: function convertDataToFloat() {
            this.overviewModel.metricList.forEach(function (metric) {
              metric.data.forEach(function (instance) {
                instance.values.forEach(function (value) {
                  value[0] = parseFloat(value[0]);
                  value[1] = parseFloat(value[1]);
                });
              });
            });
          }
        }, {
          key: "initialiseMetricMinMaxTotal",
          value: function initialiseMetricMinMaxTotal() {
            var _this5 = this;

            this.overviewModel.metricList.forEach(function (metric) {
              metric.min = -1;
              metric.max = -1;
              metric.data.forEach(function (instance) {
                instance.values.forEach(function (point) {
                  _this5.checkAndSetOverviewMinMax(metric, point);
                });
              });
            });
          }
        }, {
          key: "checkAndSetOverviewMinMax",
          value: function checkAndSetOverviewMinMax(metric, point) {
            var value = point[1];

            if (metric.min == -1) {
              metric.min = value;
              metric.max = value;
            } else {
              if (value < metric.min) {
                metric.min = value;
              }

              if (value > metric.max) {
                metric.max = value;
              }
            }
          }
        }, {
          key: "initialiseColorMap",
          value: function initialiseColorMap() {
            var _this6 = this;

            this.overviewModel.metricList.forEach(function (metric, index) {
              var colorList = _this6.config.colors[index];
              metric.layerRange = metric.max / colorList.length; // map a range of values to a color

              metric.colorMap = _this6.getColorMap(metric, colorList);
            });
          }
        }, {
          key: "getColorMap",
          value: function getColorMap(metric, colors) {
            var colorMap = new Map();

            for (var i = 0; i < colors.length; ++i) {
              var threshold = {};
              threshold.min = i * metric.layerRange;
              threshold.max = threshold.min + metric.layerRange;
              threshold.average = (threshold.max + threshold.min) / 2;
              colorMap.set(threshold, colors[i]);
            }

            return colorMap;
          }
        }, {
          key: "initiliseOverviewData",
          value: function initiliseOverviewData() {
            this.overviewModel.data = [];
            this.populateOverviewData();
            this.calculateInstanceMetricTotalMinMax();
            this.sortOverviewData();
          }
        }, {
          key: "populateOverviewData",
          value: function populateOverviewData() {
            var _this7 = this;

            this.overviewModel.metricList.forEach(function (metric, metricIndex) {
              metric.data.forEach(function (metricInstance) {
                var newInstance = _.find(_this7.overviewModel.data, function (search) {
                  return metricInstance.metric.instance == search.instance;
                });

                if (!newInstance) {
                  newInstance = _this7.initaliseNewInstance(metricInstance);
                }

                metricInstance.values.forEach(function (value) {
                  var point = {};
                  point.date = value[0];
                  point.value = value[1];
                  newInstance.metricList[metricIndex].data.push(point);
                });
              });
            });
          }
        }, {
          key: "initaliseNewInstance",
          value: function initaliseNewInstance(metricInstance) {
            var newInstance = {};
            newInstance.instance = metricInstance.metric.instance;
            newInstance.metricList = [];

            for (var i = 0; i < this.config.colors.length; ++i) {
              var metric = {};
              metric.data = [];
              newInstance.metricList.push(metric);
            }

            this.overviewModel.data.push(newInstance);
            return newInstance;
          }
        }, {
          key: "calculateInstanceMetricTotalMinMax",
          value: function calculateInstanceMetricTotalMinMax() {
            var _this8 = this;

            this.overviewModel.data.forEach(function (instance) {
              instance.metricList.forEach(function (metric, metricIndex) {
                metric.total = 0;
                metric.min = -1;
                metric.max = -1;
                metric.data.forEach(function (point) {
                  // sum the "threshold" average of each data point instead of the actual value of the data point 
                  metric.total += _this8.getThresholdAverage(point.value, _this8.overviewModel.metricList[metricIndex].colorMap);

                  if (metric.min == -1 || point.value < metric.min) {
                    metric.min = point.value;
                  }

                  if (metric.max == -1 || point.value > metric.max) {
                    metric.max = point.value;
                  }
                });
              });
            });
          }
        }, {
          key: "getThresholdAverage",
          value: function getThresholdAverage(value, map) {
            var result;
            map.forEach(function (color, threshold) {
              if (threshold.min <= value && value <= threshold.max) {
                result = threshold.average;
              }
            });
            return result;
          }
        }, {
          key: "sortOverviewData",
          value: function sortOverviewData() {
            var _this9 = this;

            this.overviewModel.data.sort(function (first, second) {
              for (var i = 0; i < _this9.config.sortOrder.length; ++i) {
                var metricIndex = _this9.config.sortOrder[i];

                if (first.metricList[metricIndex].total != second.metricList[metricIndex].total) {
                  return first.metricList[metricIndex].total - second.metricList[metricIndex].total;
                }
              }

              return 0;
            });
          }
        }, {
          key: "initialiseOverviewGroups",
          value: function initialiseOverviewGroups() {
            this.initialiseSingleAttributeGroups();
            this.initialiseMultiAttributeGroups();
          }
        }, {
          key: "initialiseSingleAttributeGroups",
          value: function initialiseSingleAttributeGroups() {
            var _this10 = this;

            this.overviewModel.metricList.forEach(function (metric, metricIndex) {
              metric.groupList = [];

              _this10.overviewModel.data.forEach(function (instance) {
                var group = _.find(metric.groupList, function (search) {
                  return instance.metricList[metricIndex].total == search.total;
                });

                if (!group) {
                  group = _this10.initialiseNewSingleAttributeGroups(instance, metricIndex);
                  metric.groupList.push(group);
                }

                group.instanceList.push(instance);
              });
            });
          }
        }, {
          key: "initialiseNewSingleAttributeGroups",
          value: function initialiseNewSingleAttributeGroups(instance, metricIndex) {
            var group = {};
            group.instanceList = [];
            group.total = instance.metricList[metricIndex].total;
            return group;
          }
        }, {
          key: "initialiseMultiAttributeGroups",
          value: function initialiseMultiAttributeGroups() {
            var _this11 = this;

            this.overviewModel.groupList = [];
            this.overviewModel.data.forEach(function (instance) {
              var group = _.find(_this11.overviewModel.groupList, function (search) {
                for (var i = 0; i < instance.metricList.length; ++i) {
                  if (instance.metricList[i].total != search.metricList[i].total) {
                    return false;
                  }
                }

                return true;
              });

              if (!group) {
                group = _this11.initialiseNewMultiAttributeGroup(instance);

                _this11.overviewModel.groupList.push(group);
              }

              group.instanceList.push(instance);
            });
          }
        }, {
          key: "initialiseNewMultiAttributeGroup",
          value: function initialiseNewMultiAttributeGroup(instance) {
            var group = {};
            group.metricList = [];
            group.instanceList = [];
            instance.metricList.forEach(function (instanceMetric) {
              var groupMetric = {};
              groupMetric.total = instanceMetric.total;
              group.metricList.push(groupMetric);
            });
            return group;
          }
        }, {
          key: "renderOverview",
          value: function renderOverview() {
            if (this.overviewModel.data.length > 0) {
              this.clearFocus();
              this.drawOverview();
            }
          }
        }, {
          key: "clearFocus",
          value: function clearFocus() {
            this.hasFocus = false;
            this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
          }
        }, {
          key: "drawOverview",
          value: function drawOverview() {
            var _this12 = this;

            this.$timeout(function () {
              _this12.overviewContext.clearRect(0, 0, _this12.overviewCanvas.width, _this12.overviewCanvas.height);

              _this12.setOverviewCanvasSize();

              _this12.scope.ctrl.focusGraphMarginTop = _this12.scope.ctrl.overviewHeight + _this12.config.marginBetweenOverviewAndFocus;

              _this12.drawOverviewData();
            });
          }
        }, {
          key: "setOverviewCanvasSize",
          value: function setOverviewCanvasSize() {
            this.setOverviewContextLabelFont();
            this.overviewModel.labelTextHeight = this.overviewContext.measureText("M").width;
            this.overviewModel.overviewStartY = this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview;
            this.setOverviewWidth();
            this.setOverviewHeight();
            this.scope.$apply();
          }
        }, {
          key: "setOverviewWidth",
          value: function setOverviewWidth() {
            var _this13 = this;

            this.scope.ctrl.overviewWidth = this.getMaxMetricLength() * this.overviewModel.metricList.length * this.config.overview.pointWidth + (this.overviewModel.metricList.length - 1) * this.config.overview.horizontalMarginBetweenMetrics;
            this.scope.ctrl.overviewCanvasWidth = this.scope.ctrl.overviewWidth;

            if (this.scope.ctrl.isGrouped) {
              this.scope.ctrl.overviewCanvasWidth += this.config.overview.marginBetweenMarkerAndGroup * this.overviewModel.metricList.length;

              if (this.scope.ctrl.groupingMode == this.scope.ctrl.enumList.groupingMode.SINGLE) {
                this.scope.ctrl.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize * this.overviewModel.metricList.length;
                this.overviewModel.metricList.forEach(function (metric) {
                  _this13.scope.ctrl.overviewCanvasWidth += _this13.getMaxGroupSizeBarLength(metric);
                });
              }
            } else {
              this.scope.ctrl.overviewCanvasWidth += this.getMaxMultiAttributeGroupSize() + this.config.overview.horizontalMarginBetweenMetrics;
            }
          }
        }, {
          key: "getMaxMetricLength",
          value: function getMaxMetricLength() {
            var length = 0;
            this.overviewModel.metricList.forEach(function (metric) {
              var instanceWithMostPoints = _.maxBy(metric.data, function (point) {
                return point.values.length;
              });

              length = instanceWithMostPoints.values.length;
            });
            return length;
          }
        }, {
          key: "getMaxGroupSizeBarLength",
          value: function getMaxGroupSizeBarLength(metric) {
            var largestGroup = _.maxBy(metric.groupList, function (group) {
              return group.instanceList.length;
            });

            return largestGroup.instanceList.length * this.config.overview.singleAttributeGroupSizeWidth;
          }
        }, {
          key: "getMaxMultiAttributeGroupSize",
          value: function getMaxMultiAttributeGroupSize() {
            var result = 0;
            this.overviewModel.groupList.forEach(function (group) {
              if (group.instanceList.length > result) {
                result = group.instanceList.length;
              }
            });
            return result;
          }
        }, {
          key: "setOverviewHeight",
          value: function setOverviewHeight() {
            if (this.scope.ctrl.isGrouped) {
              var groupCount = this.getMaxGroupCount();
              this.scope.ctrl.overviewHeight = groupCount * (this.config.overview.groupedPointHeight * 2); // 2 = group + margin
            } else {
              this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.config.overview.ungroupedPointHeight;
            }

            this.scope.ctrl.overviewHeight += (this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 2; // Metric and time labels
          }
        }, {
          key: "getMaxGroupCount",
          value: function getMaxGroupCount() {
            var groupCount;

            if (this.scope.ctrl.groupingMode == this.scope.ctrl.enumList.groupingMode.SINGLE) {
              var metricWithMostGroups = _.maxBy(this.overviewModel.metricList, function (metric) {
                return metric.groupList.length;
              });

              groupCount = metricWithMostGroups.groupList.length;
            } else {
              groupCount = this.overviewModel.groupList.length;
            }

            return groupCount;
          }
        }, {
          key: "setOverviewContextLabelFont",
          value: function setOverviewContextLabelFont() {
            this.overviewContext.font = "bold " + this.config.overview.metricFontSize + "px Arial";
          }
        }, {
          key: "drawOverviewData",
          value: function drawOverviewData() {
            this.overviewModel.metricWidth = this.getMaxMetricLength() * this.config.overview.pointWidth;
            this.overviewModel.overviewEndY = 0;

            if (this.scope.ctrl.isGrouped) {
              this.drawGroupedOverview();
            } else {
              this.drawUngroupedOverview();
            }

            this.drawMetricLabels();
            this.drawTimeLabels();
          }
        }, {
          key: "drawGroupedOverview",
          value: function drawGroupedOverview() {
            var _this14 = this;

            this.overviewModel.overviewInstanceHeight = this.config.overview.groupedPointHeight;

            if (this.scope.ctrl.groupingMode == this.scope.ctrl.enumList.groupingMode.SINGLE) {
              this.overviewModel.metricList.forEach(function (metric, metricIndex) {
                metric.groupList.forEach(function (group, groupIndex) {
                  _this14.drawGroupOverviewWrapper(group, groupIndex, [metricIndex]);
                });
              });
            } else {
              this.overviewModel.groupList.forEach(function (group, groupIndex) {
                var metricIndexList = _this14.getAllMetricIndexList();

                _this14.drawGroupOverviewWrapper(group, groupIndex, metricIndexList);
              });
            }

            this.drawGroupSize();
            this.drawMetricSeparator();
          }
        }, {
          key: "drawGroupOverviewWrapper",
          value: function drawGroupOverviewWrapper(group, groupIndex, metricIndexList) {
            var instance = group.instanceList[0];
            this.drawOverviewInstance(instance, groupIndex, this.config.overview.groupedPointHeight, this.config.overview.groupedPointHeight, metricIndexList);
            group.y = instance.y;
          }
        }, {
          key: "drawOverviewInstance",
          value: function drawOverviewInstance(instance, index, pointHeight, marginBetweenInstances, metricIndexList) {
            var _this15 = this;

            var endY = instance.y + pointHeight;

            if (endY > this.overviewModel.overviewEndY) {
              this.overviewModel.overviewEndY = endY;
            }

            instance.y = this.overviewModel.overviewStartY + index * (pointHeight + marginBetweenInstances);
            metricIndexList.forEach(function (metricIndex) {
              _this15.drawOverviewInstanceMetric(instance, metricIndex, pointHeight);
            });
          }
        }, {
          key: "drawOverviewInstanceMetric",
          value: function drawOverviewInstanceMetric(instance, metricIndex, pointHeight) {
            var overviewMetric = this.overviewModel.metricList[metricIndex];

            if (metricIndex > 0) {
              var previousMetric = this.overviewModel.metricList[metricIndex - 1];
              overviewMetric.startX = previousMetric.endX + this.config.overview.horizontalMarginBetweenMetrics + this.config.overview.marginBetweenMarkerAndGroup;

              if (this.scope.ctrl.isGrouped && this.scope.ctrl.groupingMode == this.scope.ctrl.enumList.groupingMode.SINGLE) {
                var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(previousMetric);
                overviewMetric.startX += maxGroupSizeBarLength + this.config.overview.marginBetweenMetricAndGroupSize;
              }
            } else {
              overviewMetric.startX = this.config.overview.marginBetweenMarkerAndGroup;
            }

            this.drawOverviewInstancePoints(instance, metricIndex, overviewMetric, pointHeight);
            overviewMetric.endX = overviewMetric.startX + this.overviewModel.metricWidth;
          }
        }, {
          key: "drawOverviewInstancePoints",
          value: function drawOverviewInstancePoints(instance, metricIndex, overviewMetric, pointHeight) {
            var _this16 = this;

            var instanceMetric = instance.metricList[metricIndex];
            instanceMetric.data.forEach(function (point, pointIndex) {
              point.x = overviewMetric.startX + pointIndex * _this16.config.overview.pointWidth;
              point.color = _this16.getColorFromMap(point.value, _this16.overviewModel.metricList[metricIndex].colorMap);
              _this16.overviewContext.fillStyle = point.color;

              _this16.overviewContext.fillRect(point.x, instance.y, _this16.config.overview.pointWidth, pointHeight);
            });
          }
        }, {
          key: "getColorFromMap",
          value: function getColorFromMap(value, map) {
            var result;
            map.forEach(function (color, threshold) {
              if (threshold.min <= value && value <= threshold.max) {
                result = color;
              }
            });
            return "#" + result;
          }
        }, {
          key: "getAllMetricIndexList",
          value: function getAllMetricIndexList() {
            return Array.from(Array(this.overviewModel.metricList.length).keys());
          }
        }, {
          key: "drawGroupSize",
          value: function drawGroupSize() {
            this.setOverviewContextLabelFont();
            var label = "Groups size";
            var labelWidth = this.overviewContext.measureText(label).width;

            if (this.scope.ctrl.groupingMode == this.scope.ctrl.enumList.groupingMode.SINGLE) {
              this.drawSingleAttributeGroupSize(labelWidth);
            } else {
              this.drawMultipleAttributeGroupSize(labelWidth);
            }
          }
        }, {
          key: "drawSingleAttributeGroupSize",
          value: function drawSingleAttributeGroupSize(labelWidth) {
            var _this17 = this;

            this.overviewModel.metricList.forEach(function (metric) {
              var startX = metric.endX + _this17.config.overview.marginBetweenMetricAndGroupSize;

              var maxGroupSizeBarLength = _this17.getMaxGroupSizeBarLength(metric);

              metric.groupList.forEach(function (group, groupIndex) {
                _this17.drawGroupSizeWrapper(startX, group, groupIndex, _this17.config.overview.singleAttributeGroupSizeWidth);
              });
              _this17.overviewContext.fillStyle = "black";

              _this17.overviewContext.fillText("Groups size", (startX * 2 + maxGroupSizeBarLength - labelWidth) / 2, _this17.overviewModel.labelTextHeight);
            });
          }
        }, {
          key: "drawGroupSizeWrapper",
          value: function drawGroupSizeWrapper(startX, group, groupIndex, groupSizeWidth) {
            var endX = startX + group.instanceList.length * groupSizeWidth;
            var startY = this.overviewModel.overviewStartY + groupIndex * this.config.overview.groupedPointHeight * 2; // 2 = instance + margin between instances

            var endY = startY + this.config.overview.groupedPointHeight;
            this.overviewContext.beginPath();
            this.overviewContext.moveTo(startX, startY);
            this.overviewContext.lineTo(endX, startY);
            this.overviewContext.lineTo(endX, endY);
            this.overviewContext.lineTo(startX, endY);
            this.overviewContext.closePath();
            this.overviewContext.fillStyle = "black";
            this.overviewContext.fill();
            return endX;
          }
        }, {
          key: "drawMultipleAttributeGroupSize",
          value: function drawMultipleAttributeGroupSize(labelWidth) {
            var _this18 = this;

            var startX = this.scope.ctrl.overviewWidth + this.config.overview.horizontalMarginBetweenMetrics;
            var maxEndX = 0;
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var endX = _this18.drawGroupSizeWrapper(startX, group, groupIndex, _this18.config.overview.multipleAttributeGroupSizeWidth);

              if (endX > maxEndX) {
                maxEndX = endX;
              }
            });
            this.overviewContext.fillStyle = "black";
            this.overviewContext.fillText("Groups size", (startX + maxEndX - labelWidth) / 2, this.overviewModel.labelTextHeight);
          }
        }, {
          key: "drawMetricSeparator",
          value: function drawMetricSeparator() {
            this.overviewContext.strokeStyle = "gray";

            for (var i = 0; i < this.overviewModel.metricList.length - 1; ++i) {
              var metric = this.overviewModel.metricList[i];
              var x = metric.endX + this.config.overview.horizontalMarginBetweenMetrics / 2;

              if (this.scope.ctrl.groupingMode == this.scope.ctrl.enumList.groupingMode.SINGLE) {
                var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(metric);
                x += this.config.overview.marginBetweenMetricAndGroupSize + maxGroupSizeBarLength;
              }

              this.overviewContext.beginPath();
              this.overviewContext.moveTo(x, this.overviewModel.overviewStartY);
              this.overviewContext.lineTo(x, this.scope.ctrl.overviewHeight);
              this.overviewContext.stroke();
              this.overviewContext.closePath();
            }
          }
        }, {
          key: "drawUngroupedOverview",
          value: function drawUngroupedOverview() {
            var _this19 = this;

            this.overviewModel.overviewInstanceHeight = this.config.overview.ungroupedPointHeight;
            this.overviewModel.data.forEach(function (instance, instanceIndex) {
              var metricIndexList = _this19.getAllMetricIndexList();

              _this19.drawOverviewInstance(instance, instanceIndex, _this19.config.overview.ungroupedPointHeight, 0, metricIndexList);
            });
            this.drawGroupBars();
          }
        }, {
          key: "drawGroupBars",
          value: function drawGroupBars() {
            var colorStep = (this.config.overview.startingGreyColor - this.config.overview.endingGrayColor) / this.overviewModel.groupList.length;

            for (var i = 1; i < this.overviewModel.metricList.length; ++i) {
              var x = this.overviewModel.metricList[i].startX - this.config.overview.horizontalMarginBetweenMetrics / 2;
              this.drawGroupBarAtPosition(x, colorStep);
            }
          }
        }, {
          key: "drawGroupBarAtPosition",
          value: function drawGroupBarAtPosition(x, colorStep) {
            var _this20 = this;

            var y = this.overviewModel.overviewStartY;
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var greyValue = Math.round(_this20.config.overview.startingGreyColor - colorStep * groupIndex);
              var fillStyle = "rgba(" + greyValue + ", " + greyValue + ", " + greyValue + ", 1)";
              _this20.overviewContext.fillStyle = fillStyle;
              var height = group.instanceList.length * _this20.config.overview.ungroupedPointHeight;

              _this20.overviewContext.fillRect(x - Math.floor(_this20.config.overview.groupBarWidth / 2), y, _this20.config.overview.groupBarWidth, height);

              y += height;
            });
          }
        }, {
          key: "drawMetricLabels",
          value: function drawMetricLabels() {
            this.setOverviewContextLabelFont();
            this.overviewContext.fillStyle = "black";

            for (var i = 0; i < this.config.metricLabelList.length; ++i) {
              var metric = this.overviewModel.metricList[i];
              var label = this.config.metricLabelList[i];
              var width = this.overviewContext.measureText(label).width;
              this.overviewContext.fillText(label, (metric.startX + metric.endX - width) / 2, this.overviewModel.labelTextHeight);
            }
          }
        }, {
          key: "drawTimeLabels",
          value: function drawTimeLabels() {
            this.setOverviewContextTimeFont();
            var toDate = this.getDateString(this.toDate * 1000);
            var toDateWidth = this.overviewContext.measureText(toDate).width;
            var y = this.scope.ctrl.overviewHeight;
            var metric = this.overviewModel.metricList[this.overviewModel.metricList.length - 1];
            this.overviewContext.fillStyle = "black";
            this.overviewContext.fillText(toDate, metric.endX - toDateWidth / 2, y);
          }
        }, {
          key: "setOverviewContextTimeFont",
          value: function setOverviewContextTimeFont() {
            this.overviewContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
          }
        }, {
          key: "getDateString",
          value: function getDateString(date) {
            return moment(date).format(this.config.dateFormat);
          }
        }, {
          key: "selectOverviewMode",
          value: function selectOverviewMode() {
            this.drawOverview();
          }
        }, {
          key: "selectLinker",
          value: function selectLinker() {
            this.drawFocusArea();
          }
        }, {
          key: "selectGroupingMode",
          value: function selectGroupingMode() {
            this.changeGroupingSelection();
          }
        }, {
          key: "changeGroupingSelection",
          value: function changeGroupingSelection() {
            this.drawOverview();
            this.scope.ctrl.focusModel.groupList = [];
            this.showFocus = false;
          }
        }, {
          key: "groupUngroup",
          value: function groupUngroup() {
            this.scope.ctrl.isGrouped = !this.scope.ctrl.isGrouped;
            this.changeGroupingSelection();
          }
        }, {
          key: "moveMouseOnOverview",
          value: function moveMouseOnOverview(evt) {
            this.setOverviewMousePosition(evt);

            if (this.scope.ctrl.isGrouped) {
              this.initialiseOverviewCanvasCursor();
              var found = false;

              for (var overviewIndex = 0; overviewIndex < this.overviewModel.metricList.length; ++overviewIndex) {
                var metric = this.overviewModel.metricList[overviewIndex]; // only check if mouse is on a metric graph

                if (metric.startX <= this.overviewModel.mousePosition.x && this.overviewModel.mousePosition.x <= metric.endX) {
                  found = this.checkAndSetSelectedGroup(metric);
                }

                if (found) {
                  break;
                }
              }
            } else if (!this.focusAreaIsFixed) {
              this.drawFocus(evt);
            }
          }
        }, {
          key: "setOverviewMousePosition",
          value: function setOverviewMousePosition(evt) {
            this.overviewModel.mousePosition = this.getMousePos(evt, this.focusAreaCanvas);
          }
        }, {
          key: "checkAndSetSelectedGroup",
          value: function checkAndSetSelectedGroup(metric) {
            if (this.scope.ctrl.groupingMode == this.scope.ctrl.enumList.groupingMode.SINGLE) {
              for (var i = 0; i < metric.groupList.length; ++i) {
                var group = metric.groupList[i];

                if (this.checkGroupIsSelected(group)) {
                  return true;
                }
              }
            } else {
              for (var i = 0; i < this.overviewModel.groupList.length; ++i) {
                var group = this.overviewModel.groupList[i];

                if (this.checkGroupIsSelected(group)) {
                  return true;
                }
              }
            }

            this.overviewModel.selectedGroup = null;
            return false;
          }
        }, {
          key: "checkGroupIsSelected",
          value: function checkGroupIsSelected(group) {
            if (group.y <= this.overviewModel.mousePosition.y && this.overviewModel.mousePosition.y <= group.y + this.config.overview.groupedPointHeight) {
              this.overviewModel.selectedGroup = group;
              this.scope.ctrl.overviewCursor = "pointer";
              return true;
            }
          }
        }, {
          key: "clickOnOverView",
          value: function clickOnOverView(evt) {
            this.setOverviewMousePosition(evt);

            if (this.scope.ctrl.isGrouped) {
              this.checkAndAddGroupToFocus();
            } else {
              this.fixFocusArea(evt);
            }
          }
        }, {
          key: "checkAndAddGroupToFocus",
          value: function checkAndAddGroupToFocus() {
            var _this21 = this;

            if (this.overviewModel.selectedGroup) {
              this.$timeout(function () {
                var focusGroup = _.find(_this21.scope.ctrl.focusModel.groupList, function (search) {
                  return search.overviewGroup == _this21.overviewModel.selectedGroup;
                });

                if (focusGroup) {
                  _.remove(_this21.scope.ctrl.focusModel.groupList, function (group) {
                    return group.overviewGroup == _this21.overviewModel.selectedGroup;
                  });
                } else {
                  _this21.addGroupToFocus();
                }

                _this21.scope.$apply();

                _this21.drawFocusGraph();
              });
            }
          }
        }, {
          key: "addGroupToFocus",
          value: function addGroupToFocus() {
            var _this22 = this;

            var focusGroup = {};
            focusGroup.instanceList = [];
            focusGroup.overviewGroup = this.overviewModel.selectedGroup;
            this.overviewModel.selectedGroup.instanceList.forEach(function (overviewInstance) {
              var metricWithMostData = _.maxBy(overviewInstance.metricList, function (metric) {
                return metric.data.length;
              });

              ;
              _this22.scope.ctrl.focusModel.focusedIndexList = Array.from(Array(metricWithMostData.data.length).keys());

              var focusInstance = _this22.getFocusInstance(overviewInstance, _this22.scope.ctrl.focusModel.focusedIndexList);

              focusGroup.instanceList.push(focusInstance);
            });
            this.scope.ctrl.focusModel.groupList.push(focusGroup);
          }
        }, {
          key: "fixFocusArea",
          value: function fixFocusArea(evt) {
            this.initialiseOverviewCanvasCursor();

            if (this.focusAreaIsFixed) {
              this.drawFocus(evt);
            }

            this.focusAreaIsFixed = !this.focusAreaIsFixed;
          }
        }, {
          key: "drawFocus",
          value: function drawFocus(evt) {
            this.drawFocusArea();

            for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
              var metric = this.overviewModel.metricList[i]; // only update focus graph if mouse is pointing on one of metric overview graphs

              if (metric.startX <= this.overviewModel.mousePosition.x && this.overviewModel.mousePosition.x <= metric.endX) {
                this.drawFocusGraph();
                break;
              }
            }
          }
        }, {
          key: "getMousePos",
          value: function getMousePos(evt, canvas) {
            var rect = canvas.getBoundingClientRect();
            return {
              x: evt.clientX - rect.left,
              y: evt.clientY - rect.top
            };
          }
        }, {
          key: "drawFocusArea",
          value: function drawFocusArea() {
            if (this.overviewModel.mousePosition) {
              var size = this.getFocusAreaSize();
              var minimumTopY = Math.max(this.overviewModel.overviewStartY, this.overviewModel.mousePosition.y - size / 2);
              this.scope.ctrl.focusModel.focusStartY = Math.min(minimumTopY, this.overviewModel.overviewEndY - size);
              this.drawFocusAreaAndLinkers(true);
            }
          }
        }, {
          key: "getFocusAreaSize",
          value: function getFocusAreaSize() {
            return Math.min(this.config.focusArea.size * 2, this.overviewModel.overviewEndY - this.overviewModel.overviewStartY);
          }
        }, {
          key: "drawFocusAreaAndLinkers",
          value: function drawFocusAreaAndLinkers(doDrawLinkers) {
            var _this23 = this;

            var size = this.getFocusAreaSize();
            var offset = this.getFocusAreaOffset();

            if (offset >= 0) {
              if (doDrawLinkers) {
                this.clearFocus();
              }

              this.focusAreaContext.strokeStyle = this.config.focusArea.color;
              this.overviewModel.metricList.forEach(function (metric) {
                metric.focusStartX = metric.startX + offset;

                _this23.focusAreaContext.strokeRect(metric.focusStartX, _this23.scope.ctrl.focusModel.focusStartY, size, size);
              });

              if (doDrawLinkers) {
                this.drawLinkers();
              }
            }
          }
        }, {
          key: "getFocusAreaOffset",
          value: function getFocusAreaOffset() {
            for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
              var metric = this.overviewModel.metricList[i];

              if (this.checkMouseIsInMetric(metric)) {
                this.overviewModel.mousePositionXOffset = this.overviewModel.mousePosition.x - metric.startX;
                this.scope.ctrl.focusModel.sourceMetricIndex = i;
                return Math.min(Math.max(metric.startX, this.overviewModel.mousePosition.x - this.config.focusArea.size), metric.endX - this.getFocusAreaSize()) - metric.startX;
              }
            }
          }
        }, {
          key: "checkMouseIsInMetric",
          value: function checkMouseIsInMetric(metric) {
            return metric.startX <= this.overviewModel.mousePosition.x && this.overviewModel.mousePosition.x <= metric.endX;
          }
        }, {
          key: "drawLinkers",
          value: function drawLinkers() {
            var _this24 = this;

            var pixelData = this.overviewContext.getImageData(this.overviewModel.mousePosition.x, this.overviewModel.mousePosition.y, 1, 1).data;
            this.focusAreaContext.strokeStyle = "rgb(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + ")";
            var instance = this.getLinkerTargetInstance();
            instance = null; // temp flag to prevent drawing linkers

            if (instance) {
              this.overviewModel.metricList.forEach(function (metric, index) {
                if (!_this24.checkMouseIsInMetric(metric)) {
                  _this24.drawLinkersByMode(metric, instance, index);
                }
              });
            }
          }
        }, {
          key: "getLinkerTargetInstance",
          value: function getLinkerTargetInstance() {
            for (var i = 0; i < this.overviewModel.data.length; ++i) {
              var instance = this.overviewModel.data[i];

              if (instance.y - this.config.overview.ungroupedPointHeight <= this.overviewModel.mousePosition.y && this.overviewModel.mousePosition.y <= instance.y) {
                return instance;
              }
            }
          }
        }, {
          key: "drawLinkersByMode",
          value: function drawLinkersByMode(metric, instance, index) {
            switch (this.scope.ctrl.linkingMode) {
              case this.scope.ctrl.enumList.linkingMode.X_CROSS:
                this.drawXCross(metric, instance);
                break;

              case this.scope.ctrl.enumList.linkingMode.NORMAL_CROSS:
                this.drawNormalCross(metric, instance);
                break;

              case this.scope.ctrl.enumList.linkingMode.CHANGE_COLOR:
                this.changeInstanceColor(metric, instance, index);
                break;

              default:
                break;
            }
          }
        }, {
          key: "drawXCross",
          value: function drawXCross(metric, instance) {
            var centerX = metric.startX + this.overviewModel.mousePositionXOffset;
            var leftStartX = centerX - this.config.focusArea.xCrossSize;
            var rightStartX = centerX + this.config.overview.pointWidth;
            var bottomInstance = instance.y + this.config.overview.ungroupedPointHeight;
            this.drawXCrossLine(leftStartX, instance.y - this.config.focusArea.xCrossSize, instance.y);
            this.drawXCrossLine(rightStartX, instance.y, instance.y - this.config.focusArea.xCrossSize);
            this.drawXCrossLine(leftStartX, bottomInstance + this.config.focusArea.xCrossSize, bottomInstance);
            this.drawXCrossLine(rightStartX, bottomInstance, bottomInstance + this.config.focusArea.xCrossSize);
          }
        }, {
          key: "drawXCrossLine",
          value: function drawXCrossLine(startX, startY, endY) {
            this.drawLineOnFocusAreaCanvas(startX, startY, startX + this.config.focusArea.xCrossSize, endY);
          }
        }, {
          key: "drawLineOnFocusAreaCanvas",
          value: function drawLineOnFocusAreaCanvas(startX, startY, endX, endY) {
            this.focusAreaContext.beginPath();
            this.focusAreaContext.moveTo(startX, startY);
            this.focusAreaContext.lineTo(endX, endY);
            this.focusAreaContext.stroke();
            this.focusAreaContext.closePath();
          }
        }, {
          key: "drawNormalCross",
          value: function drawNormalCross(metric, instance) {
            var focusSize = this.getFocusAreaSize();
            var centertX = metric.startX + this.overviewModel.mousePositionXOffset;
            var endX = metric.focusStartX + focusSize;
            var distanceBetweenLines = this.config.overview.pointWidth * 2;
            var leftLineX = centertX - distanceBetweenLines;
            var rightLineX = centertX + distanceBetweenLines;
            var topLineY = instance.y - distanceBetweenLines;
            var bottomLineY = instance.y + distanceBetweenLines;
            var endY = this.scope.ctrl.focusModel.focusStartY + focusSize;
            this.drawNormalCrossLines(metric, endX, leftLineX, rightLineX, topLineY, bottomLineY, endY);
          }
        }, {
          key: "drawNormalCrossLines",
          value: function drawNormalCrossLines(metric, endX, leftLineX, rightLineX, topLineY, bottomLineY, endY) {
            // top horizontal
            this.drawLineOnFocusAreaCanvas(metric.focusStartX, topLineY, leftLineX, topLineY);
            this.drawLineOnFocusAreaCanvas(rightLineX, topLineY, endX, topLineY); // botton horizontal

            this.drawLineOnFocusAreaCanvas(metric.focusStartX, bottomLineY, leftLineX, bottomLineY);
            this.drawLineOnFocusAreaCanvas(rightLineX, bottomLineY, endX, bottomLineY); // left vertical

            this.drawLineOnFocusAreaCanvas(leftLineX, this.scope.ctrl.focusModel.focusStartY, leftLineX, topLineY);
            this.drawLineOnFocusAreaCanvas(leftLineX, bottomLineY, leftLineX, endY); // right vertical

            this.drawLineOnFocusAreaCanvas(rightLineX, this.scope.ctrl.focusModel.focusStartY, rightLineX, topLineY);
            this.drawLineOnFocusAreaCanvas(rightLineX, bottomLineY, rightLineX, endY);
          }
        }, {
          key: "changeInstanceColor",
          value: function changeInstanceColor(metric, instance, index) {
            var _this25 = this;

            if (index == 0) {
              this.clearFocus();
            }

            instance.metricList[index].data.forEach(function (instancePoint, pointIndex) {
              var colorMap = _this25.getColorMap(metric, _this25.config.colors[_this25.scope.ctrl.focusModel.sourceMetricIndex]);

              _this25.focusAreaContext.fillStyle = _this25.getColorFromMap(instancePoint.value, colorMap);

              _this25.focusAreaContext.fillRect(instancePoint.x, instance.y, _this25.overviewModel.overviewInstanceHeight, _this25.overviewModel.overviewInstanceHeight);

              if (instancePoint.x == metric.startX + _this25.overviewModel.mousePositionXOffset) {
                // vertical line
                metric.data.forEach(function (metricInstance, metricInstanceIndex) {
                  var metricPoint = metricInstance.values[pointIndex];
                  var value = metricPoint ? metricPoint[1] : 0;
                  _this25.focusAreaContext.fillStyle = _this25.getColorFromMap(value, colorMap);

                  _this25.focusAreaContext.fillRect(instancePoint.x, _this25.overviewModel.data[metricInstanceIndex].y, _this25.overviewModel.overviewInstanceHeight, _this25.overviewModel.overviewInstanceHeight);
                });
              }
            });

            if (index == instance.metricList.length - 1) {
              this.drawFocusAreaAndLinkers(false);
            }
          }
        }, {
          key: "drawFocusGraph",
          value: function drawFocusGraph() {
            var _this26 = this;

            if (!this.scope.ctrl.isGrouped) {
              this.initialiseFocusGraphData();
            }

            if (this.scope.ctrl.isGrouped && this.scope.ctrl.focusModel.groupList.length > 0 || !this.scope.ctrl.isGrouped && this.scope.ctrl.focusModel.data.length > 0) {
              this.scope.ctrl.showFocus = true;
              this.$timeout(function () {
                _this26.scope.ctrl.focusGraphHeight = _this26.overviewModel.metricList.length * _this26.config.focusGraph.metricMaxHeight + (_this26.overviewModel.metricList.length - 1) * _this26.config.focusGraph.marginBetweenMetrics;
                _this26.scope.ctrl.focusGraphWidth = (_this26.scope.ctrl.focusModel.focusedIndexList.length - 1) * _this26.getFocusGraphPointWidth();

                _this26.scope.$apply();

                _this26.scope.ctrl.focusModel.focusRowHeight = _this26.getElementByID("focusGraphRow").offsetHeight;

                _this26.setFocusFromAndToDate();

                _this26.positionFocusFromAndToDate();

                _this26.drawFocusGraphData();

                _this26.autoSrollFocusGraph();
              });
            } else {
              this.scope.ctrl.showFocus = false;
            }
          }
        }, {
          key: "getFocusGraphPointWidth",
          value: function getFocusGraphPointWidth() {
            return this.scope.ctrl.isGrouped ? this.config.focusGraph.groupedPointWidth : this.config.focusGraph.ungroupedPointWidth;
          }
        }, {
          key: "initialiseFocusGraphData",
          value: function initialiseFocusGraphData() {
            var _this27 = this;

            if (!this.scope.ctrl.focusModel.data) {
              this.scope.ctrl.focusModel.data = [];
            }

            this.scope.ctrl.focusModel.data.length = 0;
            this.overviewModel.data.forEach(function (overviewInstance) {
              if (_this27.checkInstanceInFocus(overviewInstance)) {
                _this27.scope.ctrl.focusModel.focusedIndexList = _this27.getIndexesOfPointsInFocus(overviewInstance);

                var focusInstance = _this27.getFocusInstance(overviewInstance, _this27.scope.ctrl.focusModel.focusedIndexList);

                _this27.scope.ctrl.focusModel.data.push(focusInstance);
              }
            });
          }
        }, {
          key: "checkInstanceInFocus",
          value: function checkInstanceInFocus(instance) {
            return instance.y <= this.scope.ctrl.focusModel.focusStartY + this.getFocusAreaSize() && instance.y + this.overviewModel.overviewInstanceHeight >= this.scope.ctrl.focusModel.focusStartY;
          }
        }, {
          key: "getIndexesOfPointsInFocus",
          value: function getIndexesOfPointsInFocus(overviewInstance) {
            var _this28 = this;

            var indexes = [];

            for (var i = 0; i < overviewInstance.metricList.length; ++i) {
              var metric = overviewInstance.metricList[i];

              if (metric.data.length > 0) {
                var overviewMetric = this.overviewModel.metricList[i];
                metric.data.forEach(function (point, index) {
                  if (overviewMetric.focusStartX <= point.x && point.x <= overviewMetric.focusStartX + _this28.getFocusAreaSize()) {
                    indexes.push(index);
                  }
                });
                break;
              }
            }

            return indexes;
          }
        }, {
          key: "getFocusInstance",
          value: function getFocusInstance(overviewInstance, indexList) {
            var focusInstance = {};
            focusInstance.instance = overviewInstance.instance;
            this.initialiseFocusInstanceData(focusInstance, overviewInstance, indexList);
            return focusInstance;
          }
        }, {
          key: "initialiseFocusInstanceData",
          value: function initialiseFocusInstanceData(focusInstance, overviewInstance, indexList) {
            focusInstance.metricList = [];
            this.addFocusMetrics(focusInstance, overviewInstance, indexList);
            this.initialiseInstanceLayers(focusInstance);
          }
        }, {
          key: "addFocusMetrics",
          value: function addFocusMetrics(focusInstance, overviewInstance, indexList) {
            this.overviewModel.metricList.forEach(function (metric, metricIndex) {
              var focusMetric = {};
              focusMetric.data = [];
              focusMetric.layerList = [];
              indexList.forEach(function (index) {
                var point = overviewInstance.metricList[metricIndex].data[index];

                if (point) {
                  focusMetric.data.push(point);
                }
              });
              focusInstance.metricList.push(focusMetric);
            });
          }
        }, {
          key: "initialiseInstanceLayers",
          value: function initialiseInstanceLayers(instance) {
            var _this29 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              _this29.config.colors[metricIndex].forEach(function () {
                var layer = {};
                layer.valueList = [];
                metric.layerList.push(layer);
              });

              metric.data.forEach(function (point) {
                var value = point.value;
                metric.layerList.forEach(function (layer) {
                  layer.valueList.push(value > 0 ? value : 0);
                  value -= _this29.overviewModel.metricList[metricIndex].layerRange;
                });
              });
            });
          }
        }, {
          key: "setFocusFromAndToDate",
          value: function setFocusFromAndToDate() {
            for (var instanceIndex = 0; instanceIndex < this.overviewModel.data.length; ++instanceIndex) {
              var instance = this.overviewModel.data[instanceIndex];
              var set = false;

              for (var metricIndex = 0; metricIndex < instance.metricList.length; ++metricIndex) {
                var metric = instance.metricList[metricIndex];
                var fromIndex = this.scope.ctrl.focusModel.focusedIndexList[0];
                var toIndex = this.scope.ctrl.focusModel.focusedIndexList[this.scope.ctrl.focusModel.focusedIndexList.length - 1];

                if (metric.data[fromIndex] && metric.data[toIndex]) {
                  this.scope.ctrl.focusedFromDate = this.getDateString(metric.data[fromIndex].date * 1000);
                  this.scope.ctrl.focusedToDate = this.getDateString(metric.data[toIndex].date * 1000);
                  set = true;
                  break;
                }
              }

              if (set) {
                break;
              }
            }
          }
        }, {
          key: "positionFocusFromAndToDate",
          value: function positionFocusFromAndToDate() {
            this.scope.ctrl.timeFontSize = this.config.overview.timeFontSize;
            this.setOverviewContextTimeFont();
            var canvasStartX = this.getElementByID("canvasCell").offsetLeft;
            var fromDateWidth = this.overviewContext.measureText(this.scope.ctrl.focusedFromDate).width;
            this.scope.ctrl.fromDateLeftMargin = canvasStartX - fromDateWidth / 2;
            this.scope.ctrl.toDateLeftMargin = this.scope.ctrl.focusGraphWidth - fromDateWidth;
          }
        }, {
          key: "drawFocusGraphData",
          value: function drawFocusGraphData() {
            if (this.scope.ctrl.isGrouped) {
              this.drawGroupedFocusGraph();
            } else {
              this.drawUngroupedFocusGraph();
            }
          }
        }, {
          key: "drawGroupedFocusGraph",
          value: function drawGroupedFocusGraph() {
            var _this30 = this;

            this.scope.ctrl.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  var canvas = _this30.getElementByID("focusGraphCanvas-" + groupIndex + "-" + instanceIndex);

                  var context = _this30.getCanvasContext(canvas);

                  context.clearRect(0, 0, canvas.width, canvas.height);

                  _this30.drawFocusGraphInstance(instance, context);
                }
              });
            });
          }
        }, {
          key: "drawFocusGraphInstance",
          value: function drawFocusGraphInstance(instance, context) {
            var _this31 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              metric.layerList.forEach(function (layer, layerIndex) {
                var y = (_this31.config.focusGraph.metricMaxHeight + _this31.config.focusGraph.marginBetweenMetrics) * metricIndex + _this31.config.focusGraph.metricMaxHeight;
                context.beginPath();
                context.moveTo(0, y);
                var x = 0;
                var previousX = 0;
                var previousValue = 0;
                layer.valueList.forEach(function (value, valueIndex) {
                  x = _this31.getFocusGraphPointWidth() * valueIndex;

                  _this31.moveContextBasedOnValue(context, value, previousX, previousValue, layerIndex, x, y, _this31.overviewModel.metricList[metricIndex].layerRange);

                  previousX = x;
                  previousValue = value;
                });
                context.lineTo(x, y);
                context.lineTo(_this31.scope.ctrl.focusModel.graphBeginX, y);
                context.closePath();
                context.fillStyle = "#" + _this31.config.colors[metricIndex][layerIndex];
                context.fill();
              });
            });
          }
        }, {
          key: "drawUngroupedFocusGraph",
          value: function drawUngroupedFocusGraph() {
            var _this32 = this;

            this.scope.ctrl.focusModel.data.forEach(function (instance, instanceIndex) {
              var canvas = _this32.getElementByID("focusGraphCanvas-" + instanceIndex);

              var context = _this32.getCanvasContext(canvas);

              context.clearRect(0, 0, canvas.width, canvas.height);

              _this32.drawFocusGraphInstance(instance, context);
            });
          }
        }, {
          key: "moveContextBasedOnValue",
          value: function moveContextBasedOnValue(context, value, previousX, previousValue, layerIndex, x, y, layerRange) {
            if (value == 0) {
              // draw line straight down to base if value is 0
              context.lineTo(previousX, y);
            } else {
              // move to current position at base if previous value is 0
              if (layerIndex > 0 && previousValue == 0) {
                context.lineTo(x, y);
              }

              if (value >= layerRange) {
                context.lineTo(x, y - this.config.focusGraph.metricMaxHeight);
              } else {
                context.lineTo(x, y - value * this.config.focusGraph.metricMaxHeight / layerRange);
              }
            }
          }
        }, {
          key: "autoSrollFocusGraph",
          value: function autoSrollFocusGraph() {
            if (this.scope.ctrl.isGrouped) {
              this.focusGraphContainer.scrollTop = this.scope.ctrl.focusModel.focusRowHeight * this.focusModel.groupList.length;
            } else {
              this.scrollByInstance();
            }
          }
        }, {
          key: "scrollByInstance",
          value: function scrollByInstance() {
            var instance = this.getLinkerTargetInstance();

            if (instance) {
              for (var i = 0; i < this.scope.ctrl.focusModel.data.length; ++i) {
                var focusModelInstance = this.scope.ctrl.focusModel.data[i];

                if (instance.instance == focusModelInstance.instance) {
                  focusModelInstance.isSelected = true;
                  this.focusGraphContainer.scrollTop = this.scope.ctrl.focusModel.focusRowHeight * i;
                } else {
                  focusModelInstance.isSelected = false;
                }
              }
            }
          }
        }, {
          key: "showNodes",
          value: function showNodes(group, event) {
            var _this33 = this;

            event.preventDefault();
            this.$timeout(function () {
              group.showDetails = !group.showDetails;

              _this33.scope.$apply();

              if (group.showDetails) {
                _this33.drawFocusGraphData();
              }

              _this33.selectNode(group.instanceList[0]);
            });
          }
        }, {
          key: "selectNode",
          value: function selectNode(instance) {
            if (this.scope.ctrl.isGrouped) {
              this.scope.ctrl.focusModel.groupList.forEach(function (group) {
                group.instanceList.forEach(function (instance) {
                  instance.isSelected = false;
                });
              });
            } else {
              this.scope.ctrl.focusModel.data.forEach(function (focusInstance) {
                focusInstance.isSelected = false;
              });
            }

            instance.isSelected = true;
            this.updateVariable(instance);
          }
        }, {
          key: "updateVariable",
          value: function updateVariable(instance) {
            var _this34 = this;

            this.variableSrv.variables.forEach(function (v) {
              if (v.name == "node") {
                _this34.variableSrv.setOptionAsCurrent(v, {
                  text: instance.instance,
                  value: instance.instance
                });

                _this34.variableSrv.variableUpdated(v, true);
              }
            });
          }
        }]);

        return HeatmapCtrl;
      }(MetricsPanelCtrl));

      HeatmapCtrl.templateUrl = "module.html";
    }
  };
});
//# sourceMappingURL=heatmap_ctrl.js.map
