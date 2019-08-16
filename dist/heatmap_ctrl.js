"use strict";

System.register(["app/plugins/sdk", "./heatmap.css!", "lodash"], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, HeatmapCtrl;

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
    }, function (_heatmapCss) {}, function (_lodash) {
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
          _this.focusModel = {};
          _this.scope.focusModel = _this.focusModel;

          _this.initialiseConfig();

          return _this;
        }

        _createClass(HeatmapCtrl, [{
          key: "initialiseConfig",
          value: function initialiseConfig() {
            this.config = {
              // color schemes for metrics
              colors: [["f2d9e6", "d98cb3", "bf4080", "73264d"], // red
              ["ccddff", "6699ff", "0055ff", "003399"], // blue
              ["eeeedd", "cccc99", "aaaa55", "666633"]],
              // determines which the order of attributes to use for sorting
              sortOrder: [0, 1, 2],
              apiAddress: "http://localhost:3000/api/datasources/proxy/1/api/v1/query_range?query=",
              marginBetweenOverviewAndFocus: 50
            };
            this.initialiseOverviewConfig();
            this.initialiseFocusAreaConfig();
            this.initialiseFocusGraphConfig();
          }
        }, {
          key: "initialiseOverviewConfig",
          value: function initialiseOverviewConfig() {
            this.config.overview = {
              pointWidth: 1,
              groupedPointHeight: 5,
              ungroupedPointHeight: 1,
              verticalMarginalBetweenMetrics: 2,
              horizontalMarginBetweenMetrics: 30,
              marginBetweenInstances: 6,
              startingGreyColor: 240,
              endingGrayColor: 80,
              groupBarWidth: 9
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
              pointWidth: 20,
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
              overviewMode: {
                SEPARATED: "1",
                INTEGRATED: "2"
              },
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
            this.scope.ctrl.overviewMode = this.scope.ctrl.enumList.overviewMode.SEPARATED;
            this.scope.ctrl.linkingMode = this.scope.ctrl.enumList.linkingMode.X_CROSS;
            this.scope.ctrl.groupingMode = this.scope.ctrl.enumList.groupingMode.SINGLE;
            this.scope.ctrl.attributeForGrouping = "0";
            this.scope.ctrl.isGrouped = true;
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

            this.scope.selectAttributeForGrouping = function () {
              parent.selectAttributeForGrouping();
            };

            this.scope.groupUngroup = function () {
              parent.groupUngroup();
            };

            this.scope.moveFocusArea = function (evt) {
              parent.moveFocusArea.bind(parent, evt)();
            };

            this.scope.fixFocusArea = function (evt) {
              parent.fixFocusArea.bind(parent, evt)();
            };

            this.scope.selectNode = function (index) {
              parent.selectNode.bind(parent, index)();
            };
          }
        }, {
          key: "initialiseUIElements",
          value: function initialiseUIElements() {
            // overview
            this.overviewCanvas = this.getElementByID("overviewCanvas");
            this.overviewContext = this.overviewCanvas.getContext("2d"); // focus area

            this.focusAreaCanvas = this.getElementByID("focusAreaCanvas");
            this.focusAreaContext = this.focusAreaCanvas.getContext("2d"); // focus graph

            this.scope.ctrl.focusGraphWidth = this.config.focusGraph.maxWidth;
            this.scope.ctrl.focusGraphHeight = this.config.focusGraph.maxHeight;
            this.focusGraphContainer = this.getElementByID("focusGraphContainer");
            this.focusGraphTable = this.getElementByID("focusGraphTable");
          }
        }, {
          key: "getElementByID",
          value: function getElementByID(id) {
            return this.elem.find("#" + id)[0];
          }
        }, {
          key: "onDataReceived",
          value: function onDataReceived(data) {
            if (this.isUpdatingVariable) {
              this.isUpdatingVariable = false;
            } else {
              this.load();
            }
          }
        }, {
          key: "load",
          value: function load() {
            var _this2 = this;

            this.$timeout(function () {
              if (_this2.scope.ctrl.isLoading) {
                _this2.load();
              } else {
                _this2.scope.ctrl.isLoading = true;

                _this2.scope.$apply();

                _this2.overviewModel.metricList = [null, null, null];
                _this2.loadCount = 0;
                _this2.fromDate = _this2.getDateInSeconds(_this2.timeSrv.timeRange().from._d);
                _this2.toDate = _this2.getDateInSeconds(_this2.timeSrv.timeRange().to._d);

                _this2.getDataFromAPI("node_load1{job='node'}", 0);

                _this2.getDataFromAPI("\n                        100 - (node_memory_MemFree_bytes{job='node'} - node_memory_Cached_bytes{job='node'}) \n                                * 100 / \n                                (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'})\n                    ", 1);

                _this2.getDataFromAPI("\n                    100 - (sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)',\n                                                                            mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})) \n                                * 100 / \n                            (sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'}))\n                ", 2);

                _this2.processRawData();
              }
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
              var colors = _this6.config.colors[index];
              metric.layerRange = metric.max / colors.length; // map a range of values to a color

              metric.colorMap = _this6.getColorMap(metric, colors);
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
            var _this10 = this;

            this.overviewModel.groupList = [];
            this.overviewModel.data.forEach(function (instance) {
              var group = _.find(_this10.overviewModel.groupList, function (search) {
                return _this10.checkInstanceInGroup(instance, search);
              });

              if (!group) {
                group = _this10.initialiseNewGroup(instance);

                _this10.overviewModel.groupList.push(group);
              }

              group.instanceList.push(instance);
            });
          }
        }, {
          key: "checkInstanceInGroup",
          value: function checkInstanceInGroup(instance, group) {
            if (this.scope.ctrl.groupingMode == this.scope.ctrl.enumList.groupingMode.SINGLE) {
              var index = parseInt(this.scope.ctrl.attributeForGrouping);
              return instance.metricList[index].total == group.metricList[index].total;
            } else {
              for (var i = 0; i < instance.metricList.length; ++i) {
                if (instance.metricList[i].total != group.metricList[i].total) {
                  return false;
                }
              }

              return true;
            }
          }
        }, {
          key: "initialiseNewGroup",
          value: function initialiseNewGroup(instance) {
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
              this.drawOverviewData();
            }
          }
        }, {
          key: "clearFocus",
          value: function clearFocus() {
            this.hasFocus = false;
            this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
          }
        }, {
          key: "drawOverviewData",
          value: function drawOverviewData() {
            var _this11 = this;

            this.$timeout(function () {
              _this11.overviewContext.clearRect(0, 0, _this11.overviewCanvas.width, _this11.overviewCanvas.height);

              var length = _this11.getInstanceHorizontalLength();

              if (_this11.scope.ctrl.overviewMode == _this11.scope.ctrl.enumList.overviewMode.SEPARATED) {
                _this11.scope.ctrl.overviewWidth = length * _this11.config.overview.pointWidth;

                if (_this11.scope.ctrl.isGrouped) {
                  _this11.scope.ctrl.overviewHeight = _this11.overviewModel.groupList.length * _this11.config.overview.groupedPointHeight;
                  _this11.scope.ctrl.overviewCanvasWidth = _this11.scope.ctrl.overviewWidth + _this11.getMaxGroupSize() + _this11.config.overview.horizontalMarginBetweenMetrics;
                } else {
                  _this11.scope.ctrl.overviewHeight = _this11.overviewModel.data.length * _this11.config.overview.ungroupedPointHeight;
                  _this11.scope.ctrl.overviewCanvasWidth = _this11.scope.ctrl.overviewWidth;
                }

                _this11.scope.$apply();

                _this11.drawSeparated();
              } else {
                _this11.overviewModel.overviewInstanceHeight = _this11.config.overview.ungroupedPointHeight * _this11.overviewModel.metricList.length + _this11.config.overview.verticalMarginalBetweenMetrics * (_this11.overviewModel.metricList.length - 1) + _this11.config.overview.marginBetweenInstances;
                _this11.scope.ctrl.overviewWidth = length * _this11.config.overview.pointWidth;
                _this11.scope.ctrl.overviewCanvasWidth = _this11.scope.ctrl.overviewWidth;
                _this11.scope.ctrl.overviewHeight = _this11.overviewModel.data.length * _this11.overviewModel.overviewInstanceHeight;

                _this11.scope.$apply();

                _this11.drawIntengrated();
              }

              ;
              _this11.scope.ctrl.focusGraphMarginTop = _this11.scope.ctrl.overviewHeight + _this11.config.marginBetweenOverviewAndFocus;
            });
          }
        }, {
          key: "getInstanceHorizontalLength",
          value: function getInstanceHorizontalLength() {
            var length = this.getMaxMetricLength();

            if (this.scope.ctrl.overviewMode == this.scope.ctrl.enumList.overviewMode.SEPARATED) {
              return length * this.overviewModel.metricList.length + (this.overviewModel.metricList.length - 1) * this.config.overview.horizontalMarginBetweenMetrics;
            } else {
              return length;
            }
          }
        }, {
          key: "getMaxGroupSize",
          value: function getMaxGroupSize() {
            var result = 0;
            this.overviewModel.groupList.forEach(function (group) {
              if (group.instanceList.length > result) {
                result = group.instanceList.length;
              }
            });
            return result;
          }
        }, {
          key: "getMaxMetricLength",
          value: function getMaxMetricLength() {
            var length = 0;
            this.overviewModel.metricList.forEach(function (metric) {
              metric.data.forEach(function (point) {
                if (point.values.length > length) {
                  length = point.values.length;
                }
              });
            });
            return length;
          }
        }, {
          key: "drawIntengrated",
          value: function drawIntengrated() {
            var _this12 = this;

            this.overviewModel.data.forEach(function (instance, instanceIndex) {
              instance.y = instanceIndex * _this12.overviewModel.overviewInstanceHeight;
              instance.metricList.forEach(function (metric, metricIndex) {
                metric.data.forEach(function (point, pointIndex) {
                  point.x = pointIndex * _this12.config.overview.pointWidth;
                  point.color = _this12.getColorFromMap(point.value, _this12.overviewModel.metricList[metricIndex].colorMap);
                  _this12.overviewContext.fillStyle = point.color;
                  var y = instance.y + metricIndex * _this12.config.overview.ungroupedPointHeight * _this12.config.overview.verticalMarginalBetweenMetrics;

                  _this12.overviewContext.fillRect(point.x, y, _this12.config.overview.ungroupedPointHeight, _this12.config.overview.ungroupedPointHeight);
                });
              });
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
          key: "drawSeparated",
          value: function drawSeparated() {
            this.overviewModel.metricWidth = this.getMaxMetricLength() * this.config.overview.pointWidth;

            if (this.scope.ctrl.isGrouped) {
              this.drawGrouped();
            } else {
              this.drawUngrouped();
            }
          }
        }, {
          key: "drawGrouped",
          value: function drawGrouped() {
            var _this13 = this;

            this.overviewModel.overviewInstanceHeight = this.config.overview.groupedPointHeight;
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var instance = group.instanceList[0];

              _this13.drawOverviewInstance(instance, groupIndex, _this13.config.overview.groupedPointHeight);
            });
            this.drawGroupSize();
          }
        }, {
          key: "drawOverviewInstance",
          value: function drawOverviewInstance(instance, index, pointHeigh) {
            var _this14 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              instance.y = index * pointHeigh;
              var overviewMetric = _this14.overviewModel.metricList[metricIndex];
              overviewMetric.startX = _this14.overviewModel.metricWidth * metricIndex;

              if (metricIndex > 0) {
                overviewMetric.startX += _this14.config.overview.horizontalMarginBetweenMetrics * metricIndex;
              }

              metric.data.forEach(function (point, pointIndex) {
                point.x = overviewMetric.startX + pointIndex * _this14.config.overview.pointWidth;
                point.color = _this14.getColorFromMap(point.value, _this14.overviewModel.metricList[metricIndex].colorMap);
                _this14.overviewContext.fillStyle = point.color;

                _this14.overviewContext.fillRect(point.x, instance.y, _this14.config.overview.pointWidth, pointHeigh);
              });
              overviewMetric.endX = overviewMetric.startX + _this14.overviewModel.metricWidth;
            });
          }
        }, {
          key: "drawGroupSize",
          value: function drawGroupSize() {
            var _this15 = this;

            var beginX = this.scope.ctrl.overviewWidth + this.config.overview.horizontalMarginBetweenMetrics;
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var endX = beginX + group.instanceList.length;
              var beginY = groupIndex * _this15.config.overview.groupedPointHeight;
              var endY = beginY + _this15.config.overview.groupedPointHeight;

              _this15.overviewContext.beginPath();

              _this15.overviewContext.moveTo(beginX, beginY);

              _this15.overviewContext.lineTo(endX, beginY);

              _this15.overviewContext.lineTo(endX, endY);

              _this15.overviewContext.lineTo(beginX, endY);

              _this15.overviewContext.closePath();

              _this15.overviewContext.fillStyle = "gray";

              _this15.overviewContext.fill();
            });
          }
        }, {
          key: "drawUngrouped",
          value: function drawUngrouped() {
            var _this16 = this;

            this.overviewModel.overviewInstanceHeight = this.config.overview.ungroupedPointHeight;
            this.overviewModel.data.forEach(function (instance, instanceIndex) {
              _this16.drawOverviewInstance(instance, instanceIndex, _this16.config.overview.ungroupedPointHeight);
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
            var _this17 = this;

            var y = 0;
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var greyValue = Math.round(_this17.config.overview.startingGreyColor - colorStep * groupIndex);
              var fillStyle = "rgba(" + greyValue + ", " + greyValue + ", " + greyValue + ", 1)";
              _this17.overviewContext.fillStyle = fillStyle;
              var height = group.instanceList.length * _this17.config.overview.ungroupedPointHeight;

              _this17.overviewContext.fillRect(x - Math.floor(_this17.config.overview.groupBarWidth / 2), y, _this17.config.overview.groupBarWidth, height);

              y += height;
            });
          }
        }, {
          key: "selectOverviewMode",
          value: function selectOverviewMode() {
            this.drawOverviewData();
          }
        }, {
          key: "selectLinker",
          value: function selectLinker() {
            this.drawFocusArea();
          }
        }, {
          key: "selectGroupingMode",
          value: function selectGroupingMode() {
            this.initialiseOverviewGroups();
            this.drawOverviewData();
          }
        }, {
          key: "selectAttributeForGrouping",
          value: function selectAttributeForGrouping() {
            this.initialiseOverviewGroups();
            this.drawOverviewData();
          }
        }, {
          key: "groupUngroup",
          value: function groupUngroup() {
            this.scope.ctrl.isGrouped = !this.scope.ctrl.isGrouped;
            this.drawOverviewData();
          }
        }, {
          key: "moveFocusArea",
          value: function moveFocusArea(evt) {
            if (!this.focusAreaIsFixed) {
              this.drawFocus(evt);
              evt.preventDefault();
            }
          }
        }, {
          key: "fixFocusArea",
          value: function fixFocusArea(evt) {
            if (this.focusAreaIsFixed) {
              this.drawFocus(evt);
            }

            this.focusAreaIsFixed = !this.focusAreaIsFixed;
            evt.preventDefault();
          }
        }, {
          key: "drawFocus",
          value: function drawFocus(evt) {
            this.focusModel.mousePosition = this.getMousePos(evt, this.overviewCanvas);
            this.drawFocusArea();

            for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
              var metric = this.overviewModel.metricList[i]; // only update focus graph if mouse is pointing on one of metric overview graphs

              if (metric.startX <= this.focusModel.mousePosition.x && this.focusModel.mousePosition.x <= metric.endX) {
                this.drawFocusGraph();
                this.autoSrollFocusGraph();
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
            if (this.focusModel.mousePosition) {
              var size = this.getFocusAreaSize();
              this.focusModel.focusStartY = Math.min(Math.max(0, this.focusModel.mousePosition.y - size / 2), this.overviewCanvas.height - size);

              if (this.scope.ctrl.overviewMode == this.scope.ctrl.enumList.overviewMode.SEPARATED) {
                this.drawMultipleFocusArea(true);
              } else {
                this.drawSingleFocusArea();
              }
            }
          }
        }, {
          key: "getFocusAreaSize",
          value: function getFocusAreaSize() {
            return this.config.focusArea.size * 2;
          }
        }, {
          key: "drawSingleFocusArea",
          value: function drawSingleFocusArea() {
            this.clearFocus();
            var size = this.getFocusAreaSize();
            this.focusModel.focusStartY = Math.min(Math.max(0, this.focusModel.mousePosition.y - size / 2), this.overviewCanvas.height - this.getFocusAreaSize());
            this.focusModel.focusStartX = Math.min(Math.max(0, this.focusModel.mousePosition.x - this.config.focusArea.size), this.overviewCanvas.width - size);
            this.focusAreaContext.strokeStyle = this.config.focusArea.color;
            this.focusAreaContext.strokeRect(this.focusModel.focusStartX, this.focusModel.focusStartY, size, size);
          }
        }, {
          key: "drawMultipleFocusArea",
          value: function drawMultipleFocusArea(doDrawLinkers) {
            var _this18 = this;

            var size = this.getFocusAreaSize();
            var offset = this.getFocusAreaOffset();

            if (offset >= 0) {
              if (doDrawLinkers) {
                this.clearFocus();
              }

              this.focusAreaContext.strokeStyle = this.config.focusArea.color;
              this.overviewModel.metricList.forEach(function (metric) {
                metric.focusStartX = metric.startX + offset;

                _this18.focusAreaContext.strokeRect(metric.focusStartX, _this18.focusModel.focusStartY, size, size);
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
                this.focusModel.mousePositionXOffset = this.focusModel.mousePosition.x - metric.startX;
                this.focusModel.sourceMetricIndex = i;
                return Math.min(Math.max(metric.startX, this.focusModel.mousePosition.x - this.config.focusArea.size), metric.endX - this.getFocusAreaSize()) - metric.startX;
              }
            }
          }
        }, {
          key: "checkMouseIsInMetric",
          value: function checkMouseIsInMetric(metric) {
            return metric.startX <= this.focusModel.mousePosition.x && this.focusModel.mousePosition.x <= metric.endX;
          }
        }, {
          key: "drawLinkers",
          value: function drawLinkers() {
            var _this19 = this;

            var pixelData = this.overviewContext.getImageData(this.focusModel.mousePosition.x, this.focusModel.mousePosition.y, 1, 1).data;
            this.focusAreaContext.strokeStyle = "rgb(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + ")";
            var instance = this.getLinkerTargetInstance();
            instance = null; // temp flag to prevent drawing linkers

            if (instance) {
              this.overviewModel.metricList.forEach(function (metric, index) {
                if (!_this19.checkMouseIsInMetric(metric)) {
                  _this19.drawLinkersByMode(metric, instance, index);
                }
              });
            }
          }
        }, {
          key: "getLinkerTargetInstance",
          value: function getLinkerTargetInstance() {
            for (var i = 0; i < this.overviewModel.data.length; ++i) {
              var instance = this.overviewModel.data[i];

              if (instance.y - this.config.overview.ungroupedPointHeight <= this.focusModel.mousePosition.y && this.focusModel.mousePosition.y <= instance.y) {
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
            var centerX = metric.startX + this.focusModel.mousePositionXOffset;
            var leftBeginX = centerX - this.config.focusArea.xCrossSize;
            var rightBeginX = centerX + this.config.overview.pointWidth;
            var bottomInstance = instance.y + this.config.overview.ungroupedPointHeight;
            this.drawXCrossLine(leftBeginX, instance.y - this.config.focusArea.xCrossSize, instance.y);
            this.drawXCrossLine(rightBeginX, instance.y, instance.y - this.config.focusArea.xCrossSize);
            this.drawXCrossLine(leftBeginX, bottomInstance + this.config.focusArea.xCrossSize, bottomInstance);
            this.drawXCrossLine(rightBeginX, bottomInstance, bottomInstance + this.config.focusArea.xCrossSize);
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
            var centertX = metric.startX + this.focusModel.mousePositionXOffset;
            var endX = metric.focusStartX + focusSize;
            var distanceBetweenLines = this.config.overview.pointWidth * 2;
            var leftLineX = centertX - distanceBetweenLines;
            var rightLineX = centertX + distanceBetweenLines;
            var topLineY = instance.y - distanceBetweenLines;
            var bottomLineY = instance.y + distanceBetweenLines;
            var endY = this.focusModel.focusStartY + focusSize;
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

            this.drawLineOnFocusAreaCanvas(leftLineX, this.focusModel.focusStartY, leftLineX, topLineY);
            this.drawLineOnFocusAreaCanvas(leftLineX, bottomLineY, leftLineX, endY); // right vertical

            this.drawLineOnFocusAreaCanvas(rightLineX, this.focusModel.focusStartY, rightLineX, topLineY);
            this.drawLineOnFocusAreaCanvas(rightLineX, bottomLineY, rightLineX, endY);
          }
        }, {
          key: "changeInstanceColor",
          value: function changeInstanceColor(metric, instance, index) {
            var _this20 = this;

            if (index == 0) {
              this.clearFocus();
            }

            instance.metricList[index].data.forEach(function (instancePoint, pointIndex) {
              var colorMap = _this20.getColorMap(metric, _this20.config.colors[_this20.focusModel.sourceMetricIndex]);

              _this20.focusAreaContext.fillStyle = _this20.getColorFromMap(instancePoint.value, colorMap);

              _this20.focusAreaContext.fillRect(instancePoint.x, instance.y, _this20.overviewModel.overviewInstanceHeight, _this20.overviewModel.overviewInstanceHeight);

              if (instancePoint.x == metric.startX + _this20.focusModel.mousePositionXOffset) {
                // vertical line
                metric.data.forEach(function (metricInstance, metricInstanceIndex) {
                  var metricPoint = metricInstance.values[pointIndex];
                  var value = metricPoint ? metricPoint[1] : 0;
                  _this20.focusAreaContext.fillStyle = _this20.getColorFromMap(value, colorMap);

                  _this20.focusAreaContext.fillRect(instancePoint.x, _this20.overviewModel.data[metricInstanceIndex].y, _this20.overviewModel.overviewInstanceHeight, _this20.overviewModel.overviewInstanceHeight);
                });
              }
            });

            if (index == instance.metricList.length - 1) {
              this.drawMultipleFocusArea(false);
            }
          }
        }, {
          key: "drawFocusGraph",
          value: function drawFocusGraph() {
            var _this21 = this;

            this.initialiseFocusGraphData();

            if (this.focusModel.data.length > 0) {
              this.$timeout(function () {
                _this21.scope.ctrl.focusGraphHeight = _this21.overviewModel.metricList.length * _this21.config.focusGraph.metricMaxHeight + (_this21.overviewModel.metricList.length - 1) * _this21.config.focusGraph.marginBetweenMetrics;
                _this21.scope.ctrl.focusGraphWidth = _this21.focusModel.data[0].metricList[0].data.length * _this21.config.focusGraph.pointWidth;

                _this21.scope.$apply();

                _this21.focusModel.focusRowHeight = _this21.getElementByID("focusGraphRow-0").offsetHeight;

                _this21.drawFocusGraphData();
              });
            }
          }
        }, {
          key: "initialiseFocusGraphData",
          value: function initialiseFocusGraphData() {
            var _this22 = this;

            if (!this.focusModel.data) {
              this.focusModel.data = [];
            }

            this.focusModel.data.length = 0;

            if (this.scope.ctrl.isGrouped) {
              this.overviewModel.groupList.forEach(function (group, groupIndex) {
                var firstInstance = group.instanceList[0];

                if (_this22.checkInstanceInFocus(firstInstance)) {
                  var focusInstance = _this22.initialiseFocusInstance(firstInstance, _this22.getIndexesOfPointsInFocus(firstInstance));

                  focusInstance.groupIndex = groupIndex + 1;
                }
              });
            } else {
              this.overviewModel.data.forEach(function (instance) {
                if (_this22.checkInstanceInFocus(instance)) {
                  _this22.initialiseFocusInstance(instance, _this22.getIndexesOfPointsInFocus(instance));
                }
              });
            }
          }
        }, {
          key: "checkInstanceInFocus",
          value: function checkInstanceInFocus(instance) {
            return instance.y <= this.focusModel.focusStartY + this.getFocusAreaSize() && instance.y + this.overviewModel.overviewInstanceHeight >= this.focusModel.focusStartY;
          }
        }, {
          key: "getIndexesOfPointsInFocus",
          value: function getIndexesOfPointsInFocus(instance) {
            var _this23 = this;

            var indexes = [];

            for (var i = 0; i < instance.metricList.length; ++i) {
              var metric = instance.metricList[i];

              if (metric.data.length > 0) {
                var overviewMetric = this.overviewModel.metricList[i];
                metric.data.forEach(function (point, index) {
                  if (overviewMetric.focusStartX <= point.x && point.x <= overviewMetric.focusStartX + _this23.getFocusAreaSize()) {
                    indexes.push(index);
                  }
                });
                break;
              }
            }

            return indexes;
          }
        }, {
          key: "initialiseFocusInstance",
          value: function initialiseFocusInstance(overviewInstance, indexList) {
            var focusInstance = {};
            focusInstance.instance = overviewInstance.instance;
            focusInstance.metricList = [];
            this.addFocusMetrics(focusInstance, overviewInstance, indexList);
            this.initialiseInstanceLayers(focusInstance);
            this.focusModel.data.push(focusInstance);
            return focusInstance;
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
            var _this24 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              _this24.config.colors[metricIndex].forEach(function () {
                var layer = {};
                layer.valueList = [];
                metric.layerList.push(layer);
              });

              metric.data.forEach(function (point) {
                var value = point.value;
                metric.layerList.forEach(function (layer) {
                  layer.valueList.push(value > 0 ? value : 0);
                  value -= _this24.overviewModel.metricList[metricIndex].layerRange;
                });
              });
            });
          }
        }, {
          key: "drawFocusGraphData",
          value: function drawFocusGraphData() {
            var _this25 = this;

            this.focusModel.data.forEach(function (instance, instanceIndex) {
              var canvas = _this25.getElementByID("focusGraphCanvas-" + instanceIndex);

              var context = canvas.getContext("2d");
              context.clearRect(0, 0, canvas.width, canvas.height);
              instance.metricList.forEach(function (metric, metricIndex) {
                metric.layerList.forEach(function (layer, layerIndex) {
                  var y = (_this25.config.focusGraph.metricMaxHeight + _this25.config.focusGraph.marginBetweenMetrics) * metricIndex + _this25.config.focusGraph.metricMaxHeight;
                  context.beginPath();
                  context.moveTo(0, y);
                  var x = 0;
                  var previousX = 0;
                  var previousValue = 0;
                  layer.valueList.forEach(function (value, valueIndex) {
                    x = _this25.config.focusGraph.pointWidth * valueIndex;

                    _this25.moveContextBasedOnValue(context, value, previousX, previousValue, layerIndex, x, y, _this25.overviewModel.metricList[metricIndex].layerRange);

                    previousX = x;
                    previousValue = value;
                  });
                  context.lineTo(x, y);
                  context.lineTo(_this25.focusModel.graphBeginX, y);
                  context.closePath();
                  context.fillStyle = "#" + _this25.config.colors[metricIndex][layerIndex];
                  context.fill();
                });
              });
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
              this.scrollByInstance(this.getFirstInstanceOfSelectedGroup());
            } else {
              this.scrollByInstance(this.getLinkerTargetInstance());
            }
          }
        }, {
          key: "scrollByInstance",
          value: function scrollByInstance(instance) {
            for (var i = 0; i < this.focusModel.data.length; ++i) {
              var focusModelInstance = this.focusModel.data[i];

              if (instance.instance == focusModelInstance.instance) {
                focusModelInstance.isSelected = true;
                this.focusGraphContainer.scrollTop = this.focusModel.focusRowHeight * i;
              } else {
                focusModelInstance.isSelected = false;
              }
            }
          }
        }, {
          key: "getFirstInstanceOfSelectedGroup",
          value: function getFirstInstanceOfSelectedGroup() {
            for (var i = 0; i < this.overviewModel.groupList.length; ++i) {
              var group = this.overviewModel.groupList[i];
              var firstInstance = group.instanceList[0];

              if (firstInstance.y <= this.focusModel.mousePosition.y && this.focusModel.mousePosition.y <= firstInstance.y + this.config.overview.groupedPointHeight) {
                return firstInstance;
              }
            }
          }
        }, {
          key: "selectNode",
          value: function selectNode(index) {
            this.focusModel.data.forEach(function (focusInstance) {
              focusInstance.isSelected = false;
            });
            var instance = this.focusModel.data[index];
            instance.isSelected = true;
            this.updateVariable(instance);
          }
        }, {
          key: "updateVariable",
          value: function updateVariable(instance) {
            var _this26 = this;

            this.variableSrv.variables.forEach(function (v) {
              if (v.name == "node") {
                _this26.variableSrv.setOptionAsCurrent(v, {
                  text: instance.instance,
                  value: instance.instance
                });

                _this26.isUpdatingVariable = true;

                _this26.variableSrv.variableUpdated(v, true);
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
