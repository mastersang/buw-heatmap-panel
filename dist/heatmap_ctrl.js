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

          _this.focusPanelHeight = _this.config.focusGraph.graphHeight;
          _this.overviewPanelHeight = _this.config.overview.minOverviewPanelHeight;

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
              maxSingleMetricGroupedWidth: 1700,
              minOverviewPanelHeight: 350,
              topAndBottomPadding: 20,
              metricFontSize: 12,
              timeFontSize: 9,
              marginBetweenLabelsAndOverview: 15,
              pointWidth: 1,
              ungroupedPointHeight: 1,
              groupedPointHeight: 10,
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
              minHeight: 50,
              graphHeight: 300,
              groupedPointWidth: 5,
              ungroupedPointWidth: 50,
              metricMaxHeight: 20,
              metricMinHeight: 5,
              marginBetweenMetrics: 10,
              maxWidth: 1000,
              markerSize: 20,
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
            this.groupingThreshold = 20;
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
              var result = e.data[0];
              var metric = tab.overviewModel.metricList[metricIndex];
              metric.DTPList = result.DTPList;
              metric.thresholdGroupListMap = result.thresholdGroupListMap;
              ++tab.clusteredMetricCount;

              _this12.scope.$apply();

              if (tab.clusteredMetricCount == tab.overviewModel.metricList.length) {
                _this12.initialiseMultiMetricGroups();
              }
            });
          }
        }, {
          key: "initialiseMultiMetricGroups",
          value: function initialiseMultiMetricGroups() {
            var _this13 = this;

            var tab = this.currentTab;
            var worker = new Worker("/public/plugins/buw-heatmap-panel/multi_metric_worker.js");
            var param = this.getWorkerParam();
            worker.postMessage([param]);

            worker.onmessage = function (e) {
              _this13.handleFinishedMultiMetricClustering(e, tab);
            };
          }
        }, {
          key: "handleFinishedMultiMetricClustering",
          value: function handleFinishedMultiMetricClustering(e, tab) {
            tab.isClustering = false;
            tab.overviewModel.thresholdGroupListMap = e.data[0];
            this.referenceGroupInstanceToDataInstance(tab);
            this.initialiseSingleMetricInstanceGroupList(tab);
          }
        }, {
          key: "referenceGroupInstanceToDataInstance",
          value: function referenceGroupInstanceToDataInstance(tab) {
            var _this14 = this;

            tab.overviewModel.thresholdGroupListMap.forEach(function (groupList) {
              _this14.referenceGroupInstanceToDataInstanceByGroupList(tab, groupList);
            });
            tab.overviewModel.metricList.forEach(function (metric) {
              metric.thresholdGroupListMap.forEach(function (groupList) {
                _this14.referenceGroupInstanceToDataInstanceByGroupList(tab, groupList);
              });
            });
          }
        }, {
          key: "referenceGroupInstanceToDataInstanceByGroupList",
          value: function referenceGroupInstanceToDataInstanceByGroupList(tab, groupList) {
            groupList.forEach(function (group) {
              var newInstanceList = [];
              group.instanceList.forEach(function (groupInstance) {
                var dataInstance = _.find(tab.overviewModel.data, function (search) {
                  return groupInstance.instance == search.instance;
                });

                newInstanceList.push(dataInstance);
              });
              group.instanceList = newInstanceList;
            });
          }
        }, {
          key: "initialiseSingleMetricInstanceGroupList",
          value: function initialiseSingleMetricInstanceGroupList(tab) {
            var _this15 = this;

            tab.overviewModel.data.forEach(function (instance) {
              instance.groupList = [];
              tab.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this15.getCurrentSingleMetricGroupList(metric);

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
          key: "initialiseCompressedTimeIndexes",
          value: function initialiseCompressedTimeIndexes() {
            var _this16 = this;

            this.currentTab.overviewModel.metricList.forEach(function (overviewMetric, metricIndex) {
              overviewMetric.compressedTimeIndexList = [0];

              _this16.currentTab.overviewModel.data.forEach(function (instance) {
                _this16.initialiseInstanceCompressedTimeRangeList(instance, overviewMetric, metricIndex);
              });

              _this16.currentTab.overviewModel.data.forEach(function (instance) {
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
            var _this17 = this;

            var instanceMetric = instance.metricList[metricIndex];
            instanceMetric.compressedIndexRangeList = [];
            var presviousRange;
            instanceMetric.data.forEach(function (point, pointIndex) {
              var thresholdAverage = _this17.getThresholdAverage(point.value, overviewMetric.colorMap);

              if (pointIndex == 0) {
                presviousRange = _this17.initialiseNewCompressedTimeRange(instanceMetric, thresholdAverage);
              } else {
                if (thresholdAverage != presviousRange.value || pointIndex == instanceMetric.data.length - 1) {
                  presviousRange.end = pointIndex;

                  if (thresholdAverage != presviousRange.value) {
                    presviousRange = _this17.initialiseNewCompressedTimeRange(instanceMetric, thresholdAverage);
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
            var _this18 = this;

            if (!this.isLoading) {
              this.$timeout(function () {
                _this18.overviewContext.clearRect(0, 0, _this18.overviewCanvas.width, _this18.overviewCanvas.height);

                _this18.setOverviewPanelAndCanvasSize();

                _this18.focusGraphMarginTop = _this18.overviewCanvasHeight + _this18.config.marginBetweenOverviewAndFocus;

                _this18.scope.$apply();

                _this18.drawOverviewData();
              });
            }
          }
        }, {
          key: "setOverviewPanelAndCanvasSize",
          value: function setOverviewPanelAndCanvasSize() {
            this.setOverviewContextLabelFont();
            this.currentTab.overviewModel.labelTextHeight = this.overviewContext.measureText("M").width;
            this.currentTab.overviewModel.overviewStartY = this.currentTab.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview;
            this.setOverviewCanvasWidth();
            this.setOverviewCanvasHeight();
          }
        }, {
          key: "setOverviewCanvasWidth",
          value: function setOverviewCanvasWidth() {
            this.setOverviewContextTimeFont();
            this.setMarginBetweenMetrics();
            this.currentTab.overviewModel.pointWidth = this.config.overview.pointWidth;

            if (this.isGrouped) {
              this.setGroupedOverviewPointWidth();
            }

            if (this.isSingleGrouped()) {
              this.setSingleMetricGroupedCanvasWidth();
            } else {
              this.setMultipleGroupedAndUngroupedCanvasWidth();
            }
          }
        }, {
          key: "setOverviewContextTimeFont",
          value: function setOverviewContextTimeFont() {
            this.overviewContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
          }
        }, {
          key: "setMarginBetweenMetrics",
          value: function setMarginBetweenMetrics() {
            if (this.isGrouped) {
              if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                this.currentTab.overviewModel.marginBetweenMetrics = this.config.overview.decompressedMarginBetweenMetrics;
              } else {
                this.currentTab.overviewModel.marginBetweenMetrics = this.config.overview.compressedMarginBetweenMetrics;
              }
            } else if (this.isCompressed) {
              this.currentTab.overviewModel.marginBetweenMetrics = this.config.overview.compressedMarginBetweenMetrics;
            } else {
              this.currentTab.overviewModel.marginBetweenMetrics = this.config.overview.decompressedMarginBetweenMetrics;
            }
          }
        }, {
          key: "isSingleGrouped",
          value: function isSingleGrouped() {
            return this.isGrouped && this.groupingMode == this.enumList.groupingMode.SINGLE;
          }
        }, {
          key: "setSingleMetricGroupedCanvasWidth",
          value: function setSingleMetricGroupedCanvasWidth() {
            var _this19 = this;

            this.currentTab.overviewModel.metricWidth = this.getMaxMetricLength() * this.currentTab.overviewModel.pointWidth;
            this.currentTab.overviewModel.maxGroupSizeBarLength = 0;
            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              var metricMaxGroupSizeBarLength = _this19.getMaxGroupSizeBarLength(metric);

              _this19.currentTab.overviewModel.maxGroupSizeBarLength = Math.max(_this19.currentTab.overviewModel.maxGroupSizeBarLength, metricMaxGroupSizeBarLength);
            });
            this.currentTab.overviewModel.metricWidth += this.currentTab.overviewModel.maxGroupSizeBarLength + this.currentTab.overviewModel.marginBetweenMetrics + this.config.overview.marginBetweenMarkerAndGroup + this.config.overview.marginBetweenMetricAndGroupSize;
            this.overviewCanvasWidth = this.config.overview.maxSingleMetricGroupedWidth;
            this.currentTab.overviewModel.metricsPerRow = Math.floor(this.overviewCanvasWidth / this.currentTab.overviewModel.metricWidth);
          }
        }, {
          key: "setMultipleGroupedAndUngroupedCanvasWidth",
          value: function setMultipleGroupedAndUngroupedCanvasWidth() {
            var _this20 = this;

            this.currentTab.overviewModel.overviewWidth = this.config.overview.marginBetweenMarkerAndGroup * this.currentTab.overviewModel.metricList.length + this.currentTab.overviewModel.marginBetweenMetrics * (this.currentTab.overviewModel.metricList.length - 1); // total width of overiew graph

            if (this.isCompressed) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                _this20.currentTab.overviewModel.overviewWidth += metric.compressedTimeIndexList.length * _this20.currentTab.overviewModel.pointWidth;
              });
            } else {
              this.currentTab.overviewModel.overviewWidth += this.getMaxMetricLength() * this.currentTab.overviewModel.metricList.length * this.currentTab.overviewModel.pointWidth;
            }

            this.overviewCanvasWidth = this.currentTab.overviewModel.overviewWidth;
            this.setFromDateAndToDateWidth();

            if (this.isGrouped) {
              this.setGroupedOverviewCanvasWidth();
            } else {
              this.overviewCanvasWidth += this.currentTab.overviewModel.toDateWidth / 2;
            }
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

                  this.currentTab.overviewModel.pointWidth *= scale;
                }
              }
            }
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
          key: "setFromDateAndToDateWidth",
          value: function setFromDateAndToDateWidth() {
            this.currentTab.overviewModel.fromDate = this.convertDateToString(this.fromDate);
            this.currentTab.overviewModel.toDate = this.convertDateToString(this.toDate);
            this.currentTab.overviewModel.toDateWidth = this.overviewContext.measureText(this.currentTab.overviewModel.toDate).width;
          }
        }, {
          key: "setGroupedOverviewCanvasWidth",
          value: function setGroupedOverviewCanvasWidth() {
            var _this21 = this;

            this.overviewCanvasWidth += this.config.overview.marginBetweenMarkerAndGroup * this.currentTab.overviewModel.metricList.length;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize * this.currentTab.overviewModel.metricList.length;
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                _this21.overviewCanvasWidth += _this21.getMaxGroupSizeBarLength(metric) * _this21.config.overview.groupSizeBarWidth;
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
              result = Math.max(result, group.instanceList.length);
            });
            return result;
          }
        }, {
          key: "getCurrentMultiMetricGroupList",
          value: function getCurrentMultiMetricGroupList() {
            return this.currentTab.overviewModel.thresholdGroupListMap.get(this.groupingThreshold);
          }
        }, {
          key: "setOverviewCanvasHeight",
          value: function setOverviewCanvasHeight() {
            if (this.isGrouped) {
              if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                this.currentTab.overviewModel.instanceHeight = this.config.overview.groupedPointHeight + this.config.overview.marginBetweenGroups;
              } else {
                this.currentTab.overviewModel.instanceHeight = this.config.overview.pieRadius * 2 + this.config.overview.marginBetweenGroups;
              }
            } else {
              this.currentTab.overviewModel.instanceHeight = this.config.overview.ungroupedPointHeight;
            }

            if (this.isSingleGrouped()) {
              this.setSingleMetricGroupedCanvasHeight();
            } else {
              this.setMultipleMetricGroupedAndUngroupedCanvasHeight();
            }
          }
        }, {
          key: "setSingleMetricGroupedCanvasHeight",
          value: function setSingleMetricGroupedCanvasHeight() {
            var rowIndex = 0;
            this.currentTab.overviewModel.overviewHeight = 0;
            this.currentTab.overviewModel.rowHeightList = []; // get height of each row of metrics

            while (this.currentTab.overviewModel.metricList.length / this.currentTab.overviewModel.metricsPerRow > rowIndex) {
              var maxGroupCount = 0;

              for (var columnIndex = 0; columnIndex < this.currentTab.overviewModel.metricsPerRow; ++columnIndex) {
                var metricIndex = rowIndex * this.currentTab.overviewModel.metricsPerRow + columnIndex;

                if (metricIndex < this.currentTab.overviewModel.metricList.length) {
                  var metric = this.currentTab.overviewModel.metricList[metricIndex];
                  var groupList = this.getCurrentSingleMetricGroupList(metric);
                  maxGroupCount = Math.max(maxGroupCount, groupList.length);
                }
              }

              var height = maxGroupCount * this.currentTab.overviewModel.instanceHeight + (this.currentTab.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 3; // metric label, from/to date, selected date

              this.currentTab.overviewModel.rowHeightList.push(height);
              this.currentTab.overviewModel.overviewHeight += height;
              ++rowIndex;
            }

            this.currentTab.overviewModel.rowsOfMetric = Math.ceil(this.currentTab.overviewModel.metricList.length / this.currentTab.overviewModel.metricsPerRow);
            this.overviewCanvasHeight = this.currentTab.overviewModel.overviewHeight;
          }
        }, {
          key: "setMultipleMetricGroupedAndUngroupedCanvasHeight",
          value: function setMultipleMetricGroupedAndUngroupedCanvasHeight() {
            // height of tallest graph
            if (this.isGrouped) {
              var groupCount = this.getMaxGroupCount();
              this.currentTab.overviewModel.overviewHeight = groupCount * this.currentTab.overviewModel.instanceHeight;
            } else {
              this.currentTab.overviewModel.overviewHeight = this.currentTab.overviewModel.data.length * this.config.overview.ungroupedPointHeight;
            }

            this.overviewCanvasHeight = this.currentTab.overviewModel.overviewHeight + (this.currentTab.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 3; // metric label, from/to date, selected date
          }
        }, {
          key: "getMaxGroupCount",
          value: function getMaxGroupCount() {
            var _this22 = this;

            var groupCount = 0;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this22.getCurrentSingleMetricGroupList(metric);

                groupCount = Math.max(groupCount, groupList.length);
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
            var _this23 = this;

            this.currentTab.overviewModel.overviewEndY = 0;
            this.currentTab.overviewModel.metricList.forEach(function (metric, metricIndex) {
              _this23.setOverviewMetricStartEndX(metric, metricIndex);
            });

            if (this.isGrouped) {
              this.drawGroupedOverview();
            } else {
              this.drawUngroupedOverview();
            }

            this.drawMetricLabels();
          }
        }, {
          key: "setOverviewMetricStartEndX",
          value: function setOverviewMetricStartEndX(metric, metricIndex) {
            if (this.isSingleGrouped()) {
              this.setSingleGroupedOverviewMetricStartEndX(metric, metricIndex);
            } else {
              this.setMultipleGroupedAndUngroupedMetricStartEndX(metric, metricIndex);
            }
          }
        }, {
          key: "setSingleGroupedOverviewMetricStartEndX",
          value: function setSingleGroupedOverviewMetricStartEndX(metric, metricIndex) {
            var columnIndex = metricIndex % this.currentTab.overviewModel.metricsPerRow;
            metric.startX = columnIndex * this.currentTab.overviewModel.metricWidth + this.config.overview.marginBetweenMarkerAndGroup;
            metric.endX = metric.startX + this.getMaxMetricLength() * this.currentTab.overviewModel.pointWidth;
          }
        }, {
          key: "setMultipleGroupedAndUngroupedMetricStartEndX",
          value: function setMultipleGroupedAndUngroupedMetricStartEndX(metric, metricIndex) {
            if (metricIndex > 0) {
              var previousMetric = this.currentTab.overviewModel.metricList[metricIndex - 1];
              metric.startX = previousMetric.endX + this.currentTab.overviewModel.marginBetweenMetrics;

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

            if (this.isCompressed) {
              metric.endX = metric.startX + metric.compressedTimeIndexList.length * this.currentTab.overviewModel.pointWidth;
            } else {
              metric.endX = metric.startX + this.getMaxMetricLength() * this.currentTab.overviewModel.pointWidth;
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
            var _this24 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric, metricIndex) {
              metric.startY = _this24.currentTab.overviewModel.overviewStartY;
              var rowIndex = Math.floor(metricIndex / _this24.currentTab.overviewModel.metricsPerRow);

              for (var previousRowIndex = 0; previousRowIndex < rowIndex; ++previousRowIndex) {
                metric.startY += _this24.currentTab.overviewModel.rowHeightList[previousRowIndex];
              }

              var groupList = _this24.getCurrentSingleMetricGroupList(metric);

              groupList.forEach(function (group, groupIndex) {
                _this24.drawGroupedOverviewWrapper(group, groupIndex, metric.startY, [metricIndex]);

                metric.endY = group.y + _this24.config.overview.groupedPointHeight;
              });
              var columnIndex = metricIndex % _this24.currentTab.overviewModel.metricsPerRow;

              if (columnIndex < _this24.currentTab.overviewModel.metricsPerRow - 1) {
                _this24.drawMetricSeparator(metric);
              }
            });
          }
        }, {
          key: "drawGroupedOverviewWrapper",
          value: function drawGroupedOverviewWrapper(group, groupIndex, startY, metricIndexList) {
            var instance = group.instanceList[0];
            instance.y = startY + groupIndex * this.currentTab.overviewModel.instanceHeight;

            if (this.groupSizeChart == this.enumList.groupSizeChart.PIE) {
              instance.y += this.currentTab.overviewModel.instanceHeight / 2;
            }

            this.drawOverviewInstance(instance, this.config.overview.groupedPointHeight, metricIndexList);
            group.y = instance.y;
          }
        }, {
          key: "drawOverviewInstance",
          value: function drawOverviewInstance(instance, pointHeight, metricIndexList) {
            var _this25 = this;

            var endY = instance.y + this.currentTab.overviewModel.instanceHeight;

            if (endY > this.currentTab.overviewModel.overviewEndY) {
              this.currentTab.overviewModel.overviewEndY = endY;
            }

            metricIndexList.forEach(function (metricIndex) {
              _this25.drawOverviewInstancePoints(instance, metricIndex, pointHeight);
            });
          }
        }, {
          key: "drawOverviewInstancePoints",
          value: function drawOverviewInstancePoints(instance, metricIndex, pointHeight) {
            var _this26 = this;

            var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex];
            var instanceMetric = instance.metricList[metricIndex];

            if (this.isCompressed) {
              overviewMetric.compressedTimeIndexList.forEach(function (pointIndex, rangeIndex) {
                var point = instanceMetric.data[pointIndex];

                if (point) {
                  _this26.drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, rangeIndex, pointHeight);
                }
              });
            } else {
              instanceMetric.data.forEach(function (point, pointIndex) {
                _this26.drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, pointIndex, pointHeight);
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
            var _this27 = this;

            var result = null;
            map.forEach(function (color, threshold) {
              if (!result && _this27.isBetween(value, threshold.min, threshold.max)) {
                result = color;
              }
            });
            return result;
          }
        }, {
          key: "drawMultiMetricGroupedOverview",
          value: function drawMultiMetricGroupedOverview() {
            var _this28 = this;

            var groupList = this.getCurrentMultiMetricGroupList();
            groupList.forEach(function (group, groupIndex) {
              var metricIndexList = _this28.getAllMetricIndexList();

              _this28.drawGroupedOverviewWrapper(group, groupIndex, _this28.currentTab.overviewModel.overviewStartY, metricIndexList);
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
            var _this29 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric, metricIndex) {
              var startX = metric.endX + _this29.config.overview.marginBetweenMetricAndGroupSize;

              var groupList = _this29.getCurrentSingleMetricGroupList(metric);

              groupList.forEach(function (group) {
                if (_this29.groupSizeChart == _this29.enumList.groupSizeChart.HORIZONTAL_BAR) {
                  _this29.drawSingleMetricBarGroupSize(group, startX);
                } else {
                  _this29.drawSingleMetricPieGroupSize(group, startX);
                }
              });
              var y = _this29.currentTab.overviewModel.labelTextHeight;
              var rowIndex = Math.floor(metricIndex / _this29.currentTab.overviewModel.metricsPerRow);

              for (var previousRowIndex = 0; previousRowIndex < rowIndex; ++previousRowIndex) {
                y += _this29.currentTab.overviewModel.rowHeightList[previousRowIndex];
              }

              if (_this29.groupSizeChart == _this29.enumList.groupSizeChart.HORIZONTAL_BAR) {
                var maxGroupSizeBarLength = _this29.getMaxGroupSizeBarLength(metric);

                _this29.drawGroupSizeLabel((startX * 2 + maxGroupSizeBarLength - _this29.currentTab.overviewModel.groupSizeLabelWidth) / 2, y);
              } else {
                _this29.drawGroupSizeLabel((startX * 2 + _this29.config.overview.pieRadius - _this29.currentTab.overviewModel.groupSizeLabelWidth) / 2, y);
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
          value: function drawGroupSizeLabel(x, y) {
            this.overviewContext.fillStyle = "black";
            this.overviewContext.fillText("Groups size", x, y);
          }
        }, {
          key: "drawMultipleMetricGroupSize",
          value: function drawMultipleMetricGroupSize() {
            var _this30 = this;

            var startX = this.currentTab.overviewModel.overviewWidth + this.config.overview.marginBetweenMetricAndGroupSize + this.currentTab.overviewModel.groupSizeLabelWidth / 2;
            var maxEndX = 0;
            var groupList = this.getCurrentMultiMetricGroupList();
            groupList.forEach(function (group, groupIndex) {
              var endX = _this30.drawBarGroupSizeWrapper(group, startX, group.instanceList.length, _this30.config.overview.groupSizeColor);

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
                x += this.currentTab.overviewModel.maxGroupSizeBarLength;
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
            var _this31 = this;

            this.currentTab.overviewModel.data.forEach(function (instance, instanceIndex) {
              var metricIndexList = _this31.getAllMetricIndexList();

              instance.y = _this31.currentTab.overviewModel.overviewStartY + instanceIndex * _this31.currentTab.overviewModel.instanceHeight;

              _this31.drawOverviewInstance(instance, _this31.currentTab.overviewModel.instanceHeight, metricIndexList);
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
              var y = this.currentTab.overviewModel.labelTextHeight;

              if (this.isSingleGrouped()) {
                var rowIndex = Math.floor(metricIndex / this.currentTab.overviewModel.metricsPerRow);

                for (var previousRowIndex = 0; previousRowIndex < rowIndex; ++previousRowIndex) {
                  y += this.currentTab.overviewModel.rowHeightList[previousRowIndex];
                }
              }

              this.overviewContext.fillText(label, metric.startX, y);

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
            var _this32 = this;

            this.showHistogram = false;

            if (this.changedColorThreshold) {
              this.changedColorThreshold = false;
              this.drawOverview();

              if (this.isGrouped) {
                var temp = this.currentTab.focusModel.groupList;
                this.currentTab.focusModel.groupList = [];
                temp.forEach(function (group) {
                  _this32.addOrRemoveGroupToFocus(group.overviewGroup, true);
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
            var _this33 = this;

            this.showMergeSelectedGroups = false;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this33.getCurrentSingleMetricGroupList(metric);

                _this33.setShowMergeGroupsButtonWrapper(groupList);
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
            var _this34 = this;

            this.$timeout(function () {
              _this34.focusAreaContext.font = _this34.config.overview.groupedPointHeight + "px calculator";

              _this34.clearFocusArea();

              _this34.currentTab.overviewModel.groupMarkerList = [];

              if (_this34.groupingMode == _this34.enumList.groupingMode.SINGLE) {
                _this34.currentTab.overviewModel.metricList.forEach(function (metric) {
                  var groupList = _this34.getCurrentSingleMetricGroupList(metric);

                  groupList.forEach(function (group) {
                    _this34.drawOverviewGroupMarker(group, [metric]);
                  });
                });
              } else {
                var groupList = _this34.getCurrentMultiMetricGroupList();

                groupList.forEach(function (group) {
                  _this34.drawOverviewGroupMarker(group, _this34.currentTab.overviewModel.metricList);
                });
              }
            });
          }
        }, {
          key: "drawOverviewGroupMarker",
          value: function drawOverviewGroupMarker(group, metricList) {
            var _this35 = this;

            if (group.isSelected) {
              metricList.forEach(function (metric) {
                var marker = {};
                marker.group = group;
                marker.startX = metric.startX - _this35.config.overview.marginBetweenMarkerAndGroup + group.markerX;
                marker.endX = marker.startX + _this35.config.overview.groupedPointHeight;
                marker.startY = group.y;
                marker.endY = marker.startY + _this35.config.overview.groupedPointHeight;
                _this35.focusAreaContext.fillStyle = group.color; //this.focusAreaContext.fillRect(marker.startX, marker.startY, this.config.overview.groupedPointHeight, this.config.overview.groupedPointHeight);

                _this35.focusAreaContext.fillText(_this35.getGroupNumber(group), marker.startX, marker.startY + _this35.config.overview.groupedPointHeight);

                _this35.currentTab.overviewModel.groupMarkerList.push(marker);
              });
            }
          }
        }, {
          key: "getGroupNumber",
          value: function getGroupNumber(group) {
            var split = group.name.split(" ");
            return split[split.length - 1];
          }
        }, {
          key: "drawFocusGraph",
          value: function drawFocusGraph(initialiseData) {
            var _this36 = this;

            if (!this.isGrouped && initialiseData) {
              this.initialiseFocusGraphData();
            }

            if (this.isGrouped && this.currentTab.focusModel.groupList.length > 0 || !this.isGrouped && this.currentTab.focusModel.data.length > 0) {
              this.showFocus = true;
              this.$timeout(function () {
                _this36.setFocusGraphCanvasHeight();

                _this36.setFocusGraphPointWidth();

                _this36.scope.$apply();

                var focusGraphRow = _this36.getElementByID("focusGraphRow");

                if (focusGraphRow) {
                  _this36.setFocusFromAndToDate();

                  if (!_this36.isGrouped) {
                    _this36.positionFocusFromAndToDate();
                  }

                  _this36.currentTab.focusModel.focusRowHeight = focusGraphRow.offsetHeight;

                  _this36.drawFocusGraphData();

                  _this36.autoSrollFocusGraph();
                }
              });
            } else {
              this.showFocus = false;
            }
          }
        }, {
          key: "initialiseFocusGraphData",
          value: function initialiseFocusGraphData() {
            var _this37 = this;

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
              if (_this37.isBetween(overviewInstance.y, topY, bottomY)) {
                _this37.currentTab.focusModel.focusedIndexList = _this37.getIndexesOfPointsInFocus(overviewInstance);

                var focusInstance = _this37.getFocusInstance(overviewInstance, _this37.currentTab.focusModel.focusedIndexList);

                _this37.currentTab.focusModel.data.push(focusInstance);
              }
            });
          }
        }, {
          key: "getIndexesOfPointsInFocus",
          value: function getIndexesOfPointsInFocus(overviewInstance) {
            var _this38 = this;

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
                  if (_this38.isBetween(point.x, leftX, rightX)) {
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
            var _this39 = this;

            instance.metricList.forEach(function (instanceMetric, metricIndex) {
              for (var i = 0; i < _this39.config.colorCount; ++i) {
                var layer = {};
                layer.valueList = [];
                instanceMetric.layerList.push(layer);
              }

              var overviewMetric = _this39.currentTab.overviewModel.metricList[metricIndex];
              instanceMetric.data.forEach(function (point) {
                var value = point.value;
                var colorList = _this39.panel.metricList[metricIndex].colorList;
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
          key: "setFocusGraphCanvasHeight",
          value: function setFocusGraphCanvasHeight() {
            var _this40 = this;

            if (this.isGrouped) {
              this.currentTab.focusModel.groupList.forEach(function (group) {
                if (group.showAllMetrics) {
                  group.focusGraphHeight = _this40.currentTab.overviewModel.metricList.length * _this40.config.focusGraph.metricMaxHeight + (_this40.currentTab.overviewModel.metricList.length - 1) * _this40.config.focusGraph.marginBetweenMetrics;
                } else {
                  group.focusGraphHeight = _this40.config.focusGraph.metricMaxHeight;
                }
              });
            } else {
              this.currentTab.focusModel.data.forEach(function (instance) {
                if (instance.showAllMetrics) {
                  instance.focusGraphHeight = _this40.currentTab.overviewModel.metricList.length * _this40.config.focusGraph.metricMaxHeight + (_this40.currentTab.overviewModel.metricList.length - 1) * _this40.config.focusGraph.marginBetweenMetrics;
                } else {
                  instance.focusGraphHeight = _this40.config.focusGraph.metricMaxHeight;
                }
              });
            }
          }
        }, {
          key: "setFocusGraphPointWidth",
          value: function setFocusGraphPointWidth() {
            var pointCount = this.currentTab.focusModel.focusedIndexList.length - 1;
            var pointWidth;

            if (this.isGrouped) {
              pointWidth = Math.max(1, Math.floor(this.config.focusGraph.maxWidth / pointCount));
            } else {
              pointWidth = this.config.focusGraph.ungroupedPointWidth;
            }

            this.focusGraphWidth = Math.min(this.config.focusGraph.maxWidth, pointCount * pointWidth);
            this.currentTab.focusModel.pointWidth = Math.max(1, Math.floor(this.focusGraphWidth / pointCount));
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
            var _this41 = this;

            this.changedColorThreshold = true;
            var value = Math.round((this.currentTab.histogramModel.mousePosition.x - this.currentTab.histogramModel.horizontalAxisStartX) / this.config.histogram.barWidth);
            value = Math.max(value, 1);
            value = Math.min(value, this.currentTab.histogramModel.metric.max - 1);
            this.currentTab.histogramModel.metric.colorMap.forEach(function (color, threshold) {
              if (threshold != _this41.currentTab.histogramModel.selectedBar.threshold) {
                if (value >= _this41.currentTab.histogramModel.selectedBar.threshold.max) {
                  // move right
                  if (threshold.min == _this41.currentTab.histogramModel.selectedBar.threshold.max) {
                    value = Math.min(value, threshold.max - 1);
                    threshold.min = value;
                  }
                } else {
                  // move left
                  if (_this41.currentTab.histogramModel.selectedBar.threshold.min == 0) {
                    // left most threshold
                    if (threshold.min == _this41.currentTab.histogramModel.selectedBar.threshold.max) {
                      threshold.min = value;
                    }
                  } else {
                    // left threshold
                    if (threshold.max == _this41.currentTab.histogramModel.selectedBar.threshold.min) {
                      value = Math.max(value, threshold.max + 1);
                    } // right threshold


                    if (threshold.min == _this41.currentTab.histogramModel.selectedBar.threshold.max) {
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
            var _this42 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              if (metric.originalGroupList) {
                metric.thresholdGroupListMap.set(_this42.previousGroupThreshold, metric.originalGroupList);
                metric.originalGroupList = null;
              }

              var groupList = _this42.getCurrentSingleMetricGroupList(metric);

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
            var _this43 = this;

            if (this.currentTab.isClustering) {
              this.$timeout(function () {
                _this43.waitUntilGroupProcessingIsFinished();
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
            var _this44 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              var groupList = _this44.getCurrentSingleMetricGroupList(metric);

              if (!metric.originalGroupList) {
                metric.originalGroupList = [];
                groupList.forEach(function (group) {
                  metric.originalGroupList.push(group);
                });
              }

              _this44.mergeSelectedGroupsWrapper(groupList);
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
            var _this45 = this;

            var mergedGroup;
            currentGroupList.forEach(function (group) {
              if (group.isSelected) {
                if (mergedGroup) {
                  group.instanceList.forEach(function (instance) {
                    mergedGroup.instanceList.push(instance);
                  });
                } else {
                  mergedGroup = _this45.getCopyOfGroup(group);
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
            var _this46 = this;

            var oldFocusGroupList = this.currentTab.focusModel.groupList;
            this.currentTab.focusModel.groupList = [];

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this46.getCurrentSingleMetricGroupList(metric);

                _this46.mergeFocusGroupListWrapper(groupList);
              });
            } else {
              this.mergeFocusGroupListWrapper(this.getCurrentMultiMetricGroupList());
            }

            this.setMainMetricIndexAfterMerging(oldFocusGroupList);
          }
        }, {
          key: "mergeFocusGroupListWrapper",
          value: function mergeFocusGroupListWrapper(groupList) {
            var _this47 = this;

            groupList.forEach(function (group) {
              if (group.isSelected) {
                _this47.addGroupToFocus(group);
              }
            });
          }
        }, {
          key: "addGroupToFocus",
          value: function addGroupToFocus(group) {
            var _this48 = this;

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

              _this48.currentTab.focusModel.focusedIndexList = Array.from(Array(length).keys());

              var focusInstance = _this48.getFocusInstance(overviewInstance, _this48.currentTab.focusModel.focusedIndexList);

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
            var _this49 = this;

            this.currentTab.overviewModel.selectedMetricIndexSet = new Set();
            this.currentTab.focusModel.groupList.forEach(function (group) {
              _this49.currentTab.overviewModel.selectedMetricIndexSet.add(group.overviewGroup.metricIndex);
            });
            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              var groupList = _this49.getCurrentSingleMetricGroupList(metric);

              groupList.forEach(function (group) {
                group.overlapCount = 0;

                if (_this49.currentTab.focusModel.groupList.length > 0) {
                  _this49.checkOverlappingGroupsAndSetOverlapCount(group);
                }
              });
            });
          }
        }, {
          key: "checkOverlappingGroupsAndSetOverlapCount",
          value: function checkOverlappingGroupsAndSetOverlapCount(group) {
            var _this50 = this;

            group.instanceList.forEach(function (instance) {
              var check = 0;

              _this50.currentTab.focusModel.groupList.forEach(function (overlappingGroup) {
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
                if (check == _this50.currentTab.overviewModel.selectedMetricIndexSet.size - 1) {
                  ++group.overlapCount;
                }
              } else if (check == _this50.currentTab.overviewModel.selectedMetricIndexSet.size) {
                ++group.overlapCount;
              }
            });
          }
        }, {
          key: "mergeMultipleMetricGroups",
          value: function mergeMultipleMetricGroups() {
            var _this51 = this;

            var groupList = this.getCurrentMultiMetricGroupList();

            if (!this.currentTab.overviewModel.originalGroupList) {
              this.currentTab.overviewModel.originalGroupList = [];
              groupList.forEach(function (group) {
                _this51.currentTab.overviewModel.originalGroupList.push(group);
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
            this.clearTimeIndicator();
          }
        }, {
          key: "selectTimeHighlightMode",
          value: function selectTimeHighlightMode() {
            var _this52 = this;

            this.clearTimeIndicator();

            if (this.currentTab.overviewModel.thresholdGroupListMap) {
              this.currentTab.overviewModel.thresholdGroupListMap.forEach(function (groupList) {
                _this52.clearGroupIndexRangeIndexList(groupList);
              });
            }

            if (this.currentTab.overviewModel.metricList) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                metric.thresholdGroupListMap.forEach(function (groupList) {
                  _this52.clearGroupIndexRangeIndexList(groupList);
                });
              });
            }
          }
        }, {
          key: "clearGroupIndexRangeIndexList",
          value: function clearGroupIndexRangeIndexList(groupList) {
            groupList.forEach(function (group) {
              group.timeRangeIndexList = [];
            });
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
            var _this53 = this;

            this.histogramCanvasContext.clearRect(0, 0, this.histogramCanvas.width, this.histogramCanvas.height);
            this.currentTab.histogramModel.metric = this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.selectedMetricIndex];
            this.histogramMetric = this.panel.metricList[this.currentTab.overviewModel.selectedMetricIndex];
            this.scope.$watch("ctrl.histogramMetric.color", function (newValue, oldValue) {
              if (newValue != oldValue) {
                _this53.initialiseColorListByMetric(_this53.histogramMetric);

                _this53.initialiseColorMapByMetric(_this53.currentTab.histogramModel.metric, _this53.histogramMetric);

                _this53.drawHistogram();
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
            var _this54 = this;

            var occurenceStep = this.config.histogram.verticalAxisLength / this.currentTab.histogramModel.metric.histogram.max;
            this.currentTab.histogramModel.metric.histogram.data.forEach(function (occurences, value) {
              _this54.histogramCanvasContext.fillStyle = _this54.getColorFromMap(value, _this54.currentTab.histogramModel.metric.colorMap);
              var x = _this54.currentTab.histogramModel.horizontalAxisStartX + _this54.config.histogram.barWidth * value;
              var y = _this54.currentTab.histogramModel.horizontalAxisY - occurenceStep * occurences;
              var height = _this54.currentTab.histogramModel.horizontalAxisY - y;
              var minHeight = _this54.config.histogram.minimumBarHeight;

              if (height < minHeight) {
                y = _this54.currentTab.histogramModel.horizontalAxisY - minHeight;
                height = minHeight;
              }

              _this54.histogramCanvasContext.fillRect(x, y, _this54.config.histogram.barWidth, height);
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
            var _this55 = this;

            var thresholdBarY = this.currentTab.histogramModel.sliderY - this.config.histogram.thresholdBarLength / 2;
            this.currentTab.histogramModel.thresholdBarList = [];
            var i = 0;
            this.currentTab.histogramModel.metric.colorMap.forEach(function (color, threshold) {
              var bar = {};
              bar.threshold = threshold;
              bar.x = _this55.currentTab.histogramModel.horizontalAxisStartX + _this55.config.histogram.barWidth * (threshold.max + 1); // no need to draw slider bar for last threshold

              if (i < _this55.currentTab.histogramModel.metric.colorMap.size - 1) {
                _this55.histogramCanvasContext.beginPath();

                _this55.histogramCanvasContext.moveTo(bar.x, thresholdBarY);

                _this55.histogramCanvasContext.lineTo(bar.x, thresholdBarY + _this55.config.histogram.thresholdBarLength);

                _this55.histogramCanvasContext.stroke();

                _this55.histogramCanvasContext.closePath();

                ++i;
              }

              _this55.currentTab.histogramModel.thresholdBarList.push(bar);
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
            var _this56 = this;

            if (this.currentTab == tab) {
              if (this.currentTab.isClustering) {
                this.$timeout(function () {
                  _this56.waitForTabProcessingToFinish(tab);
                }, 100);
              } else {
                this.$timeout(function () {
                  _this56.drawOverview();

                  _this56.drawSelectedGroupsMarkers();

                  _this56.drawFocusGraph();

                  _this56.$timeout(function () {
                    if (_this56.timeHighlightMode == _this56.enumList.timeHighlightMode.POINT) {
                      _this56.drawTimeIndicators();
                    } else {
                      _this56.drawSelectedTimeRanges();
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
            if (this.isBetween(this.currentTab.overviewModel.mousePosition.x, metric.startX, metric.endX)) {
              if (this.isSingleGrouped()) {
                return this.isBetween(this.currentTab.overviewModel.mousePosition.y, metric.startY, metric.endY);
              } else {
                return true;
              }
            } else {
              return false;
            }
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
            var _this57 = this;

            this.clearTimeIndicator();
            this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.drawTimeIndicatorWrapper(this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.selectedMetricIndex]);
            } else {
              this.currentTab.overviewModel.metricList.forEach(function (metric, metricIndex) {
                _this57.drawTimeIndicatorWrapper(metric, metricIndex);
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
            var _this58 = this;

            this.currentTab.overviewModel.isHoveringOnTimeRange = false;
            this.currentTab.overviewModel.mouseIsInsideTimeRange = false;
            this.currentTab.overviewModel.hoveredTimeRangeGroup = null;
            this.currentTab.overviewModel.timeRangePositionMap.forEach(function (position, group) {
              if (_this58.currentTab.overviewModel.selectedMetricIndex == group.metricIndex && _this58.isBetween(_this58.currentTab.overviewModel.mousePosition.y, position.startY, group.y)) {
                _this58.currentTab.overviewModel.isHoveringOnTimeRange = true;
                _this58.currentTab.overviewModel.hoveredTimeRangeGroup = group;

                if (_this58.isBetween(_this58.currentTab.overviewModel.mousePosition.x, position.startX, position.endX)) {
                  _this58.currentTab.overviewModel.mouseIsInsideTimeRange = true;
                }
              }
            });
          }
        }, {
          key: "initialiseSelectedGroupTimeRangeIndexList",
          value: function initialiseSelectedGroupTimeRangeIndexList() {
            var _this59 = this;

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
              if (_this59.isBetween(point.x, startX, endX)) {
                _this59.currentTab.overviewModel.timeRangeGroup.timeRangeIndexList.push(pointIndex);
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
            var _this60 = this;

            this.clearTimeIndicator();
            this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;
            this.overviewTimeIndicatorContext.fillStyle = this.config.timeIndicator.color;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.currentTab.overviewModel.metricList.forEach(function (metric) {
                var groupList = _this60.getCurrentSingleMetricGroupList(metric);

                groupList.forEach(function (group) {
                  _this60.drawSelectedTimeRangeWrapper(group, [group.metricIndex]);
                });
              });
            } else {
              var groupList = this.getCurrentMultiMetricGroupList();
              groupList.forEach(function (group) {
                _this60.drawSelectedTimeRangeWrapper(group, Array.from(Array(_this60.currentTab.overviewModel.metricList.length).keys()));
              });
            }
          }
        }, {
          key: "drawSelectedTimeRangeWrapper",
          value: function drawSelectedTimeRangeWrapper(group, metricIndexList) {
            var _this61 = this;

            if (group.timeRangeIndexList && group.timeRangeIndexList.length > 0) {
              metricIndexList.forEach(function (metricIndex) {
                var instanceMetric = group.instanceList[0].metricList[metricIndex];
                var overviewMetric = _this61.currentTab.overviewModel.metricList[metricIndex];
                var startPoint, endPoint;
                var startRangeIndex = group.timeRangeIndexList[0];
                var endRangeIndex = group.timeRangeIndexList[group.timeRangeIndexList.length - 1];

                if (_this61.isCompressed && metricIndex != group.metricIndex) {
                  var previousPointIndex = 0;

                  var groupList = _this61.getCurrentMultiMetricGroupList();

                  for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                    var currentPointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];

                    if (_this61.isBetween(startRangeIndex, previousPointIndex, currentPointIndex)) {
                      startPoint = _this61.getTimeRangePointWrapper(previousPointIndex, groupList, metricIndex);
                    }

                    if (_this61.isBetween(endRangeIndex, previousPointIndex, currentPointIndex)) {
                      endPoint = _this61.getTimeRangePointWrapper(currentPointIndex, groupList, metricIndex);
                    }

                    previousPointIndex = currentPointIndex;
                  }
                } else {
                  startPoint = instanceMetric.data[startRangeIndex];
                  endPoint = instanceMetric.data[endRangeIndex];
                }

                if (startPoint) {
                  _this61.drawSelectedTimeRangeLines(overviewMetric, group, startPoint, endPoint);
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
            var _this62 = this;

            this.clearFocusArea();
            this.focusAreaContext.strokeStyle = this.config.focusArea.color;
            var width = this.currentTab.focusAreaModel.endX - this.currentTab.focusAreaModel.startX;
            var height = this.currentTab.focusAreaModel.endY - this.currentTab.focusAreaModel.startY;
            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              _this62.focusAreaContext.strokeRect(metric.startX + _this62.currentTab.focusAreaModel.startX, _this62.currentTab.focusAreaModel.startY, width, height);
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
                this.drawAllGroupFocusMarkers();
              }
            }
          }
        }, {
          key: "initialiseFocusMarkerInterval",
          value: function initialiseFocusMarkerInterval() {
            var _this63 = this;

            this.focusMarkerMovingBackwards = false;
            this.focusGroupWithInterval.focusMarkerX = 0;
            this.currentFocusMarkerInterval = this.$interval(function () {
              if (_this63.focusMarkerMovingBackwards) {
                _this63.handleFocusMarkerMovingBackwardCase();
              } else {
                _this63.handleFocusMarkerMovingForwardCase();
              }

              _this63.drawAllGroupFocusMarkers();
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
            var _this64 = this;

            var newTab = this.initialiseNewTab();
            this.initialiseNewTabDatesAndData(newTab);
            newTab.overviewModel.metricList.forEach(function (newMetric, metricIndex) {
              var oldMetric = _this64.currentTab.overviewModel.metricList[metricIndex];
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
            var _this65 = this;

            var timeRangeGroupList = [];
            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              var groupList = _this65.getCurrentSingleMetricGroupList(metric);

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
            var _this66 = this;

            this.currentTab.overviewModel.metricList.forEach(function (metric) {
              var newMetric = {};
              newMetric.data = [];
              metric.data.forEach(function (metricInstance) {
                if (_this66.checkInstanceIsInOverlapList(metricInstance)) {
                  var newMetricInstance = {};
                  newMetricInstance.metric = metricInstance.metric;
                  newMetricInstance.values = [];
                  metricInstance.values.forEach(function (value) {
                    var date = value[0];

                    if (_this66.isBetween(date, newTab.fromDate, newTab.toDate)) {
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
            var _this67 = this;

            this.currentTab.focusModel.overlappingList = [];
            var metricIndex = this.currentTab.overviewModel.selectedMetricIndexSet.values().next().value;
            var instanceList = this.getAllInstanceListForSelectedMetric(metricIndex);
            instanceList.forEach(function (instance) {
              _this67.checkAndAddOverlappingInstance(metricIndex, instance);
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
            var _this68 = this;

            if (this.showOverlapDetails) {
              this.$timeout(function () {
                _this68.overlapGraphHeight = _this68.currentTab.focusModel.groupList.length * _this68.config.focusGraph.metricMaxHeight + (_this68.currentTab.focusModel.groupList.length - 1) * _this68.config.focusGraph.marginBetweenMetrics;

                _this68.scope.$apply();

                var metricIndexList = [];

                _this68.currentTab.focusModel.groupList.forEach(function (group) {
                  metricIndexList.push(group.overviewGroup.metricIndex);
                });

                _this68.currentTab.focusModel.overlappingList.forEach(function (instance, instanceIndex) {
                  _this68.drawOverlapInstance(instance, instanceIndex, metricIndexList);
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
            var _this69 = this;

            if (this.isGrouped) {
              this.$timeout(function () {
                if (_this69.groupingMode == _this69.enumList.groupingMode.SINGLE) {
                  _this69.focusGraphMarkerWidth = (_this69.config.focusGraph.markerSize / 2 + _this69.config.focusGraph.marginBetweenMarkers) * _this69.currentTab.overviewModel.metricList.length;
                } else {
                  _this69.focusGraphMarkerWidth = _this69.config.focusGraph.markerSize / 2 + _this69.config.focusGraph.marginBetweenMarkers;
                }

                _this69.focusGraphMarkerHeight = _this69.config.focusGraph.markerSize;

                _this69.scope.$apply();

                _this69.drawAllGroupFocusMarkers();

                _this69.drawGroupedFocusGraph();
              });
            } else if (this.currentTab.overviewModel.selectedMetricIndex > -1) {
              this.drawUngroupedFocusGraph();
            }
          }
        }, {
          key: "drawAllGroupFocusMarkers",
          value: function drawAllGroupFocusMarkers() {
            var _this70 = this;

            this.currentTab.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  _this70.drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex);
                }
              });
            });
          }
        }, {
          key: "drawGroupedFocusMarker",
          value: function drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex) {
            var _this71 = this;

            var canvas = this.getElementByID("focusGroupMarkerCanvas-" + groupIndex + "-" + instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (this.groupingMode == this.enumList.groupingMode.SINGLE && group.showDetails) {
              instance.groupWithMarkerList = [];
              instance.overviewInstance.groupList.forEach(function (instanceGroup, instanceGroupIndex) {
                if (instanceGroup.isSelected) {
                  instance.groupWithMarkerList.push(instanceGroup);
                  var x = (_this71.config.focusGraph.markerSize + _this71.config.focusGraph.marginBetweenMarkers) * instanceGroupIndex;

                  _this71.drawGroupedFocusMarkerWrapper(context, instanceGroup, x);
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

            context.font = this.config.focusGraph.markerSize + "px calculator";
            context.fillStyle = group.color; // context.fillRect(x, 0, this.config.focusGraph.markerSize, this.config.focusGraph.markerSize);

            context.fillText(this.getGroupNumber(group), x, 0 + this.config.focusGraph.markerSize);
          }
        }, {
          key: "drawGroupedFocusGraph",
          value: function drawGroupedFocusGraph() {
            var _this72 = this;

            this.currentTab.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  _this72.drawGroupedFocusGraphWrapper(group, groupIndex, instance, instanceIndex);
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
            var _this73 = this;

            metricList.forEach(function (metric, metricListIndex) {
              metric.layerList.forEach(function (layer, layerIndex) {
                var panelMetric = _this73.panel.metricList[metricIndexList[metricListIndex]];
                context.fillStyle = panelMetric.colorList[layerIndex];
                var y = (_this73.config.focusGraph.metricMaxHeight + _this73.config.focusGraph.marginBetweenMetrics) * metricListIndex + _this73.config.focusGraph.metricMaxHeight;
                context.beginPath(); // start drawing from bottom

                context.moveTo(0, y);
                var x = 0;
                var totalValue = 0;
                valueIndexList.forEach(function (valueIndex, positionIndex) {
                  var value = layer.valueList[valueIndex];

                  if (value != null) {
                    x = pointWidth * positionIndex;

                    _this73.moveFocusGraphContextBasedOnValue(context, value, layer, layerIndex, x, y);

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
            var _this74 = this;

            this.currentTab.focusModel.data.forEach(function (instance, instanceIndex) {
              var canvas = _this74.getUngroupedFocusCanvas(instanceIndex);

              var context = _this74.getCanvasContext(canvas);

              context.clearRect(0, 0, canvas.width, canvas.height);
              var valueIndexList = Array.from(Array(_this74.getMaxMetricLength()).keys());
              var metricList = [instance.metricList[_this74.currentTab.overviewModel.selectedMetricIndex]];
              var metricIndexList = [_this74.currentTab.overviewModel.selectedMetricIndex];

              if (instance.showAllMetrics) {
                metricList = instance.metricList;
                metricIndexList = Array.from(Array(instance.metricList.length).keys());
              }

              _this74.drawFocusGraphInstance(context, valueIndexList, _this74.currentTab.focusModel.pointWidth, metricList, metricIndexList);
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
          key: "collapseExpandFocus",
          value: function collapseExpandFocus() {
            this.collapseFocusGraph = !this.collapseFocusGraph;

            if (this.collapseFocusGraph) {
              this.focusPanelHeight -= this.config.focusGraph.graphHeight;
              this.overviewPanelHeight += this.config.focusGraph.graphHeight;
            } else {
              this.focusPanelHeight += this.config.focusGraph.graphHeight;
              this.overviewPanelHeight -= this.config.focusGraph.graphHeight;
            }
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
            var _this75 = this;

            this.overviewMarkerMovingBackwards = false;
            this.overviewGroupWithInterval.overviewMarkerX = 0;
            this.currentOverviewMarkerInterval = this.$interval(function () {
              if (_this75.overviewMarkerMovingBackwards) {
                _this75.handleOverviewMarkerMovingBackwardCase();
              } else {
                _this75.handleOverviewMarkerMovingForwardCase();
              }

              if (_this75.currentTab.focusModel.overviewGroupWithIntervalList) {
                _this75.currentTab.focusModel.overviewGroupWithIntervalList.forEach(function (overviewGroup) {
                  overviewGroup.markerX = _this75.overviewGroupWithInterval.overviewMarkerX;
                });
              }

              _this75.drawSelectedGroupsMarkers();
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
            var _this76 = this;

            event.preventDefault();
            this.$timeout(function () {
              group.showDetails = !group.showDetails;

              _this76.scope.$apply();

              _this76.drawFocusGraphData();
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
            var canvas = this.getGroupedFocusCanvas(groupIndex, instanceIndex); //  this.showPopup(instance, evt, groupIndex, instanceIndex, canvas)
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
