"use strict";

System.register(["app/plugins/sdk", "./heatmap.css!", "moment", "lodash"], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, moment, _, HeatmapCtrl;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

        function HeatmapCtrl($scope, $injector, $timeout, $interval, variableSrv, timeSrv) {
          var _this;

          _classCallCheck(this, HeatmapCtrl);

          _this = _possibleConstructorReturn(this, _getPrototypeOf(HeatmapCtrl).call(this, $scope, $injector));
          _this.$timeout = $timeout;
          _this.$interval = $interval;
          _this.variableSrv = variableSrv;
          _this.timeSrv = timeSrv;

          _this.initialiseConfig();

          _this.initialisePanelDefaults();

          _this.initialisePredefinedMetricOptionList();

          _this.initialiseMetricsColorList();

          _this.initialiseStartingVariables();

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_assertThisInitialized(_this)));

          _this.events.on("data-received", _this.onDataReceived.bind(_assertThisInitialized(_this)));

          return _this;
        }

        _createClass(HeatmapCtrl, [{
          key: "initialiseConfig",
          value: function initialiseConfig() {
            this.initialiseGeneralConfig();
            this.initialiseOverviewConfig();
            this.initialiseFocusAreaConfig();
            this.initialiseTimeIndicatorConfig();
            this.initialiseFocusGraphConfig();
          }
        }, {
          key: "initialiseGeneralConfig",
          value: function initialiseGeneralConfig() {
            this.config = {
              apiAddress: "http://localhost:3000/api/datasources/proxy/1/api/v1/query_range?query=",
              dateFormat: "DD/MM/YY HH:mm:ss",
              colorCount: 4,
              maxLuminanceChange: 0.8,
              marginBetweenOverviewAndFocus: 20,
              groupingThresholdCount: 50,
              startingGreyColor: 240,
              endingGrayColor: 80,
              intervalTimer: 70
            };
          }
        }, {
          key: "initialiseOverviewConfig",
          value: function initialiseOverviewConfig() {
            this.config.overview = {
              topAndBottomPadding: 20,
              metricFontSize: 12,
              timeFontSize: 10,
              marginBetweenLabelsAndOverview: 10,
              pointWidth: 1,
              ungroupedPointHeight: 1,
              groupedPointHeight: 5,
              compressedMarginBetweenMetrics: 100,
              decompressedMarginBetweenMetrics: 30,
              marginBetweenGroups: 10,
              groupBarWidth: 9,
              singleAttributeGroupSizeWidth: 1,
              multipleAttributeGroupSizeWidth: 2,
              marginBetweenMarkerAndGroup: 15,
              marginBetweenMetricAndGroupSize: 20
            };
          }
        }, {
          key: "initialiseFocusAreaConfig",
          value: function initialiseFocusAreaConfig() {
            this.config.focusArea = {
              color: "Aqua",
              focusAreaSize: 20,
              xCrossSize: 15
            };
          }
        }, {
          key: "initialiseTimeIndicatorConfig",
          value: function initialiseTimeIndicatorConfig() {
            this.config.timeIndicator = {
              color: "DarkGray"
            };
          }
        }, {
          key: "initialiseFocusGraphConfig",
          value: function initialiseFocusGraphConfig() {
            var _this$config$focusGra;

            this.config.focusGraph = (_this$config$focusGra = {
              maxWidth: 10000,
              maxHeight: 10000,
              groupedPointWidth: 4,
              ungroupedPointWidth: 20,
              metricMaxHeight: 30,
              marginBetweenMetrics: 10
            }, _defineProperty(_this$config$focusGra, "maxHeight", 10000), _defineProperty(_this$config$focusGra, "markerSize", 20), _defineProperty(_this$config$focusGra, "marginBetweenMarkers", 20), _this$config$focusGra);
          }
        }, {
          key: "initialisePanelDefaults",
          value: function initialisePanelDefaults() {
            this.panelDefaults = {
              predefinedMetricList: [{
                name: "CPU",
                query: "node_load1{job='node'}"
              }, {
                name: "Memory",
                query: "100 - (node_memory_MemFree_bytes{job='node'} - node_memory_Cached_bytes{job='node'}) * 100 / (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'})"
              }, {
                name: "Disk",
                query: "100 - (sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)', mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})) * 100 / (sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'}))"
              }, {
                name: "Network",
                query: "sum by (instance) (node_network_receive_bytes_total{job='node',device!~'^(?:docker|vboxnet|veth|lo).*'})"
              }, {
                name: "Disk Temperature",
                query: "sum by (instance) (smartmon_temperature_celsius_raw_value{job='node',smart_id='194'})"
              }]
            };

            _.defaults(this.panel, this.panelDefaults);

            this.panel.predefinedMetricList = this.panelDefaults.predefinedMetricList;
          }
        }, {
          key: "initialisePredefinedMetricOptionList",
          value: function initialisePredefinedMetricOptionList() {
            var _this2 = this;

            this.predefinedMetricOptionList = [];
            this.panelDefaults.predefinedMetricList.forEach(function (metric) {
              _this2.predefinedMetricOptionList.push(metric.name);
            });
          }
        }, {
          key: "initialiseMetricsColorList",
          value: function initialiseMetricsColorList() {
            var _this3 = this;

            this.panel.metricList.forEach(function (metric) {
              metric.colorList = [];
              metric.colorList.push(metric.color);
              var luminanceChange = -_this3.config.maxLuminanceChange / _this3.config.colorCount;

              for (var i = 0; i < _this3.config.colorCount - 1; ++i) {
                var color = _this3.changeColorLuminance(metric.color, i * luminanceChange);

                metric.colorList.push(color);
              }
            });
          }
        }, {
          key: "initialiseStartingVariables",
          value: function initialiseStartingVariables() {
            this.firstLoad = true;
            this.overviewModel = {};
            this.overviewModel.groupMarkerList = [];
            this.focusModel = {};
            this.focusModel.groupList = [];
          }
        }, {
          key: "changeColorLuminance",
          value: function changeColorLuminance(hex, lum) {
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
          }
        }, {
          key: "selectPredefinedMetric",
          value: function selectPredefinedMetric(index) {
            var metric = this.panel.metricList[index];

            if (!metric.isCustom) {
              for (var i = 0; i < this.panel.predefinedMetricList.length; ++i) {
                var predefinedMetric = this.panel.predefinedMetricList[i];

                if (metric.name == predefinedMetric.name) {
                  this.panel.metricList[index] = JSON.parse(JSON.stringify(predefinedMetric));
                  break;
                }
              }
            }
          }
        }, {
          key: "link",
          value: function link(scope, elem) {
            this.scope = scope;
            this.elem = elem;
            this.initialiseControl();
            this.initialiseUIElements();
          }
        }, {
          key: "initialiseControl",
          value: function initialiseControl() {
            this.enumList = {
              groupingMode: {
                SINGLE: "1",
                MULTIPLE: "2"
              },
              timeHighlightMode: {
                POINT: "1",
                RANGE: "2"
              }
            };
            this.groupingMode = this.enumList.groupingMode.SINGLE;
            this.groupingThreshold = 0;
            this.isGrouped = true;
            this.timeHighlightMode = this.enumList.timeHighlightMode.POINT;
            this.initialiseOverviewCanvasCursor();
          }
        }, {
          key: "initialiseOverviewCanvasCursor",
          value: function initialiseOverviewCanvasCursor() {
            this.overviewCursor = "crosshair";
          }
        }, {
          key: "initialiseUIElements",
          value: function initialiseUIElements() {
            // overview
            this.overviewCanvas = this.getElementByID("overviewCanvas");
            this.overviewContext = this.getCanvasContext(this.overviewCanvas); // focus area + overview group markers

            this.focusAreaCanvas = this.getElementByID("focusAreaCanvas");
            this.focusAreaContext = this.getCanvasContext(this.focusAreaCanvas); // overview time indicator

            this.overviewTimeIndicatorCanvas = this.getElementByID("overviewTimeIndicatorCanvas");
            this.overviewTimeIndicatorContext = this.getCanvasContext(this.overviewTimeIndicatorCanvas); // focus graph

            this.focusGraphWidth = this.config.focusGraph.maxWidth;
            this.focusGraphHeight = this.config.focusGraph.maxHeight;
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
          key: "onInitEditMode",
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/buw-heatmap-panel/editor.html', 2);
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
            var _this4 = this;

            this.$timeout(function () {
              _this4.isLoading = true;

              _this4.scope.$apply();

              _this4.overviewModel.metricList = [];

              _this4.panel.metricList.forEach(function () {
                _this4.overviewModel.metricList.push(null);
              });

              _this4.loadCount = 0;
              _this4.fromDate = _this4.getDateInSeconds(_this4.timeSrv.timeRange().from._d);
              _this4.toDate = _this4.getDateInSeconds(_this4.timeSrv.timeRange().to._d);

              _this4.panel.metricList.forEach(function (metric, index) {
                _this4.getDataFromAPI(metric.query, index);
              });

              _this4.processRawData();
            });
          }
        }, {
          key: "getDateInSeconds",
          value: function getDateInSeconds(date) {
            return Math.round(date.getTime() / 1000);
          }
        }, {
          key: "getDataFromAPI",
          value: function getDataFromAPI(query, index) {
            var _this5 = this;

            var xmlHttp = new XMLHttpRequest();

            xmlHttp.onreadystatechange = function () {
              // received response
              if (xmlHttp.readyState == 4) {
                ++_this5.loadCount;

                if (xmlHttp.status == 200) {
                  var metric = {};
                  metric.data = JSON.parse(xmlHttp.responseText).data.result;
                  _this5.overviewModel.metricList[index] = metric;
                }
              }
            };

            var url = this.config.apiAddress + encodeURIComponent(query) + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=60";
            xmlHttp.open("GET", url, true);
            xmlHttp.send(null);
          }
        }, {
          key: "processRawData",
          value: function processRawData() {
            var _this6 = this;

            this.$timeout(function () {
              if (_this6.loadCount < _this6.overviewModel.metricList.length) {
                _this6.processRawData.bind(_this6)();
              } else {
                _this6.isLoading = false;

                if (!_this6.overviewModel.metricList.includes(null)) {
                  _this6.convertDataToFloat();

                  _this6.initialiseMetricMinMaxTotal();

                  _this6.initialiseColorMap();

                  _this6.initiliseOverviewData();

                  _this6.initialiseOverviewGroups();

                  _this6.initialiseCompressedTimeIndexes();

                  _this6.renderOverview();
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
            var _this7 = this;

            this.overviewModel.metricList.forEach(function (metric) {
              metric.min = -1;
              metric.max = -1;
              metric.data.forEach(function (instance) {
                instance.values.forEach(function (point) {
                  _this7.checkAndSetOverviewMinMax(metric, point);
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
            var _this8 = this;

            this.overviewModel.metricList.forEach(function (metric, index) {
              var colorList = _this8.panel.metricList[index].colorList;
              metric.layerRange = metric.max / colorList.length; // map a range of values to a color

              metric.colorMap = _this8.getColorMap(metric, colorList);
            });
          }
        }, {
          key: "getColorMap",
          value: function getColorMap(metric, colorList) {
            var colorMap = new Map();

            for (var i = 0; i < colorList.length; ++i) {
              var threshold = {};
              threshold.min = i * metric.layerRange;
              threshold.max = threshold.min + metric.layerRange;
              threshold.average = (threshold.max + threshold.min) / 2;
              colorMap.set(threshold, colorList[i]);
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
            var _this9 = this;

            this.overviewModel.metricList.forEach(function (metric, metricIndex) {
              metric.data.forEach(function (metricInstance) {
                var newInstance = _.find(_this9.overviewModel.data, function (search) {
                  return metricInstance.metric.instance == search.instance;
                });

                if (!newInstance) {
                  newInstance = _this9.initaliseNewInstance(metricInstance);
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

            for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
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
            var _this10 = this;

            this.overviewModel.data.forEach(function (instance) {
              instance.metricList.forEach(function (metric, metricIndex) {
                metric.total = 0;
                metric.min = -1;
                metric.max = -1;
                metric.data.forEach(function (point) {
                  // sum the "threshold" average of each data point instead of the actual value of the data point 
                  metric.total += _this10.getThresholdAverage(point.value, _this10.overviewModel.metricList[metricIndex].colorMap);

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
            var _this11 = this;

            var result;
            map.forEach(function (color, threshold) {
              if (_this11.isBetween(value, threshold.min, threshold.max)) {
                result = threshold.average;
              }
            });
            return result;
          }
        }, {
          key: "isBetween",
          value: function isBetween(target, start, end) {
            return start <= target && target <= end;
          }
        }, {
          key: "sortOverviewData",
          value: function sortOverviewData() {
            this.overviewModel.data.sort(function (first, second) {
              for (var i = 0; i < first.metricList.length; ++i) {
                if (first.metricList[i].total != second.metricList[i].total) {
                  return first.metricList[i].total - second.metricList[i].total;
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
            var _this12 = this;

            this.overviewModel.metricList.forEach(function (metric, metricIndex) {
              _this12.initialiseMetricSingleAttributeGroups(metric, metricIndex);

              _this12.initialiseSingleAttributeGroupsColor(metric, metricIndex);
            });
            this.initialiseSingleAttributeInstanceGroupList();
          }
        }, {
          key: "initialiseMetricSingleAttributeGroups",
          value: function initialiseMetricSingleAttributeGroups(metric, metricIndex) {
            metric.thresholdGroupListMap = new Map();

            for (var groupingThreshold = 0; groupingThreshold <= this.config.groupingThresholdCount; ++groupingThreshold) {
              var groupList = [];
              this.populateSingleAttributeGroupList(groupList, metricIndex, groupingThreshold);
              groupList.sort(function (first, second) {
                return first.total - second.total;
              });
              metric.thresholdGroupListMap.set(groupingThreshold, groupList);
            }
          }
        }, {
          key: "populateSingleAttributeGroupList",
          value: function populateSingleAttributeGroupList(groupList, metricIndex, groupingThreshold) {
            var _this13 = this;

            var thresholdValue = groupingThreshold * 0.01;
            this.overviewModel.data.forEach(function (instance) {
              var group = _.find(groupList, function (search) {
                var min = search.total * (1 - thresholdValue);
                var max = search.total * (1 + thresholdValue);
                return _this13.isBetween(instance.metricList[metricIndex].total, min, max);
              });

              if (!group) {
                group = _this13.initialiseNewSingleAttributeGroups(instance, metricIndex);
                groupList.push(group);
              }

              group.instanceList.push(instance);
            });
          }
        }, {
          key: "initialiseNewSingleAttributeGroups",
          value: function initialiseNewSingleAttributeGroups(instance, metricIndex) {
            var group = {};
            group.instanceList = [];
            group.markerX = 0;
            group.total = instance.metricList[metricIndex].total;
            return group;
          }
        }, {
          key: "initialiseSingleAttributeGroupsColor",
          value: function initialiseSingleAttributeGroupsColor(metric, metricIndex) {
            var _this14 = this;

            var originalColor = this.panel.metricList[metricIndex].colorList[0];
            metric.thresholdGroupListMap.forEach(function (groupList) {
              var luminanceChange = -_this14.config.maxLuminanceChange / groupList.length;
              groupList.forEach(function (group, groupIndex) {
                group.color = _this14.changeColorLuminance(originalColor, groupIndex * luminanceChange);
              });
            });
          }
        }, {
          key: "initialiseSingleAttributeInstanceGroupList",
          value: function initialiseSingleAttributeInstanceGroupList() {
            var _this15 = this;

            this.overviewModel.data.forEach(function (instance) {
              instance.groupList = [];

              _this15.overviewModel.metricList.forEach(function (metric, metricIndex) {
                for (var i = 0; i < metric.thresholdGroupListMap.length; ++i) {
                  var group = metric.thresholdGroupListMap[i];

                  if (instance.metricList[metricIndex].total == group.total) {
                    instance.groupList.push(group);
                    break;
                  }
                }
              });
            });
          }
        }, {
          key: "initialiseMultiAttributeGroups",
          value: function initialiseMultiAttributeGroups() {
            this.overviewModel.thresholdGroupListMap = new Map();

            for (var groupingThreshold = 0; groupingThreshold <= this.config.groupingThresholdCount; ++groupingThreshold) {
              var groupList = [];
              this.populateMultiAttributeGroupList(groupList, groupingThreshold);
              this.overviewModel.thresholdGroupListMap.set(groupingThreshold, groupList);
            }

            this.initialiseMultiAttributeGroupsColor();
          }
        }, {
          key: "populateMultiAttributeGroupList",
          value: function populateMultiAttributeGroupList(groupList, groupingThreshold) {
            var _this16 = this;

            var thresholdValue = groupingThreshold * 0.01;
            this.overviewModel.data.forEach(function (instance) {
              var group = _this16.findExistingMultiAttributeGroup(groupList, thresholdValue, instance);

              if (!group) {
                group = _this16.initialiseNewMultiAttributeGroup(instance);
                groupList.push(group);
              }

              group.instanceList.push(instance);

              for (var i = 0; i < instance.metricList.length; ++i) {
                var metric = group.metricList[i];
                metric.total = (metric.total * (group.instanceList.length - 1) + instance.metricList[i].total) / group.instanceList.length;
              }
            });
          }
        }, {
          key: "findExistingMultiAttributeGroup",
          value: function findExistingMultiAttributeGroup(groupList, thresholdValue, instance) {
            var _this17 = this;

            var group = _.find(groupList, function (search) {
              for (var i = 0; i < instance.metricList.length; ++i) {
                var metric = search.metricList[i];
                var min = metric.total * (1 - thresholdValue);
                var max = metric.total * (1 + thresholdValue);

                if (!_this17.isBetween(instance.metricList[i].total, min, max)) {
                  return false;
                }
              }

              return true;
            });

            return group;
          }
        }, {
          key: "initialiseNewMultiAttributeGroup",
          value: function initialiseNewMultiAttributeGroup(instance) {
            var group = {};
            group.metricList = [];
            group.instanceList = [];
            group.markerX = 0;
            instance.metricList.forEach(function (instanceMetric) {
              var groupMetric = {};
              groupMetric.total = instanceMetric.total;
              group.metricList.push(groupMetric);
            });
            return group;
          }
        }, {
          key: "initialiseMultiAttributeGroupsColor",
          value: function initialiseMultiAttributeGroupsColor() {
            var _this18 = this;

            this.overviewModel.thresholdGroupListMap.forEach(function (groupList) {
              var luminanceChange = (_this18.config.startingGreyColor - _this18.config.endingGrayColor) / groupList.length;
              groupList.forEach(function (group, groupIndex) {
                var greyValue = Math.round(_this18.config.startingGreyColor - luminanceChange * groupIndex);
                group.color = "rgba(" + greyValue + ", " + greyValue + ", " + greyValue + ", 1)";
              });
            });
          }
        }, {
          key: "initialiseCompressedTimeIndexes",
          value: function initialiseCompressedTimeIndexes() {
            var _this19 = this;

            this.overviewModel.metricList.forEach(function (overviewMetric, metricIndex) {
              overviewMetric.compressedTimeIndexList = [0];

              _this19.overviewModel.data.forEach(function (instance) {
                _this19.initialiseInstanceCompressedTimeRangeList(instance, overviewMetric, metricIndex);
              });

              _this19.overviewModel.data.forEach(function (instance) {
                var instanceMetric = instance.metricList[metricIndex];
                instanceMetric.compressedIndexRangeList.forEach(function (range) {
                  if (!overviewMetric.compressedTimeIndexList.includes(range.end)) {
                    overviewMetric.compressedTimeIndexList.push(range.end);
                  }
                });
              });

              overviewMetric.compressedTimeIndexList.sort(function (first, second) {
                return first - second;
              });
            });
          }
        }, {
          key: "initialiseInstanceCompressedTimeRangeList",
          value: function initialiseInstanceCompressedTimeRangeList(instance, overviewMetric, metricIndex) {
            var _this20 = this;

            var instanceMetric = instance.metricList[metricIndex];
            instanceMetric.compressedIndexRangeList = [];
            var presviousRange;
            instanceMetric.data.forEach(function (point, pointIndex) {
              var thresholdAverage = _this20.getThresholdAverage(point.value, overviewMetric.colorMap);

              if (pointIndex == 0) {
                presviousRange = _this20.initialiseNewCompressedTimeRange(instanceMetric, thresholdAverage);
              } else {
                if (thresholdAverage != presviousRange.value || pointIndex == instanceMetric.data.length - 1) {
                  presviousRange.end = pointIndex;

                  if (thresholdAverage != presviousRange.value) {
                    presviousRange = _this20.initialiseNewCompressedTimeRange(instanceMetric, thresholdAverage);
                  }
                }
              }
            });
          }
        }, {
          key: "initialiseNewCompressedTimeRange",
          value: function initialiseNewCompressedTimeRange(instanceMetric, thresholdAverage) {
            var range = {};
            instanceMetric.compressedIndexRangeList.push(range);
            range.value = thresholdAverage;
            return range;
          }
        }, {
          key: "renderOverview",
          value: function renderOverview() {
            if (this.overviewModel.data.length > 0) {
              this.clearFocusArea();
              this.drawOverview();
            }
          }
        }, {
          key: "clearFocusArea",
          value: function clearFocusArea() {
            this.hasFocus = false;
            this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
          }
        }, {
          key: "drawOverview",
          value: function drawOverview() {
            var _this21 = this;

            this.$timeout(function () {
              _this21.overviewContext.clearRect(0, 0, _this21.overviewCanvas.width, _this21.overviewCanvas.height);

              _this21.setOverviewCanvasSize();

              _this21.focusGraphMarginTop = _this21.overviewCanvasHeight + _this21.config.marginBetweenOverviewAndFocus;

              _this21.scope.$apply();

              _this21.drawOverviewData();
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
          }
        }, {
          key: "setOverviewWidth",
          value: function setOverviewWidth() {
            var _this22 = this;

            this.setOverviewContextTimeFont();
            var marginBetweenMetrics = this.getMarginBetweenMetrics();
            this.overviewModel.overviewWidth = this.config.overview.marginBetweenMarkerAndGroup * this.overviewModel.metricList.length + marginBetweenMetrics * (this.overviewModel.metricList.length - 1); // total width of overiew graph

            if (this.isCompressed) {
              this.overviewModel.metricList.forEach(function (metric) {
                _this22.overviewModel.overviewWidth += metric.compressedTimeIndexList.length * _this22.config.overview.pointWidth;
              });
            } else {
              this.overviewModel.overviewWidth += this.getMaxMetricLength() * this.overviewModel.metricList.length * this.config.overview.pointWidth;
            }

            this.overviewCanvasWidth = this.overviewModel.overviewWidth;
            this.overviewModel.toDate = this.convertDateToString(this.toDate * 1000);
            this.overviewModel.toDateWidth = this.overviewContext.measureText(this.overviewModel.toDate).width;

            if (this.isGrouped) {
              this.setGroupedOverviewCanvasWidth();
            } else {
              this.overviewCanvasWidth += this.overviewModel.toDateWidth / 2;
            }
          }
        }, {
          key: "getMarginBetweenMetrics",
          value: function getMarginBetweenMetrics() {
            var marginBetweenMetrics;

            if (this.isGrouped || !this.isCompressed) {
              marginBetweenMetrics = this.config.overview.decompressedMarginBetweenMetrics;
            } else {
              marginBetweenMetrics = this.config.overview.compressedMarginBetweenMetrics;
            }

            return marginBetweenMetrics;
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
          key: "setGroupedOverviewCanvasWidth",
          value: function setGroupedOverviewCanvasWidth() {
            var _this23 = this;

            this.overviewCanvasWidth += this.config.overview.marginBetweenMarkerAndGroup * this.overviewModel.metricList.length;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize * this.overviewModel.metricList.length;
              this.overviewModel.metricList.forEach(function (metric) {
                _this23.overviewCanvasWidth += _this23.getMaxGroupSizeBarLength(metric) * _this23.config.overview.singleAttributeGroupSizeWidth;
              });
            } else {
              this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize + this.getMaxMultiAttributeGroupSize() * this.config.overview.multipleAttributeGroupSizeWidth;
            }
          }
        }, {
          key: "getMaxGroupSizeBarLength",
          value: function getMaxGroupSizeBarLength(metric) {
            var groupList = this.getCurrentSingleAttributeGroupList(metric);

            var largestGroup = _.maxBy(groupList, function (group) {
              return group.instanceList.length;
            });

            return largestGroup.instanceList.length * this.config.overview.singleAttributeGroupSizeWidth;
          }
        }, {
          key: "getCurrentSingleAttributeGroupList",
          value: function getCurrentSingleAttributeGroupList(metric) {
            return metric.thresholdGroupListMap.get(this.groupingThreshold);
          }
        }, {
          key: "getMaxMultiAttributeGroupSize",
          value: function getMaxMultiAttributeGroupSize() {
            var result = 0;
            var groupList = this.getCurrentMultiAttributeGroupList();
            groupList.forEach(function (group) {
              if (group.instanceList.length > result) {
                result = group.instanceList.length;
              }
            });
            return result;
          }
        }, {
          key: "getCurrentMultiAttributeGroupList",
          value: function getCurrentMultiAttributeGroupList() {
            return this.overviewModel.thresholdGroupListMap.get(this.groupingThreshold);
          }
        }, {
          key: "setOverviewHeight",
          value: function setOverviewHeight() {
            // height of tallest graph
            if (this.isGrouped) {
              var groupCount = this.getMaxGroupCount();
              this.overviewModel.overviewHeight = groupCount * (this.config.overview.groupedPointHeight + this.config.overview.marginBetweenGroups);
            } else {
              this.overviewModel.overviewHeight = this.overviewModel.data.length * this.config.overview.ungroupedPointHeight;
            } // 2 = Metric and time labels


            this.overviewCanvasHeight = this.overviewModel.overviewHeight + (this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 2;
          }
        }, {
          key: "getMaxGroupCount",
          value: function getMaxGroupCount() {
            var _this24 = this;

            var groupCount = 0;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this24.getCurrentSingleAttributeGroupList(metric);

                var length = groupList.length;

                if (length > groupCount) {
                  groupCount = length;
                }
              });
            } else {
              var groupList = this.getCurrentMultiAttributeGroupList();
              groupCount = groupList.length;
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
            this.overviewModel.overviewEndY = 0;
            this.setOverviewMetricStartXAndEndX();

            if (this.isGrouped) {
              this.drawGroupedOverview();
            } else {
              this.drawUngroupedOverview();
            }

            this.drawMetricLabels();
            this.drawToDateLabel();
          }
        }, {
          key: "setOverviewMetricStartXAndEndX",
          value: function setOverviewMetricStartXAndEndX() {
            var _this25 = this;

            var marginBetweenMetrics = this.isCompressed ? this.config.overview.compressedMarginBetweenMetrics : this.config.overview.decompressedMarginBetweenMetrics;
            this.overviewModel.metricList.forEach(function (metric, metricIndex) {
              _this25.setOverviewMetricStartX(metric, metricIndex, marginBetweenMetrics);

              if (_this25.isCompressed) {
                metric.endX = metric.startX + metric.compressedTimeIndexList.length * _this25.config.overview.pointWidth;
              } else {
                metric.endX = metric.startX + _this25.getMaxMetricLength() * _this25.config.overview.pointWidth;
              }
            });
          }
        }, {
          key: "setOverviewMetricStartX",
          value: function setOverviewMetricStartX(metric, metricIndex, marginBetweenMetrics) {
            if (metricIndex > 0) {
              var previousMetric = this.overviewModel.metricList[metricIndex - 1];
              metric.startX = previousMetric.endX + marginBetweenMetrics;

              if (this.isGrouped) {
                metric.startX += this.config.overview.marginBetweenMarkerAndGroup;

                if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                  var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(previousMetric);
                  metric.startX += maxGroupSizeBarLength + this.config.overview.marginBetweenMetricAndGroupSize;
                }
              }
            } else {
              metric.startX = this.config.overview.marginBetweenMarkerAndGroup;
            }
          }
        }, {
          key: "drawGroupedOverview",
          value: function drawGroupedOverview() {
            this.overviewModel.overviewInstanceHeight = this.config.overview.groupedPointHeight;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.drawSingeAttributeGroupedOverview();
            } else {
              this.drawMultiAttributeGroupedOverview();
            }

            this.drawGroupSize();
          }
        }, {
          key: "drawSingeAttributeGroupedOverview",
          value: function drawSingeAttributeGroupedOverview() {
            var _this26 = this;

            this.overviewModel.metricList.forEach(function (metric, metricIndex) {
              var groupList = _this26.getCurrentSingleAttributeGroupList(metric);

              groupList.forEach(function (group, groupIndex) {
                _this26.drawGroupOverviewWrapper(group, groupIndex, [metricIndex]);
              });

              _this26.drawMetricSeparator(metric);
            });
          }
        }, {
          key: "drawGroupOverviewWrapper",
          value: function drawGroupOverviewWrapper(group, groupIndex, metricIndexList) {
            var instance = group.instanceList[0];
            this.drawOverviewInstance(instance, groupIndex, this.config.overview.groupedPointHeight, this.config.overview.marginBetweenGroups, metricIndexList);
            group.y = instance.y;
          }
        }, {
          key: "drawOverviewInstance",
          value: function drawOverviewInstance(instance, instanceIndex, pointHeight, marginBetweenInstances, metricIndexList) {
            var _this27 = this;

            instance.y = this.overviewModel.overviewStartY + instanceIndex * (pointHeight + marginBetweenInstances);
            var endY = instance.y + pointHeight;

            if (endY > this.overviewModel.overviewEndY) {
              this.overviewModel.overviewEndY = endY;
            }

            metricIndexList.forEach(function (metricIndex) {
              _this27.drawOverviewInstancePoints(instance, metricIndex, pointHeight);
            });
          }
        }, {
          key: "drawOverviewInstancePoints",
          value: function drawOverviewInstancePoints(instance, metricIndex, pointHeight) {
            var _this28 = this;

            var overviewMetric = this.overviewModel.metricList[metricIndex];
            var instanceMetric = instance.metricList[metricIndex];

            if (this.isCompressed) {
              overviewMetric.compressedTimeIndexList.forEach(function (pointIndex, rangeIndex) {
                var point = instanceMetric.data[pointIndex];

                if (point) {
                  _this28.drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, rangeIndex, _this28.config.overview.pointWidth, pointHeight);
                }
              });
            } else {
              instanceMetric.data.forEach(function (point, pointIndex) {
                _this28.drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, pointIndex, _this28.config.overview.pointWidth, pointHeight);
              });
            }
          }
        }, {
          key: "drawOverviewInstancePoint",
          value: function drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, pointIndex, pointWidth, pointHeight) {
            point.x = overviewMetric.startX + pointIndex * pointWidth;
            point.color = this.getColorFromMap(point.value, this.overviewModel.metricList[metricIndex].colorMap);
            this.overviewContext.fillStyle = point.color;
            this.overviewContext.fillRect(point.x, instance.y, pointWidth, pointHeight);
          }
        }, {
          key: "getColorFromMap",
          value: function getColorFromMap(value, map) {
            var _this29 = this;

            var result;
            map.forEach(function (color, threshold) {
              if (_this29.isBetween(value, threshold.min, threshold.max)) {
                result = color;
              }
            });
            return result;
          }
        }, {
          key: "drawMultiAttributeGroupedOverview",
          value: function drawMultiAttributeGroupedOverview() {
            var _this30 = this;

            var groupList = this.getCurrentMultiAttributeGroupList();
            groupList.forEach(function (group, groupIndex) {
              var metricIndexList = _this30.getAllMetricIndexList();

              _this30.drawGroupOverviewWrapper(group, groupIndex, metricIndexList);
            });
            this.drawMetricSeparator(this.overviewModel.metricList[this.overviewModel.metricList.length - 1]);
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

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.drawSingleAttributeGroupSize(labelWidth);
            } else {
              this.drawMultipleAttributeGroupSize(labelWidth);
            }
          }
        }, {
          key: "drawSingleAttributeGroupSize",
          value: function drawSingleAttributeGroupSize(labelWidth) {
            var _this31 = this;

            this.overviewModel.metricList.forEach(function (metric) {
              var startX = metric.endX + _this31.config.overview.marginBetweenMetricAndGroupSize;

              var maxGroupSizeBarLength = _this31.getMaxGroupSizeBarLength(metric);

              var groupList = _this31.getCurrentSingleAttributeGroupList(metric);

              groupList.forEach(function (group, groupIndex) {
                _this31.drawGroupSizeWrapper(startX, group, groupIndex, _this31.config.overview.singleAttributeGroupSizeWidth);
              });
              _this31.overviewContext.fillStyle = "black";

              _this31.overviewContext.fillText("Groups size", (startX * 2 + maxGroupSizeBarLength - labelWidth) / 2, _this31.overviewModel.labelTextHeight);
            });
          }
        }, {
          key: "drawGroupSizeWrapper",
          value: function drawGroupSizeWrapper(startX, group, groupIndex, groupSizeWidth) {
            var endX = startX + group.instanceList.length * groupSizeWidth;
            var startY = this.overviewModel.overviewStartY + groupIndex * (this.config.overview.groupedPointHeight + this.config.overview.marginBetweenGroups);
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
            var _this32 = this;

            var startX = this.overviewModel.overviewWidth + this.config.overview.decompressedMarginBetweenMetrics;
            var maxEndX = 0;
            var groupList = this.getCurrentMultiAttributeGroupList();
            groupList.forEach(function (group, groupIndex) {
              var endX = _this32.drawGroupSizeWrapper(startX, group, groupIndex, _this32.config.overview.multipleAttributeGroupSizeWidth);

              if (endX > maxEndX) {
                maxEndX = endX;
              }
            });
            this.overviewContext.fillStyle = "black";
            this.overviewContext.fillText("Groups size", (startX + maxEndX - labelWidth) / 2, this.overviewModel.labelTextHeight);
          }
        }, {
          key: "drawMetricSeparator",
          value: function drawMetricSeparator(metric) {
            this.overviewContext.strokeStyle = "gray";
            var x = metric.endX + this.config.overview.decompressedMarginBetweenMetrics / 2;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(metric);
              x += this.config.overview.marginBetweenMetricAndGroupSize + maxGroupSizeBarLength;
            }

            this.overviewContext.beginPath();
            this.overviewContext.moveTo(x, this.overviewModel.overviewStartY);
            this.overviewContext.lineTo(x, this.overviewModel.overviewStartY + this.overviewModel.overviewHeight);
            this.overviewContext.stroke();
            this.overviewContext.closePath();
          }
        }, {
          key: "drawUngroupedOverview",
          value: function drawUngroupedOverview() {
            var _this33 = this;

            this.overviewModel.overviewInstanceHeight = this.config.overview.ungroupedPointHeight;
            this.overviewModel.data.forEach(function (instance, instanceIndex) {
              var metricIndexList = _this33.getAllMetricIndexList();

              _this33.drawOverviewInstance(instance, instanceIndex, _this33.config.overview.ungroupedPointHeight, 0, metricIndexList);
            });

            if (!this.isCompressed) {// this.drawGroupBars();
            }
          }
        }, {
          key: "drawGroupBars",
          value: function drawGroupBars() {
            for (var i = 1; i < this.overviewModel.metricList.length; ++i) {
              var x = this.overviewModel.metricList[i].startX - this.config.overview.decompressedMarginBetweenMetrics / 2 - Math.floor(this.config.overview.groupBarWidth / 2);
              this.drawGroupBarAtPosition(x);
            }
          }
        }, {
          key: "drawGroupBarAtPosition",
          value: function drawGroupBarAtPosition(x) {
            var _this34 = this;

            var y = this.overviewModel.overviewStartY;
            this.overviewModel.thresholdGroupListMap.forEach(function (group) {
              _this34.overviewContext.fillStyle = group.color;
              var height = group.instanceList.length * _this34.config.overview.ungroupedPointHeight;

              _this34.overviewContext.fillRect(x, y, _this34.config.overview.groupBarWidth, height);

              y += height;
            });
          }
        }, {
          key: "drawMetricLabels",
          value: function drawMetricLabels() {
            this.setOverviewContextLabelFont();
            this.overviewContext.fillStyle = "black";

            for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
              var metric = this.overviewModel.metricList[i];
              var label = this.panel.metricList[i].name;
              var width = this.overviewContext.measureText(label).width;
              this.overviewContext.fillText(label, (metric.startX + metric.endX - width) / 2, this.overviewModel.labelTextHeight);
            }
          }
        }, {
          key: "drawToDateLabel",
          value: function drawToDateLabel() {
            this.setOverviewContextTimeFont();
            var y = this.overviewModel.overviewStartY + this.overviewModel.overviewHeight + this.config.overview.marginBetweenLabelsAndOverview;
            var metric = this.overviewModel.metricList[this.overviewModel.metricList.length - 1];
            this.overviewContext.fillStyle = "black";
            this.overviewContext.fillText(this.overviewModel.toDate, metric.endX - this.overviewModel.toDateWidth / 2, y);
          }
        }, {
          key: "setOverviewContextTimeFont",
          value: function setOverviewContextTimeFont() {
            this.overviewContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
          }
        }, {
          key: "convertDateToString",
          value: function convertDateToString(date) {
            return moment(date).format(this.config.dateFormat);
          }
        }, {
          key: "selectOverviewMode",
          value: function selectOverviewMode() {
            this.drawOverview();
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
            this.clearFocusArea();
            this.clearTimeIndicator();
            this.deselectAllGroups();
            this.showFocus = false;
            this.showMergeSelectedGroups = false;
          }
        }, {
          key: "deselectAllGroups",
          value: function deselectAllGroups() {
            this.focusModel.groupList = [];
            this.deselectSingleAttributeGroups();
            this.deselectMultiAttributeGroups();
          }
        }, {
          key: "deselectSingleAttributeGroups",
          value: function deselectSingleAttributeGroups() {
            var _this35 = this;

            this.overviewModel.metricList.forEach(function (metric) {
              if (metric.originalGroupList) {
                metric.thresholdGroupListMap.set(_this35.previousGroupThreshold, metric.originalGroupList);
                metric.originalGroupList = null;
              }

              var groupList = _this35.getCurrentSingleAttributeGroupList(metric);

              if (groupList) {
                groupList.forEach(function (group) {
                  group.isSelected = false;
                });
              }
            });
          }
        }, {
          key: "deselectMultiAttributeGroups",
          value: function deselectMultiAttributeGroups() {
            if (this.overviewModel.originalGroupList) {
              this.overviewModel.thresholdGroupListMap.set(this.previousGroupThreshold, this.overviewModel.originalGroupList);
              this.overviewModel.originalGroupList = null;
            }

            var groupList = this.getCurrentMultiAttributeGroupList();
            groupList.forEach(function (group) {
              group.isSelected = false;
            });
          }
        }, {
          key: "changeGroupingThreshold",
          value: function changeGroupingThreshold() {
            this.changeGroupingSelection();
          }
        }, {
          key: "groupUngroup",
          value: function groupUngroup() {
            this.isGrouped = !this.isGrouped;
            this.changeGroupingSelection();
          }
        }, {
          key: "mergeSelectedGroups",
          value: function mergeSelectedGroups() {
            this.previousGroupThreshold = this.groupingThreshold;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.mergeSingleAttributeGroups();
            } else {
              this.mergeMultipleAttributeGroups();
            }

            this.mergeFocusGroupList();
            this.showMergeSelectedGroups = false;
            this.drawOverview();
            this.drawSelectedGroupsMarkers();
            this.drawFocusGraph();
          }
        }, {
          key: "mergeSingleAttributeGroups",
          value: function mergeSingleAttributeGroups() {
            var _this36 = this;

            this.overviewModel.metricList.forEach(function (metric) {
              var groupList = _this36.getCurrentSingleAttributeGroupList(metric);

              if (!metric.originalGroupList) {
                metric.originalGroupList = [];
                groupList.forEach(function (group) {
                  metric.originalGroupList.push(group);
                });
              }

              _this36.mergeSelectedGroupsWrapper(groupList);
            });
          }
        }, {
          key: "mergeSelectedGroupsWrapper",
          value: function mergeSelectedGroupsWrapper(groupList) {
            var currentGroupList = [];
            groupList.forEach(function (group) {
              currentGroupList.push(group);
            });
            groupList.length = 0;
            this.populateMergedGroupList(currentGroupList, groupList);
          }
        }, {
          key: "populateMergedGroupList",
          value: function populateMergedGroupList(currentGroupList, groupList) {
            var mergedGroup;
            currentGroupList.forEach(function (group) {
              if (group.isSelected) {
                if (mergedGroup) {
                  group.instanceList.forEach(function (instance) {
                    mergedGroup.instanceList.push(instance);
                  });
                } else {
                  mergedGroup = JSON.parse(JSON.stringify(group));
                  groupList.push(mergedGroup);
                }
              } else {
                groupList.push(group);
              }
            });
          }
        }, {
          key: "mergeFocusGroupList",
          value: function mergeFocusGroupList() {
            var _this37 = this;

            this.focusModel.groupList = [];

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this37.getCurrentSingleAttributeGroupList(metric);

                _this37.mergeFocusGroupListWrapper(groupList);
              });
            } else {
              this.mergeFocusGroupListWrapper(this.getCurrentMultiAttributeGroupList());
            }
          }
        }, {
          key: "mergeFocusGroupListWrapper",
          value: function mergeFocusGroupListWrapper(groupList) {
            var _this38 = this;

            groupList.forEach(function (group) {
              if (group.isSelected) {
                _this38.addGroupToFocus(group);
              }
            });
          }
        }, {
          key: "addGroupToFocus",
          value: function addGroupToFocus(group) {
            var _this39 = this;

            var focusGroup = {};
            focusGroup.instanceList = [];
            focusGroup.overviewGroup = group;
            group.instanceList.forEach(function (overviewInstance) {
              var metricWithMostData = _.maxBy(overviewInstance.metricList, function (metric) {
                return metric.data.length;
              });

              _this39.focusModel.focusedIndexList = Array.from(Array(metricWithMostData.data.length).keys());

              var focusInstance = _this39.getFocusInstance(overviewInstance, _this39.focusModel.focusedIndexList);

              focusGroup.instanceList.push(focusInstance);
            });
            this.focusModel.groupList.push(focusGroup);
          }
        }, {
          key: "mergeMultipleAttributeGroups",
          value: function mergeMultipleAttributeGroups() {
            var _this40 = this;

            var groupList = this.getCurrentMultiAttributeGroupList();

            if (!this.overviewModel.originalGroupList) {
              this.overviewModel.originalGroupList = [];
              groupList.forEach(function (group) {
                _this40.overviewModel.originalGroupList.push(group);
              });
            }

            this.mergeSelectedGroupsWrapper(groupList);
          }
        }, {
          key: "compressDecompress",
          value: function compressDecompress() {
            this.isCompressed = !this.isCompressed;
            this.drawOverview();
            this.clearFocusArea();
          }
        }, {
          key: "selectTimeHighlightMode",
          value: function selectTimeHighlightMode() {
            this.clearTimeIndicator();

            if (this.overviewModel.thresholdGroupListMap) {
              this.overviewModel.thresholdGroupListMap.forEach(function (group) {
                group.timeRangeIndexList = [];
              });
            }

            if (this.overviewModel.metricList) {
              this.overviewModel.metricList.forEach(function (metric) {
                metric.thresholdGroupListMap.forEach(function (group) {
                  group.timeRangeIndexList = [];
                });
              });
            }
          }
        }, {
          key: "clearTimeIndicator",
          value: function clearTimeIndicator() {
            this.overviewTimeIndicatorContext.clearRect(0, 0, this.overviewTimeIndicatorCanvas.width, this.overviewTimeIndicatorCanvas.height);
          }
        }, {
          key: "mouseDownOnOverview",
          value: function mouseDownOnOverview(evt) {
            if (this.isGrouped && this.overviewModel.hoveredGroup && this.timeHighlightMode == this.enumList.timeHighlightMode.RANGE) {
              this.overviewModel.isSelectingTimeRange = true;
              this.overviewModel.timeRangeStartOffset = this.overviewModel.mousePositionXOffset;
              this.overviewModel.timeRangeGroup = this.overviewModel.hoveredGroup;
            }
          }
        }, {
          key: "moveMouseOnOverview",
          value: function moveMouseOnOverview(evt) {
            if (this.overviewModel.metricList) {
              this.setOverviewMousePosition(evt);

              if (this.isGrouped) {
                this.initialiseOverviewCanvasCursor();
                this.overviewModel.hoveredGroup = null;
                this.overviewModel.hoveredMarker = null;
                this.checkAndSetSelectedOverviewMarker();
                this.checkMouseIsOnGroupAndSetHoveredGroup();

                if (this.timeHighlightMode == this.enumList.timeHighlightMode.POINT) {
                  if (this.overviewModel.hoveredGroup) {
                    this.drawTimeIndicators();
                  } else {
                    this.clearTimeIndicator();
                  }
                } else if (this.overviewModel.isSelectingTimeRange) {
                  this.initialiseSelectedGroupTimeRangeIndexList();
                  this.drawSelectedTimeRanges();
                }
              } else if (!this.isCompressed && !this.focusAreaIsFixed) {
                this.drawFocus(evt);
              }
            }
          }
        }, {
          key: "setOverviewMousePosition",
          value: function setOverviewMousePosition(evt) {
            this.overviewModel.mousePosition = this.getMousePos(evt, this.focusAreaCanvas);
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
          key: "checkMouseIsOnGroupAndSetHoveredGroup",
          value: function checkMouseIsOnGroupAndSetHoveredGroup() {
            for (var metricIndex = 0; metricIndex < this.overviewModel.metricList.length; ++metricIndex) {
              var metric = this.overviewModel.metricList[metricIndex];

              if (metric) {
                // only check if mouse is on a metric graph
                if (this.isBetween(this.overviewModel.mousePosition.x, metric.startX, metric.endX)) {
                  this.overviewModel.selectedMetricIndex = metricIndex;
                  this.overviewModel.mousePositionXOffset = this.overviewModel.mousePosition.x - metric.startX;

                  if (this.checkAndSetHoveredGroup(metric)) {
                    return;
                  }
                }
              }
            }
          }
        }, {
          key: "checkAndSetHoveredGroup",
          value: function checkAndSetHoveredGroup(metric) {
            var groupList;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              groupList = this.getCurrentSingleAttributeGroupList(metric);
            } else {
              groupList = this.getCurrentMultiAttributeGroupList();
            }

            return this.checkAndSetHoveredGroupInGroupList(groupList);
          }
        }, {
          key: "checkAndSetHoveredGroupInGroupList",
          value: function checkAndSetHoveredGroupInGroupList(groupList) {
            for (var i = 0; i < groupList.length; ++i) {
              var group = groupList[i];

              if (this.checkGroupIsHovered(group)) {
                return true;
              }
            }

            return false;
          }
        }, {
          key: "checkGroupIsHovered",
          value: function checkGroupIsHovered(group) {
            if (this.isBetween(this.overviewModel.mousePosition.y, group.y, group.y + this.config.overview.groupedPointHeight)) {
              this.overviewModel.hoveredGroup = group;
              this.overviewCursor = "pointer";
              return true;
            }
          }
        }, {
          key: "checkAndSetSelectedOverviewMarker",
          value: function checkAndSetSelectedOverviewMarker() {
            for (var markerIndex = 0; markerIndex < this.overviewModel.groupMarkerList.length; ++markerIndex) {
              var marker = this.overviewModel.groupMarkerList[markerIndex];

              if (this.isBetween(this.overviewModel.mousePosition.x, marker.startX, marker.endX) && this.isBetween(this.overviewModel.mousePosition.y, marker.startY, marker.endY)) {
                this.overviewCursor = "pointer";
                this.overviewModel.hoveredMarker = marker;
                return;
              }
            }
          }
        }, {
          key: "drawTimeIndicators",
          value: function drawTimeIndicators() {
            var _this41 = this;

            this.clearTimeIndicator();
            this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.drawTimeIndicatorWrapper(this.overviewModel.metricList[this.overviewModel.selectedMetricIndex]);
            } else {
              this.overviewModel.metricList.forEach(function (metric) {
                _this41.drawTimeIndicatorWrapper(metric);
              });
            }

            this.drawSelectedTimeLabel();
          }
        }, {
          key: "drawTimeIndicatorWrapper",
          value: function drawTimeIndicatorWrapper(metric) {
            var horizontalLineY = this.drawHorizontalTimeLine(metric, this.overviewModel.hoveredGroup);
            this.drawSelectedTimePoint(metric, horizontalLineY);
          }
        }, {
          key: "drawHorizontalTimeLine",
          value: function drawHorizontalTimeLine(metric, group) {
            var horizontalLineY = group.y - this.config.overview.marginBetweenGroups / 2;
            this.overviewTimeIndicatorContext.beginPath();
            this.overviewTimeIndicatorContext.moveTo(metric.startX, horizontalLineY);
            this.overviewTimeIndicatorContext.lineTo(metric.endX, horizontalLineY);
            this.overviewTimeIndicatorContext.stroke();
            this.overviewTimeIndicatorContext.closePath();
            return horizontalLineY;
          }
        }, {
          key: "drawSelectedTimePoint",
          value: function drawSelectedTimePoint(metric, horizontalLineY) {
            var verticalLineX = metric.startX + this.overviewModel.mousePositionXOffset;
            this.overviewTimeIndicatorContext.beginPath();
            this.overviewTimeIndicatorContext.moveTo(verticalLineX, horizontalLineY);
            this.overviewTimeIndicatorContext.lineTo(verticalLineX, this.overviewModel.hoveredGroup.y);
            this.overviewTimeIndicatorContext.stroke();
            this.overviewTimeIndicatorContext.closePath();
          }
        }, {
          key: "drawSelectedTimeLabel",
          value: function drawSelectedTimeLabel() {
            for (var metricIndex = 0; metricIndex < this.overviewModel.metricList.length; ++metricIndex) {
              var instanceMetric = this.overviewModel.hoveredGroup.instanceList[0].metricList[metricIndex];
              var overviewMetric = this.overviewModel.metricList[metricIndex];

              if (this.isCompressed) {
                for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                  var point = instanceMetric.data[overviewMetric.compressedTimeIndexList[compressedTimeIndex]];

                  if (this.checkDataPointIsSelectedAndDrawTimeLabel(point, this.config.overview.pointWidth)) {
                    return;
                  }
                }
              } else {
                for (var compressedTimeIndex = 0; compressedTimeIndex < instanceMetric.data.length; ++compressedTimeIndex) {
                  var point = instanceMetric.data[compressedTimeIndex];

                  if (this.checkDataPointIsSelectedAndDrawTimeLabel(point, this.config.overview.pointWidth)) {
                    return;
                  }
                }
              }
            }
          }
        }, {
          key: "checkDataPointIsSelectedAndDrawTimeLabel",
          value: function checkDataPointIsSelectedAndDrawTimeLabel(point, pointWidth) {
            if (this.isBetween(this.overviewModel.mousePosition.x, point.x, point.x + pointWidth)) {
              this.overviewTimeIndicatorContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
              this.overviewTimeIndicatorContext.fillStyle = "black";
              var date = this.convertDateToString(point.date * 1000);
              var y = this.overviewModel.overviewStartY + this.overviewModel.overviewHeight + this.config.overview.marginBetweenLabelsAndOverview;
              var x = Math.max(0, this.overviewModel.mousePosition.x - this.overviewModel.toDateWidth / 2);
              this.overviewTimeIndicatorContext.fillText(date, x, y);
              return true;
            } else {
              return false;
            }
          }
        }, {
          key: "initialiseSelectedGroupTimeRangeIndexList",
          value: function initialiseSelectedGroupTimeRangeIndexList() {
            var _this42 = this;

            this.overviewModel.timeRangeGroup.timeRangeMetricIndex = this.overviewModel.selectedMetricIndex;
            this.overviewModel.timeRangeGroup.timeRangeIndexList = [];
            var instanceMetric = this.overviewModel.timeRangeGroup.instanceList[0].metricList[this.overviewModel.selectedMetricIndex];
            var overviewMetric = this.overviewModel.metricList[this.overviewModel.selectedMetricIndex];
            var startX = overviewMetric.startX + this.overviewModel.timeRangeStartOffset;
            var endX = overviewMetric.startX + this.overviewModel.mousePositionXOffset;

            if (startX > endX) {
              var temp = startX;
              startX = endX;
              endX = temp;
            }

            instanceMetric.data.forEach(function (point, pointIndex) {
              if (_this42.isBetween(point.x, startX, endX)) {
                _this42.overviewModel.timeRangeGroup.timeRangeIndexList.push(pointIndex);
              }
            });

            if (this.overviewModel.timeRangeGroup.timeRangeIndexList.length > 0) {
              this.setTimeRangeStartAndEndDate();
            }
          }
        }, {
          key: "setTimeRangeStartAndEndDate",
          value: function setTimeRangeStartAndEndDate() {
            var timeRangeGroup = this.overviewModel.timeRangeGroup;
            var metric = timeRangeGroup.instanceList[0].metricList[this.overviewModel.selectedMetricIndex];
            var timeRangeIndexList = timeRangeGroup.timeRangeIndexList;
            var startPoint = metric.data[timeRangeIndexList[0]];
            timeRangeGroup.startTimeRangeDate = this.convertDateToString(startPoint.date * 1000);
            var endPoint = metric.data[timeRangeIndexList[timeRangeIndexList.length - 1]];
            timeRangeGroup.endTimeRangeDate = this.convertDateToString(endPoint.date * 1000);
          }
        }, {
          key: "drawSelectedTimeRanges",
          value: function drawSelectedTimeRanges() {
            var _this43 = this;

            this.clearTimeIndicator();
            this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;
            this.overviewTimeIndicatorContext.fillStyle = this.config.timeIndicator.color;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this43.getCurrentSingleAttributeGroupList(metric);

                groupList.forEach(function (group) {
                  _this43.drawSelectedTimeRangeWrapper(group, [group.timeRangeMetricIndex]);
                });
              });
            } else {
              var groupList = this.getCurrentMultiAttributeGroupList();
              groupList.forEach(function (group) {
                _this43.drawSelectedTimeRangeWrapper(group, Array.from(Array(_this43.overviewModel.metricList.length).keys()));
              });
            }
          }
        }, {
          key: "drawSelectedTimeRangeWrapper",
          value: function drawSelectedTimeRangeWrapper(group, metricIndexList) {
            var _this44 = this;

            if (group.timeRangeIndexList && group.timeRangeIndexList.length > 0) {
              metricIndexList.forEach(function (metricIndex) {
                var instanceMetric = group.instanceList[0].metricList[metricIndex];
                var startPoint = instanceMetric.data[group.timeRangeIndexList[0]];

                if (startPoint) {
                  var overviewMetric = _this44.overviewModel.metricList[metricIndex];

                  var startY = _this44.drawHorizontalTimeLine(overviewMetric, group);

                  var endIndex = group.timeRangeIndexList[group.timeRangeIndexList.length - 1];
                  var startX = startPoint.x;
                  var endX = instanceMetric.data[endIndex].x + _this44.config.overview.pointWidth;
                  var width = endX - startX;
                  var height = group.y - startY;

                  _this44.overviewTimeIndicatorContext.fillRect(startX, startY, width, height);
                }
              });
            }
          }
        }, {
          key: "mouseUpOnOverView",
          value: function mouseUpOnOverView(evt) {
            if (this.isGrouped) {
              if (this.overviewModel.hoveredMarker) {
                this.startFocusMarkerInterval(this.overviewModel.hoveredMarker.group);
              } else {
                this.updateSelectedGroupListAndDrawFocusGraph();
              }
            } else if (!this.isCompressed) {
              this.fixFocusArea(evt);
            }
          }
        }, {
          key: "updateSelectedGroupListAndDrawFocusGraph",
          value: function updateSelectedGroupListAndDrawFocusGraph() {
            var _this45 = this;

            this.$timeout(function () {
              var updatedSelectedGroups = false;

              if (_this45.timeHighlightMode == _this45.enumList.timeHighlightMode.POINT) {
                if (_this45.overviewModel.hoveredGroup) {
                  _this45.addOrRemoveGroupToFocus(_this45.overviewModel.hoveredGroup, true);

                  updatedSelectedGroups = true;
                } else {
                  _this45.stopInterval();
                }
              } else if (_this45.overviewModel.isSelectingTimeRange) {
                var removeExisting = _this45.overviewModel.timeRangeStartOffset == _this45.overviewModel.mousePositionXOffset;

                _this45.addOrRemoveGroupToFocus(_this45.overviewModel.timeRangeGroup, removeExisting);

                updatedSelectedGroups = true;
              }

              _this45.scope.$apply();

              if (updatedSelectedGroups) {
                _this45.drawSelectedGroupsMarkers();

                _this45.drawFocusGraph();
              }

              _this45.overviewModel.isSelectingTimeRange = false;
            });
          }
        }, {
          key: "addOrRemoveGroupToFocus",
          value: function addOrRemoveGroupToFocus(group, removeExisting) {
            var focusGroup = _.find(this.focusModel.groupList, function (search) {
              return search.overviewGroup == group;
            });

            if (focusGroup) {
              if (removeExisting) {
                group.isSelected = false;

                _.remove(this.focusModel.groupList, function (search) {
                  return search.overviewGroup == group;
                });
              }
            } else {
              group.isSelected = true;
              this.addGroupToFocus(group);
            }

            this.setShowMergeGroupsButton();
          }
        }, {
          key: "setShowMergeGroupsButton",
          value: function setShowMergeGroupsButton() {
            var _this46 = this;

            this.showMergeSelectedGroups = false;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this46.getCurrentSingleAttributeGroupList(metric);

                _this46.setShowMergeGroupsButtonWrapper(groupList);
              });
            } else {
              var groupList = this.getCurrentMultiAttributeGroupList();
              this.setShowMergeGroupsButtonWrapper(groupList);
            }
          }
        }, {
          key: "setShowMergeGroupsButtonWrapper",
          value: function setShowMergeGroupsButtonWrapper(groupList) {
            var selectedGroupCount = 0;

            for (var i = 0; i < groupList.length; ++i) {
              var group = groupList[i];

              if (group.isSelected) {
                ++selectedGroupCount;
              }

              if (selectedGroupCount == 2) {
                this.showMergeSelectedGroups = true;
                return;
              }
            }

            ;
          }
        }, {
          key: "getFocusInstance",
          value: function getFocusInstance(overviewInstance, indexList) {
            var focusInstance = {};
            focusInstance.instance = overviewInstance.instance;
            focusInstance.overviewInstance = overviewInstance;
            this.initialiseFocusInstanceData(focusInstance, overviewInstance, indexList);
            return focusInstance;
          }
        }, {
          key: "drawSelectedGroupsMarkers",
          value: function drawSelectedGroupsMarkers() {
            var _this47 = this;

            this.$timeout(function () {
              _this47.clearFocusArea();

              _this47.overviewModel.groupMarkerList = [];

              if (_this47.groupingMode == _this47.enumList.groupingMode.SINGLE) {
                _this47.overviewModel.metricList.forEach(function (metric) {
                  var groupList = _this47.getCurrentSingleAttributeGroupList(metric);

                  groupList.forEach(function (group) {
                    _this47.drawOverviewGroupMarker(group, [metric]);
                  });
                });
              } else {
                var groupList = _this47.getCurrentMultiAttributeGroupList();

                groupList.forEach(function (group) {
                  _this47.drawOverviewGroupMarker(group, _this47.overviewModel.metricList);
                });
              }
            });
          }
        }, {
          key: "drawOverviewGroupMarker",
          value: function drawOverviewGroupMarker(group, metricList) {
            var _this48 = this;

            if (group.isSelected) {
              metricList.forEach(function (metric) {
                var marker = {};
                marker.group = group;
                marker.startX = metric.startX - _this48.config.overview.marginBetweenMarkerAndGroup + group.markerX;
                marker.endX = marker.startX + _this48.config.overview.groupedPointHeight;
                marker.startY = group.y;
                marker.endY = marker.startY + _this48.config.overview.groupedPointHeight;
                _this48.focusAreaContext.fillStyle = group.color;

                _this48.focusAreaContext.fillRect(marker.startX, marker.startY, _this48.config.overview.groupedPointHeight, _this48.config.overview.groupedPointHeight);

                _this48.overviewModel.groupMarkerList.push(marker);
              });
            }
          }
        }, {
          key: "startFocusMarkerInterval",
          value: function startFocusMarkerInterval(group) {
            if (this.focusGroupWithInterval != group) {
              this.stopInterval();
              this.focusGroupWithInterval = group;
              this.initialiseFocusMarkerInterval();
            }
          }
        }, {
          key: "stopInterval",
          value: function stopInterval() {
            this.stopOverviewMarkerInterval();
            this.stopFocusMarkerInterval();
          }
        }, {
          key: "stopOverviewMarkerInterval",
          value: function stopOverviewMarkerInterval() {
            if (this.currentOverviewMarkerInterval) {
              this.$interval.cancel(this.currentOverviewMarkerInterval);

              if (this.overviewGroupWithInterval) {
                this.overviewGroupWithInterval.overviewMarkerX = 0;

                if (this.focusModel.overviewGroupWithIntervalList) {
                  this.focusModel.overviewGroupWithIntervalList.forEach(function (overviewGroup) {
                    overviewGroup.markerX = 0;
                  });
                }

                this.drawSelectedGroupsMarkers();
              }

              this.overviewGroupWithInterval = null;
            }
          }
        }, {
          key: "stopFocusMarkerInterval",
          value: function stopFocusMarkerInterval() {
            if (this.currentFocusMarkerInterval) {
              this.$interval.cancel(this.currentFocusMarkerInterval);

              if (this.focusGroupWithInterval) {
                this.focusGroupWithInterval.focusMarkerX = 0;
                this.focusGroupWithInterval = null;
                this.drawGroupFocusMarkers();
              }
            }
          }
        }, {
          key: "initialiseFocusMarkerInterval",
          value: function initialiseFocusMarkerInterval() {
            var _this49 = this;

            this.focusMarkerMovingBackwards = false;
            this.focusGroupWithInterval.focusMarkerX = 0;
            this.currentFocusMarkerInterval = this.$interval(function () {
              if (_this49.focusMarkerMovingBackwards) {
                _this49.handleFocusMarkerMovingBackwardCase();
              } else {
                _this49.handleFocusMarkerMovingForwardCase();
              }

              _this49.drawGroupFocusMarkers();
            }, this.config.intervalTimer);
          }
        }, {
          key: "handleFocusMarkerMovingBackwardCase",
          value: function handleFocusMarkerMovingBackwardCase() {
            if (this.focusGroupWithInterval.focusMarkerX == 0) {
              this.focusMarkerMovingBackwards = false;
              ++this.focusGroupWithInterval.focusMarkerX;
            } else {
              --this.focusGroupWithInterval.focusMarkerX;
            }
          }
        }, {
          key: "handleFocusMarkerMovingForwardCase",
          value: function handleFocusMarkerMovingForwardCase() {
            if (this.focusGroupWithInterval.focusMarkerX == Math.round(this.config.focusGraph.marginBetweenMarkers / 2)) {
              this.focusMarkerMovingBackwards = true;
              --this.focusGroupWithInterval.focusMarkerX;
            } else {
              ++this.focusGroupWithInterval.focusMarkerX;
            }
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

              if (this.checkMouseIsInMetric(metric)) {
                this.drawFocusGraph();
                break;
              }
            }
          }
        }, {
          key: "checkMouseIsInMetric",
          value: function checkMouseIsInMetric(metric) {
            return this.isBetween(this.overviewModel.mousePosition.x, metric.startX, metric.endX);
          }
        }, {
          key: "drawFocusArea",
          value: function drawFocusArea() {
            var _this50 = this;

            if (this.overviewModel.mousePosition) {
              this.clearFocusArea();
              var size = this.getFocusAreaSize();
              var minimumTopY = Math.max(this.overviewModel.overviewStartY, this.overviewModel.mousePosition.y - size / 2);
              this.focusModel.focusStartY = Math.min(minimumTopY, this.overviewModel.overviewEndY - size);
              var size = this.getFocusAreaSize();
              var offset = this.getFocusAreaOffset();

              if (offset >= 0) {
                this.focusAreaContext.strokeStyle = this.config.focusArea.color;
                this.overviewModel.metricList.forEach(function (metric) {
                  metric.focusStartX = metric.startX + offset;

                  _this50.focusAreaContext.strokeRect(metric.focusStartX, _this50.focusModel.focusStartY, size, size);
                });
              }
            }
          }
        }, {
          key: "getFocusAreaSize",
          value: function getFocusAreaSize() {
            return Math.min(this.config.focusArea.focusAreaSize * 2, this.overviewModel.overviewEndY - this.overviewModel.overviewStartY);
          }
        }, {
          key: "getFocusAreaOffset",
          value: function getFocusAreaOffset() {
            for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
              var metric = this.overviewModel.metricList[i];

              if (this.checkMouseIsInMetric(metric)) {
                this.overviewModel.mousePositionXOffset = this.overviewModel.mousePosition.x - metric.startX;
                this.focusModel.sourceMetricIndex = i;
                return Math.min(Math.max(metric.startX, this.overviewModel.mousePosition.x - this.config.focusArea.focusAreaSize), metric.endX - this.getFocusAreaSize()) - metric.startX;
              }
            }
          }
        }, {
          key: "drawFocusGraph",
          value: function drawFocusGraph() {
            var _this51 = this;

            if (!this.isGrouped) {
              this.initialiseFocusGraphData();
            }

            if (this.isGrouped && this.focusModel.groupList.length > 0 || !this.isGrouped && this.focusModel.data.length > 0) {
              this.showFocus = true;
              this.$timeout(function () {
                _this51.focusGraphHeight = _this51.overviewModel.metricList.length * _this51.config.focusGraph.metricMaxHeight + (_this51.overviewModel.metricList.length - 1) * _this51.config.focusGraph.marginBetweenMetrics;
                _this51.focusGraphWidth = (_this51.focusModel.focusedIndexList.length - 1) * _this51.getFocusGraphPointWidth();

                _this51.scope.$apply();

                var focusGraphRow = _this51.getElementByID("focusGraphRow");

                if (focusGraphRow) {
                  _this51.focusModel.focusRowHeight = focusGraphRow.offsetHeight;

                  _this51.setFocusFromAndToDate();

                  _this51.positionFocusFromAndToDate();

                  _this51.drawFocusGraphData();

                  _this51.autoSrollFocusGraph();
                }
              });
            } else {
              this.showFocus = false;
            }
          }
        }, {
          key: "getFocusGraphPointWidth",
          value: function getFocusGraphPointWidth() {
            return this.isGrouped ? this.config.focusGraph.groupedPointWidth : this.config.focusGraph.ungroupedPointWidth;
          }
        }, {
          key: "initialiseFocusGraphData",
          value: function initialiseFocusGraphData() {
            var _this52 = this;

            if (!this.focusModel.data) {
              this.focusModel.data = [];
            }

            this.focusModel.data.length = 0;
            this.overviewModel.data.forEach(function (overviewInstance) {
              if (_this52.checkInstanceInFocus(overviewInstance)) {
                _this52.focusModel.focusedIndexList = _this52.getIndexesOfPointsInFocus(overviewInstance);

                var focusInstance = _this52.getFocusInstance(overviewInstance, _this52.focusModel.focusedIndexList);

                _this52.focusModel.data.push(focusInstance);
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
            var _this53 = this;

            var indexes = [];

            for (var i = 0; i < overviewInstance.metricList.length; ++i) {
              var metric = overviewInstance.metricList[i];

              if (metric.data.length > 0) {
                var overviewMetric = this.overviewModel.metricList[i];
                metric.data.forEach(function (point, index) {
                  if (_this53.isBetween(point.x, overviewMetric.focusStartX, overviewMetric.focusStartX + _this53.getFocusAreaSize())) {
                    indexes.push(index);
                  }
                });
                break;
              }
            }

            return indexes;
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
            var _this54 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              _this54.panel.metricList[metricIndex].colorList.forEach(function () {
                var layer = {};
                layer.valueList = [];
                metric.layerList.push(layer);
              });

              metric.data.forEach(function (point) {
                var value = point.value;
                metric.layerList.forEach(function (layer) {
                  layer.valueList.push(value > 0 ? value : 0);
                  value -= _this54.overviewModel.metricList[metricIndex].layerRange;
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
                  this.focusedFromDate = this.convertDateToString(metric.data[fromIndex].date * 1000);
                  this.focusedToDate = this.convertDateToString(metric.data[toIndex].date * 1000);
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
            this.timeFontSize = this.config.overview.timeFontSize;
            this.setOverviewContextTimeFont();
            var canvasStartX = this.getElementByID("canvasCell").offsetLeft;
            var fromDateWidth = this.overviewContext.measureText(this.focusedFromDate).width;
            this.fromDateLeftMargin = canvasStartX - fromDateWidth / 2;
            this.toDateLeftMargin = this.focusGraphWidth - fromDateWidth;
          }
        }, {
          key: "drawFocusGraphData",
          value: function drawFocusGraphData() {
            var _this55 = this;

            if (this.isGrouped) {
              this.$timeout(function () {
                if (_this55.groupingMode == _this55.enumList.groupingMode.SINGLE) {
                  _this55.focusGraphMarkerWidth = (_this55.config.focusGraph.markerSize + _this55.config.focusGraph.marginBetweenMarkers) * _this55.overviewModel.metricList.length;
                } else {
                  _this55.focusGraphMarkerWidth = _this55.config.focusGraph.markerSize + _this55.config.focusGraph.marginBetweenMarkers;
                }

                _this55.focusGraphMarkerHeight = _this55.config.focusGraph.markerSize;

                _this55.scope.$apply();

                _this55.drawGroupFocusMarkers();

                _this55.drawGroupedFocusGraph();
              });
            } else {
              this.drawUngroupedFocusGraph();
            }
          }
        }, {
          key: "drawGroupFocusMarkers",
          value: function drawGroupFocusMarkers() {
            var _this56 = this;

            this.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  _this56.drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex);
                }
              });
            });
          }
        }, {
          key: "drawGroupedFocusMarker",
          value: function drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex) {
            var _this57 = this;

            var canvas = this.getElementByID("focusGroupMarkerCanvas-" + groupIndex + "-" + instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (this.groupingMode == this.enumList.groupingMode.SINGLE && group.showDetails) {
              instance.groupWithMarkerList = [];
              instance.overviewInstance.groupList.forEach(function (instanceGroup, instanceGroupIndex) {
                if (instanceGroup.isSelected) {
                  instance.groupWithMarkerList.push(instanceGroup);
                  var x = (_this57.config.focusGraph.markerSize + _this57.config.focusGraph.marginBetweenMarkers) * instanceGroupIndex;

                  _this57.drawGroupedFocusMarkerWrapper(context, instanceGroup, x);
                }
              });
            } else {
              this.drawGroupedFocusMarkerWrapper(context, group.overviewGroup, 0);
            }
          }
        }, {
          key: "drawGroupedFocusMarkerWrapper",
          value: function drawGroupedFocusMarkerWrapper(context, group, x) {
            if (group == this.focusGroupWithInterval) {
              x += this.focusGroupWithInterval.focusMarkerX;
            }

            context.fillStyle = group.color;
            context.fillRect(x, 0, this.config.focusGraph.markerSize, this.config.focusGraph.markerSize);
          }
        }, {
          key: "drawGroupedFocusGraph",
          value: function drawGroupedFocusGraph() {
            var _this58 = this;

            this.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  _this58.drawGroupedFocusGraphWrapper(group, groupIndex, instance, instanceIndex);
                }
              });
            });
          }
        }, {
          key: "drawGroupedFocusGraphWrapper",
          value: function drawGroupedFocusGraphWrapper(group, groupIndex, instance, instanceIndex) {
            // full time range
            var canvas = this.getElementByID("focusGraphCanvas-" + groupIndex + "-" + instanceIndex);
            var maxMetricLength = this.getMaxMetricLength();
            this.drawGroupedFocusGraphInstance(canvas, instance, Array.from(Array(maxMetricLength).keys()), this.getFocusGraphPointWidth()); // selected time range

            if (group.overviewGroup.timeRangeIndexList) {
              var canvas = this.getElementByID("focusGraphHighlightedTimeRangeCanvas-" + groupIndex + "-" + instanceIndex);
              var pointWidth = Math.floor(this.focusGraphWidth / group.overviewGroup.timeRangeIndexList.length);
              this.drawGroupedFocusGraphInstance(canvas, instance, group.overviewGroup.timeRangeIndexList, pointWidth);
            }
          }
        }, {
          key: "drawGroupedFocusGraphInstance",
          value: function drawGroupedFocusGraphInstance(canvas, instance, valueIndexList, pointWidth) {
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);
            this.drawFocusGraphInstance(instance, context, valueIndexList, pointWidth);
          }
        }, {
          key: "drawFocusGraphInstance",
          value: function drawFocusGraphInstance(instance, context, valueIndexList, pointWidth) {
            var _this59 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              metric.layerList.forEach(function (layer, layerIndex) {
                // start drawing from bottom
                var y = (_this59.config.focusGraph.metricMaxHeight + _this59.config.focusGraph.marginBetweenMetrics) * metricIndex + _this59.config.focusGraph.metricMaxHeight;
                context.beginPath();
                context.moveTo(0, y);
                var x = 0;
                var previousX = 0;
                var previousValue = 0;
                valueIndexList.forEach(function (valueIndex, positionIndex) {
                  var value = layer.valueList[valueIndex];

                  if (value != undefined) {
                    x = pointWidth * positionIndex;

                    _this59.moveContextBasedOnValue(context, value, previousX, previousValue, layerIndex, x, y, _this59.overviewModel.metricList[metricIndex].layerRange);

                    previousX = x;
                    previousValue = value;
                  }
                });
                context.lineTo(x, y);
                context.lineTo(_this59.focusModel.graphBeginX, y);
                context.closePath();
                context.fillStyle = _this59.panel.metricList[metricIndex].colorList[layerIndex];
                context.fill();
              });
            });
          }
        }, {
          key: "drawUngroupedFocusGraph",
          value: function drawUngroupedFocusGraph() {
            var _this60 = this;

            this.focusModel.data.forEach(function (instance, instanceIndex) {
              var canvas = _this60.getElementByID("focusGraphCanvas-" + instanceIndex);

              var context = _this60.getCanvasContext(canvas);

              context.clearRect(0, 0, canvas.width, canvas.height);

              _this60.drawFocusGraphInstance(instance, context, Array.from(Array(_this60.getMaxMetricLength()).keys()));
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
            if (this.isGrouped) {
              if (this.overviewModel.hoveredGroup && this.overviewModel.hoveredGroup.isSelected) {
                var rowCount = 0;
                this.focusModel.groupList.forEach(function (group) {
                  if (group.showDetails) {
                    rowCount += group.instanceList.length;
                  } else {
                    ++rowCount;
                  }
                });
                this.focusGraphContainer.scrollTop = this.focusModel.focusRowHeight * rowCount;
              }
            } else {
              this.scrollByInstance();
            }
          }
        }, {
          key: "scrollByInstance",
          value: function scrollByInstance() {
            var instance = this.getHoveredInstance();

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
          key: "getHoveredInstance",
          value: function getHoveredInstance() {
            for (var i = 0; i < this.overviewModel.data.length; ++i) {
              var instance = this.overviewModel.data[i];

              if (this.isBetween(this.overviewModel.mousePosition.y, instance.y - this.config.overview.ungroupedPointHeight, instance.y)) {
                return instance;
              }
            }
          }
        }, {
          key: "moveMouseOnFocusGroup",
          value: function moveMouseOnFocusGroup(group, instance) {
            if (this.groupingMode == this.enumList.groupingMode.MULTIPLE || !group.showDetails) {
              this.focusModel.overviewGroupWithIntervalList = [group.overviewGroup];
              this.startOverviewMarkerInterval(group);
            } else {
              this.focusModel.overviewGroupWithIntervalList = instance.groupWithMarkerList;
              this.startOverviewMarkerInterval(group);
            }
          }
        }, {
          key: "startOverviewMarkerInterval",
          value: function startOverviewMarkerInterval(group) {
            if (this.overviewGroupWithInterval != group) {
              this.stopInterval();
              this.overviewGroupWithInterval = group;
              this.initialiseOverviewMarkerInterval();
            }
          }
        }, {
          key: "initialiseOverviewMarkerInterval",
          value: function initialiseOverviewMarkerInterval() {
            var _this61 = this;

            this.overviewMarkerMovingBackwards = false;
            this.overviewGroupWithInterval.overviewMarkerX = 0;
            this.currentOverviewMarkerInterval = this.$interval(function () {
              if (_this61.overviewMarkerMovingBackwards) {
                _this61.handleOverviewMarkerMovingBackwardCase();
              } else {
                _this61.handleOverviewMarkerMovingForwardCase();
              }

              if (_this61.focusModel.overviewGroupWithIntervalList) {
                _this61.focusModel.overviewGroupWithIntervalList.forEach(function (overviewGroup) {
                  overviewGroup.markerX = _this61.overviewGroupWithInterval.overviewMarkerX;
                });
              }

              _this61.drawSelectedGroupsMarkers();
            }, this.config.intervalTimer);
          }
        }, {
          key: "handleOverviewMarkerMovingBackwardCase",
          value: function handleOverviewMarkerMovingBackwardCase() {
            if (this.overviewGroupWithInterval.overviewMarkerX == 0) {
              this.overviewMarkerMovingBackwards = false;
              ++this.overviewGroupWithInterval.overviewMarkerX;
            } else {
              --this.overviewGroupWithInterval.overviewMarkerX;
            }
          }
        }, {
          key: "handleOverviewMarkerMovingForwardCase",
          value: function handleOverviewMarkerMovingForwardCase() {
            if (this.overviewGroupWithInterval.overviewMarkerX == Math.round(this.config.overview.marginBetweenMarkerAndGroup / 2)) {
              this.overviewMarkerMovingBackwards = true;
              --this.overviewGroupWithInterval.overviewMarkerX;
            } else {
              ++this.overviewGroupWithInterval.overviewMarkerX;
            }
          }
        }, {
          key: "showNodes",
          value: function showNodes(group, event) {
            var _this62 = this;

            event.preventDefault();
            this.$timeout(function () {
              group.showDetails = !group.showDetails;

              _this62.scope.$apply();

              _this62.drawFocusGraphData();
            });
          }
        }, {
          key: "selectNode",
          value: function selectNode(instance) {
            if (this.isGrouped) {
              this.focusModel.groupList.forEach(function (group) {
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
            var _this63 = this;

            this.variableSrv.variables.forEach(function (v) {
              if (v.name == "node") {
                _this63.variableSrv.setOptionAsCurrent(v, {
                  text: instance.instance,
                  value: instance.instance
                });

                _this63.isUpdatingVariable = true;

                _this63.variableSrv.variableUpdated(v, true);
              }
            });
          }
        }, {
          key: "removeMetric",
          value: function removeMetric(metric) {
            _.remove(this.panel.metricList, function (search) {
              return search == metric;
            });
          }
        }, {
          key: "addMetric",
          value: function addMetric() {
            var metric = {};
            metric.color = "#000000";
            this.panel.metricList.push(metric);
          }
        }]);

        return HeatmapCtrl;
      }(MetricsPanelCtrl));

      HeatmapCtrl.templateUrl = "module.html";
    }
  };
});
//# sourceMappingURL=heatmap_ctrl.js.map
