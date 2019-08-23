"use strict";

System.register(["app/plugins/sdk", "./heatmap.css!", "moment", "lodash"], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, moment, _, HeatmapCtrl;

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
          _this.focusModel = {};
          _this.scope.focusModel = _this.focusModel;

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
              groupSizeWidth: 2
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
            var _this11 = this;

            this.$timeout(function () {
              _this11.overviewContext.clearRect(0, 0, _this11.overviewCanvas.width, _this11.overviewCanvas.height);

              _this11.setOverviewCanvasSize();

              _this11.scope.ctrl.focusGraphMarginTop = _this11.scope.ctrl.overviewHeight + _this11.config.marginBetweenOverviewAndFocus;

              _this11.drawOverviewData();
            });
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
          key: "setOverviewCanvasSize",
          value: function setOverviewCanvasSize() {
            var instanceHorizontalLength = this.getMaxMetricLength() * this.overviewModel.metricList.length + (this.overviewModel.metricList.length - 1) * this.config.overview.horizontalMarginBetweenMetrics;
            this.scope.ctrl.overviewWidth = instanceHorizontalLength * this.config.overview.pointWidth;

            if (this.scope.ctrl.isGrouped) {
              this.scope.ctrl.overviewHeight = this.overviewModel.groupList.length * (this.config.overview.groupedPointHeight * 2);
            } else {
              this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.config.overview.ungroupedPointHeight;
            }

            this.scope.ctrl.overviewCanvasWidth = this.scope.ctrl.overviewWidth + this.getMaxGroupSize() + this.config.overview.horizontalMarginBetweenMetrics;
            this.setOverviewContextLabelFont();
            this.overviewModel.labelTextHeight = this.overviewContext.measureText("M").width;
            this.overviewModel.overviewStartY = this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview;
            this.scope.ctrl.overviewHeight += (this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 2; // Metric and time labels

            this.scope.$apply();
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
            var _this12 = this;

            this.overviewModel.overviewInstanceHeight = this.config.overview.groupedPointHeight;
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var instance = group.instanceList[0];

              _this12.drawOverviewInstance(instance, groupIndex, _this12.config.overview.groupedPointHeight, _this12.config.overview.groupedPointHeight);
            });
            this.drawGroupSize();
          }
        }, {
          key: "drawOverviewInstance",
          value: function drawOverviewInstance(instance, index, pointHeigh, marginBetweenInstances) {
            var _this13 = this;

            instance.y = this.overviewModel.overviewStartY + index * (pointHeigh + marginBetweenInstances);
            var endY = instance.y + pointHeigh;

            if (endY > this.overviewModel.overviewEndY) {
              this.overviewModel.overviewEndY = endY;
            }

            instance.metricList.forEach(function (metric, metricIndex) {
              var overviewMetric = _this13.overviewModel.metricList[metricIndex];
              overviewMetric.startX = _this13.overviewModel.metricWidth * metricIndex;

              if (metricIndex > 0) {
                overviewMetric.startX += _this13.config.overview.horizontalMarginBetweenMetrics * metricIndex;
              }

              metric.data.forEach(function (point, pointIndex) {
                point.x = overviewMetric.startX + pointIndex * _this13.config.overview.pointWidth;
                point.color = _this13.getColorFromMap(point.value, _this13.overviewModel.metricList[metricIndex].colorMap);
                _this13.overviewContext.fillStyle = point.color;

                _this13.overviewContext.fillRect(point.x, instance.y, _this13.config.overview.pointWidth, pointHeigh);
              });
              overviewMetric.endX = overviewMetric.startX + _this13.overviewModel.metricWidth;
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
          key: "drawGroupSize",
          value: function drawGroupSize() {
            var _this14 = this;

            var startX = this.scope.ctrl.overviewWidth + this.config.overview.horizontalMarginBetweenMetrics;
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var endX = startX + group.instanceList.length * _this14.config.overview.groupSizeWidth;
              var startY = _this14.overviewModel.overviewStartY + groupIndex * _this14.config.overview.groupedPointHeight;
              var endY = startY + _this14.config.overview.groupedPointHeight;

              _this14.overviewContext.beginPath();

              _this14.overviewContext.moveTo(startX, startY);

              _this14.overviewContext.lineTo(endX, startY);

              _this14.overviewContext.lineTo(endX, endY);

              _this14.overviewContext.lineTo(startX, endY);

              _this14.overviewContext.closePath();

              _this14.overviewContext.fillStyle = "black";

              _this14.overviewContext.fill();
            });
          }
        }, {
          key: "drawUngroupedOverview",
          value: function drawUngroupedOverview() {
            var _this15 = this;

            this.overviewModel.overviewInstanceHeight = this.config.overview.ungroupedPointHeight;
            this.overviewModel.data.forEach(function (instance, instanceIndex) {
              _this15.drawOverviewInstance(instance, instanceIndex, _this15.config.overview.ungroupedPointHeight, 0);
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
            var _this16 = this;

            var y = this.overviewModel.overviewStartY;
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var greyValue = Math.round(_this16.config.overview.startingGreyColor - colorStep * groupIndex);
              var fillStyle = "rgba(" + greyValue + ", " + greyValue + ", " + greyValue + ", 1)";
              _this16.overviewContext.fillStyle = fillStyle;
              var height = group.instanceList.length * _this16.config.overview.ungroupedPointHeight;

              _this16.overviewContext.fillRect(x - Math.floor(_this16.config.overview.groupBarWidth / 2), y, _this16.config.overview.groupBarWidth, height);

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
            var textHeight = this.overviewContext.measureText("M").width;
            var fromDate = this.getDateString(this.fromDate * 1000);
            var fromDateWidth = this.overviewContext.measureText(fromDate).width;
            var toDate = this.getDateString(this.toDate * 1000);
            var toDateWidth = this.overviewContext.measureText(toDate).width;
            var y = this.scope.ctrl.overviewHeight - textHeight;
            var metric = this.overviewModel.metricList[this.overviewModel.metricList.length - 1]; // this.overviewContext.fillText(fromDate, metric.startX - fromDateWidth / 2, y);

            this.overviewContext.fillText(toDate, metric.endX - toDateWidth / 2, y);

            for (var i = 0; i < this.config.metricLabelList.length; ++i) {}
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
            this.updateGrouping();
          }
        }, {
          key: "updateGrouping",
          value: function updateGrouping() {
            this.initialiseOverviewGroups();
            this.drawOverview();
            this.showFocus = false;
            this.initialiseAllFocusGraphGroups();
          }
        }, {
          key: "selectAttributeForGrouping",
          value: function selectAttributeForGrouping() {
            this.updateGrouping();
          }
        }, {
          key: "groupUngroup",
          value: function groupUngroup() {
            this.scope.ctrl.isGrouped = !this.scope.ctrl.isGrouped;
            this.drawOverview();
            this.showFocus = false;
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
              var minimumTopY = Math.max(this.overviewModel.overviewStartY, this.focusModel.mousePosition.y - size / 2);
              this.focusModel.focusStartY = Math.min(minimumTopY, this.overviewModel.overviewEndY - size);
              this.drawFocusAreaAndLinkers(true);
            }
          }
        }, {
          key: "getFocusAreaSize",
          value: function getFocusAreaSize() {
            return Math.min(this.config.focusArea.size * 2, this.overviewModel.overviewEndY - this.overviewModel.overviewStartY);
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
          key: "drawFocusAreaAndLinkers",
          value: function drawFocusAreaAndLinkers(doDrawLinkers) {
            var _this17 = this;

            var size = this.getFocusAreaSize();
            var offset = this.getFocusAreaOffset();

            if (offset >= 0) {
              if (doDrawLinkers) {
                this.clearFocus();
              }

              this.focusAreaContext.strokeStyle = this.config.focusArea.color;
              this.overviewModel.metricList.forEach(function (metric) {
                metric.focusStartX = metric.startX + offset;

                _this17.focusAreaContext.strokeRect(metric.focusStartX, _this17.focusModel.focusStartY, size, size);
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
            var _this18 = this;

            var pixelData = this.overviewContext.getImageData(this.focusModel.mousePosition.x, this.focusModel.mousePosition.y, 1, 1).data;
            this.focusAreaContext.strokeStyle = "rgb(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + ")";
            var instance = this.getLinkerTargetInstance();
            instance = null; // temp flag to prevent drawing linkers

            if (instance) {
              this.overviewModel.metricList.forEach(function (metric, index) {
                if (!_this18.checkMouseIsInMetric(metric)) {
                  _this18.drawLinkersByMode(metric, instance, index);
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
            var _this19 = this;

            if (index == 0) {
              this.clearFocus();
            }

            instance.metricList[index].data.forEach(function (instancePoint, pointIndex) {
              var colorMap = _this19.getColorMap(metric, _this19.config.colors[_this19.focusModel.sourceMetricIndex]);

              _this19.focusAreaContext.fillStyle = _this19.getColorFromMap(instancePoint.value, colorMap);

              _this19.focusAreaContext.fillRect(instancePoint.x, instance.y, _this19.overviewModel.overviewInstanceHeight, _this19.overviewModel.overviewInstanceHeight);

              if (instancePoint.x == metric.startX + _this19.focusModel.mousePositionXOffset) {
                // vertical line
                metric.data.forEach(function (metricInstance, metricInstanceIndex) {
                  var metricPoint = metricInstance.values[pointIndex];
                  var value = metricPoint ? metricPoint[1] : 0;
                  _this19.focusAreaContext.fillStyle = _this19.getColorFromMap(value, colorMap);

                  _this19.focusAreaContext.fillRect(instancePoint.x, _this19.overviewModel.data[metricInstanceIndex].y, _this19.overviewModel.overviewInstanceHeight, _this19.overviewModel.overviewInstanceHeight);
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
            var _this20 = this;

            if (this.scope.ctrl.isGrouped) {
              this.initialiseFocusGraphGroups();
            } else {
              this.initialiseFocusGraphData();
            }

            if (this.scope.ctrl.isGrouped && this.focusModel.focusedGroupList.length > 0 || !this.scope.ctrl.isGrouped && this.focusModel.data.length > 0) {
              this.scope.ctrl.showFocus = true;
              this.$timeout(function () {
                _this20.scope.ctrl.focusGraphHeight = _this20.overviewModel.metricList.length * _this20.config.focusGraph.metricMaxHeight + (_this20.overviewModel.metricList.length - 1) * _this20.config.focusGraph.marginBetweenMetrics;
                var firstInstance = _this20.scope.ctrl.isGrouped ? _this20.focusModel.focusedGroupList[0].instanceList[0] : _this20.focusModel.data[0];
                _this20.scope.ctrl.focusGraphWidth = (_this20.focusModel.focusedIndexList.length - 1) * _this20.config.focusGraph.pointWidth;

                _this20.scope.$apply();

                _this20.focusModel.focusRowHeight = _this20.getElementByID("focusGraphRow").offsetHeight;

                _this20.setFocusFromAndToDate();

                _this20.positionFocusFromAndToDate();

                _this20.drawFocusGraphData();
              });
            } else {
              this.scope.ctrl.showFocus = false;
            }
          }
        }, {
          key: "initialiseFocusGraphGroups",
          value: function initialiseFocusGraphGroups() {
            if (!this.focusModel.allGroupList) {
              this.initialiseAllFocusGraphGroups();
            }

            if (!this.focusModel.focusedGroupList) {
              this.focusModel.focusedGroupList = [];
            }

            this.focusModel.focusedGroupList.length = 0;
            this.initialiseFocusGraphFocusedGroups();
          }
        }, {
          key: "initialiseAllFocusGraphGroups",
          value: function initialiseAllFocusGraphGroups() {
            var _this21 = this;

            this.focusModel.allGroupList = [];
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var focusGroup = {};

              _this21.focusModel.allGroupList.push(focusGroup);

              focusGroup.index = groupIndex + 1;
              focusGroup.instanceList = [];
              group.instanceList.forEach(function (overviewInstance) {
                var focusInstance = _this21.getFocusInstance(overviewInstance, [0, 0]);

                focusGroup.instanceList.push(focusInstance);
              });
            });
          }
        }, {
          key: "initialiseFocusGraphFocusedGroups",
          value: function initialiseFocusGraphFocusedGroups() {
            var _this22 = this;

            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var firstInstance = group.instanceList[0];

              if (_this22.checkInstanceInFocus(firstInstance)) {
                _this22.focusModel.focusedIndexList = _this22.getIndexesOfPointsInFocus(firstInstance);
                group.instanceList.forEach(function (overviewInstance, instanceIndex) {
                  var focusInstance = _this22.focusModel.allGroupList[groupIndex].instanceList[instanceIndex];

                  _this22.initialiseFocusInstanceData(focusInstance, overviewInstance, _this22.focusModel.focusedIndexList);
                });
                var focusGroup = _this22.focusModel.allGroupList[groupIndex];
                focusGroup.showDetails = false;

                _this22.focusModel.focusedGroupList.push(focusGroup);
              }
            });
          }
        }, {
          key: "initialiseFocusGraphData",
          value: function initialiseFocusGraphData() {
            var _this23 = this;

            if (!this.focusModel.data) {
              this.focusModel.data = [];
            }

            this.focusModel.data.length = 0;
            this.overviewModel.data.forEach(function (overviewInstance) {
              if (_this23.checkInstanceInFocus(overviewInstance)) {
                _this23.focusModel.focusedIndexList = _this23.getIndexesOfPointsInFocus(overviewInstance);

                var focusInstance = _this23.getFocusInstance(overviewInstance, _this23.focusModel.focusedIndexList);

                _this23.focusModel.data.push(focusInstance);
              }
            });
          }
        }, {
          key: "checkInstanceInFocus",
          value: function checkInstanceInFocus(instance) {
            return instance.y <= this.focusModel.focusStartY + this.getFocusAreaSize() && instance.y + this.overviewModel.overviewInstanceHeight >= this.focusModel.focusStartY;
          }
        }, {
          key: "getIndexesOfPointsInFocus",
          value: function getIndexesOfPointsInFocus(overviewInstance) {
            var _this24 = this;

            var indexes = [];

            for (var i = 0; i < overviewInstance.metricList.length; ++i) {
              var metric = overviewInstance.metricList[i];

              if (metric.data.length > 0) {
                var overviewMetric = this.overviewModel.metricList[i];
                metric.data.forEach(function (point, index) {
                  if (overviewMetric.focusStartX <= point.x && point.x <= overviewMetric.focusStartX + _this24.getFocusAreaSize()) {
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
            var _this25 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              _this25.config.colors[metricIndex].forEach(function () {
                var layer = {};
                layer.valueList = [];
                metric.layerList.push(layer);
              });

              metric.data.forEach(function (point) {
                var value = point.value;
                metric.layerList.forEach(function (layer) {
                  layer.valueList.push(value > 0 ? value : 0);
                  value -= _this25.overviewModel.metricList[metricIndex].layerRange;
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
                var fromIndex = this.focusModel.focusedIndexList[0];
                var toIndex = this.focusModel.focusedIndexList[this.focusModel.focusedIndexList.length - 1];

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
            var _this26 = this;

            this.focusModel.focusedGroupList.forEach(function (group) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  var canvas = _this26.getElementByID("focusGraphCanvas-" + group.index + "-" + instanceIndex);

                  var context = _this26.getCanvasContext(canvas);

                  context.clearRect(0, 0, canvas.width, canvas.height);

                  _this26.drawFocusGraphInstance(instance, context);
                }
              });
            });
          }
        }, {
          key: "drawFocusGraphInstance",
          value: function drawFocusGraphInstance(instance, context) {
            var _this27 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              metric.layerList.forEach(function (layer, layerIndex) {
                var y = (_this27.config.focusGraph.metricMaxHeight + _this27.config.focusGraph.marginBetweenMetrics) * metricIndex + _this27.config.focusGraph.metricMaxHeight;
                context.beginPath();
                context.moveTo(0, y);
                var x = 0;
                var previousX = 0;
                var previousValue = 0;
                layer.valueList.forEach(function (value, valueIndex) {
                  x = _this27.config.focusGraph.pointWidth * valueIndex;

                  _this27.moveContextBasedOnValue(context, value, previousX, previousValue, layerIndex, x, y, _this27.overviewModel.metricList[metricIndex].layerRange);

                  previousX = x;
                  previousValue = value;
                });
                context.lineTo(x, y);
                context.lineTo(_this27.focusModel.graphBeginX, y);
                context.closePath();
                context.fillStyle = "#" + _this27.config.colors[metricIndex][layerIndex];
                context.fill();
              });
            });
          }
        }, {
          key: "drawUngroupedFocusGraph",
          value: function drawUngroupedFocusGraph() {
            var _this28 = this;

            this.focusModel.data.forEach(function (instance, instanceIndex) {
              var canvas = _this28.getElementByID("focusGraphCanvas-" + instanceIndex);

              var context = _this28.getCanvasContext(canvas);

              context.clearRect(0, 0, canvas.width, canvas.height);

              _this28.drawFocusGraphInstance(instance, context);
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
              this.scrollByGroup();
            } else {
              this.scrollByInstance();
            }
          }
        }, {
          key: "scrollByGroup",
          value: function scrollByGroup() {
            for (var allGroupIndex = 0; allGroupIndex < this.focusModel.allGroupList.length; ++allGroupIndex) {
              var group = this.focusModel.allGroupList[allGroupIndex];
              var overviewInstance = this.overviewModel.groupList[allGroupIndex].instanceList[0];
              var focusInstance = group.instanceList[0];

              if (overviewInstance.y <= this.focusModel.mousePosition.y && this.focusModel.mousePosition.y <= overviewInstance.y + this.config.overview.groupedPointHeight) {
                focusInstance.isSelected = true;

                for (var focusedGroupIndex = 0; focusedGroupIndex < this.focusModel.focusedGroupList.length; ++focusedGroupIndex) {
                  if (this.focusModel.focusedGroupList[focusedGroupIndex] == group) {
                    this.focusGraphContainer.scrollTop = this.focusModel.focusRowHeight * focusedGroupIndex;
                    break;
                  }
                }
              } else {
                focusInstance.isSelected = false;
              }
            }
          }
        }, {
          key: "scrollByInstance",
          value: function scrollByInstance() {
            var instance = this.getLinkerTargetInstance();

            if (instance) {
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
          }
        }, {
          key: "showNodes",
          value: function showNodes(group, event) {
            var _this29 = this;

            event.preventDefault();
            this.$timeout(function () {
              group.showDetails = !group.showDetails;

              _this29.scope.$apply();

              if (group.showDetails) {
                _this29.drawFocusGraphData();
              }

              _this29.selectNode(group.instanceList[0]);
            });
          }
        }, {
          key: "selectNode",
          value: function selectNode(instance) {
            if (this.scope.ctrl.isGrouped) {
              this.focusModel.focusedGroupList.forEach(function (group) {
                group.instanceList.forEach(function (instance) {
                  instance.isSelected = false;
                });
              });
            } else {
              this.focusModel.data.forEach(function (focusInstance) {
                focusInstance.isSelected = false;
              });
            }

            instance.isSelected = true;
            this.updateVariable(instance);
          }
        }, {
          key: "updateVariable",
          value: function updateVariable(instance) {
            var _this30 = this;

            this.variableSrv.variables.forEach(function (v) {
              if (v.name == "node") {
                _this30.variableSrv.setOptionAsCurrent(v, {
                  text: instance.instance,
                  value: instance.instance
                });

                _this30.isUpdatingVariable = true;

                _this30.variableSrv.variableUpdated(v, true);
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
