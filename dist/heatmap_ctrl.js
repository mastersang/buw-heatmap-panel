"use strict";

System.register(["app/plugins/sdk", "./heatmap.css!", "moment", "lodash"], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, moment, _, HeatmapCtrl;

  function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

  function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

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
          _this.scope = $scope;
          _this.$timeout = $timeout;
          _this.$interval = $interval;
          _this.variableSrv = variableSrv;
          _this.timeSrv = timeSrv;

          _this.initialiseConfig();

          _this.initialisePanelDefaults();

          _this.initialisePredefinedMetricOptionList();

          _this.initialiseMetricsColorList();

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
              dateFormat: "DD.MM HH:mm",
              colorCount: 4,
              maxLuminanceChange: 0.8,
              marginBetweenOverviewAndFocus: 20,
              groupingThresholdCount: 100,
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
              timeFontSize: 9,
              marginBetweenLabelsAndOverview: 15,
              pointWidth: 1,
              ungroupedPointHeight: 1,
              groupedPointHeight: 5,
              compressedMarginBetweenMetrics: 100,
              decompressedMarginBetweenMetrics: 25,
              marginBetweenGroups: 10,
              groupSizeBarWidth: 1,
              pieRadius: 8,
              marginBetweenMarkerAndGroup: 25,
              marginBetweenMetricAndGroupSize: 30,
              groupSizeColor: "lightgray",
              overlapColor: "black",
              selectedInstancesForFocusOffset: 10
            };
          }
        }, {
          key: "initialiseFocusAreaConfig",
          value: function initialiseFocusAreaConfig() {
            this.config.focusArea = {
              color: "Aqua"
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
              marginBetweenAxesAndNumbers: 20,
              verticalAxisLength: 500,
              barWidth: 5,
              minimumBarHeight: 2,
              marginBetweenSliderAndChart: 50,
              thresholdBarLength: 10
            };
          }
        }, {
          key: "initialiseFocusGraphConfig",
          value: function initialiseFocusGraphConfig() {
            this.config.focusGraph = {
              groupedPointWidth: 5,
              ungroupedPointWidth: 50,
              metricMaxHeight: 20,
              metricMinHeight: 5,
              marginBetweenMetrics: 10,
              maxWidth: 1000,
              markerSize: 5,
              marginBetweenMarkers: 5
            };
          }
        }, {
          key: "initialisePanelDefaults",
          value: function initialisePanelDefaults() {
            this.panelDefaults = {
              predefinedMetricList: [{
                name: "CPU",
                unit: "%",
                //    query: "node_load1{job='node'}) * 100 / count by (instance) (count by (instance, cpu) (node_cpu_seconds_total{job='node'}))"
                query: "node_load1{job='node'}"
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
            }; // this.panel.predefinedMetricList = this.panelDefaults.predefinedMetricList;
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
                _this3.initialiseColorListByMetric(metric);
              });
            }
          }
        }, {
          key: "initialiseColorListByMetric",
          value: function initialiseColorListByMetric(metric) {
            // add lightest shade as defined by user
            metric.colorList = [];
            metric.colorList.push(metric.color);
            var luminanceChange = -this.config.maxLuminanceChange / this.config.colorCount; // add the other shades

            for (var i = 1; i < this.config.colorCount; ++i) {
              var color = this.changeColorLuminance(metric.color, i * luminanceChange);
              metric.colorList.push(color);
            }
          }
        }, {
          key: "initialiseNewTab",
          value: function initialiseNewTab() {
            var tab = {};
            tab.overviewModel = {};
            tab.overviewModel.timeRangePositionMap = new Map();
            tab.histogramModel = {};
            tab.overviewModel.data = [];
            tab.overviewModel.metricList = [];
            tab.focusAreaModel = {};
            tab.overviewModel.groupMarkerList = [];
            tab.focusModel = {};
            tab.focusModel.groupList = [];
            this.tabList.push(tab);
            return tab;
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
              groupSizeChart: {
                HORIZONTAL_BAR: "1",
                PIE: "2"
              },
              timeHighlightMode: {
                POINT: "1",
                RANGE: "2"
              }
            };
            this.groupingMode = this.enumList.groupingMode.SINGLE;
            this.groupSizeChart = this.enumList.groupSizeChart.HORIZONTAL_BAR;
            this.groupingThreshold = 50;
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

              _this4.loadCount = 0;
              _this4.fromDate = _this4.getDateInSeconds(_this4.timeSrv.timeRange().from._d);
              _this4.toDate = _this4.getDateInSeconds(_this4.timeSrv.timeRange().to._d);
              _this4.tabList = [];
              _this4.currentTab = _this4.initialiseNewTab(); // time is in milliseconds

              _this4.currentTab.fromDateString = _this4.convertDateToString(_this4.fromDate);
              _this4.currentTab.toDateString = _this4.convertDateToString(_this4.toDate);

              _this4.panel.metricList.forEach(function () {
                _this4.currentTab.overviewModel.metricList.push(null);
              });

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
          } // convert date in timestamp (seconds) to string

        }, {
          key: "convertDateToString",
          value: function convertDateToString(date) {
            return moment(date * 1000).format(this.config.dateFormat);
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
                  _this5.currentTab.overviewModel.metricList[index] = metric;
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
              if (_this6.loadCount < _this6.currentTab.overviewModel.metricList.length) {
                _this6.processRawData.bind(_this6)();
              } else {
                _this6.isLoading = false;

                if (!_this6.currentTab.overviewModel.metricList.includes(null)) {
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
            this.currentTab.overviewModel.metricList.forEach(function (metric) {
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

            this.currentTab.overviewModel.metricList.forEach(function (metric, metricIndex) {
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

            this.currentTab.overviewModel.metricList.forEach(function (overviewMetric, index) {
              var panelMetric = _this8.panel.metricList[index];

              _this8.initialiseColorMapByMetric(overviewMetric, panelMetric);
            });
          }
        }, {
          key: "initialiseColorMapByMetric",
          value: function initialiseColorMapByMetric(overviewMetric, panelMetric) {
            var colorList = panelMetric.colorList;
            overviewMetric.layerRange = Math.round(overviewMetric.max / colorList.length); // map a range of values to a color

            overviewMetric.colorMap = this.getColorMap(overviewMetric, colorList);
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
            this.currentTab.overviewModel.data = [];
            this.populateOverviewDataAndInitialiseHistogramData();
            this.calculateInstanceMetricTotalMinMax();
            this.sortOverviewData();
          }
        }, {
          key: "populateOverviewDataAndInitialiseHistogramData",
          value: function populateOverviewDataAndInitialiseHistogramData() {
            var _this9 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric, metricIndex) {
              metric.histogram = {};
              metric.histogram.data = new Map();
              metric.data.forEach(function (metricInstance) {
                var newInstance = _.find(_this9.currentTab.overviewModel.data, function (search) {
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

            for (var i = 0; i < this.currentTab.overviewModel.metricList.length; ++i) {
              var metric = {};
              metric.data = [];
              newInstance.metricList.push(metric);
            }

            this.currentTab.overviewModel.data.push(newInstance);
            return newInstance;
          }
        }, {
          key: "calculateInstanceMetricTotalMinMax",
          value: function calculateInstanceMetricTotalMinMax() {
            this.currentTab.overviewModel.data.forEach(function (instance) {
              instance.metricList.forEach(function (metric, metricIndex) {
                metric.total = 0;
                metric.min = -1;
                metric.max = -1;
                metric.data.forEach(function (point) {
                  metric.total += point.value;

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
            var _this10 = this;

            var result;
            map.forEach(function (color, threshold) {
              if (_this10.isBetween(value, threshold.min, threshold.max)) {
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
            this.currentTab.overviewModel.data.sort(function (first, second) {
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
            var _this11 = this;

            var tab = this.currentTab;
            tab.clusteredMetricCount = 0;
            tab.isClustering = true;
            var newMetricList = tab.overviewModel.metricList.slice();
            newMetricList.forEach(function (metric, metricIndex) {
              var worker = new Worker("/public/plugins/buw-heatmap-panel/single_metric_worker.js");

              var param = _this11.getSingleMetricWorkerParam(metric, metricIndex);

              worker.postMessage([param]);

              worker.onmessage = function (e) {
                _this11.handleFinishedSingleMetricClustering(e, tab, metricIndex);
              };
            });
          }
        }, {
          key: "getSingleMetricWorkerParam",
          value: function getSingleMetricWorkerParam(metric, metricIndex) {
            var param = this.getWorkerParam();
            var panelMetric = this.panel.metricList[metricIndex];
            var metricName = panelMetric.name;
            var colorList = panelMetric.colorList;
            param.metric = metric;
            param.metricIndex = metricIndex;
            param.metricName = metricName;
            param.colorList = colorList;
            return param;
          }
        }, {
          key: "getWorkerParam",
          value: function getWorkerParam() {
            return {
              tab: this.currentTab,
              config: this.config
            };
          }
        }, {
          key: "handleFinishedSingleMetricClustering",
          value: function handleFinishedSingleMetricClustering(e, tab, metricIndex) {
            var _this12 = this;

            this.$timeout(function () {
              var metric = e.data[0];
              tab.overviewModel.metricList[metricIndex] = metric;
              ++tab.clusteredMetricCount;

              _this12.scope.$apply();

              if (tab.clusteredMetricCount == tab.overviewModel.metricList.length) {
                _this12.initialiseSingleMetricInstanceGroupList(tab);

                _this12.initialiseMultiMetricGroups();
              }
            });
          }
        }, {
          key: "initialiseSingleMetricInstanceGroupList",
          value: function initialiseSingleMetricInstanceGroupList(tab) {
            var _this13 = this;

            tab.overviewModel.data.forEach(function (instance) {
              instance.groupList = [];
              tab.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this13.getCurrentSingleMetricGroupList(metric);

                for (var i = 0; i < groupList.length; ++i) {
                  var group = groupList[i];

                  var check = _.find(group.instanceList, function (search) {
                    return search.instance == instance.instance;
                  });

                  if (check) {
                    instance.groupList.push(group);
                    break;
                  }
                }
              });
            });
          }
        }, {
          key: "initialiseMultiMetricGroups",
          value: function initialiseMultiMetricGroups() {
            var _this14 = this;

            this.currentTab.overviewModel.thresholdGroupListMap = new Map();
            var tab = this.currentTab;
            var worker = new Worker("/public/plugins/buw-heatmap-panel/multi_metric_worker.js");
            var param = this.getWorkerParam();
            worker.postMessage([param]);

            worker.onmessage = function (e) {
              _this14.handleFinishedMultiMetricClustering(e, tab);
            };
          }
        }, {
          key: "handleFinishedMultiMetricClustering",
          value: function handleFinishedMultiMetricClustering(e, tab) {
            tab.isClustering = false;
            var result = e.data[0];
            tab.overviewModel = result.overviewModel;
          }
        }, {
          key: "initialiseCompressedTimeIndexes",
          value: function initialiseCompressedTimeIndexes() {
            var _this15 = this;

            this.currentTab.overviewModel.metricList.forEach(function (overviewMetric, metricIndex) {
              overviewMetric.compressedTimeIndexList = [0];

              _this15.currentTab.overviewModel.data.forEach(function (instance) {
                _this15.initialiseInstanceCompressedTimeRangeList(instance, overviewMetric, metricIndex);
              });

              _this15.currentTab.overviewModel.data.forEach(function (instance) {
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
            var _this16 = this;

            var instanceMetric = instance.metricList[metricIndex];
            instanceMetric.compressedIndexRangeList = [];
            var presviousRange;
            instanceMetric.data.forEach(function (point, pointIndex) {
              var thresholdAverage = _this16.getThresholdAverage(point.value, overviewMetric.colorMap);

              if (pointIndex == 0) {
                presviousRange = _this16.initialiseNewCompressedTimeRange(instanceMetric, thresholdAverage);
              } else {
                if (thresholdAverage != presviousRange.value || pointIndex == instanceMetric.data.length - 1) {
                  presviousRange.end = pointIndex;

                  if (thresholdAverage != presviousRange.value) {
                    presviousRange = _this16.initialiseNewCompressedTimeRange(instanceMetric, thresholdAverage);
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
            this.clearFocusArea();
            this.drawOverview();
          }
        }, {
          key: "clearFocusArea",
          value: function clearFocusArea() {
            this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
          }
        }, {
          key: "drawOverview",
          value: function drawOverview() {
            var _this17 = this;

            if (!this.isLoading) {
              this.$timeout(function () {
                _this17.overviewContext.clearRect(0, 0, _this17.overviewCanvas.width, _this17.overviewCanvas.height);

                _this17.setOverviewCanvasSize();

                _this17.focusGraphMarginTop = _this17.overviewCanvasHeight + _this17.config.marginBetweenOverviewAndFocus;

                _this17.scope.$apply();

                _this17.drawOverviewData();
              });
            }
          }
        }, {
          key: "setOverviewCanvasSize",
          value: function setOverviewCanvasSize() {
            this.setOverviewContextLabelFont();
            this.currentTab.overviewModel.labelTextHeight = this.overviewContext.measureText("M").width;
            this.currentTab.overviewModel.overviewStartY = this.currentTab.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview;
            this.setOverviewWidth();
            this.setOverviewHeight();
          }
        }, {
          key: "setOverviewWidth",
          value: function setOverviewWidth() {
            var _this18 = this;

            this.setOverviewContextTimeFont();
            var marginBetweenMetrics = this.getMarginBetweenMetrics();
            this.currentTab.overviewModel.overviewWidth = this.config.overview.marginBetweenMarkerAndGroup * this.currentTab.overviewModel.metricList.length + marginBetweenMetrics * (this.currentTab.overviewModel.metricList.length - 1);
            this.currentTab.overviewModel.pointWidth = this.config.overview.pointWidth;

            if (this.isGrouped) {
              this.setGroupedOverviewPointWidth();
            } // total width of overiew graph


            if (this.isCompressed) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                _this18.currentTab.overviewModel.overviewWidth += metric.compressedTimeIndexList.length * _this18.currentTab.overviewModel.pointWidth;
              });
            } else {
              this.currentTab.overviewModel.overviewWidth += this.getMaxMetricLength() * this.currentTab.overviewModel.metricList.length * this.currentTab.overviewModel.pointWidth;
            }

            this.overviewCanvasWidth = this.currentTab.overviewModel.overviewWidth;
            this.currentTab.overviewModel.fromDate = this.convertDateToString(this.fromDate);
            this.currentTab.overviewModel.toDate = this.convertDateToString(this.toDate);
            this.currentTab.overviewModel.toDateWidth = this.overviewContext.measureText(this.currentTab.overviewModel.toDate).width;

            if (this.isGrouped) {
              this.setGroupedOverviewCanvasWidth();
            } else {
              this.overviewCanvasWidth += this.currentTab.overviewModel.toDateWidth / 2;
            }
          }
        }, {
          key: "setOverviewContextTimeFont",
          value: function setOverviewContextTimeFont() {
            this.overviewContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
          }
        }, {
          key: "setGroupedOverviewPointWidth",
          value: function setGroupedOverviewPointWidth() {
            if (this.currentTab != this.tabList[0]) {
              var maxOriginalLength = this.getMaxMetricLengthByTab(this.tabList[0]);

              if (maxOriginalLength > 0) {
                var originalLength = this.getMaxMetricLength();

                if (originalLength > 0) {
                  var currentLength = originalLength;
                  var nextScaledLength = currentLength;
                  var scale = 1;

                  while (currentLength < maxOriginalLength && nextScaledLength < maxOriginalLength) {
                    currentLength = nextScaledLength;
                    ++scale;
                    nextScaledLength = originalLength * scale;
                  }

                  if (Math.abs(maxOriginalLength - originalLength) > Math.abs(nextScaledLength - maxOriginalLength)) {
                    this.currentTab.overviewModel.pointWidth *= scale - 1;
                  } else {
                    this.currentTab.overviewModel.pointWidth *= scale;
                  }
                }
              }
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
            return this.getMaxMetricLengthByTab(this.currentTab);
          }
        }, {
          key: "getMaxMetricLengthByTab",
          value: function getMaxMetricLengthByTab(tab) {
            var length = 0;

            if (tab.overviewModel.metricList) {
              tab.overviewModel.metricList.forEach(function (metric) {
                var instanceWithMostPoints = _.maxBy(metric.data, function (point) {
                  return point.values.length;
                });

                if (instanceWithMostPoints) {
                  length = instanceWithMostPoints.values.length;
                }
              });
            }

            return length;
          }
        }, {
          key: "setGroupedOverviewCanvasWidth",
          value: function setGroupedOverviewCanvasWidth() {
            var _this19 = this;

            this.overviewCanvasWidth += this.config.overview.marginBetweenMarkerAndGroup * this.currentTab.overviewModel.metricList.length;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize * this.currentTab.overviewModel.metricList.length;
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                _this19.overviewCanvasWidth += _this19.getMaxGroupSizeBarLength(metric) * _this19.config.overview.groupSizeBarWidth;
              });
            } else {
              if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize + this.getMaxMultiMetricGroupSize() * this.config.overview.groupSizeBarWidth;
              } else {
                this.overviewCanvasWidth += this.config.overview.pieRadius * 2;
              }
            }
          }
        }, {
          key: "getMaxGroupSizeBarLength",
          value: function getMaxGroupSizeBarLength(metric) {
            var groupList = this.getCurrentSingleMetricGroupList(metric);

            var largestGroup = _.maxBy(groupList, function (group) {
              return group.instanceList.length;
            });

            if (largestGroup) {
              return largestGroup.instanceList.length * this.config.overview.groupSizeBarWidth;
            } else {
              return 0;
            }
          }
        }, {
          key: "getCurrentSingleMetricGroupList",
          value: function getCurrentSingleMetricGroupList(metric) {
            return metric.thresholdGroupListMap.get(this.groupingThreshold);
          }
        }, {
          key: "getMaxMultiMetricGroupSize",
          value: function getMaxMultiMetricGroupSize() {
            var result = 0;
            var groupList = this.getCurrentMultiMetricGroupList();
            groupList.forEach(function (group) {
              if (group.instanceList.length > result) {
                result = group.instanceList.length;
              }
            });
            return result;
          }
        }, {
          key: "getCurrentMultiMetricGroupList",
          value: function getCurrentMultiMetricGroupList() {
            return this.currentTab.overviewModel.thresholdGroupListMap.get(this.groupingThreshold);
          }
        }, {
          key: "setOverviewHeight",
          value: function setOverviewHeight() {
            // height of tallest graph
            if (this.isGrouped) {
              var groupCount = this.getMaxGroupCount();

              if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                this.currentTab.overviewModel.instanceHeight = this.config.overview.groupedPointHeight + this.config.overview.marginBetweenGroups;
              } else {
                this.currentTab.overviewModel.instanceHeight = this.config.overview.pieRadius * 2 + this.config.overview.marginBetweenGroups;
              }

              this.currentTab.overviewModel.overviewHeight = groupCount * this.currentTab.overviewModel.instanceHeight;
            } else {
              this.currentTab.overviewModel.instanceHeight = this.config.overview.ungroupedPointHeight;
              this.currentTab.overviewModel.overviewHeight = this.currentTab.overviewModel.data.length * this.config.overview.ungroupedPointHeight;
            } // 2 = Metric and time labels


            this.overviewCanvasHeight = this.currentTab.overviewModel.overviewHeight + (this.currentTab.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 3; // metric label, from/to date, selected date
          }
        }, {
          key: "getMaxGroupCount",
          value: function getMaxGroupCount() {
            var _this20 = this;

            var groupCount = 0;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this20.getCurrentSingleMetricGroupList(metric);

                var length = groupList.length;

                if (length > groupCount) {
                  groupCount = length;
                }
              });
            } else {
              var groupList = this.getCurrentMultiMetricGroupList();
              groupCount = groupList.length;
            }

            return groupCount;
          }
        }, {
          key: "setOverviewContextLabelFont",
          value: function setOverviewContextLabelFont() {
            this.overviewContext.font = "italic " + (this.config.overview.metricFontSize - 1) + "px Arial";
          }
        }, {
          key: "drawOverviewData",
          value: function drawOverviewData() {
            this.currentTab.overviewModel.overviewEndY = 0;
            this.setOverviewMetricStartXAndEndX();

            if (this.isGrouped) {
              this.drawGroupedOverview();
            } else {
              this.drawUngroupedOverview();
            }

            this.drawMetricLabels();
          }
        }, {
          key: "setOverviewMetricStartXAndEndX",
          value: function setOverviewMetricStartXAndEndX() {
            var _this21 = this;

            var marginBetweenMetrics = this.getMarginBetweenMetrics();
            this.currentTab.overviewModel.metricList.forEach(function (metric, metricIndex) {
              _this21.setOverviewMetricStartX(metric, metricIndex, marginBetweenMetrics);

              if (_this21.isCompressed) {
                metric.endX = metric.startX + metric.compressedTimeIndexList.length * _this21.currentTab.overviewModel.pointWidth;
              } else {
                metric.endX = metric.startX + _this21.getMaxMetricLength() * _this21.currentTab.overviewModel.pointWidth;
              }
            });
          }
        }, {
          key: "setOverviewMetricStartX",
          value: function setOverviewMetricStartX(metric, metricIndex, marginBetweenMetrics) {
            if (metricIndex > 0) {
              var previousMetric = this.currentTab.overviewModel.metricList[metricIndex - 1];
              metric.startX = previousMetric.endX + marginBetweenMetrics;

              if (this.isGrouped) {
                metric.startX += this.config.overview.marginBetweenMarkerAndGroup;

                if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                  metric.startX += this.config.overview.marginBetweenMetricAndGroupSize;

                  if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                    var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(previousMetric);
                    metric.startX += maxGroupSizeBarLength;
                  } else {
                    metric.startX += this.config.overview.pieRadius * 2;
                  }
                }
              }
            } else {
              metric.startX = this.config.overview.marginBetweenMarkerAndGroup;
            }
          }
        }, {
          key: "drawGroupedOverview",
          value: function drawGroupedOverview() {
            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.drawSingeMetricGroupedOverview();
            } else {
              this.drawMultiMetricGroupedOverview();
            }

            this.drawGroupSize();
          }
        }, {
          key: "drawSingeMetricGroupedOverview",
          value: function drawSingeMetricGroupedOverview() {
            var _this22 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric, metricIndex) {
              var groupList = _this22.getCurrentSingleMetricGroupList(metric);

              groupList.forEach(function (group, groupIndex) {
                _this22.drawGroupedOverviewWrapper(group, groupIndex, [metricIndex]);
              });

              if (metricIndex < _this22.currentTab.overviewModel.metricList.length - 1) {
                _this22.drawMetricSeparator(metric);
              }
            });
          }
        }, {
          key: "drawGroupedOverviewWrapper",
          value: function drawGroupedOverviewWrapper(group, groupIndex, metricIndexList) {
            var instance = group.instanceList[0];
            instance.y = this.currentTab.overviewModel.overviewStartY + groupIndex * this.currentTab.overviewModel.instanceHeight;

            if (this.groupSizeChart == this.enumList.groupSizeChart.PIE) {
              instance.y += this.currentTab.overviewModel.instanceHeight / 2;
            }

            this.drawOverviewInstance(instance, this.config.overview.groupedPointHeight, metricIndexList);
            group.y = instance.y;
          }
        }, {
          key: "drawOverviewInstance",
          value: function drawOverviewInstance(instance, pointHeight, metricIndexList) {
            var _this23 = this;

            var endY = instance.y + this.currentTab.overviewModel.instanceHeight;

            if (endY > this.currentTab.overviewModel.overviewEndY) {
              this.currentTab.overviewModel.overviewEndY = endY;
            }

            metricIndexList.forEach(function (metricIndex) {
              _this23.drawOverviewInstancePoints(instance, metricIndex, pointHeight);
            });
          }
        }, {
          key: "drawOverviewInstancePoints",
          value: function drawOverviewInstancePoints(instance, metricIndex, pointHeight) {
            var _this24 = this;

            var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex];
            var instanceMetric = instance.metricList[metricIndex];

            if (this.isCompressed) {
              overviewMetric.compressedTimeIndexList.forEach(function (pointIndex, rangeIndex) {
                var point = instanceMetric.data[pointIndex];

                if (point) {
                  _this24.drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, rangeIndex, pointHeight);
                }
              });
            } else {
              instanceMetric.data.forEach(function (point, pointIndex) {
                _this24.drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, pointIndex, pointHeight);
              });
            }
          }
        }, {
          key: "drawOverviewInstancePoint",
          value: function drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, pointIndex, pointHeight) {
            if (point.value != null) {
              point.x = overviewMetric.startX + pointIndex * this.currentTab.overviewModel.pointWidth;
              point.color = this.getColorFromMap(point.value, this.currentTab.overviewModel.metricList[metricIndex].colorMap);
              this.overviewContext.fillStyle = point.color;
              this.overviewContext.fillRect(point.x, instance.y, this.currentTab.overviewModel.pointWidth, pointHeight);
            }
          }
        }, {
          key: "getColorFromMap",
          value: function getColorFromMap(value, map) {
            var _this25 = this;

            var result = null;
            map.forEach(function (color, threshold) {
              if (!result && _this25.isBetween(value, threshold.min, threshold.max)) {
                result = color;
              }
            });
            return result;
          }
        }, {
          key: "drawMultiMetricGroupedOverview",
          value: function drawMultiMetricGroupedOverview() {
            var _this26 = this;

            var groupList = this.getCurrentMultiMetricGroupList();
            groupList.forEach(function (group, groupIndex) {
              var metricIndexList = _this26.getAllMetricIndexList();

              _this26.drawGroupedOverviewWrapper(group, groupIndex, metricIndexList);
            });
            this.drawMetricSeparator(this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.metricList.length - 1]);
          }
        }, {
          key: "getAllMetricIndexList",
          value: function getAllMetricIndexList() {
            return Array.from(Array(this.currentTab.overviewModel.metricList.length).keys());
          }
        }, {
          key: "drawGroupSize",
          value: function drawGroupSize() {
            this.setOverviewContextLabelFont();
            var label = "Groups size";
            this.currentTab.overviewModel.groupSizeLabelWidth = this.overviewContext.measureText(label).width;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.drawSingleMetricGroupSize();
            } else {
              this.drawMultipleMetricGroupSize();
            }
          }
        }, {
          key: "drawSingleMetricGroupSize",
          value: function drawSingleMetricGroupSize() {
            var _this27 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              var startX = metric.endX + _this27.config.overview.marginBetweenMetricAndGroupSize;

              var groupList = _this27.getCurrentSingleMetricGroupList(metric);

              groupList.forEach(function (group) {
                if (_this27.groupSizeChart == _this27.enumList.groupSizeChart.HORIZONTAL_BAR) {
                  _this27.drawSingleMetricBarGroupSize(group, startX);
                } else {
                  _this27.drawSingleMetricPieGroupSize(group, startX);
                }
              });

              if (_this27.groupSizeChart == _this27.enumList.groupSizeChart.HORIZONTAL_BAR) {
                var maxGroupSizeBarLength = _this27.getMaxGroupSizeBarLength(metric);

                _this27.drawGroupSizeLabel((startX * 2 + maxGroupSizeBarLength - _this27.currentTab.overviewModel.groupSizeLabelWidth) / 2);
              } else {
                _this27.drawGroupSizeLabel((startX * 2 + _this27.config.overview.pieRadius - _this27.currentTab.overviewModel.groupSizeLabelWidth) / 2);
              }
            });
          }
        }, {
          key: "drawSingleMetricBarGroupSize",
          value: function drawSingleMetricBarGroupSize(group, startX) {
            this.drawBarGroupSizeWrapper(group, startX, group.instanceList.length, this.config.overview.groupSizeColor); // don't draw overlap if group isn't selected and is in a selected metric

            if (this.currentTab.overviewModel.selectedMetricIndexSet && (!this.currentTab.overviewModel.selectedMetricIndexSet.has(group.metricIndex) || group.isSelected)) {
              this.drawBarGroupSizeWrapper(group, startX, group.overlapCount, this.config.overview.overlapColor);
            }
          }
        }, {
          key: "drawBarGroupSizeWrapper",
          value: function drawBarGroupSizeWrapper(group, startX, length, color) {
            var endX = startX + length * this.config.overview.groupSizeBarWidth;
            var endY = group.y + this.config.overview.groupedPointHeight;
            this.overviewContext.beginPath();
            this.overviewContext.moveTo(startX, group.y);
            this.overviewContext.lineTo(endX, group.y);
            this.overviewContext.lineTo(endX, endY);
            this.overviewContext.lineTo(startX, endY);
            this.overviewContext.closePath();
            this.overviewContext.fillStyle = color;
            this.overviewContext.fill();
            return endX;
          }
        }, {
          key: "drawSingleMetricPieGroupSize",
          value: function drawSingleMetricPieGroupSize(group, startX) {
            var startAngle = -0.5 * Math.PI;
            this.drawPieGroupSizeWrapper(group, startX, startAngle, group.instanceList.length, this.config.overview.groupSizeColor);
            this.drawPieGroupSizeWrapper(group, startX, startAngle, group.overlapCount, this.config.overview.overlapColor);
          }
        }, {
          key: "drawPieGroupSizeWrapper",
          value: function drawPieGroupSizeWrapper(group, startX, startAngle, size, color) {
            var x = startX + this.config.overview.pieRadius;
            var endAngle = startAngle + size * 2 * Math.PI / 360;
            this.overviewContext.beginPath();
            this.overviewContext.moveTo(x, group.y);
            this.overviewContext.arc(x, group.y, this.config.overview.pieRadius, startAngle, endAngle);
            this.overviewContext.lineTo(x, group.y);
            this.overviewContext.closePath();
            this.overviewContext.fillStyle = color;
            this.overviewContext.fill();
            return endAngle;
          }
        }, {
          key: "drawGroupSizeLabel",
          value: function drawGroupSizeLabel(x) {
            this.overviewContext.fillStyle = "black";
            this.overviewContext.fillText("Groups size", x, this.currentTab.overviewModel.labelTextHeight);
          }
        }, {
          key: "drawMultipleMetricGroupSize",
          value: function drawMultipleMetricGroupSize() {
            var _this28 = this;

            var startX = this.currentTab.overviewModel.overviewWidth + this.config.overview.marginBetweenMetricAndGroupSize + this.currentTab.overviewModel.groupSizeLabelWidth / 2;
            var maxEndX = 0;
            var groupList = this.getCurrentMultiMetricGroupList();
            groupList.forEach(function (group, groupIndex) {
              var endX = _this28.drawBarGroupSizeWrapper(group, startX, group.instanceList.length, _this28.config.overview.groupSizeColor);

              if (endX > maxEndX) {
                maxEndX = endX;
              }
            });
            this.drawGroupSizeLabel((startX + maxEndX - this.currentTab.overviewModel.groupSizeLabelWidth) / 2);
          }
        }, {
          key: "drawMetricSeparator",
          value: function drawMetricSeparator(metric) {
            this.overviewContext.strokeStyle = "gray";
            var x = metric.endX + this.config.overview.decompressedMarginBetweenMetrics / 2;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              x += this.config.overview.marginBetweenMetricAndGroupSize;

              if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(metric);
                x += maxGroupSizeBarLength;
              } else {
                x += this.config.overview.pieRadius * 2;
              }
            }

            this.overviewContext.beginPath();
            this.overviewContext.moveTo(x, this.currentTab.overviewModel.overviewStartY);
            this.overviewContext.lineTo(x, this.currentTab.overviewModel.overviewStartY + this.currentTab.overviewModel.overviewHeight);
            this.overviewContext.stroke();
            this.overviewContext.closePath();
          }
        }, {
          key: "drawUngroupedOverview",
          value: function drawUngroupedOverview() {
            var _this29 = this;

            this.currentTab.overviewModel.data.forEach(function (instance, instanceIndex) {
              var metricIndexList = _this29.getAllMetricIndexList();

              instance.y = _this29.currentTab.overviewModel.overviewStartY + instanceIndex * _this29.currentTab.overviewModel.instanceHeight;

              _this29.drawOverviewInstance(instance, _this29.currentTab.overviewModel.instanceHeight, metricIndexList);
            });
          }
        }, {
          key: "drawMetricLabels",
          value: function drawMetricLabels() {
            for (var metricIndex = 0; metricIndex < this.currentTab.overviewModel.metricList.length; ++metricIndex) {
              this.setOverviewContextLabelFont();
              var metric = this.currentTab.overviewModel.metricList[metricIndex];
              var label = this.panel.metricList[metricIndex].name;
              var width = this.overviewContext.measureText(label).width;
              this.overviewContext.fillStyle = this.getMetricDarkestColor(this.panel.metricList[metricIndex]);
              this.overviewContext.fillText(label, (metric.startX + metric.endX - width) / 2, this.currentTab.overviewModel.labelTextHeight);

              if (this.isGrouped && !this.isCompressed) {
                this.drawTimeLabels(metric);
              }
            }
          }
        }, {
          key: "getMetricDarkestColor",
          value: function getMetricDarkestColor(metric) {
            var colorList = metric.colorList;
            return colorList[colorList.length - 1];
          }
        }, {
          key: "drawTimeLabels",
          value: function drawTimeLabels(metric) {
            this.setOverviewContextTimeFont();
            metric.timeLabelY = this.config.overview.marginBetweenLabelsAndOverview;
            var groupList;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              groupList = this.getCurrentSingleMetricGroupList(metric);
            } else {
              groupList = this.getCurrentMultiMetricGroupList();
            }

            if (groupList.length > 0) {
              metric.timeLabelY += groupList[groupList.length - 1].y + this.config.overview.groupedPointHeight;
            }

            this.overviewContext.fillStyle = "black";
            this.overviewContext.fillText(this.currentTab.overviewModel.fromDate, metric.startX - this.currentTab.overviewModel.toDateWidth / 2, metric.timeLabelY);
            this.overviewContext.fillText(this.currentTab.overviewModel.toDate, metric.endX - this.currentTab.overviewModel.toDateWidth / 2, metric.timeLabelY);
          }
        }, {
          key: "closeHistogram",
          value: function closeHistogram() {
            var _this30 = this;

            this.showHistogram = false;

            if (this.changedColorThreshold) {
              this.changedColorThreshold = false;
              this.drawOverview();

              if (this.isGrouped) {
                var temp = this.currentTab.focusModel.groupList;
                this.currentTab.focusModel.groupList = [];
                temp.forEach(function (group) {
                  _this30.addOrRemoveGroupToFocus(group.overviewGroup, true);
                });
                this.drawFocusGraph();
              } else {
                this.drawFocusGraph();
              }
            }
          }
        }, {
          key: "addOrRemoveGroupToFocus",
          value: function addOrRemoveGroupToFocus(group, removeExisting) {
            var focusGroup = _.find(this.currentTab.focusModel.groupList, function (search) {
              return search.overviewGroup == group;
            });

            if (focusGroup) {
              if (removeExisting) {
                group.isSelected = false;
                group.timeRangeIndexList = null; // deselect group from focus

                _.remove(this.currentTab.focusModel.groupList, function (search) {
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
          key: "removeExistingFocusGroupInSameMetric",
          value: function removeExistingFocusGroupInSameMetric(group) {
            var newGroupList = [];
            this.currentTab.focusModel.groupList.forEach(function (existingGroup) {
              if (existingGroup.overviewGroup.metricIndex == group.metricIndex) {
                existingGroup.overviewGroup.isSelected = false;
              } else {
                newGroupList.push(existingGroup);
              }
            });
            this.currentTab.focusModel.groupList = newGroupList;
          }
        }, {
          key: "setShowMergeGroupsButton",
          value: function setShowMergeGroupsButton() {
            var _this31 = this;

            this.showMergeSelectedGroups = false;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this31.getCurrentSingleMetricGroupList(metric);

                _this31.setShowMergeGroupsButtonWrapper(groupList);
              });
            } else {
              var groupList = this.getCurrentMultiMetricGroupList();
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
          key: "drawSelectedGroupsMarkers",
          value: function drawSelectedGroupsMarkers() {
            var _this32 = this;

            this.$timeout(function () {
              _this32.clearFocusArea();

              _this32.currentTab.overviewModel.groupMarkerList = [];

              if (_this32.groupingMode == _this32.enumList.groupingMode.SINGLE) {
                _this32.currentTab.overviewModel.metricList.forEach(function (metric) {
                  var groupList = _this32.getCurrentSingleMetricGroupList(metric);

                  groupList.forEach(function (group) {
                    _this32.drawOverviewGroupMarker(group, [metric]);
                  });
                });
              } else {
                var groupList = _this32.getCurrentMultiMetricGroupList();

                groupList.forEach(function (group) {
                  _this32.drawOverviewGroupMarker(group, _this32.currentTab.overviewModel.metricList);
                });
              }
            });
          }
        }, {
          key: "drawOverviewGroupMarker",
          value: function drawOverviewGroupMarker(group, metricList) {
            var _this33 = this;

            if (group.isSelected) {
              metricList.forEach(function (metric) {
                var marker = {};
                marker.group = group;
                marker.startX = metric.startX - _this33.config.overview.marginBetweenMarkerAndGroup + group.markerX;
                marker.endX = marker.startX + _this33.config.overview.groupedPointHeight;
                marker.startY = group.y;
                marker.endY = marker.startY + _this33.config.overview.groupedPointHeight;
                _this33.focusAreaContext.fillStyle = group.color;

                _this33.focusAreaContext.fillRect(marker.startX, marker.startY, _this33.config.overview.groupedPointHeight, _this33.config.overview.groupedPointHeight);

                _this33.currentTab.overviewModel.groupMarkerList.push(marker);
              });
            }
          }
        }, {
          key: "drawFocusGraph",
          value: function drawFocusGraph(initialiseData) {
            var _this34 = this;

            if (!this.isGrouped && initialiseData) {
              this.initialiseFocusGraphData();
            }

            if (this.isGrouped && this.currentTab.focusModel.groupList.length > 0 || !this.isGrouped && this.currentTab.focusModel.data.length > 0) {
              this.showFocus = true;
              this.$timeout(function () {
                _this34.setFocusGraphCanvasHeight();

                var pointCount = _this34.currentTab.focusModel.focusedIndexList.length - 1;
                var pointWidth;

                if (_this34.isGrouped) {
                  pointWidth = Math.max(1, Math.floor(_this34.config.focusGraph.maxWidth / pointCount));
                } else {
                  pointWidth = _this34.config.focusGraph.ungroupedPointWidth;
                }

                _this34.focusGraphWidth = Math.min(_this34.config.focusGraph.maxWidth, pointCount * pointWidth);

                _this34.scope.$apply();

                _this34.currentTab.focusModel.pointWidth = Math.max(1, Math.floor(_this34.focusGraphWidth / pointCount));

                var focusGraphRow = _this34.getElementByID("focusGraphRow");

                if (focusGraphRow) {
                  _this34.setFocusFromAndToDate();

                  if (!_this34.isGrouped) {
                    _this34.positionFocusFromAndToDate();
                  }

                  _this34.currentTab.focusModel.focusRowHeight = focusGraphRow.offsetHeight;

                  _this34.drawFocusGraphData();

                  _this34.autoSrollFocusGraph();
                }
              });
            } else {
              this.showFocus = false;
            }
          }
        }, {
          key: "setFocusGraphCanvasHeight",
          value: function setFocusGraphCanvasHeight() {
            var _this35 = this;

            if (this.isGrouped) {
              this.currentTab.focusModel.groupList.forEach(function (group) {
                if (group.showAllMetrics) {
                  group.focusGraphHeight = _this35.currentTab.overviewModel.metricList.length * _this35.config.focusGraph.metricMaxHeight + (_this35.currentTab.overviewModel.metricList.length - 1) * _this35.config.focusGraph.marginBetweenMetrics;
                } else {
                  group.focusGraphHeight = _this35.config.focusGraph.metricMaxHeight;
                }
              });
            } else {
              this.currentTab.focusModel.data.forEach(function (instance) {
                if (instance.showAllMetrics) {
                  instance.focusGraphHeight = _this35.currentTab.overviewModel.metricList.length * _this35.config.focusGraph.metricMaxHeight + (_this35.currentTab.overviewModel.metricList.length - 1) * _this35.config.focusGraph.marginBetweenMetrics;
                } else {
                  instance.focusGraphHeight = _this35.config.focusGraph.metricMaxHeight;
                }
              });
            }
          }
        }, {
          key: "moveMouseOnHistogram",
          value: function moveMouseOnHistogram(evt) {
            this.currentTab.histogramModel.mousePosition = this.getMousePos(evt, this.histogramCanvas);

            if (this.currentTab.histogramModel.isSelectingBar) {
              this.setNewThresholdValue();
            } else {
              this.checkAndSetSelectedHistogramThresholdBar();
            }
          }
        }, {
          key: "setNewThresholdValue",
          value: function setNewThresholdValue() {
            var _this36 = this;

            this.changedColorThreshold = true;
            var value = Math.round((this.currentTab.histogramModel.mousePosition.x - this.currentTab.histogramModel.horizontalAxisStartX) / this.config.histogram.barWidth);
            value = Math.max(value, 1);
            value = Math.min(value, this.currentTab.histogramModel.metric.max - 1);
            this.currentTab.histogramModel.metric.colorMap.forEach(function (color, threshold) {
              if (threshold != _this36.currentTab.histogramModel.selectedBar.threshold) {
                if (value >= _this36.currentTab.histogramModel.selectedBar.threshold.max) {
                  // move right
                  if (threshold.min == _this36.currentTab.histogramModel.selectedBar.threshold.max) {
                    value = Math.min(value, threshold.max - 1);
                    threshold.min = value;
                  }
                } else {
                  // move left
                  if (_this36.currentTab.histogramModel.selectedBar.threshold.min == 0) {
                    // left most threshold
                    if (threshold.min == _this36.currentTab.histogramModel.selectedBar.threshold.max) {
                      threshold.min = value;
                    }
                  } else {
                    // left threshold
                    if (threshold.max == _this36.currentTab.histogramModel.selectedBar.threshold.min) {
                      value = Math.max(value, threshold.max + 1);
                    } // right threshold


                    if (threshold.min == _this36.currentTab.histogramModel.selectedBar.threshold.max) {
                      threshold.min = value;
                    }
                  }
                }
              }
            });
            this.currentTab.histogramModel.selectedBar.threshold.max = value;
            this.drawHistogram();
          }
        }, {
          key: "checkAndSetSelectedHistogramThresholdBar",
          value: function checkAndSetSelectedHistogramThresholdBar() {
            this.histogramCursor = "default";
            this.currentTab.histogramModel.selectedBar = null;
            var topY = this.currentTab.histogramModel.sliderY - this.config.histogram.thresholdBarLength / 2;
            var bottomY = this.currentTab.histogramModel.sliderY + this.config.histogram.thresholdBarLength / 2;

            if (this.isBetween(this.currentTab.histogramModel.mousePosition.y, topY, bottomY)) {
              for (var i = 0; i < this.currentTab.histogramModel.thresholdBarList.length; ++i) {
                var bar = this.currentTab.histogramModel.thresholdBarList[i];
                var leftX = bar.x - this.config.histogram.barWidth;
                var rightX = bar.x + this.config.histogram.barWidth;

                if (this.isBetween(this.currentTab.histogramModel.mousePosition.x, leftX, rightX)) {
                  this.histogramCursor = "pointer";
                  this.currentTab.histogramModel.selectedBar = bar;
                  break;
                }
              }
            }
          }
        }, {
          key: "mouseDownOnHistogram",
          value: function mouseDownOnHistogram() {
            if (this.currentTab.histogramModel.selectedBar) {
              this.currentTab.histogramModel.isSelectingBar = true;
            }
          }
        }, {
          key: "mouseUpOnHistogram",
          value: function mouseUpOnHistogram() {
            this.currentTab.histogramModel.isSelectingBar = false;
            this.currentTab.histogramModel.selectedBar = null;
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
            if (!this.isLoading) {
              this.drawOverview();
              this.clearFocusArea();
              this.clearTimeIndicator();
              this.deselectAllGroups();
              this.showFocus = false;
              this.showMergeSelectedGroups = false;
            }
          }
        }, {
          key: "deselectAllGroups",
          value: function deselectAllGroups() {
            this.currentTab.focusModel.groupList = [];
            this.currentTab.overviewModel.timeRangePositionMap = new Map();
            this.deselectSingleMetricGroups(); // this.deselectMultiMetricGroups();
          }
        }, {
          key: "deselectSingleMetricGroups",
          value: function deselectSingleMetricGroups() {
            var _this37 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              if (metric.originalGroupList) {
                metric.thresholdGroupListMap.set(_this37.previousGroupThreshold, metric.originalGroupList);
                metric.originalGroupList = null;
              }

              var groupList = _this37.getCurrentSingleMetricGroupList(metric);

              if (groupList) {
                groupList.forEach(function (group) {
                  group.isSelected = false;
                  group.timeRangeIndexList = null;
                  group.overlapCount = 0;
                });
              }
            });
          }
        }, {
          key: "deselectMultiMetricGroups",
          value: function deselectMultiMetricGroups() {
            if (this.currentTab.overviewModel.originalGroupList) {
              this.currentTab.overviewModel.thresholdGroupListMap.set(this.previousGroupThreshold, this.currentTab.overviewModel.originalGroupList);
              this.currentTab.overviewModel.originalGroupList = null;
            }

            var groupList = this.getCurrentMultiMetricGroupList();
            groupList.forEach(function (group) {
              group.isSelected = false;
              group.timeRangeIndexList = null;
            });
          }
        }, {
          key: "changeGroupingThreshold",
          value: function changeGroupingThreshold() {
            this.initialiseSingleMetricInstanceGroupList(this.currentTab);
            this.changeGroupingSelection();
          }
        }, {
          key: "selectGroupsizeChart",
          value: function selectGroupsizeChart() {
            this.drawOverview();
          }
        }, {
          key: "groupUngroup",
          value: function groupUngroup() {
            this.isGrouped = !this.isGrouped;

            if (this.isGrouped && this.currentTab.isClustering) {
              this.waitUntilGroupProcessingIsFinished();
            } else {
              this.changeGroupingSelection();
            }
          }
        }, {
          key: "waitUntilGroupProcessingIsFinished",
          value: function waitUntilGroupProcessingIsFinished() {
            var _this38 = this;

            if (this.currentTab.isClustering) {
              this.$timeout(function () {
                _this38.waitUntilGroupProcessingIsFinished();
              }, 100);
            } else if (this.isGrouped) {
              this.changeGroupingSelection();
            }
          }
        }, {
          key: "mergeSelectedGroups",
          value: function mergeSelectedGroups() {
            this.showMergeSelectedGroups = false; // store current threshold value to restore original groups when threshold is changed

            this.previousGroupThreshold = this.groupingThreshold;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.mergeSingleMetricGroups();
            } else {
              this.mergeMultipleMetricGroups();
            }

            this.mergeFocusGroupList();
            this.initialiseGroupsOverlapCount();
            this.drawOverview();
            this.drawSelectedGroupsMarkers();
            this.drawFocusGraph(false);
          }
        }, {
          key: "mergeSingleMetricGroups",
          value: function mergeSingleMetricGroups() {
            var _this39 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              var groupList = _this39.getCurrentSingleMetricGroupList(metric);

              if (!metric.originalGroupList) {
                metric.originalGroupList = [];
                groupList.forEach(function (group) {
                  metric.originalGroupList.push(group);
                });
              }

              _this39.mergeSelectedGroupsWrapper(groupList);
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
            var _this40 = this;

            var mergedGroup;
            currentGroupList.forEach(function (group) {
              if (group.isSelected) {
                if (mergedGroup) {
                  group.instanceList.forEach(function (instance) {
                    mergedGroup.instanceList.push(instance);
                  });
                } else {
                  mergedGroup = _this40.getCopyOfGroup(group);
                  groupList.push(mergedGroup);
                }
              } else {
                groupList.push(group);
              }
            });
          }
        }, {
          key: "getCopyOfGroup",
          value: function getCopyOfGroup(group) {
            var newGroup = {};
            newGroup.name = group.name;
            newGroup.metricIndex = group.metricIndex;
            newGroup.instanceList = group.instanceList;
            newGroup.total = group.total;
            newGroup.color = group.color;
            newGroup.isSelected = group.isSelected;
            newGroup.markerX = group.markerX;
            newGroup.y = group.y;
            return newGroup;
          }
        }, {
          key: "mergeFocusGroupList",
          value: function mergeFocusGroupList() {
            var _this41 = this;

            var oldFocusGroupList = this.currentTab.focusModel.groupList;
            this.currentTab.focusModel.groupList = [];

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this41.getCurrentSingleMetricGroupList(metric);

                _this41.mergeFocusGroupListWrapper(groupList);
              });
            } else {
              this.mergeFocusGroupListWrapper(this.getCurrentMultiMetricGroupList());
            }

            this.setMainMetricIndexAfterMerging(oldFocusGroupList);
          }
        }, {
          key: "mergeFocusGroupListWrapper",
          value: function mergeFocusGroupListWrapper(groupList) {
            var _this42 = this;

            groupList.forEach(function (group) {
              if (group.isSelected) {
                _this42.addGroupToFocus(group);
              }
            });
          }
        }, {
          key: "addGroupToFocus",
          value: function addGroupToFocus(group) {
            var _this43 = this;

            var focusGroup = {};
            focusGroup.instanceList = [];
            focusGroup.overviewGroup = group;
            focusGroup.mainMetricIndex = this.currentTab.overviewModel.selectedMetricIndex;
            group.instanceList.forEach(function (overviewInstance) {
              var length = 0;

              var metricWithMostData = _.maxBy(overviewInstance.metricList, function (metric) {
                return metric.data.length;
              });

              if (metricWithMostData) {
                length = metricWithMostData.data.length;
              }

              _this43.currentTab.focusModel.focusedIndexList = Array.from(Array(length).keys());

              var focusInstance = _this43.getFocusInstance(overviewInstance, _this43.currentTab.focusModel.focusedIndexList);

              focusGroup.instanceList.push(focusInstance);
            });
            this.currentTab.focusModel.groupList.push(focusGroup);
          }
        }, {
          key: "setMainMetricIndexAfterMerging",
          value: function setMainMetricIndexAfterMerging(oldFocusGroupList) {
            this.currentTab.focusModel.groupList.forEach(function (group) {
              var oldGroup = _.find(oldFocusGroupList, function (search) {
                return search.overviewGroup == group.overviewGroup;
              });

              if (oldGroup) {
                group = oldGroup.mainMetricIndex;
              }
            });
          }
        }, {
          key: "initialiseGroupsOverlapCount",
          value: function initialiseGroupsOverlapCount() {
            var _this44 = this;

            this.currentTab.overviewModel.selectedMetricIndexSet = new Set();
            this.currentTab.focusModel.groupList.forEach(function (group) {
              _this44.currentTab.overviewModel.selectedMetricIndexSet.add(group.overviewGroup.metricIndex);
            });
            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              var groupList = _this44.getCurrentSingleMetricGroupList(metric);

              groupList.forEach(function (group) {
                group.overlapCount = 0;

                if (_this44.currentTab.focusModel.groupList.length > 0) {
                  _this44.checkOverlappingGroupsAndSetOverlapCount(group);
                }
              });
            });
          }
        }, {
          key: "checkOverlappingGroupsAndSetOverlapCount",
          value: function checkOverlappingGroupsAndSetOverlapCount(group) {
            var _this45 = this;

            group.instanceList.forEach(function (instance) {
              var check = 0;

              _this45.currentTab.focusModel.groupList.forEach(function (overlappingGroup) {
                if (overlappingGroup.overviewGroup.metricIndex != group.metricIndex) {
                  var overlappingInstance = _.find(overlappingGroup.overviewGroup.instanceList, function (search) {
                    return search.instance == instance.instance;
                  });

                  if (overlappingInstance) {
                    ++check;
                  }
                }
              });

              if (group.isSelected) {
                if (check == _this45.currentTab.overviewModel.selectedMetricIndexSet.size - 1) {
                  ++group.overlapCount;
                }
              } else if (check == _this45.currentTab.overviewModel.selectedMetricIndexSet.size) {
                ++group.overlapCount;
              }
            });
          }
        }, {
          key: "mergeMultipleMetricGroups",
          value: function mergeMultipleMetricGroups() {
            var _this46 = this;

            var groupList = this.getCurrentMultiMetricGroupList();

            if (!this.currentTab.overviewModel.originalGroupList) {
              this.currentTab.overviewModel.originalGroupList = [];
              groupList.forEach(function (group) {
                _this46.currentTab.overviewModel.originalGroupList.push(group);
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

            if (this.currentTab.overviewModel.thresholdGroupListMap) {
              this.currentTab.overviewModel.thresholdGroupListMap.forEach(function (group) {
                group.timeRangeIndexList = [];
              });
            }

            if (this.currentTab.overviewModel.metricList) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
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
            } else if (this.isGrouped) {
              if (this.currentTab.overviewModel.hoveredGroup && this.timeHighlightMode == this.enumList.timeHighlightMode.RANGE) {
                this.currentTab.overviewModel.isSelectingTimeRange = true;
                this.currentTab.overviewModel.timeRangeStartOffset = this.currentTab.overviewModel.mousePositionXOffset;
                this.currentTab.overviewModel.timeRangeGroup = this.currentTab.overviewModel.hoveredGroup;
              }
            } else {
              this.currentTab.overviewModel.focusAreaStartPoint = {};
              this.focusInArea = false;
              var firstMetric = this.currentTab.overviewModel.metricList[0];
              this.currentTab.overviewModel.focusAreaStartPoint.x = Math.max(firstMetric.startX, this.currentTab.overviewModel.mousePositionXOffset - firstMetric.startX);
              this.currentTab.overviewModel.focusAreaStartPoint.y = this.currentTab.overviewModel.mousePosition.y;
              this.isDrawingFocusArea = true;
            }
          }
        }, {
          key: "drawHistogram",
          value: function drawHistogram() {
            var _this47 = this;

            this.histogramCanvasContext.clearRect(0, 0, this.histogramCanvas.width, this.histogramCanvas.height);
            this.currentTab.histogramModel.metric = this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.selectedMetricIndex];
            this.histogramMetric = this.panel.metricList[this.currentTab.overviewModel.selectedMetricIndex];
            this.scope.$watch("ctrl.histogramMetric.color", function (newValue, oldValue) {
              if (newValue != oldValue) {
                _this47.initialiseColorListByMetric(_this47.histogramMetric);

                _this47.initialiseColorMapByMetric(_this47.currentTab.histogramModel.metric, _this47.histogramMetric);

                _this47.drawHistogram();
              }
            });
            this.drawHistogramAxes();
            this.drawHistogramMaxValueAndOccurence();
            this.drawHistogramBars();
            this.drawHistogramThresholdSlider();
          }
        }, {
          key: "drawHistogramAxes",
          value: function drawHistogramAxes() {
            this.histogramCanvasContext.font = this.config.overview.metricFontSize + "px Arial";
            this.currentTab.histogramModel.verticalAxisStartY = this.currentTab.overviewModel.labelTextHeight + this.config.histogram.marginBetweenAxesAndNumbers;
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
            var verticalLabelWidth = this.histogramCanvasContext.measureText(occurences).width;
            var maxOccurenceWidth = this.histogramCanvasContext.measureText(this.currentTab.histogramModel.metric.histogram.max).width;
            this.currentTab.histogramModel.horizontalAxisStartX = maxOccurenceWidth + this.config.histogram.marginBetweenAxesAndNumbers;
            this.histogramCanvasContext.fillText("occurences", this.currentTab.histogramModel.horizontalAxisStartX - verticalLabelWidth / 2, this.currentTab.overviewModel.labelTextHeight);
            this.currentTab.histogramModel.horizontalAxisY = this.currentTab.histogramModel.verticalAxisStartY + this.config.histogram.verticalAxisLength;
            this.histogramCanvasContext.beginPath();
            this.histogramCanvasContext.moveTo(this.currentTab.histogramModel.horizontalAxisStartX, this.currentTab.histogramModel.verticalAxisStartY);
            this.histogramCanvasContext.lineTo(this.currentTab.histogramModel.horizontalAxisStartX, this.currentTab.histogramModel.horizontalAxisY);
            this.histogramCanvasContext.stroke();
            this.histogramCanvasContext.closePath();
          }
        }, {
          key: "drawHistogramHorizontalAxis",
          value: function drawHistogramHorizontalAxis() {
            this.currentTab.histogramModel.horizontalAxisEndX = this.currentTab.histogramModel.horizontalAxisStartX + this.config.histogram.barWidth * (this.currentTab.histogramModel.metric.max + 1);
            var labelX = this.currentTab.histogramModel.horizontalAxisEndX + this.config.histogram.marginBetweenAxesAndNumbers;
            var labelY = this.currentTab.histogramModel.horizontalAxisY + this.currentTab.overviewModel.labelTextHeight / 2;
            this.histogramCanvasContext.fillText(this.histogramMetric.unit, labelX, labelY);
            this.histogramCanvasContext.beginPath();
            this.histogramCanvasContext.moveTo(this.currentTab.histogramModel.horizontalAxisStartX, this.currentTab.histogramModel.horizontalAxisY);
            this.histogramCanvasContext.lineTo(this.currentTab.histogramModel.horizontalAxisEndX, this.currentTab.histogramModel.horizontalAxisY);
            this.histogramCanvasContext.stroke();
            this.histogramCanvasContext.closePath();
          }
        }, {
          key: "drawHistogramMaxValueAndOccurence",
          value: function drawHistogramMaxValueAndOccurence() {
            this.histogramCanvasContext.font = this.config.overview.metricFontSize + "px Arial";
            var occurenceLabelY = this.currentTab.histogramModel.verticalAxisStartY + this.currentTab.overviewModel.labelTextHeight / 2;
            this.histogramCanvasContext.fillText(this.currentTab.histogramModel.metric.histogram.max, 0, occurenceLabelY);
            var maxValueWidth = this.histogramCanvasContext.measureText(this.currentTab.histogramModel.metric.max).width;
            var valueLabelY = this.currentTab.histogramModel.horizontalAxisY + this.config.histogram.marginBetweenAxesAndNumbers + this.currentTab.overviewModel.labelTextHeight;
            this.histogramCanvasContext.fillText(this.currentTab.histogramModel.metric.max, this.currentTab.histogramModel.horizontalAxisEndX - maxValueWidth / 2, valueLabelY);
            var originX = this.currentTab.histogramModel.horizontalAxisStartX - this.currentTab.overviewModel.labelTextHeight - this.config.histogram.marginBetweenAxesAndNumbers;
            this.histogramCanvasContext.fillText(0, originX, valueLabelY);
          }
        }, {
          key: "drawHistogramBars",
          value: function drawHistogramBars() {
            var _this48 = this;

            var occurenceStep = this.config.histogram.verticalAxisLength / this.currentTab.histogramModel.metric.histogram.max;
            this.currentTab.histogramModel.metric.histogram.data.forEach(function (occurences, value) {
              _this48.histogramCanvasContext.fillStyle = _this48.getColorFromMap(value, _this48.currentTab.histogramModel.metric.colorMap);
              var x = _this48.currentTab.histogramModel.horizontalAxisStartX + _this48.config.histogram.barWidth * value;
              var y = _this48.currentTab.histogramModel.horizontalAxisY - occurenceStep * occurences;
              var height = _this48.currentTab.histogramModel.horizontalAxisY - y;
              var minHeight = _this48.config.histogram.minimumBarHeight;

              if (height < minHeight) {
                y = _this48.currentTab.histogramModel.horizontalAxisY - minHeight;
                height = minHeight;
              }

              _this48.histogramCanvasContext.fillRect(x, y, _this48.config.histogram.barWidth, height);
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
            this.currentTab.histogramModel.sliderY = this.currentTab.histogramModel.horizontalAxisY + this.config.histogram.marginBetweenSliderAndChart;
            this.histogramCanvasContext.beginPath();
            this.histogramCanvasContext.moveTo(this.currentTab.histogramModel.horizontalAxisStartX, this.currentTab.histogramModel.sliderY);
            this.histogramCanvasContext.lineTo(this.currentTab.histogramModel.horizontalAxisEndX, this.currentTab.histogramModel.sliderY);
            this.histogramCanvasContext.stroke();
            this.histogramCanvasContext.closePath();
          }
        }, {
          key: "drawHistogramThresholdBars",
          value: function drawHistogramThresholdBars() {
            var _this49 = this;

            var thresholdBarY = this.currentTab.histogramModel.sliderY - this.config.histogram.thresholdBarLength / 2;
            this.currentTab.histogramModel.thresholdBarList = [];
            var i = 0;
            this.currentTab.histogramModel.metric.colorMap.forEach(function (color, threshold) {
              var bar = {};
              bar.threshold = threshold;
              bar.x = _this49.currentTab.histogramModel.horizontalAxisStartX + _this49.config.histogram.barWidth * (threshold.max + 1); // no need to draw slider bar for last threshold

              if (i < _this49.currentTab.histogramModel.metric.colorMap.size - 1) {
                _this49.histogramCanvasContext.beginPath();

                _this49.histogramCanvasContext.moveTo(bar.x, thresholdBarY);

                _this49.histogramCanvasContext.lineTo(bar.x, thresholdBarY + _this49.config.histogram.thresholdBarLength);

                _this49.histogramCanvasContext.stroke();

                _this49.histogramCanvasContext.closePath();

                ++i;
              }

              _this49.currentTab.histogramModel.thresholdBarList.push(bar);
            });
          }
        }, {
          key: "selectTab",
          value: function selectTab(tab) {
            this.currentTab = tab;
            this.showMergeSelectedGroups = false;
            this.waitForTabProcessingToFinish(tab);
          }
        }, {
          key: "waitForTabProcessingToFinish",
          value: function waitForTabProcessingToFinish(tab) {
            var _this50 = this;

            if (this.currentTab == tab) {
              if (this.currentTab.isClustering) {
                this.$timeout(function () {
                  _this50.waitForTabProcessingToFinish(tab);
                }, 100);
              } else {
                this.$timeout(function () {
                  _this50.drawOverview();

                  _this50.drawSelectedGroupsMarkers();

                  _this50.drawFocusGraph();

                  _this50.$timeout(function () {
                    if (_this50.timeHighlightMode == _this50.enumList.timeHighlightMode.POINT) {
                      _this50.drawTimeIndicators();
                    } else {
                      _this50.drawSelectedTimeRanges();
                    }
                  });
                });
              }

              ;
            }
          }
        }, {
          key: "removeTab",
          value: function removeTab(tab) {
            _.remove(this.tabList, function (search) {
              return search == tab;
            });

            if (this.currentTab == tab) {
              this.selectTab(this.tabList[0]);
            }
          }
        }, {
          key: "moveMouseOnOverview",
          value: function moveMouseOnOverview(evt) {
            if (this.currentTab.overviewModel.metricList) {
              this.setOverviewMousePosition(evt);
              this.setSelectedMetricIndex();

              if (this.currentTab.overviewModel.selectedMetricIndex > -1) {
                // check if mouse is on metric label
                var bottomY = this.currentTab.overviewModel.overviewStartY - this.config.overview.marginBetweenLabelsAndOverview;

                if (this.isBetween(this.currentTab.overviewModel.mousePosition.y, 0, bottomY)) {
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
              } else if (this.currentTab.overviewModel.selectedMetricIndex > -1) {
                if (this.isDrawingFocusArea) {
                  this.drawFocusArea();
                } else if (!this.focusAreaIsFixed) {
                  this.clearFocusArea();
                  this.drawFocus();
                }
              }
            } else {
              this.deselectMetricLabel();
            }
          }
        }, {
          key: "setOverviewMousePosition",
          value: function setOverviewMousePosition(evt) {
            this.currentTab.overviewModel.mousePosition = this.getMousePos(evt, this.focusAreaCanvas);
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
            this.currentTab.overviewModel.selectedMetricIndex = -1;

            for (var metricIndex = 0; metricIndex < this.currentTab.overviewModel.metricList.length; ++metricIndex) {
              var metric = this.currentTab.overviewModel.metricList[metricIndex];

              if (metric) {
                // only check if mouse is on a metric graph
                if (this.checkMouseIsInMetric(metric)) {
                  this.currentTab.overviewModel.selectedMetricIndex = metricIndex; // set x position of mouse per overview graph for easier manipulation with mouse positions

                  this.currentTab.overviewModel.mousePositionXOffset = this.currentTab.overviewModel.mousePosition.x - metric.startX + this.currentTab.overviewModel.metricList[0].startX;
                  break;
                }
              }
            }
          }
        }, {
          key: "checkMouseIsInMetric",
          value: function checkMouseIsInMetric(metric) {
            return this.isBetween(this.currentTab.overviewModel.mousePosition.x, metric.startX, metric.endX);
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
            this.currentTab.overviewModel.hoveredGroup = null;
            this.currentTab.overviewModel.hoveredMarker = null;

            if (this.currentTab.overviewModel.isSelectingTimeRange) {
              this.initialiseSelectedGroupTimeRangeIndexList();
              this.initialiseGroupsOverlapCount();
              this.drawSelectedTimeRanges();
              this.drawFocusGraph(false);
            } else {
              this.checkAndSetSelectedOverviewMarker();

              if (this.currentTab.overviewModel.selectedMetricIndex >= 0) {
                this.checkAndSetHoveredGroup();
                this.checkMouseIsOnTimeRange();
              }

              if (this.currentTab.overviewModel.isHoveringOnTimeRange) {
                this.overviewCursor = "pointer";
              }

              if (this.timeHighlightMode == this.enumList.timeHighlightMode.POINT) {
                this.setSelectedTimeIndexAndDrawTimeIndicators();
              }
            }
          }
        }, {
          key: "checkAndSetSelectedOverviewMarker",
          value: function checkAndSetSelectedOverviewMarker() {
            for (var markerIndex = 0; markerIndex < this.currentTab.overviewModel.groupMarkerList.length; ++markerIndex) {
              var marker = this.currentTab.overviewModel.groupMarkerList[markerIndex];

              if (this.isBetween(this.currentTab.overviewModel.mousePosition.x, marker.startX, marker.endX) && this.isBetween(this.currentTab.overviewModel.mousePosition.y, marker.startY, marker.endY)) {
                this.setOverviewCursorToPointer();
                this.currentTab.overviewModel.hoveredMarker = marker;
                return;
              }
            }
          }
        }, {
          key: "checkAndSetHoveredGroup",
          value: function checkAndSetHoveredGroup() {
            var groupList;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              var metric = this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.selectedMetricIndex];
              groupList = this.getCurrentSingleMetricGroupList(metric);
            } else {
              groupList = this.getCurrentMultiMetricGroupList();
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
            if (this.isBetween(this.currentTab.overviewModel.mousePosition.y, group.y, group.y + this.config.overview.groupedPointHeight)) {
              this.currentTab.overviewModel.hoveredGroup = group;
              this.setOverviewCursorToPointer();
              return true;
            }
          }
        }, {
          key: "setSelectedTimeIndexAndDrawTimeIndicators",
          value: function setSelectedTimeIndexAndDrawTimeIndicators() {
            if (this.currentTab.overviewModel.hoveredGroup) {
              if (this.isCompressed && this.groupingMode == this.enumList.groupingMode.MULTIPLE) {
                this.setSelectedTimeIndex();
              }

              this.drawTimeIndicators();
            } else {
              this.clearTimeIndicator();
            }
          }
        }, {
          key: "setSelectedTimeIndex",
          value: function setSelectedTimeIndex() {
            var overviewMetric = this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.selectedMetricIndex];
            var groupList = this.getCurrentMultiMetricGroupList();

            for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
              var instanceMetric = groupList[groupIndex].instanceList[0].metricList[this.currentTab.overviewModel.selectedMetricIndex];

              for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                var pointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];
                var point = instanceMetric.data[pointIndex];

                if (point) {
                  if (this.checkDataPointIsSelected(point)) {
                    this.currentTab.overviewModel.selectedTimeIndex = pointIndex;
                    return;
                  }
                }
              }
            }
          }
        }, {
          key: "checkDataPointIsSelected",
          value: function checkDataPointIsSelected(point) {
            return this.isBetween(this.currentTab.overviewModel.mousePosition.x, point.x, point.x + this.currentTab.overviewModel.pointWidth);
          }
        }, {
          key: "drawTimeIndicators",
          value: function drawTimeIndicators() {
            var _this51 = this;

            this.clearTimeIndicator();
            this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.drawTimeIndicatorWrapper(this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.selectedMetricIndex]);
            } else {
              this.currentTab.overviewModel.metricList.forEach(function (metric, metricIndex) {
                _this51.drawTimeIndicatorWrapper(metric, metricIndex);
              });
            }

            this.drawSelectedTimeLabel();
          }
        }, {
          key: "drawTimeIndicatorWrapper",
          value: function drawTimeIndicatorWrapper(overviewMetric, metricIndex) {
            var horizontalLineY = this.drawHorizontalTimeLine(overviewMetric, this.currentTab.overviewModel.hoveredGroup);
            var verticalLineX;

            if (this.isCompressed && this.groupingMode == this.enumList.groupingMode.MULTIPLE && metricIndex != null && metricIndex != this.currentTab.overviewModel.selectedMetricIndex) {
              verticalLineX = this.getTimeIndicatorXForNonSelectedMetric(overviewMetric, metricIndex);
            } else {
              verticalLineX = overviewMetric.startX + this.currentTab.overviewModel.mousePositionXOffset - this.currentTab.overviewModel.metricList[0].startX;
            }

            this.drawSelectedTimePoint(overviewMetric, horizontalLineY, verticalLineX);
          }
        }, {
          key: "getTimeIndicatorXForNonSelectedMetric",
          value: function getTimeIndicatorXForNonSelectedMetric(overviewMetric, metricIndex) {
            var previousPointIndex = 0;

            for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
              var currentPointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];

              if (this.isBetween(this.currentTab.overviewModel.selectedTimeIndex, previousPointIndex, currentPointIndex)) {
                var groupList = this.getCurrentMultiMetricGroupList();

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
            this.overviewTimeIndicatorContext.lineTo(verticalLineX, this.currentTab.overviewModel.hoveredGroup.y);
            this.overviewTimeIndicatorContext.stroke();
            this.overviewTimeIndicatorContext.closePath();
          }
        }, {
          key: "drawSelectedTimeLabel",
          value: function drawSelectedTimeLabel() {
            for (var metricIndex = 0; metricIndex < this.currentTab.overviewModel.metricList.length; ++metricIndex) {
              var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex]; // some groups are empty -> need to iterate through group list until find one that isn't

              var groupList = this.getCurrentSingleMetricGroupList(overviewMetric);

              for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
                var instanceMetric = groupList[groupIndex].instanceList[0].metricList[metricIndex];

                if (this.isCompressed) {
                  for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                    var point = instanceMetric.data[overviewMetric.compressedTimeIndexList[compressedTimeIndex]];

                    if (point) {
                      if (this.checkDataPointIsSelectedAndDrawTimeLabel(point, overviewMetric)) {
                        return;
                      }
                    }
                  }
                } else {
                  for (var pointIndex = 0; pointIndex < instanceMetric.data.length; ++pointIndex) {
                    var point = instanceMetric.data[pointIndex];

                    if (this.checkDataPointIsSelectedAndDrawTimeLabel(point, overviewMetric)) {
                      return;
                    }
                  }
                }
              }
            }
          }
        }, {
          key: "checkDataPointIsSelectedAndDrawTimeLabel",
          value: function checkDataPointIsSelectedAndDrawTimeLabel(point, metric) {
            if (this.checkDataPointIsSelected(point)) {
              this.overviewTimeIndicatorContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
              this.overviewTimeIndicatorContext.fillStyle = "black";
              var date = this.convertDateToString(point.date);
              var y = metric.timeLabelY + this.config.overview.marginBetweenLabelsAndOverview;
              var x = Math.max(0, this.currentTab.overviewModel.mousePosition.x - this.currentTab.overviewModel.toDateWidth / 2);
              this.overviewTimeIndicatorContext.fillText(date, x, y);
              return true;
            } else {
              return false;
            }
          }
        }, {
          key: "checkMouseIsOnTimeRange",
          value: function checkMouseIsOnTimeRange() {
            var _this52 = this;

            this.currentTab.overviewModel.isHoveringOnTimeRange = false;
            this.currentTab.overviewModel.mouseIsInsideTimeRange = false;
            this.currentTab.overviewModel.hoveredTimeRangeGroup = null;
            this.currentTab.overviewModel.timeRangePositionMap.forEach(function (position, group) {
              if (_this52.currentTab.overviewModel.selectedMetricIndex == group.metricIndex && _this52.isBetween(_this52.currentTab.overviewModel.mousePosition.y, position.startY, group.y)) {
                _this52.currentTab.overviewModel.isHoveringOnTimeRange = true;
                _this52.currentTab.overviewModel.hoveredTimeRangeGroup = group;

                if (_this52.isBetween(_this52.currentTab.overviewModel.mousePosition.x, position.startX, position.endX)) {
                  _this52.currentTab.overviewModel.mouseIsInsideTimeRange = true;
                }
              }
            });
          }
        }, {
          key: "initialiseSelectedGroupTimeRangeIndexList",
          value: function initialiseSelectedGroupTimeRangeIndexList() {
            var _this53 = this;

            if (!this.currentTab.overviewModel.timeRangeGroup.isSelected) {
              this.addOrRemoveGroupToFocus(this.currentTab.overviewModel.timeRangeGroup, false);
              this.drawOverview();
              this.drawSelectedGroupsMarkers();
            }

            this.currentTab.overviewModel.timeRangeGroup.timeRangeIndexList = [];
            var metricIndex = this.currentTab.overviewModel.selectedMetricIndex;
            var instanceMetric = this.currentTab.overviewModel.timeRangeGroup.instanceList[0].metricList[metricIndex];
            var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex];
            var startX = overviewMetric.startX + this.currentTab.overviewModel.timeRangeStartOffset - this.currentTab.overviewModel.metricList[0].startX;
            var firstMetric = this.currentTab.overviewModel.metricList[0];
            var endX = overviewMetric.startX + this.currentTab.overviewModel.mousePositionXOffset - firstMetric.startX;

            if (startX > endX) {
              var temp = startX;
              startX = endX;
              endX = temp;
            }

            instanceMetric.data.forEach(function (point, pointIndex) {
              if (_this53.isBetween(point.x, startX, endX)) {
                _this53.currentTab.overviewModel.timeRangeGroup.timeRangeIndexList.push(pointIndex);
              }
            });

            if (this.currentTab.overviewModel.timeRangeGroup.timeRangeIndexList.length > 0) {
              this.setTimeRangeStartAndEndDate();
            }
          }
        }, {
          key: "setTimeRangeStartAndEndDate",
          value: function setTimeRangeStartAndEndDate() {
            var timeRangeGroup = this.currentTab.overviewModel.timeRangeGroup;
            var metric = timeRangeGroup.instanceList[0].metricList[this.currentTab.overviewModel.selectedMetricIndex];
            var timeRangeIndexList = timeRangeGroup.timeRangeIndexList;
            var startPoint = metric.data[timeRangeIndexList[0]];
            timeRangeGroup.startTimeRangeDate = this.convertDateToString(startPoint.date);
            var endPoint = metric.data[timeRangeIndexList[timeRangeIndexList.length - 1]];
            timeRangeGroup.endTimeRangeDate = this.convertDateToString(endPoint.date);
          }
        }, {
          key: "drawSelectedTimeRanges",
          value: function drawSelectedTimeRanges() {
            var _this54 = this;

            this.clearTimeIndicator();
            this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;
            this.overviewTimeIndicatorContext.fillStyle = this.config.timeIndicator.color;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this54.getCurrentSingleMetricGroupList(metric);

                groupList.forEach(function (group) {
                  _this54.drawSelectedTimeRangeWrapper(group, [group.metricIndex]);
                });
              });
            } else {
              var groupList = this.getCurrentMultiMetricGroupList();
              groupList.forEach(function (group) {
                _this54.drawSelectedTimeRangeWrapper(group, Array.from(Array(_this54.currentTab.overviewModel.metricList.length).keys()));
              });
            }
          }
        }, {
          key: "drawSelectedTimeRangeWrapper",
          value: function drawSelectedTimeRangeWrapper(group, metricIndexList) {
            var _this55 = this;

            if (group.timeRangeIndexList && group.timeRangeIndexList.length > 0) {
              metricIndexList.forEach(function (metricIndex) {
                var instanceMetric = group.instanceList[0].metricList[metricIndex];
                var overviewMetric = _this55.currentTab.overviewModel.metricList[metricIndex];
                var startPoint, endPoint;
                var startRangeIndex = group.timeRangeIndexList[0];
                var endRangeIndex = group.timeRangeIndexList[group.timeRangeIndexList.length - 1];

                if (_this55.isCompressed && metricIndex != group.metricIndex) {
                  var previousPointIndex = 0;

                  var groupList = _this55.getCurrentMultiMetricGroupList();

                  for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                    var currentPointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];

                    if (_this55.isBetween(startRangeIndex, previousPointIndex, currentPointIndex)) {
                      startPoint = _this55.getTimeRangePointWrapper(previousPointIndex, groupList, metricIndex);
                    }

                    if (_this55.isBetween(endRangeIndex, previousPointIndex, currentPointIndex)) {
                      endPoint = _this55.getTimeRangePointWrapper(currentPointIndex, groupList, metricIndex);
                    }

                    previousPointIndex = currentPointIndex;
                  }
                } else {
                  startPoint = instanceMetric.data[startRangeIndex];
                  endPoint = instanceMetric.data[endRangeIndex];
                }

                if (startPoint) {
                  _this55.drawSelectedTimeRangeLines(overviewMetric, group, startPoint, endPoint);
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
            var endX = endPoint.x + this.currentTab.overviewModel.pointWidth;
            var width = endX - startX;
            var height = group.y - startY;

            if (group.overlapCount > 0 || this.currentTab.focusModel.groupList.length == 1) {
              this.overviewTimeIndicatorContext.fillRect(startX, startY, width, height);
            } else {
              this.drawSelectedTimeRangeVerticalLine(startX, startY, group.y);
              this.drawSelectedTimeRangeVerticalLine(endX, startY, group.y);
            }

            var position = {
              startX: startX,
              endX: endX,
              startY: startY
            };
            this.currentTab.overviewModel.timeRangePositionMap.set(group, position);
          }
        }, {
          key: "drawSelectedTimeRangeVerticalLine",
          value: function drawSelectedTimeRangeVerticalLine(x, startY, endY) {
            this.overviewTimeIndicatorContext.beginPath();
            this.overviewTimeIndicatorContext.moveTo(x, startY);
            this.overviewTimeIndicatorContext.lineTo(x, endY);
            this.overviewTimeIndicatorContext.stroke();
            this.overviewTimeIndicatorContext.closePath();
          }
        }, {
          key: "drawFocusArea",
          value: function drawFocusArea() {
            this.initialiseFocusAreaPoints();

            if (this.currentTab.focusAreaModel.startX != this.currentTab.focusAreaModel.endX && this.currentTab.focusAreaModel.startY != this.currentTab.focusAreaModel.endY) {
              this.focusInArea = true;
              this.focusAreaIsFixed = false;
              this.drawFocusAreaSquare();
            } else {
              this.focusInArea = false;
            }
          }
        }, {
          key: "initialiseFocusAreaPoints",
          value: function initialiseFocusAreaPoints() {
            var firstMetric = this.currentTab.overviewModel.metricList[0];
            this.currentTab.focusAreaModel.startX = this.currentTab.overviewModel.focusAreaStartPoint.x;
            this.currentTab.focusAreaModel.endX = this.currentTab.overviewModel.mousePositionXOffset - firstMetric.startX;

            if (this.currentTab.focusAreaModel.startX > this.currentTab.overviewModel.mousePositionXOffset) {
              this.currentTab.focusAreaModel.startX = this.currentTab.overviewModel.mousePositionXOffset;
              this.currentTab.focusAreaModel.endX = this.currentTab.overviewModel.focusAreaStartPoint.x;
            }

            this.currentTab.focusAreaModel.startY = this.currentTab.overviewModel.focusAreaStartPoint.y;
            this.currentTab.focusAreaModel.endY = this.currentTab.overviewModel.mousePosition.y;

            if (this.currentTab.focusAreaModel.startY > this.currentTab.overviewModel.mousePosition.y) {
              this.currentTab.focusAreaModel.startY = this.currentTab.overviewModel.mousePosition.y;
              this.currentTab.focusAreaModel.endY = this.currentTab.overviewModel.focusAreaStartPoint.y;
            }

            this.currentTab.focusAreaModel.startX = Math.max(this.currentTab.focusAreaModel.startX, firstMetric.startX);
            this.currentTab.focusAreaModel.endX = Math.min(this.currentTab.focusAreaModel.endX, firstMetric.endX);
            this.currentTab.focusAreaModel.startY = Math.max(this.currentTab.focusAreaModel.startY, this.currentTab.overviewModel.overviewStartY);
            this.currentTab.focusAreaModel.endY = Math.min(this.currentTab.focusAreaModel.endY, this.currentTab.overviewModel.overviewEndY);
          }
        }, {
          key: "drawFocusAreaSquare",
          value: function drawFocusAreaSquare() {
            var _this56 = this;

            this.clearFocusArea();
            this.focusAreaContext.strokeStyle = this.config.focusArea.color;
            var width = this.currentTab.focusAreaModel.endX - this.currentTab.focusAreaModel.startX;
            var height = this.currentTab.focusAreaModel.endY - this.currentTab.focusAreaModel.startY;
            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              _this56.focusAreaContext.strokeRect(metric.startX + _this56.currentTab.focusAreaModel.startX, _this56.currentTab.focusAreaModel.startY, width, height);
            });
          }
        }, {
          key: "mouseUpOnOverView",
          value: function mouseUpOnOverView() {
            if (this.isGrouped) {
              if (this.currentTab.overviewModel.hoveredMarker) {
                this.startFocusMarkerInterval(this.currentTab.overviewModel.hoveredMarker.group);
              } else if (this.currentTab.overviewModel.isHoveringOnTimeRange) {
                if (this.currentTab.overviewModel.mouseIsInsideTimeRange && this.currentTab.overviewModel.hoveredTimeRangeGroup.overlapCount > 0) {
                  this.addNewTab();
                  this.selectTab(this.currentTab);
                } else {
                  this.currentTab.overviewModel.hoveredTimeRangeGroup.timeRangeIndexList = null;
                  this.drawSelectedTimeRanges();
                  this.drawFocusGraph(false);
                }
              } else {
                this.updateSelectedGroupListAndDrawFocusGraph(false);
              }

              this.currentTab.overviewModel.isHoveringOnTimeRange = false;
              this.currentTab.overviewModel.isSelectingTimeRange = false;
            } else {
              if (this.isDrawingFocusArea) {
                this.drawFocusGraph(false);
                this.isDrawingFocusArea = false;
              }

              this.focusAreaIsFixed = !this.focusAreaIsFixed;
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

                if (this.currentTab.focusModel.overviewGroupWithIntervalList) {
                  this.currentTab.focusModel.overviewGroupWithIntervalList.forEach(function (overviewGroup) {
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
            var _this57 = this;

            this.focusMarkerMovingBackwards = false;
            this.focusGroupWithInterval.focusMarkerX = 0;
            this.currentFocusMarkerInterval = this.$interval(function () {
              if (_this57.focusMarkerMovingBackwards) {
                _this57.handleFocusMarkerMovingBackwardCase();
              } else {
                _this57.handleFocusMarkerMovingForwardCase();
              }

              _this57.drawGroupFocusMarkers();
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
          key: "addNewTab",
          value: function addNewTab() {
            var _this58 = this;

            var newTab = this.initialiseNewTab();
            this.initialiseNewTabDatesAndData(newTab);
            newTab.overviewModel.metricList.forEach(function (newMetric, metricIndex) {
              var oldMetric = _this58.currentTab.overviewModel.metricList[metricIndex];
              newMetric.layerRange = oldMetric.layerRange;
              newMetric.colorMap = oldMetric.colorMap;
            });
            this.currentTab = newTab;
            this.initialiseOverviewData();
            this.initialiseOverviewGroups();
            this.initialiseCompressedTimeIndexes();
          }
        }, {
          key: "initialiseNewTabDatesAndData",
          value: function initialiseNewTabDatesAndData(newTab) {
            var timeRangeGroupList = this.getTimeRangeGroupList();
            this.initialiseNewTabDates(newTab, timeRangeGroupList);
            this.initialiseNewTabData(newTab);
          }
        }, {
          key: "getTimeRangeGroupList",
          value: function getTimeRangeGroupList() {
            var _this59 = this;

            var timeRangeGroupList = [];
            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              var groupList = _this59.getCurrentSingleMetricGroupList(metric);

              groupList.forEach(function (group) {
                if (group.timeRangeIndexList && group.timeRangeIndexList.length > 0) {
                  timeRangeGroupList.push(group);
                }
              });
            });
            return timeRangeGroupList;
          }
        }, {
          key: "initialiseNewTabDates",
          value: function initialiseNewTabDates(newTab, timeRangeGroupList) {
            newTab.fromDate = -1;
            newTab.toDate = -1;
            timeRangeGroupList.forEach(function (group) {
              var timeRangeIndexList = group.timeRangeIndexList;
              var metric = group.instanceList[0].metricList[group.metricIndex];
              var fromDate = metric.data[timeRangeIndexList[0]].date;
              var toDate = metric.data[timeRangeIndexList[timeRangeIndexList.length - 1]].date;

              if (newTab.fromDate == -1 || newTab.fromDate > fromDate) {
                newTab.fromDate = fromDate;
              }

              if (newTab.toDate == -1 || newTab.toDate < toDate) {
                newTab.toDate = toDate;
              }
            });
            newTab.fromDateString = this.convertDateToString(newTab.fromDate);
            newTab.toDateString = this.convertDateToString(newTab.toDate);
          }
        }, {
          key: "initialiseNewTabData",
          value: function initialiseNewTabData(newTab) {
            var _this60 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              var newMetric = {};
              newMetric.data = [];
              metric.data.forEach(function (metricInstance) {
                if (_this60.checkInstanceIsInOverlapList(metricInstance)) {
                  var newMetricInstance = {};
                  newMetricInstance.metric = metricInstance.metric;
                  newMetricInstance.values = [];
                  metricInstance.values.forEach(function (value) {
                    var date = value[0];

                    if (_this60.isBetween(date, newTab.fromDate, newTab.toDate)) {
                      newMetricInstance.values.push(value);
                    }
                  });
                  newMetric.data.push(newMetricInstance);
                }
              });
              newTab.overviewModel.metricList.push(newMetric);
            });
          }
        }, {
          key: "checkInstanceIsInOverlapList",
          value: function checkInstanceIsInOverlapList(instance) {
            for (var i = 0; i < this.currentTab.focusModel.overlappingList.length; ++i) {
              var overlappingInstance = this.currentTab.focusModel.overlappingList[i];

              if (instance.metric.instance == overlappingInstance.instance) {
                return true;
              }
            }

            return false;
          }
        }, {
          key: "updateSelectedGroupListAndDrawFocusGraph",
          value: function updateSelectedGroupListAndDrawFocusGraph() {
            var updatedSelectedGroups = false;

            if (this.currentTab.overviewModel.isSelectingTimeRange) {
              var removeExisting = this.currentTab.overviewModel.timeRangeStartOffset == this.currentTab.overviewModel.mousePositionXOffset;
              this.addOrRemoveGroupToFocus(this.currentTab.overviewModel.timeRangeGroup, removeExisting);
              updatedSelectedGroups = true;
            } else if (this.currentTab.overviewModel.hoveredGroup) {
              this.addOrRemoveGroupToFocus(this.currentTab.overviewModel.hoveredGroup, true);
              updatedSelectedGroups = true;
            } else {
              this.stopInterval();
            }

            if (updatedSelectedGroups) {
              this.drawFocusAfterUpdatingSelectedGroups();
            }
          }
        }, {
          key: "removeExistingGroupsInMetricByGroup",
          value: function removeExistingGroupsInMetricByGroup(group) {
            _.remove(this.currentTab.focusModel.groupList, function (search) {
              search.overviewGroup.metricIndex == group.metricIndex && search.overviewGroup != group;
            });

            var groupList = this.getCurrentSingleMetricGroupList(this.currentTab.overviewModel.metricList[group.metricIndex]);

            if (groupList) {
              groupList.forEach(function (existingGroup) {
                if (existingGroup != group) {
                  existingGroup.isSelected = false;
                  existingGroup.timeRangeIndexList = null;
                }
              });
            }
          }
        }, {
          key: "drawFocusAfterUpdatingSelectedGroups",
          value: function drawFocusAfterUpdatingSelectedGroups() {
            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.initialiseGroupsOverlapCount();
              this.initialiseOverlapList();
              this.drawOverview();
            }

            this.drawSelectedGroupsMarkers();
            this.drawFocusGraph(false);
            this.drawOverlapDetails();

            if (this.timeHighlightMode == this.enumList.timeHighlightMode.RANGE) {
              this.drawSelectedTimeRanges();
            }
          }
        }, {
          key: "initialiseOverlapList",
          value: function initialiseOverlapList() {
            var _this61 = this;

            this.currentTab.focusModel.overlappingList = [];
            var metricIndex = this.currentTab.overviewModel.selectedMetricIndexSet.values().next().value;
            var instanceList = this.getAllInstanceListForSelectedMetric(metricIndex);
            instanceList.forEach(function (instance) {
              _this61.checkAndAddOverlappingInstance(metricIndex, instance);
            });
          }
        }, {
          key: "getAllInstanceListForSelectedMetric",
          value: function getAllInstanceListForSelectedMetric(metricIndex) {
            var instanceList = [];
            this.currentTab.focusModel.groupList.forEach(function (group) {
              if (group.overviewGroup.metricIndex == metricIndex) {
                instanceList = instanceList.concat(group.instanceList);
              }
            });
            return instanceList;
          }
        }, {
          key: "checkAndAddOverlappingInstance",
          value: function checkAndAddOverlappingInstance(metricIndex, instance) {
            var check = 0;
            this.currentTab.focusModel.groupList.forEach(function (group) {
              if (group.overviewGroup.metricIndex != metricIndex) {
                var overlappingInstance = _.find(group.instanceList, function (search) {
                  return search.instance == instance.instance;
                });

                if (overlappingInstance) {
                  ++check;
                }
              }
            });

            if (check == this.currentTab.overviewModel.selectedMetricIndexSet.size - 1) {
              this.currentTab.focusModel.overlappingList.push(instance);
            }
          }
        }, {
          key: "drawOverlapDetails",
          value: function drawOverlapDetails() {
            var _this62 = this;

            if (this.showOverlapDetails) {
              this.$timeout(function () {
                _this62.overlapGraphHeight = _this62.currentTab.focusModel.groupList.length * _this62.config.focusGraph.metricMaxHeight + (_this62.currentTab.focusModel.groupList.length - 1) * _this62.config.focusGraph.marginBetweenMetrics;

                _this62.scope.$apply();

                var metricIndexList = [];

                _this62.currentTab.focusModel.groupList.forEach(function (group) {
                  metricIndexList.push(group.overviewGroup.metricIndex);
                });

                _this62.currentTab.focusModel.overlappingList.forEach(function (instance, instanceIndex) {
                  _this62.drawOverlapInstance(instance, instanceIndex, metricIndexList);
                });
              });
            }
          }
        }, {
          key: "drawOverlapInstance",
          value: function drawOverlapInstance(instance, instanceIndex, metricIndexList) {
            var canvas = this.getElementByID("focusGraphOverlapCanvas-" + instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);
            var valueIndexList = Array.from(Array(this.getMaxMetricLength()).keys());
            var metricList = [];
            metricIndexList.forEach(function (metricIndex) {
              metricList.push(instance.metricList[metricIndex]);
            });
            this.drawFocusGraphInstance(context, valueIndexList, this.currentTab.focusModel.pointWidth, metricList, metricIndexList);
          }
        }, {
          key: "drawFocus",
          value: function drawFocus() {
            for (var i = 0; i < this.currentTab.overviewModel.metricList.length; ++i) {
              var metric = this.currentTab.overviewModel.metricList[i];

              if (metric) {
                // only update focus graph if mouse is pointing on one of metric overview graphs
                if (this.checkMouseIsInMetric(metric)) {
                  this.drawFocusGraph(true);
                  break;
                }
              }
            }
          }
        }, {
          key: "initialiseFocusGraphData",
          value: function initialiseFocusGraphData() {
            var _this63 = this;

            if (!this.currentTab.focusModel.data) {
              this.currentTab.focusModel.data = [];
            }

            this.currentTab.focusModel.data.length = 0;
            var topY = Math.max(0, this.currentTab.overviewModel.mousePosition.y - this.config.overview.selectedInstancesForFocusOffset);
            var bottomY = Math.min(this.currentTab.overviewModel.overviewEndY, this.currentTab.overviewModel.mousePosition.y + this.config.overview.selectedInstancesForFocusOffset);

            if (this.focusInArea) {
              topY = this.currentTab.focusAreaModel.startY;
              bottomY = this.currentTab.focusAreaModel.endY;
            }

            this.currentTab.overviewModel.data.forEach(function (overviewInstance) {
              if (_this63.isBetween(overviewInstance.y, topY, bottomY)) {
                _this63.currentTab.focusModel.focusedIndexList = _this63.getIndexesOfPointsInFocus(overviewInstance);

                var focusInstance = _this63.getFocusInstance(overviewInstance, _this63.currentTab.focusModel.focusedIndexList);

                _this63.currentTab.focusModel.data.push(focusInstance);
              }
            });
          }
        }, {
          key: "getIndexesOfPointsInFocus",
          value: function getIndexesOfPointsInFocus(overviewInstance) {
            var _this64 = this;

            var indexes = [];

            for (var metricIndex = 0; metricIndex < overviewInstance.metricList.length; ++metricIndex) {
              var instanceMetric = overviewInstance.metricList[metricIndex];

              if (instanceMetric.data.length > 0) {
                var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex];
                var leftX = Math.max(overviewMetric.startX, this.currentTab.overviewModel.mousePositionXOffset - this.config.overview.selectedInstancesForFocusOffset);
                var rightX = Math.min(overviewMetric.endX, this.currentTab.overviewModel.mousePositionXOffset + this.config.overview.selectedInstancesForFocusOffset);

                if (this.focusInArea) {
                  leftX = overviewMetric.startX + this.currentTab.focusAreaModel.startX;
                  rightX = overviewMetric.startX + this.currentTab.focusAreaModel.endX;
                }

                instanceMetric.data.forEach(function (point, index) {
                  if (_this64.isBetween(point.x, leftX, rightX)) {
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
            focusInstance.overviewInstance = overviewInstance;
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
            this.currentTab.overviewModel.metricList.forEach(function (metric, metricIndex) {
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
            var _this65 = this;

            instance.metricList.forEach(function (instanceMetric, metricIndex) {
              for (var i = 0; i < _this65.config.colorCount; ++i) {
                var layer = {};
                layer.valueList = [];
                instanceMetric.layerList.push(layer);
              }

              var overviewMetric = _this65.currentTab.overviewModel.metricList[metricIndex];
              instanceMetric.data.forEach(function (point) {
                var value = point.value;
                var colorList = _this65.panel.metricList[metricIndex].colorList;
                instanceMetric.layerList.forEach(function (layer, layerIndex) {
                  overviewMetric.colorMap.forEach(function (color, threshold) {
                    if (color == colorList[layerIndex]) {
                      layer.valueList.push(value > 0 ? value : 0);
                      layer.range = threshold.max - threshold.min;
                      value -= layer.range;
                    }
                  });
                });
              });
            });
          }
        }, {
          key: "setFocusFromAndToDate",
          value: function setFocusFromAndToDate() {
            for (var instanceIndex = 0; instanceIndex < this.currentTab.overviewModel.data.length; ++instanceIndex) {
              var instance = this.currentTab.overviewModel.data[instanceIndex];
              var set = false;

              for (var metricIndex = 0; metricIndex < instance.metricList.length; ++metricIndex) {
                var metric = instance.metricList[metricIndex];
                var fromIndex = this.currentTab.focusModel.focusedIndexList[0];
                var toIndex = this.currentTab.focusModel.focusedIndexList[this.currentTab.focusModel.focusedIndexList.length - 1];

                if (metric.data[fromIndex] && metric.data[toIndex]) {
                  this.focusedFromDate = this.convertDateToString(metric.data[fromIndex].date);
                  this.focusedToDate = this.convertDateToString(metric.data[toIndex].date);
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
            var toDateWidth = this.overviewContext.measureText(this.focusedToDate).width;
            this.toDateLeftMargin = this.focusGraphWidth - (fromDateWidth + toDateWidth) / 2;
          }
        }, {
          key: "drawFocusGraphData",
          value: function drawFocusGraphData() {
            var _this66 = this;

            if (this.currentTab.overviewModel.selectedMetricIndex > -1) {
              if (this.isGrouped) {
                this.$timeout(function () {
                  if (_this66.groupingMode == _this66.enumList.groupingMode.SINGLE) {
                    _this66.focusGraphMarkerWidth = (_this66.config.focusGraph.markerSize + _this66.config.focusGraph.marginBetweenMarkers) * _this66.currentTab.overviewModel.metricList.length;
                  } else {
                    _this66.focusGraphMarkerWidth = _this66.config.focusGraph.markerSize + _this66.config.focusGraph.marginBetweenMarkers;
                  }

                  _this66.focusGraphMarkerHeight = _this66.config.focusGraph.markerSize;

                  _this66.scope.$apply();

                  _this66.$timeout(function () {
                    _this66.drawGroupFocusMarkers();

                    _this66.drawGroupedFocusGraph();
                  });
                });
              } else {
                this.drawUngroupedFocusGraph();
              }
            }
          }
        }, {
          key: "drawGroupFocusMarkers",
          value: function drawGroupFocusMarkers() {
            var _this67 = this;

            this.currentTab.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  _this67.drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex);
                }
              });
            });
          }
        }, {
          key: "drawGroupedFocusMarker",
          value: function drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex) {
            var _this68 = this;

            var canvas = this.getElementByID("focusGroupMarkerCanvas-" + groupIndex + "-" + instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (this.groupingMode == this.enumList.groupingMode.SINGLE && group.showDetails) {
              instance.groupWithMarkerList = [];
              instance.overviewInstance.groupList.forEach(function (instanceGroup, instanceGroupIndex) {
                if (instanceGroup.isSelected) {
                  instance.groupWithMarkerList.push(instanceGroup);
                  var x = (_this68.config.focusGraph.markerSize + _this68.config.focusGraph.marginBetweenMarkers) * instanceGroupIndex;

                  _this68.drawGroupedFocusMarkerWrapper(context, instanceGroup, x);
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
            var _this69 = this;

            this.currentTab.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  _this69.drawGroupedFocusGraphWrapper(group, groupIndex, instance, instanceIndex);
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
            var metricList = instance.metricList;
            var metricIndexList = Array.from(Array(instance.metricList.length).keys());

            if (this.groupingMode == this.enumList.groupingMode.SINGLE && !group.showAllMetrics) {
              metricList = [instance.metricList[group.mainMetricIndex]];
              metricIndexList = [group.mainMetricIndex];
            } // selected time range


            if (group.overviewGroup.timeRangeIndexList) {
              var pointWidth = Math.max(1, Math.floor(this.config.focusGraph.maxWidth / group.overviewGroup.timeRangeIndexList.length));
              this.drawGroupedFocusGraphInstance(canvas, group.overviewGroup.timeRangeIndexList, pointWidth, metricList, metricIndexList);
            } else {
              var valueList = Array.from(Array(maxMetricLength).keys());
              this.drawGroupedFocusGraphInstance(canvas, valueList, this.currentTab.focusModel.pointWidth, metricList, metricIndexList);
            }
          }
        }, {
          key: "getGroupedFocusCanvas",
          value: function getGroupedFocusCanvas(groupIndex, instanceIndex) {
            return this.getElementByID("focusGraphCanvas-" + groupIndex + "-" + instanceIndex);
          }
        }, {
          key: "drawGroupedFocusGraphInstance",
          value: function drawGroupedFocusGraphInstance(canvas, valueIndexList, pointWidth, metricList, metricIndexList) {
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);
            this.drawFocusGraphInstance(context, valueIndexList, pointWidth, metricList, metricIndexList);
          }
        }, {
          key: "drawFocusGraphInstance",
          value: function drawFocusGraphInstance(context, valueIndexList, pointWidth, metricList, metricIndexList) {
            var _this70 = this;

            metricList.forEach(function (metric, metricListIndex) {
              metric.layerList.forEach(function (layer, layerIndex) {
                var panelMetric = _this70.panel.metricList[metricIndexList[metricListIndex]];
                context.fillStyle = panelMetric.colorList[layerIndex];
                var y = (_this70.config.focusGraph.metricMaxHeight + _this70.config.focusGraph.marginBetweenMetrics) * metricListIndex + _this70.config.focusGraph.metricMaxHeight;
                context.beginPath(); // start drawing from bottom

                context.moveTo(0, y);
                var x = 0;
                var totalValue = 0;
                valueIndexList.forEach(function (valueIndex, positionIndex) {
                  var value = layer.valueList[valueIndex];

                  if (value != null) {
                    x = pointWidth * positionIndex;

                    _this70.moveFocusGraphContextBasedOnValue(context, value, layer, layerIndex, x, y);

                    totalValue += value;
                  }
                }); // draw straight line to base at the end

                context.lineTo(x, y); // move back to the starting point

                context.lineTo(0, y);
                context.closePath();

                if (totalValue > 0 || layerIndex == 0) {
                  context.fill();
                }
              });
            });
          }
        }, {
          key: "drawUngroupedFocusGraph",
          value: function drawUngroupedFocusGraph() {
            var _this71 = this;

            this.currentTab.focusModel.data.forEach(function (instance, instanceIndex) {
              var canvas = _this71.getUngroupedFocusCanvas(instanceIndex);

              var context = _this71.getCanvasContext(canvas);

              context.clearRect(0, 0, canvas.width, canvas.height);
              var valueIndexList = Array.from(Array(_this71.getMaxMetricLength()).keys());
              var metricList = [instance.metricList[_this71.currentTab.overviewModel.selectedMetricIndex]];
              var metricIndexList = [_this71.currentTab.overviewModel.selectedMetricIndex];

              if (instance.showAllMetrics) {
                metricList = instance.metricList;
                metricIndexList = Array.from(Array(instance.metricList.length).keys());
              }

              _this71.drawFocusGraphInstance(context, valueIndexList, _this71.currentTab.focusModel.pointWidth, metricList, metricIndexList);
            });
          }
        }, {
          key: "getUngroupedFocusCanvas",
          value: function getUngroupedFocusCanvas(instanceIndex) {
            return this.getElementByID("focusGraphCanvas-" + instanceIndex);
          }
        }, {
          key: "moveFocusGraphContextBasedOnValue",
          value: function moveFocusGraphContextBasedOnValue(context, value, layer, layerIndex, x, y) {
            if (value == 0) {
              // draw line straight down to base if value is 0
              var baseY = layerIndex == 0 ? y - this.config.focusGraph.metricMinHeight : y;
              context.lineTo(x, baseY);
            } else {
              var height;

              if (value >= layer.range) {
                height = this.config.focusGraph.metricMaxHeight;
              } else {
                height = value * this.config.focusGraph.metricMaxHeight / layer.range;
              }

              height = Math.max(this.config.focusGraph.metricMinHeight, height);
              context.lineTo(x, y - height);
            }
          }
        }, {
          key: "autoSrollFocusGraph",
          value: function autoSrollFocusGraph() {
            if (this.isGrouped) {
              if (this.currentTab.overviewModel.hoveredGroup && this.currentTab.overviewModel.hoveredGroup.isSelected) {
                var rowCount = 0;
                this.currentTab.focusModel.groupList.forEach(function (group) {
                  if (group.showDetails) {
                    rowCount += group.instanceList.length;
                  } else {
                    ++rowCount;
                  }
                });
                this.focusGraphContainer.scrollTop = this.currentTab.focusModel.focusRowHeight * rowCount;
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
              for (var i = 0; i < this.currentTab.focusModel.data.length; ++i) {
                var focusModelInstance = this.currentTab.focusModel.data[i];

                if (instance.instance == focusModelInstance.instance) {
                  focusModelInstance.isSelected = true;
                  this.focusGraphContainer.scrollTop = this.currentTab.focusModel.focusRowHeight * i;
                } else {
                  focusModelInstance.isSelected = false;
                }
              }
            }
          }
        }, {
          key: "getHoveredInstance",
          value: function getHoveredInstance() {
            for (var i = 0; i < this.currentTab.overviewModel.data.length; ++i) {
              var instance = this.currentTab.overviewModel.data[i];

              if (this.isBetween(this.currentTab.overviewModel.mousePosition.y, instance.y - this.config.overview.ungroupedPointHeight, instance.y)) {
                return instance;
              }
            }
          }
        }, {
          key: "leaveMouseFromOverview",
          value: function leaveMouseFromOverview() {
            this.currentTab.overviewModel.isSelectingTimeRange = false;
          }
        }, {
          key: "moveMouseOnFocusGroup",
          value: function moveMouseOnFocusGroup(group, instance) {
            if (this.groupingMode == this.enumList.groupingMode.MULTIPLE || !group.showDetails) {
              this.currentTab.focusModel.overviewGroupWithIntervalList = [group.overviewGroup];
              this.startOverviewMarkerInterval(group);
            } else {
              this.currentTab.focusModel.overviewGroupWithIntervalList = instance.groupWithMarkerList;
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
            var _this72 = this;

            this.overviewMarkerMovingBackwards = false;
            this.overviewGroupWithInterval.overviewMarkerX = 0;
            this.currentOverviewMarkerInterval = this.$interval(function () {
              if (_this72.overviewMarkerMovingBackwards) {
                _this72.handleOverviewMarkerMovingBackwardCase();
              } else {
                _this72.handleOverviewMarkerMovingForwardCase();
              }

              if (_this72.currentTab.focusModel.overviewGroupWithIntervalList) {
                _this72.currentTab.focusModel.overviewGroupWithIntervalList.forEach(function (overviewGroup) {
                  overviewGroup.markerX = _this72.overviewGroupWithInterval.overviewMarkerX;
                });
              }

              _this72.drawSelectedGroupsMarkers();
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
            var _this73 = this;

            event.preventDefault();
            this.$timeout(function () {
              group.showDetails = !group.showDetails;

              _this73.scope.$apply();

              _this73.drawFocusGraphData();
            });
          }
        }, {
          key: "showHideAllMetrics",
          value: function showHideAllMetrics() {
            this.drawFocusGraph(false);
          }
        }, {
          key: "selectGroup",
          value: function selectGroup(instance, evt, groupIndex, instanceIndex) {
            if (this.isGrouped) {
              this.currentTab.focusModel.groupList.forEach(function (group) {
                group.instanceList.forEach(function (instance) {
                  instance.isSelected = false;
                });
              });
            } else {
              this.currentTab.focusModel.data.forEach(function (focusInstance) {
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

            for (var i = 0; i < this.currentTab.overviewModel.metricList.length; ++i) {
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
          key: "showHideOverlapDetails",
          value: function showHideOverlapDetails() {
            this.showOverlapDetails = !this.showOverlapDetails;
            this.drawOverlapDetails();
          }
        }, {
          key: "selectNode",
          value: function selectNode(index, evt) {
            var instance = this.currentTab.focusModel.data[index];
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
