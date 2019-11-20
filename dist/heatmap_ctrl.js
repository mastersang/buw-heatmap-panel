"use strict";

System.register(["app/plugins/sdk", "./heatmap.css!", "moment", "lodash"], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, moment, _, HeatmapCtrl;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

  function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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
            this.initialiseHistogramConfig();
            this.initialiseTimeIndicatorConfig();
            this.initialiseHistogramConfig();
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
              decompressedMarginBetweenMetrics: 25,
              marginBetweenGroups: 10,
              groupBarWidth: 9,
              singleAttributeGroupSizeWidth: 1,
              multipleAttributeGroupSizeWidth: 2,
              marginBetweenMarkerAndGroup: 15,
              marginBetweenMetricAndGroupSize: 30
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
          key: "initialiseHistogramConfig",
          value: function initialiseHistogramConfig() {
            this.config.histogram = {
              marginBetweenAxesAndNumbers: 10,
              verticalAxisLength: 500,
              barWidth: 5,
              minimumBarHeight: 2,
              marginBetweenSliderAndChart: 50,
              thresholdBarLength: 10,
              maxOffsetToSelectBar: 20
            };
          }
        }, {
          key: "initialiseFocusGraphConfig",
          value: function initialiseFocusGraphConfig() {
            var _this$config$focusGra;

            this.config.focusGraph = (_this$config$focusGra = {
              maxWidth: 10000,
              maxHeight: 10000,
              groupedPointWidth: 8,
              ungroupedPointWidth: 35,
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
                unit: "%",
                query: "avg by (instance) (node_load1{job='node'}) * 100 / count by (instance) (count by (instance, cpu) (node_cpu_seconds_total{job='node'}))"
              }, {
                name: "Memory",
                unit: "%",
                query: "100 - (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'} - node_memory_MemFree_bytes{job='node'} - node_memory_Cached_bytes{job='node'}) * 100 / (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'})"
              }, {
                name: "Disk",
                unit: "%",
                query: "100 - (sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)', mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})) * 100 / (sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'}))"
              }, {
                name: "Network",
                unit: "MiB",
                query: "sum by (instance) (rate(node_network_receive_bytes_total{job='node',device!~'^(?: docker | vboxnet | veth | lo).*'}[5m])) / 1048576"
              }, {
                name: "Disk Temperature",
                unit: "°C",
                query: "avg by (instance) (smartmon_temperature_celsius_raw_value{job='node',smart_id='194'})"
              }]
            }; //   this.panel.predefinedMetricList = this.panelDefaults.predefinedMetricList;
            //   this.panel.metricList = this.panel.predefinedMetricList;

            _.defaults(this.panel, this.panelDefaults);

            if (!this.panel.metricList) {
              this.panel.metricList = this.panel.predefinedMetricList;
            }
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

            if (this.panel.metricList) {
              this.panel.metricList.forEach(function (metric) {
                // add lightest shade as defined by user
                metric.colorList = [];
                metric.colorList.push(metric.color);
                var luminanceChange = -_this3.config.maxLuminanceChange / _this3.config.colorCount; // add the other shades

                for (var i = 1; i < _this3.config.colorCount; ++i) {
                  var color = _this3.changeColorLuminance(metric.color, i * luminanceChange);

                  metric.colorList.push(color);
                }
              });
            }
          }
        }, {
          key: "initialiseStartingVariables",
          value: function initialiseStartingVariables() {
            this.firstLoad = true;
            this.overviewModel = {};
            this.histogramModel = {};
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
            this.timeHighlightMode = this.enumList.timeHighlightMode.POINT;
            this.initialiseOverviewCanvasCursor();
          }
        }, {
          key: "initialiseOverviewCanvasCursor",
          value: function initialiseOverviewCanvasCursor() {
            this.overviewCursor = this.isGrouped ? "default" : "crosshair";
          }
        }, {
          key: "initialiseUIElements",
          value: function initialiseUIElements() {
            // overview
            this.overviewCanvas = this.getElementByID("overviewCanvas");
            this.overviewContext = this.getCanvasContext(this.overviewCanvas); // focus area + overview group markers

            this.focusAreaCanvas = this.getElementByID("focusAreaCanvas");
            this.focusAreaContext = this.getCanvasContext(this.focusAreaCanvas); // histogram

            this.histogramCanvas = this.getElementByID("histogramCanvas");
            this.histogramCanvasContext = this.getCanvasContext(this.histogramCanvas); // overview time indicator

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
            this.load();
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

                  _this6.initialiseOverviewData();

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
                  value[1] = Math.round(parseFloat(value[1]));
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
              metric.layerRange = Math.round(metric.max / colorList.length); // map a range of values to a color

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
          key: "initialiseOverviewData",
          value: function initialiseOverviewData() {
            this.overviewModel.data = [];
            this.sortOverviewData();
            this.populateOverviewDataAndInitialiseHistogramData();
            this.calculateInstanceMetricTotalMinMax();
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
          key: "populateOverviewDataAndInitialiseHistogramData",
          value: function populateOverviewDataAndInitialiseHistogramData() {
            var _this9 = this;

            this.overviewModel.metricList.forEach(function (metric, metricIndex) {
              metric.histogram = {};
              metric.histogram.data = new Map();
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

                  if (metric.histogram.data.has(point.value)) {
                    var occurences = metric.histogram.data.get(point.value);
                    metric.histogram.data.set(point.value, occurences + 1);
                  } else {
                    metric.histogram.data.set(point.value, 1);
                  }
                });
              });
              metric.histogram.data = new Map(_toConsumableArray(metric.histogram.data).sort(function (first, second) {
                return first[0] - second[0];
              }));

              _this9.setHistogramMinMax(metric.histogram);
            });
          }
        }, {
          key: "setHistogramMinMax",
          value: function setHistogramMinMax(histogram) {
            histogram.min = -1;
            histogram.max = -1;
            histogram.data.forEach(function (occurences, value) {
              if (histogram.min == -1) {
                histogram.min = occurences;
                histogram.max = occurences;
              } else {
                if (histogram.min > occurences) {
                  histogram.min = occurences;
                }

                if (histogram.max < occurences) {
                  histogram.max = occurences;
                }
              }
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
            range.end = 0;
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

            if (this.isGrouped) {
              if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                marginBetweenMetrics = this.config.overview.decompressedMarginBetweenMetrics;
              } else {
                marginBetweenMetrics = this.config.overview.compressedMarginBetweenMetrics;
              }
            } else if (this.isCompressed) {
              marginBetweenMetrics = this.config.overview.compressedMarginBetweenMetrics;
            } else {
              marginBetweenMetrics = this.config.overview.decompressedMarginBetweenMetrics;
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

            var marginBetweenMetrics = this.getMarginBetweenMetrics();
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

              _this31.drawGroupSizeLabel((startX * 2 + maxGroupSizeBarLength - labelWidth) / 2);
            });
          }
        }, {
          key: "drawGroupSizeLabel",
          value: function drawGroupSizeLabel(x) {
            this.overviewContext.fillStyle = "black";
            this.overviewContext.fillText("Groups size", x, this.overviewModel.labelTextHeight);
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

            var startX = this.overviewModel.overviewWidth + this.config.overview.marginBetweenMetricAndGroupSize + labelWidth / 2;
            var maxEndX = 0;
            var groupList = this.getCurrentMultiAttributeGroupList();
            groupList.forEach(function (group, groupIndex) {
              var endX = _this32.drawGroupSizeWrapper(startX, group, groupIndex, _this32.config.overview.multipleAttributeGroupSizeWidth);

              if (endX > maxEndX) {
                maxEndX = endX;
              }
            });
            this.drawGroupSizeLabel((startX + maxEndX - labelWidth) / 2);
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

            for (var metricIndex = 0; metricIndex < this.overviewModel.metricList.length; ++metricIndex) {
              var metric = this.overviewModel.metricList[metricIndex];
              var label = this.panel.metricList[metricIndex].name;
              var width = this.overviewContext.measureText(label).width;
              this.overviewContext.fillStyle = this.getMetricDarkestColor(this.panel.metricList[metricIndex]);
              this.overviewContext.fillText(label, (metric.startX + metric.endX - width) / 2, this.overviewModel.labelTextHeight);
            }
          }
        }, {
          key: "getMetricDarkestColor",
          value: function getMetricDarkestColor(metric) {
            var colorList = metric.colorList;
            return colorList[colorList.length - 1];
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
          key: "closeHistogram",
          value: function closeHistogram() {
            this.showHistogram = false;

            if (this.changedColorThreshold) {
              this.changedColorThreshold = false;
              this.drawOverview();
              this.drawFocusGraph();
            }
          }
        }, {
          key: "moveMouseOnHistogram",
          value: function moveMouseOnHistogram(evt) {
            this.histogramModel.mousePosition = this.getMousePos(evt, this.histogramCanvas);

            if (this.histogramModel.isSelectingBar) {
              this.setNewThresholdValue();
            } else {
              this.checkAndSetSelectedHistogramThresholdBar();
            }
          }
        }, {
          key: "setNewThresholdValue",
          value: function setNewThresholdValue() {
            var _this35 = this;

            this.changedColorThreshold = true; // defines the max/min value from the next threshold that current threshold can be adjusted to

            var offsetValue = Math.round(this.config.histogram.maxOffsetToSelectBar / this.config.histogram.barWidth);
            var value = Math.round((this.histogramModel.mousePosition.x - this.histogramModel.horizontalAxisStartX) / this.config.histogram.barWidth);
            value = Math.max(value, 0 + offsetValue);
            value = Math.min(value, this.histogramModel.metric.max - offsetValue);
            this.histogramModel.metric.colorMap.forEach(function (color, threshold) {
              if (threshold != _this35.histogramModel.selectedBar.threshold) {
                if (value >= _this35.histogramModel.selectedBar.threshold.max) {
                  // move right
                  if (threshold.min == _this35.histogramModel.selectedBar.threshold.max) {
                    value = Math.min(value, threshold.max - offsetValue);
                    threshold.min = value;
                  }
                } else {
                  // move left
                  if (_this35.histogramModel.selectedBar.threshold.min == 0) {
                    // left most threshold
                    if (threshold.min == _this35.histogramModel.selectedBar.threshold.max) {
                      threshold.min = value;
                    }
                  } else {
                    // left threshold
                    if (threshold.max == _this35.histogramModel.selectedBar.threshold.min) {
                      value = Math.max(value, threshold.max + offsetValue);
                    } // right threshold


                    if (threshold.min == _this35.histogramModel.selectedBar.threshold.max) {
                      threshold.min = value;
                    }
                  }
                }
              }
            });
            this.histogramModel.selectedBar.threshold.max = value;
            this.drawHistogram();
          }
        }, {
          key: "checkAndSetSelectedHistogramThresholdBar",
          value: function checkAndSetSelectedHistogramThresholdBar() {
            this.histogramCursor = "default";
            this.histogramModel.selectedBar = null;
            var topY = this.histogramModel.sliderY - this.config.histogram.thresholdBarLength / 2;
            var bottomY = this.histogramModel.sliderY + this.config.histogram.thresholdBarLength / 2;

            if (this.isBetween(this.histogramModel.mousePosition.y, topY, bottomY)) {
              for (var i = 0; i < this.histogramModel.thresholdBarList.length; ++i) {
                var bar = this.histogramModel.thresholdBarList[i];
                var leftX = bar.x - this.config.histogram.maxOffsetToSelectBar;
                var rightX = bar.x + this.config.histogram.maxOffsetToSelectBar;

                if (this.isBetween(this.histogramModel.mousePosition.x, leftX, rightX)) {
                  this.histogramCursor = "pointer";
                  this.histogramModel.selectedBar = bar;
                  break;
                }
              }
            }
          }
        }, {
          key: "mouseDownOnHistogram",
          value: function mouseDownOnHistogram() {
            if (this.histogramModel.selectedBar) {
              this.histogramModel.isSelectingBar = true;
            }
          }
        }, {
          key: "mouseUpOnHistogram",
          value: function mouseUpOnHistogram() {
            this.histogramModel.isSelectingBar = false;
            this.histogramModel.selectedBar = null;
            this.histogramCursor = "default";
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
            var _this36 = this;

            this.overviewModel.metricList.forEach(function (metric) {
              if (metric.originalGroupList) {
                metric.thresholdGroupListMap.set(_this36.previousGroupThreshold, metric.originalGroupList);
                metric.originalGroupList = null;
              }

              var groupList = _this36.getCurrentSingleAttributeGroupList(metric);

              if (groupList) {
                groupList.forEach(function (group) {
                  group.isSelected = false;
                  group.timeRangeIndexList = null;
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
              group.timeRangeIndexList = null;
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
            var _this37 = this;

            this.overviewModel.metricList.forEach(function (metric) {
              var groupList = _this37.getCurrentSingleAttributeGroupList(metric);

              if (!metric.originalGroupList) {
                metric.originalGroupList = [];
                groupList.forEach(function (group) {
                  metric.originalGroupList.push(group);
                });
              }

              _this37.mergeSelectedGroupsWrapper(groupList);
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
            var _this38 = this;

            this.focusModel.groupList = [];

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this38.getCurrentSingleAttributeGroupList(metric);

                _this38.mergeFocusGroupListWrapper(groupList);
              });
            } else {
              this.mergeFocusGroupListWrapper(this.getCurrentMultiAttributeGroupList());
            }
          }
        }, {
          key: "mergeFocusGroupListWrapper",
          value: function mergeFocusGroupListWrapper(groupList) {
            var _this39 = this;

            groupList.forEach(function (group) {
              if (group.isSelected) {
                _this39.addGroupToFocus(group);
              }
            });
          }
        }, {
          key: "addGroupToFocus",
          value: function addGroupToFocus(group) {
            var _this40 = this;

            var focusGroup = {};
            focusGroup.instanceList = [];
            focusGroup.overviewGroup = group;
            group.instanceList.forEach(function (overviewInstance) {
              var metricWithMostData = _.maxBy(overviewInstance.metricList, function (metric) {
                return metric.data.length;
              });

              _this40.focusModel.focusedIndexList = Array.from(Array(metricWithMostData.data.length).keys());

              var focusInstance = _this40.getFocusInstance(overviewInstance, _this40.focusModel.focusedIndexList);

              focusGroup.instanceList.push(focusInstance);
            });
            this.focusModel.groupList.push(focusGroup);
          }
        }, {
          key: "mergeMultipleAttributeGroups",
          value: function mergeMultipleAttributeGroups() {
            var _this41 = this;

            var groupList = this.getCurrentMultiAttributeGroupList();

            if (!this.overviewModel.originalGroupList) {
              this.overviewModel.originalGroupList = [];
              groupList.forEach(function (group) {
                _this41.overviewModel.originalGroupList.push(group);
              });
            }

            this.mergeSelectedGroupsWrapper(groupList);
          }
        }, {
          key: "compressDecompress",
          value: function compressDecompress() {
            this.isCompressed = !this.isCompressed;
            this.changeGroupingSelection();
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
            if (this.isSelectingMetricLabel) {
              this.showHistogram = true;
              this.drawHistogram();
            } else if (this.isGrouped && this.overviewModel.hoveredGroup && this.timeHighlightMode == this.enumList.timeHighlightMode.RANGE) {
              this.overviewModel.isSelectingTimeRange = true;
              this.overviewModel.timeRangeStartOffset = this.overviewModel.mousePositionXOffset;
              this.overviewModel.timeRangeGroup = this.overviewModel.hoveredGroup;
            }
          }
        }, {
          key: "drawHistogram",
          value: function drawHistogram() {
            this.histogramCanvasContext.clearRect(0, 0, this.histogramCanvas.width, this.histogramCanvas.height);
            this.histogramModel.metric = this.overviewModel.metricList[this.overviewModel.selectedMetricIndex];
            this.drawHistogramAxes();
            this.drawHistogramMaxValueAndOccurence();
            this.drawHistogramBars();
            this.drawHistogramThresholdSlider();
          }
        }, {
          key: "drawHistogramAxes",
          value: function drawHistogramAxes() {
            this.histogramCanvasContext.font = this.config.overview.metricFontSize + "px Arial";
            this.histogramModel.verticalAxisStartY = this.overviewModel.labelTextHeight + this.config.histogram.marginBetweenAxesAndNumbers;
            this.histogramCanvasContext.lineWdith = 1;
            this.histogramCanvasContext.fillStyle = "black";
            this.histogramCanvasContext.strokeStyle = "gray";
            this.histogramCanvasContext.font = "bold " + this.config.overview.metricFontSize + "px Arial";
            this.drawHistogramVerticalAxis();
            this.drawHistogramHorizontalAxis();
          }
        }, {
          key: "drawHistogramVerticalAxis",
          value: function drawHistogramVerticalAxis() {
            var occurences = "occurences";
            var maxOccurenceWidth = this.histogramCanvasContext.measureText(this.histogramModel.metric.histogram.max).width;
            var verticalLabelWidth = this.histogramCanvasContext.measureText(occurences).width;
            this.histogramModel.horizontalAxisStartX = maxOccurenceWidth + this.config.histogram.marginBetweenAxesAndNumbers + verticalLabelWidth / 2;
            this.histogramCanvasContext.fillText(occurences, this.histogramModel.horizontalAxisStartX - verticalLabelWidth / 2, this.overviewModel.labelTextHeight);
            this.histogramModel.horizontalAxisY = this.histogramModel.verticalAxisStartY + this.config.histogram.verticalAxisLength;
            this.histogramCanvasContext.beginPath();
            this.histogramCanvasContext.moveTo(this.histogramModel.horizontalAxisStartX, this.histogramModel.verticalAxisStartY);
            this.histogramCanvasContext.lineTo(this.histogramModel.horizontalAxisStartX, this.histogramModel.horizontalAxisY);
            this.histogramCanvasContext.stroke();
            this.histogramCanvasContext.closePath();
          }
        }, {
          key: "drawHistogramHorizontalAxis",
          value: function drawHistogramHorizontalAxis() {
            this.histogramModel.horizontalAxisEndX = this.histogramModel.horizontalAxisStartX + this.config.histogram.barWidth * (this.histogramModel.metric.max + 1);
            var labelX = this.histogramModel.horizontalAxisEndX + this.config.histogram.marginBetweenAxesAndNumbers;
            var labelY = this.histogramModel.horizontalAxisY + this.overviewModel.labelTextHeight / 2;
            var panelMetric = this.panel.metricList[this.overviewModel.selectedMetricIndex];
            this.histogramCanvasContext.fillText(panelMetric.unit, labelX, labelY);
            this.histogramCanvasContext.beginPath();
            this.histogramCanvasContext.moveTo(this.histogramModel.horizontalAxisStartX, this.histogramModel.horizontalAxisY);
            this.histogramCanvasContext.lineTo(this.histogramModel.horizontalAxisEndX, this.histogramModel.horizontalAxisY);
            this.histogramCanvasContext.stroke();
            this.histogramCanvasContext.closePath();
          }
        }, {
          key: "drawHistogramMaxValueAndOccurence",
          value: function drawHistogramMaxValueAndOccurence() {
            this.histogramCanvasContext.font = this.config.overview.metricFontSize + "px Arial";
            var occurenceLabelY = this.histogramModel.verticalAxisStartY + this.overviewModel.labelTextHeight / 2;
            this.histogramCanvasContext.fillText(this.histogramModel.metric.histogram.max, 0, occurenceLabelY);
            var maxValueWidth = this.histogramCanvasContext.measureText(this.histogramModel.metric.max).width;
            var valueLabelY = this.histogramModel.horizontalAxisY + this.config.histogram.marginBetweenAxesAndNumbers + this.overviewModel.labelTextHeight;
            this.histogramCanvasContext.fillText(this.histogramModel.metric.max, this.histogramModel.horizontalAxisEndX - maxValueWidth / 2, valueLabelY);
            var originX = this.histogramModel.horizontalAxisStartX - this.overviewModel.labelTextHeight - this.config.histogram.marginBetweenAxesAndNumbers;
            this.histogramCanvasContext.fillText(0, originX, valueLabelY);
          }
        }, {
          key: "drawHistogramBars",
          value: function drawHistogramBars() {
            var _this42 = this;

            var occurenceStep = this.config.histogram.verticalAxisLength / this.histogramModel.metric.histogram.max;
            this.histogramModel.metric.histogram.data.forEach(function (occurences, value) {
              _this42.histogramCanvasContext.fillStyle = _this42.getColorFromMap(value, _this42.histogramModel.metric.colorMap);
              var x = _this42.histogramModel.horizontalAxisStartX + _this42.config.histogram.barWidth * value;
              var y = _this42.histogramModel.horizontalAxisY - occurenceStep * occurences;
              var height = _this42.histogramModel.horizontalAxisY - y;
              var minHeight = _this42.config.histogram.minimumBarHeight;

              if (height < minHeight) {
                y = _this42.histogramModel.horizontalAxisY - minHeight;
                height = minHeight;
              }

              _this42.histogramCanvasContext.fillRect(x, y, _this42.config.histogram.barWidth, height);
            });
          }
        }, {
          key: "drawHistogramThresholdSlider",
          value: function drawHistogramThresholdSlider() {
            this.histogramCanvasContext.strokeStyle = "black";
            this.drawHistogramSliderLine();
            this.drawHistogramThresholdBars();
          }
        }, {
          key: "drawHistogramSliderLine",
          value: function drawHistogramSliderLine() {
            this.histogramModel.sliderY = this.histogramModel.horizontalAxisY + this.config.histogram.marginBetweenSliderAndChart;
            this.histogramCanvasContext.beginPath();
            this.histogramCanvasContext.moveTo(this.histogramModel.horizontalAxisStartX, this.histogramModel.sliderY);
            this.histogramCanvasContext.lineTo(this.histogramModel.horizontalAxisEndX, this.histogramModel.sliderY);
            this.histogramCanvasContext.stroke();
            this.histogramCanvasContext.closePath();
          }
        }, {
          key: "drawHistogramThresholdBars",
          value: function drawHistogramThresholdBars() {
            var _this43 = this;

            var thresholdBarY = this.histogramModel.sliderY - this.config.histogram.thresholdBarLength / 2;
            this.histogramModel.thresholdBarList = [];
            var i = 0;
            this.histogramModel.metric.colorMap.forEach(function (color, threshold) {
              var bar = {};
              bar.threshold = threshold;
              bar.x = _this43.histogramModel.horizontalAxisStartX + _this43.config.histogram.barWidth * threshold.max; // no need to draw slider bar for last threshold

              if (i < _this43.histogramModel.metric.colorMap.size - 1) {
                _this43.histogramCanvasContext.beginPath();

                _this43.histogramCanvasContext.moveTo(bar.x, thresholdBarY);

                _this43.histogramCanvasContext.lineTo(bar.x, thresholdBarY + _this43.config.histogram.thresholdBarLength);

                _this43.histogramCanvasContext.stroke();

                _this43.histogramCanvasContext.closePath();

                ++i;
              }

              _this43.histogramModel.thresholdBarList.push(bar);
            });
          }
        }, {
          key: "moveMouseOnOverview",
          value: function moveMouseOnOverview(evt) {
            if (this.overviewModel.metricList) {
              this.setOverviewMousePosition(evt);
              this.setSelectedMetricIndex();

              if (this.overviewModel.selectedMetricIndex >= 0) {
                if (this.isBetween(this.overviewModel.mousePosition.y, 0, this.overviewModel.overviewStartY)) {
                  this.isSelectingMetricLabel = true;
                  this.setOverviewCursorToPointer();
                } else {
                  this.deselectMetricLabel();
                }
              } else {
                this.deselectMetricLabel();
              }

              if (this.isGrouped) {
                this.handleMouseMoveOnGroupedOverview();
              } else if (!this.isCompressed && !this.focusAreaIsFixed) {
                this.drawFocus(evt);
              }
            } else {
              this.deselectMetricLabel();
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
          key: "setSelectedMetricIndex",
          value: function setSelectedMetricIndex() {
            this.overviewModel.selectedMetricIndex = -1;

            for (var metricIndex = 0; metricIndex < this.overviewModel.metricList.length; ++metricIndex) {
              var metric = this.overviewModel.metricList[metricIndex];

              if (metric) {
                // only check if mouse is on a metric graph
                if (this.checkMouseIsInMetric(metric)) {
                  this.overviewModel.selectedMetricIndex = metricIndex;
                  this.overviewModel.mousePositionXOffset = this.overviewModel.mousePosition.x - metric.startX;
                  break;
                }
              }
            }
          }
        }, {
          key: "checkMouseIsInMetric",
          value: function checkMouseIsInMetric(metric) {
            return this.isBetween(this.overviewModel.mousePosition.x, metric.startX, metric.endX);
          }
        }, {
          key: "setOverviewCursorToPointer",
          value: function setOverviewCursorToPointer() {
            this.overviewCursor = "pointer";
          }
        }, {
          key: "deselectMetricLabel",
          value: function deselectMetricLabel() {
            this.isSelectingMetricLabel = false;
            this.initialiseOverviewCanvasCursor();
          }
        }, {
          key: "handleMouseMoveOnGroupedOverview",
          value: function handleMouseMoveOnGroupedOverview() {
            this.overviewModel.hoveredGroup = null;
            this.overviewModel.hoveredMarker = null;
            this.checkAndSetSelectedOverviewMarker();
            this.checkAndSetHoveredGroup();

            if (this.timeHighlightMode == this.enumList.timeHighlightMode.POINT) {
              if (this.overviewModel.hoveredGroup) {
                if (this.isCompressed && this.groupingMode == this.enumList.groupingMode.MULTIPLE) {
                  this.setSelectedTimeIndex();
                }

                this.drawTimeIndicators();
              } else {
                this.clearTimeIndicator();
              }
            } else if (this.overviewModel.isSelectingTimeRange) {
              this.initialiseSelectedGroupTimeRangeIndexList();
              this.drawSelectedTimeRanges();
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
          key: "checkAndSetHoveredGroup",
          value: function checkAndSetHoveredGroup() {
            var groupList;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              var metric = this.overviewModel.metricList[this.overviewModel.selectedMetricIndex];
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
              this.setOverviewCursorToPointer();
              return true;
            }
          }
        }, {
          key: "setSelectedTimeIndex",
          value: function setSelectedTimeIndex() {
            var overviewMetric = this.overviewModel.metricList[this.overviewModel.selectedMetricIndex];
            var groupList = this.getCurrentMultiAttributeGroupList();

            for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
              var instanceMetric = groupList[groupIndex].instanceList[0].metricList[this.overviewModel.selectedMetricIndex];

              for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                var pointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];
                var point = instanceMetric.data[pointIndex];

                if (point) {
                  if (this.checkDataPointIsSelected(point)) {
                    this.overviewModel.selectedTimeIndex = pointIndex;
                    return;
                  }
                }
              }
            }
          }
        }, {
          key: "checkDataPointIsSelected",
          value: function checkDataPointIsSelected(point) {
            return this.isBetween(this.overviewModel.mousePosition.x, point.x, point.x + this.config.overview.pointWidth);
          }
        }, {
          key: "drawTimeIndicators",
          value: function drawTimeIndicators() {
            var _this44 = this;

            this.clearTimeIndicator();
            this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.drawTimeIndicatorWrapper(this.overviewModel.metricList[this.overviewModel.selectedMetricIndex]);
            } else {
              this.overviewModel.metricList.forEach(function (metric, metricIndex) {
                _this44.drawTimeIndicatorWrapper(metric, metricIndex);
              });
            }

            this.drawSelectedTimeLabel();
          }
        }, {
          key: "drawTimeIndicatorWrapper",
          value: function drawTimeIndicatorWrapper(overviewMetric, metricIndex) {
            var horizontalLineY = this.drawHorizontalTimeLine(overviewMetric, this.overviewModel.hoveredGroup);
            var verticalLineX;

            if (this.isCompressed && this.groupingMode == this.enumList.groupingMode.MULTIPLE && metricIndex != null && metricIndex != this.overviewModel.selectedMetricIndex) {
              verticalLineX = this.getTimeIndicatorXForNonSelectedMetric(overviewMetric, metricIndex);
            } else {
              verticalLineX = overviewMetric.startX + this.overviewModel.mousePositionXOffset;
            }

            this.drawSelectedTimePoint(overviewMetric, horizontalLineY, verticalLineX);
          }
        }, {
          key: "getTimeIndicatorXForNonSelectedMetric",
          value: function getTimeIndicatorXForNonSelectedMetric(overviewMetric, metricIndex) {
            var previousPointIndex = 0;

            for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
              var currentPointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];

              if (this.isBetween(this.overviewModel.selectedTimeIndex, previousPointIndex, currentPointIndex)) {
                var groupList = this.getCurrentMultiAttributeGroupList();

                for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
                  var instanceMetric = groupList[groupIndex].instanceList[0].metricList[metricIndex];
                  var point = instanceMetric.data[overviewMetric.compressedTimeIndexList[compressedTimeIndex]];

                  if (point) {
                    return point.x;
                  }
                }
              }

              previousPointIndex = currentPointIndex;
            }
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
          value: function drawSelectedTimePoint(metric, horizontalLineY, verticalLineX) {
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
              var overviewMetric = this.overviewModel.metricList[metricIndex]; // some groups are empty -> need to iterate through group list until find one that isn't

              var groupList = this.getCurrentSingleAttributeGroupList(overviewMetric);

              for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
                var instanceMetric = groupList[groupIndex].instanceList[0].metricList[metricIndex];

                if (this.isCompressed) {
                  for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                    var point = instanceMetric.data[overviewMetric.compressedTimeIndexList[compressedTimeIndex]];

                    if (point) {
                      if (this.checkDataPointIsSelectedAndDrawTimeLabel(point)) {
                        return;
                      }
                    }
                  }
                } else {
                  for (var pointIndex = 0; pointIndex < instanceMetric.data.length; ++pointIndex) {
                    var point = instanceMetric.data[pointIndex];

                    if (this.checkDataPointIsSelectedAndDrawTimeLabel(point)) {
                      return;
                    }
                  }
                }
              }
            }
          }
        }, {
          key: "checkDataPointIsSelectedAndDrawTimeLabel",
          value: function checkDataPointIsSelectedAndDrawTimeLabel(point) {
            if (this.checkDataPointIsSelected(point)) {
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
            var _this45 = this;

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
              if (_this45.isBetween(point.x, startX, endX)) {
                _this45.overviewModel.timeRangeGroup.timeRangeIndexList.push(pointIndex);
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
            var _this46 = this;

            this.clearTimeIndicator();
            this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;
            this.overviewTimeIndicatorContext.fillStyle = this.config.timeIndicator.color;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this46.getCurrentSingleAttributeGroupList(metric);

                groupList.forEach(function (group) {
                  _this46.drawSelectedTimeRangeWrapper(group, [group.timeRangeMetricIndex]);
                });
              });
            } else {
              var groupList = this.getCurrentMultiAttributeGroupList();
              groupList.forEach(function (group) {
                _this46.drawSelectedTimeRangeWrapper(group, Array.from(Array(_this46.overviewModel.metricList.length).keys()));
              });
            }
          }
        }, {
          key: "drawSelectedTimeRangeWrapper",
          value: function drawSelectedTimeRangeWrapper(group, metricIndexList) {
            var _this47 = this;

            if (group.timeRangeIndexList && group.timeRangeIndexList.length > 0) {
              metricIndexList.forEach(function (metricIndex) {
                var instanceMetric = group.instanceList[0].metricList[metricIndex];
                var overviewMetric = _this47.overviewModel.metricList[metricIndex];
                var startPoint, endPoint;
                var startRangeIndex = group.timeRangeIndexList[0];
                var endRangeIndex = group.timeRangeIndexList[group.timeRangeIndexList.length - 1];

                if (_this47.isCompressed && metricIndex != group.timeRangeMetricIndex) {
                  var previousPointIndex = 0;

                  var groupList = _this47.getCurrentMultiAttributeGroupList();

                  for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                    var currentPointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];

                    if (_this47.isBetween(startRangeIndex, previousPointIndex, currentPointIndex)) {
                      startPoint = _this47.getTimeRangePointWrapper(previousPointIndex, groupList, metricIndex);
                    }

                    if (_this47.isBetween(endRangeIndex, previousPointIndex, currentPointIndex)) {
                      endPoint = _this47.getTimeRangePointWrapper(currentPointIndex, groupList, metricIndex);
                    }

                    previousPointIndex = currentPointIndex;
                  }
                } else {
                  startPoint = instanceMetric.data[startRangeIndex];
                  endPoint = instanceMetric.data[endRangeIndex];
                }

                if (startPoint) {
                  _this47.drawSelectedTimeRangeLines(overviewMetric, group, startPoint, endPoint);
                }
              });
            }
          }
        }, {
          key: "getTimeRangePointWrapper",
          value: function getTimeRangePointWrapper(pointIndex, groupList, metricIndex) {
            for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
              var instance = groupList[groupIndex].instanceList[0];
              var point = instance.metricList[metricIndex].data[pointIndex];

              if (point) {
                return point;
              }
            }
          }
        }, {
          key: "drawSelectedTimeRangeLines",
          value: function drawSelectedTimeRangeLines(overviewMetric, group, startPoint, endPoint) {
            var startY = this.drawHorizontalTimeLine(overviewMetric, group);
            var startX = startPoint.x;
            var endX = endPoint.x + this.config.overview.pointWidth;
            var width = endX - startX;
            var height = group.y - startY;
            this.overviewTimeIndicatorContext.fillRect(startX, startY, width, height);
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
            var _this48 = this;

            this.$timeout(function () {
              var updatedSelectedGroups = false;

              if (_this48.timeHighlightMode == _this48.enumList.timeHighlightMode.POINT) {
                if (_this48.overviewModel.hoveredGroup) {
                  _this48.addOrRemoveGroupToFocus(_this48.overviewModel.hoveredGroup, true);

                  updatedSelectedGroups = true;
                } else {
                  _this48.stopInterval();
                }
              } else if (_this48.overviewModel.isSelectingTimeRange) {
                var removeExisting = _this48.overviewModel.timeRangeStartOffset == _this48.overviewModel.mousePositionXOffset;

                _this48.addOrRemoveGroupToFocus(_this48.overviewModel.timeRangeGroup, removeExisting);

                updatedSelectedGroups = true;
              }

              _this48.scope.$apply();

              if (updatedSelectedGroups) {
                _this48.drawSelectedGroupsMarkers();

                _this48.drawFocusGraph();
              }

              _this48.overviewModel.isSelectingTimeRange = false;
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
            var _this49 = this;

            this.showMergeSelectedGroups = false;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this49.getCurrentSingleAttributeGroupList(metric);

                _this49.setShowMergeGroupsButtonWrapper(groupList);
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
            var _this50 = this;

            this.$timeout(function () {
              _this50.clearFocusArea();

              _this50.overviewModel.groupMarkerList = [];

              if (_this50.groupingMode == _this50.enumList.groupingMode.SINGLE) {
                _this50.overviewModel.metricList.forEach(function (metric) {
                  var groupList = _this50.getCurrentSingleAttributeGroupList(metric);

                  groupList.forEach(function (group) {
                    _this50.drawOverviewGroupMarker(group, [metric]);
                  });
                });
              } else {
                var groupList = _this50.getCurrentMultiAttributeGroupList();

                groupList.forEach(function (group) {
                  _this50.drawOverviewGroupMarker(group, _this50.overviewModel.metricList);
                });
              }
            });
          }
        }, {
          key: "drawOverviewGroupMarker",
          value: function drawOverviewGroupMarker(group, metricList) {
            var _this51 = this;

            if (group.isSelected) {
              metricList.forEach(function (metric) {
                var marker = {};
                marker.group = group;
                marker.startX = metric.startX - _this51.config.overview.marginBetweenMarkerAndGroup + group.markerX;
                marker.endX = marker.startX + _this51.config.overview.groupedPointHeight;
                marker.startY = group.y;
                marker.endY = marker.startY + _this51.config.overview.groupedPointHeight;
                _this51.focusAreaContext.fillStyle = group.color;

                _this51.focusAreaContext.fillRect(marker.startX, marker.startY, _this51.config.overview.groupedPointHeight, _this51.config.overview.groupedPointHeight);

                _this51.overviewModel.groupMarkerList.push(marker);
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
            var _this52 = this;

            this.focusMarkerMovingBackwards = false;
            this.focusGroupWithInterval.focusMarkerX = 0;
            this.currentFocusMarkerInterval = this.$interval(function () {
              if (_this52.focusMarkerMovingBackwards) {
                _this52.handleFocusMarkerMovingBackwardCase();
              } else {
                _this52.handleFocusMarkerMovingForwardCase();
              }

              _this52.drawGroupFocusMarkers();
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
              var metric = this.overviewModel.metricList[i];

              if (metric) {
                // only update focus graph if mouse is pointing on one of metric overview graphs
                if (this.checkMouseIsInMetric(metric)) {
                  this.drawFocusGraph();
                  break;
                }
              }
            }
          }
        }, {
          key: "drawFocusArea",
          value: function drawFocusArea() {
            var _this53 = this;

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

                  _this53.focusAreaContext.strokeRect(metric.focusStartX, _this53.focusModel.focusStartY, size, size);
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

              if (metric) {
                if (this.checkMouseIsInMetric(metric)) {
                  this.overviewModel.mousePositionXOffset = this.overviewModel.mousePosition.x - metric.startX;
                  this.focusModel.sourceMetricIndex = i;
                  return Math.min(Math.max(metric.startX, this.overviewModel.mousePosition.x - this.config.focusArea.focusAreaSize), metric.endX - this.getFocusAreaSize()) - metric.startX;
                }
              }
            }
          }
        }, {
          key: "drawFocusGraph",
          value: function drawFocusGraph() {
            var _this54 = this;

            if (!this.isGrouped) {
              this.initialiseFocusGraphData();
            }

            if (this.isGrouped && this.focusModel.groupList.length > 0 || !this.isGrouped && this.focusModel.data.length > 0) {
              this.showFocus = true;
              this.$timeout(function () {
                _this54.focusGraphHeight = _this54.overviewModel.metricList.length * _this54.config.focusGraph.metricMaxHeight + (_this54.overviewModel.metricList.length - 1) * _this54.config.focusGraph.marginBetweenMetrics;
                _this54.focusGraphWidth = (_this54.focusModel.focusedIndexList.length - 1) * _this54.getFocusGraphPointWidth();

                _this54.scope.$apply();

                var focusGraphRow = _this54.getElementByID("focusGraphRow");

                if (focusGraphRow) {
                  _this54.focusModel.focusRowHeight = focusGraphRow.offsetHeight;

                  _this54.setFocusFromAndToDate();

                  _this54.positionFocusFromAndToDate();

                  _this54.drawFocusGraphData();

                  _this54.autoSrollFocusGraph();
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
            var _this55 = this;

            if (!this.focusModel.data) {
              this.focusModel.data = [];
            }

            this.focusModel.data.length = 0;
            this.overviewModel.data.forEach(function (overviewInstance) {
              if (_this55.checkInstanceInFocus(overviewInstance)) {
                _this55.focusModel.focusedIndexList = _this55.getIndexesOfPointsInFocus(overviewInstance);

                var focusInstance = _this55.getFocusInstance(overviewInstance, _this55.focusModel.focusedIndexList);

                _this55.focusModel.data.push(focusInstance);
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
            var _this56 = this;

            var indexes = [];

            for (var i = 0; i < overviewInstance.metricList.length; ++i) {
              var metric = overviewInstance.metricList[i];

              if (metric.data.length > 0) {
                var overviewMetric = this.overviewModel.metricList[i];
                metric.data.forEach(function (point, index) {
                  if (_this56.isBetween(point.x, overviewMetric.focusStartX, overviewMetric.focusStartX + _this56.getFocusAreaSize())) {
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
            var _this57 = this;

            instance.metricList.forEach(function (instanceMetric, metricIndex) {
              for (var i = 0; i < _this57.config.colorCount; ++i) {
                var layer = {};
                layer.valueList = [];
                instanceMetric.layerList.push(layer);
              }

              var overviewMetric = _this57.overviewModel.metricList[metricIndex];
              instanceMetric.data.forEach(function (point) {
                var value = point.value;
                var colorList = _this57.panel.metricList[metricIndex].colorList;
                instanceMetric.layerList.forEach(function (layer, layerIndex) {
                  overviewMetric.colorMap.forEach(function (color, threshold) {
                    if (color == colorList[layerIndex]) {
                      layer.valueList.push(value > 0 ? value : 0);
                      value -= threshold.max;
                      layer.range = threshold.max - threshold.min;
                    }
                  });
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
            var _this58 = this;

            if (this.isGrouped) {
              this.$timeout(function () {
                if (_this58.groupingMode == _this58.enumList.groupingMode.SINGLE) {
                  _this58.focusGraphMarkerWidth = (_this58.config.focusGraph.markerSize + _this58.config.focusGraph.marginBetweenMarkers) * _this58.overviewModel.metricList.length;
                } else {
                  _this58.focusGraphMarkerWidth = _this58.config.focusGraph.markerSize + _this58.config.focusGraph.marginBetweenMarkers;
                }

                _this58.focusGraphMarkerHeight = _this58.config.focusGraph.markerSize;

                _this58.scope.$apply();

                _this58.drawGroupFocusMarkers();

                _this58.drawGroupedFocusGraph();
              });
            } else {
              this.drawUngroupedFocusGraph();
            }
          }
        }, {
          key: "drawGroupFocusMarkers",
          value: function drawGroupFocusMarkers() {
            var _this59 = this;

            this.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  _this59.drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex);
                }
              });
            });
          }
        }, {
          key: "drawGroupedFocusMarker",
          value: function drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex) {
            var _this60 = this;

            var canvas = this.getElementByID("focusGroupMarkerCanvas-" + groupIndex + "-" + instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (this.groupingMode == this.enumList.groupingMode.SINGLE && group.showDetails) {
              instance.groupWithMarkerList = [];
              instance.overviewInstance.groupList.forEach(function (instanceGroup, instanceGroupIndex) {
                if (instanceGroup.isSelected) {
                  instance.groupWithMarkerList.push(instanceGroup);
                  var x = (_this60.config.focusGraph.markerSize + _this60.config.focusGraph.marginBetweenMarkers) * instanceGroupIndex;

                  _this60.drawGroupedFocusMarkerWrapper(context, instanceGroup, x);
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
            var _this61 = this;

            this.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  _this61.drawGroupedFocusGraphWrapper(group, groupIndex, instance, instanceIndex);
                }
              });
            });
          }
        }, {
          key: "drawGroupedFocusGraphWrapper",
          value: function drawGroupedFocusGraphWrapper(group, groupIndex, instance, instanceIndex) {
            // full time range
            var maxMetricLength = this.getMaxMetricLength();
            var canvas = this.getGroupedFocusCanvas(groupIndex, instanceIndex);
            this.drawGroupedFocusGraphInstance(canvas, instance, Array.from(Array(maxMetricLength).keys()), this.getFocusGraphPointWidth()); // selected time range

            if (group.overviewGroup.timeRangeIndexList) {
              var canvas = this.getElementByID("focusGraphHighlightedTimeRangeCanvas-" + groupIndex + "-" + instanceIndex);
              var pointWidth = Math.floor(this.focusGraphWidth / group.overviewGroup.timeRangeIndexList.length);
              this.drawGroupedFocusGraphInstance(canvas, instance, group.overviewGroup.timeRangeIndexList, pointWidth);
            }
          }
        }, {
          key: "getGroupedFocusCanvas",
          value: function getGroupedFocusCanvas(groupIndex, instanceIndex) {
            return this.getElementByID("focusGraphCanvas-" + groupIndex + "-" + instanceIndex);
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
            var _this62 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              metric.layerList.forEach(function (layer, layerIndex) {
                // start drawing from bottom
                var y = (_this62.config.focusGraph.metricMaxHeight + _this62.config.focusGraph.marginBetweenMetrics) * metricIndex + _this62.config.focusGraph.metricMaxHeight;
                context.beginPath();
                context.moveTo(0, y);
                var x = 0;
                var previousX = 0;
                var previousValue = 0;
                valueIndexList.forEach(function (valueIndex, positionIndex) {
                  var value = layer.valueList[valueIndex];

                  if (value != null) {
                    x = pointWidth * positionIndex;

                    _this62.moveFocusGraphContextBasedOnValue(context, value, previousX, previousValue, layer, layerIndex, x, y);

                    previousX = x;
                    previousValue = value;
                  }
                });
                context.lineTo(x, y);
                context.lineTo(_this62.focusModel.graphBeginX, y);
                context.closePath();
                context.fillStyle = _this62.panel.metricList[metricIndex].colorList[layerIndex];
                context.fill();
              });
            });
          }
        }, {
          key: "drawUngroupedFocusGraph",
          value: function drawUngroupedFocusGraph() {
            var _this63 = this;

            this.focusModel.data.forEach(function (instance, instanceIndex) {
              var canvas = _this63.getUngroupedFocusCanvas(instanceIndex);

              var context = _this63.getCanvasContext(canvas);

              context.clearRect(0, 0, canvas.width, canvas.height);

              _this63.drawFocusGraphInstance(instance, context, Array.from(Array(_this63.getMaxMetricLength()).keys()), _this63.config.focusGraph.ungroupedPointWidth);
            });
          }
        }, {
          key: "getUngroupedFocusCanvas",
          value: function getUngroupedFocusCanvas(instanceIndex) {
            return this.getElementByID("focusGraphCanvas-" + instanceIndex);
          }
        }, {
          key: "moveFocusGraphContextBasedOnValue",
          value: function moveFocusGraphContextBasedOnValue(context, value, previousX, previousValue, layer, layerIndex, x, y) {
            if (value == 0) {
              // draw line straight down to base if value is 0
              context.lineTo(previousX, y);
            } else {
              // move to current position at base if previous value is 0
              if (layerIndex > 0 && previousValue == 0) {
                context.lineTo(x, y);
              }

              if (value >= layer.range) {
                context.lineTo(x, y - this.config.focusGraph.metricMaxHeight);
              } else {
                context.lineTo(x, y - value * this.config.focusGraph.metricMaxHeight / layer.range);
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
            var _this64 = this;

            this.overviewMarkerMovingBackwards = false;
            this.overviewGroupWithInterval.overviewMarkerX = 0;
            this.currentOverviewMarkerInterval = this.$interval(function () {
              if (_this64.overviewMarkerMovingBackwards) {
                _this64.handleOverviewMarkerMovingBackwardCase();
              } else {
                _this64.handleOverviewMarkerMovingForwardCase();
              }

              if (_this64.focusModel.overviewGroupWithIntervalList) {
                _this64.focusModel.overviewGroupWithIntervalList.forEach(function (overviewGroup) {
                  overviewGroup.markerX = _this64.overviewGroupWithInterval.overviewMarkerX;
                });
              }

              _this64.drawSelectedGroupsMarkers();
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
            var _this65 = this;

            event.preventDefault();
            this.$timeout(function () {
              group.showDetails = !group.showDetails;

              _this65.scope.$apply();

              _this65.drawFocusGraphData();
            });
          }
        }, {
          key: "selectGroup",
          value: function selectGroup(instance, evt, groupIndex, instanceIndex) {
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
            var canvas = this.getGroupedFocusCanvas(groupIndex, instanceIndex);
            this.showPopup(instance, evt, groupIndex, instanceIndex, canvas);
          }
        }, {
          key: "showPopup",
          value: function showPopup(instance, evt, canvas) {
            var mousePos = this.getMousePos(evt, canvas);
            var metricHeight = this.config.focusGraph.metricMaxHeight + this.config.focusGraph.marginBetweenMetrics;

            for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
              if (this.isBetween(mousePos.y, i * metricHeight, (i + 1) * metricHeight)) {
                var metric = this.panel.metricList[i];

                if (metric.popupURL && metric.popupURL != "") {
                  window.open(metric.popupURL + "?orgId=1&var-node=" + instance.instance, instance.instance, "top=300, left=300, width=600, height=500");
                }

                break;
              }
            }
          }
        }, {
          key: "selectNode",
          value: function selectNode(index, evt) {
            var instance = this.focusModel.data[index];
            instance.isSelected = true;
            var canvas = this.getUngroupedFocusCanvas(index);
            this.showPopup(instance, evt, canvas);
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
