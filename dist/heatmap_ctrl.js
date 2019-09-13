"use strict";

System.register(["app/plugins/sdk", "./heatmap.css!", "moment", "lodash"], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, moment, relativeTimeThreshold, _, HeatmapCtrl;

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
      relativeTimeThreshold = _moment.relativeTimeThreshold;
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
          _this.firstLoad = true;
          _this.overviewModel = {};
          _this.overviewModel.groupMarkerList = [];
          _this.focusModel = {};
          _this.focusModel.groupList = [];

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
            this.config = {
              apiAddress: "http://localhost:3000/api/datasources/proxy/1/api/v1/query_range?query=",
              dateFormat: "DD/MM/YY HH:mm:ss",
              colorCount: 4,
              maxLuminanceChange: 0.8,
              marginBetweenOverviewAndFocus: 20,
              startingGreyColor: 240,
              endingGrayColor: 80,
              // determines which the order of attributes to use for sorting
              sortOrder: [0, 1, 2],
              intervalTimer: 70
            };
            this.initialiseOverviewConfig();
            this.initialiseFocusAreaConfig();
            this.initialiseFocusGraphConfig();
          }
        }, {
          key: "initialiseOverviewConfig",
          value: function initialiseOverviewConfig() {
            this.config.overview = {
              topAndBottomPadding: 20,
              metricFontSize: 15,
              timeFontSize: 10,
              marginBetweenLabelsAndOverview: 10,
              pointWidth: 1,
              groupedPointHeight: 5,
              ungroupedPointHeight: 1,
              verticalMarginBetweenMetrics: 2,
              horizontalMarginBetweenMetrics: 30,
              marginBetweenGroups: 10,
              groupBarWidth: 9,
              singleAttributeGroupSizeWidth: 1,
              multipleAttributeGroupSizeWidth: 2,
              marginBetweenMarkerAndGroup: 15,
              marginBetweenMetricAndGroupSize: 10
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
          key: "initialiseFocusGraphConfig",
          value: function initialiseFocusGraphConfig() {
            var _this$config$focusGra;

            this.config.focusGraph = (_this$config$focusGra = {
              maxWidth: 10000,
              maxHeight: 10000,
              groupedPointWidth: 3,
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
            this.linkingMode = this.enumList.linkingMode.X_CROSS;
            this.groupingMode = this.enumList.groupingMode.SINGLE;
            this.isGrouped = true;
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

            this.timeIndicatorCanvas = this.getElementByID("timeIndicatorCanvas");
            this.timeIndicatorContext = this.getCanvasContext(this.timeIndicatorCanvas); // focus graph

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
            var _this12 = this;

            this.overviewModel.data.sort(function (first, second) {
              for (var i = 0; i < _this12.config.sortOrder.length; ++i) {
                var metricIndex = _this12.config.sortOrder[i];

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
            var _this13 = this;

            this.overviewModel.metricList.forEach(function (metric, metricIndex) {
              metric.groupList = [];

              _this13.overviewModel.data.forEach(function (instance) {
                var group = _.find(metric.groupList, function (search) {
                  return instance.metricList[metricIndex].total == search.total;
                });

                if (!group) {
                  group = _this13.initialiseNewSingleAttributeGroups(instance, metricIndex);
                  metric.groupList.push(group);
                }

                group.instanceList.push(instance);
              });

              metric.groupList.sort(function (first, second) {
                return first.total - second.total;
              });

              _this13.initialiseSingleAttributeGroupsColor(metric, metricIndex);
            });
            this.initialiseSingleAttributeInstanceGroupList();
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

            var luminanceChange = -this.config.maxLuminanceChange / metric.groupList.length;
            var originalColor = this.panel.metricList[metricIndex].colorList[0];
            metric.groupList.forEach(function (group, groupIndex) {
              group.color = _this14.changeColorLuminance(originalColor, groupIndex * luminanceChange);
            });
          }
        }, {
          key: "initialiseSingleAttributeInstanceGroupList",
          value: function initialiseSingleAttributeInstanceGroupList() {
            var _this15 = this;

            this.overviewModel.data.forEach(function (instance) {
              instance.groupList = [];

              _this15.overviewModel.metricList.forEach(function (metric, metricIndex) {
                for (var i = 0; i < metric.groupList.length; ++i) {
                  var group = metric.groupList[i];

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
            var _this16 = this;

            this.overviewModel.groupList = [];
            this.overviewModel.data.forEach(function (instance) {
              var group = _.find(_this16.overviewModel.groupList, function (search) {
                for (var i = 0; i < instance.metricList.length; ++i) {
                  if (instance.metricList[i].total != search.metricList[i].total) {
                    return false;
                  }
                }

                return true;
              });

              if (!group) {
                group = _this16.initialiseNewMultiAttributeGroup(instance);

                _this16.overviewModel.groupList.push(group);
              }

              group.instanceList.push(instance);
            });
            this.initialiseMultiAttributeGroupsColor();
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
            var _this17 = this;

            var colorStep = (this.config.startingGreyColor - this.config.endingGrayColor) / this.overviewModel.groupList.length;
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var greyValue = Math.round(_this17.config.startingGreyColor - colorStep * groupIndex);
              group.color = "rgba(" + greyValue + ", " + greyValue + ", " + greyValue + ", 1)";
            });
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
            var _this18 = this;

            this.$timeout(function () {
              _this18.overviewContext.clearRect(0, 0, _this18.overviewCanvas.width, _this18.overviewCanvas.height);

              _this18.setOverviewCanvasSize();

              _this18.focusGraphMarginTop = _this18.overviewCanvasHeight + _this18.config.marginBetweenOverviewAndFocus;

              _this18.drawOverviewData();
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
            this.setOverviewContextTimeFont();
            this.overviewModel.toDate = this.getDateString(this.toDate * 1000);
            this.overviewModel.toDateWidth = this.overviewContext.measureText(this.overviewModel.toDate).width; // total width of overiew graph (groupsize excluded)

            this.overviewModel.overviewWidth = this.getMaxMetricLength() * this.overviewModel.metricList.length * this.config.overview.pointWidth + this.config.overview.marginBetweenMarkerAndGroup * this.overviewModel.metricList.length + this.config.overview.horizontalMarginBetweenMetrics * (this.overviewModel.metricList.length - 1);
            this.overviewCanvasWidth = this.overviewModel.overviewWidth;

            if (this.isGrouped) {
              this.setGroupedOverviewCanvasWidth();
            } else {
              this.overviewCanvasWidth += this.overviewModel.toDateWidth / 2;
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
          key: "setGroupedOverviewCanvasWidth",
          value: function setGroupedOverviewCanvasWidth() {
            var _this19 = this;

            this.overviewCanvasWidth += this.config.overview.marginBetweenMarkerAndGroup * this.overviewModel.metricList.length;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize * this.overviewModel.metricList.length;
              this.overviewModel.metricList.forEach(function (metric) {
                _this19.overviewCanvasWidth += _this19.getMaxGroupSizeBarLength(metric) * _this19.config.overview.singleAttributeGroupSizeWidth;
              });
            } else {
              this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize + this.getMaxMultiAttributeGroupSize() * this.config.overview.multipleAttributeGroupSizeWidth;
            }
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
            var groupCount;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
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

            if (this.isGrouped) {
              this.drawGroupedOverview();
            } else {
              this.drawUngroupedOverview();
            }

            this.drawMetricLabels();
            this.drawToDateLabel();
          }
        }, {
          key: "drawGroupedOverview",
          value: function drawGroupedOverview() {
            var _this20 = this;

            this.overviewModel.overviewInstanceHeight = this.config.overview.groupedPointHeight;

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewModel.metricList.forEach(function (metric, metricIndex) {
                metric.groupList.forEach(function (group, groupIndex) {
                  _this20.drawGroupOverviewWrapper(group, groupIndex, [metricIndex]);
                });
              });
            } else {
              this.overviewModel.groupList.forEach(function (group, groupIndex) {
                var metricIndexList = _this20.getAllMetricIndexList();

                _this20.drawGroupOverviewWrapper(group, groupIndex, metricIndexList);
              });
            }

            this.drawGroupSize();
            this.drawMetricSeparator();
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
          value: function drawOverviewInstance(instance, index, pointHeight, marginBetweenInstances, metricIndexList) {
            var _this21 = this;

            instance.y = this.overviewModel.overviewStartY + index * (pointHeight + marginBetweenInstances);
            var endY = instance.y + pointHeight;

            if (endY > this.overviewModel.overviewEndY) {
              this.overviewModel.overviewEndY = endY;
            }

            metricIndexList.forEach(function (metricIndex) {
              _this21.drawOverviewInstanceMetric(instance, metricIndex, pointHeight);
            });
          }
        }, {
          key: "drawOverviewInstanceMetric",
          value: function drawOverviewInstanceMetric(instance, metricIndex, pointHeight) {
            var overviewMetric = this.overviewModel.metricList[metricIndex];

            if (metricIndex > 0) {
              var previousMetric = this.overviewModel.metricList[metricIndex - 1];
              overviewMetric.startX = previousMetric.endX + this.config.overview.horizontalMarginBetweenMetrics;

              if (this.isGrouped) {
                overviewMetric.startX += this.config.overview.marginBetweenMarkerAndGroup;

                if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                  var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(previousMetric);
                  overviewMetric.startX += maxGroupSizeBarLength + this.config.overview.marginBetweenMetricAndGroupSize;
                }
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
            var _this22 = this;

            var instanceMetric = instance.metricList[metricIndex];
            instanceMetric.data.forEach(function (point, pointIndex) {
              point.x = overviewMetric.startX + pointIndex * _this22.config.overview.pointWidth;
              point.color = _this22.getColorFromMap(point.value, _this22.overviewModel.metricList[metricIndex].colorMap);
              _this22.overviewContext.fillStyle = point.color;

              _this22.overviewContext.fillRect(point.x, instance.y, _this22.config.overview.pointWidth, pointHeight);
            });
          }
        }, {
          key: "getColorFromMap",
          value: function getColorFromMap(value, map) {
            var _this23 = this;

            var result;
            map.forEach(function (color, threshold) {
              if (_this23.isBetween(value, threshold.min, threshold.max)) {
                result = color;
              }
            });
            return result;
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
            var _this24 = this;

            this.overviewModel.metricList.forEach(function (metric) {
              var startX = metric.endX + _this24.config.overview.marginBetweenMetricAndGroupSize;

              var maxGroupSizeBarLength = _this24.getMaxGroupSizeBarLength(metric);

              metric.groupList.forEach(function (group, groupIndex) {
                _this24.drawGroupSizeWrapper(startX, group, groupIndex, _this24.config.overview.singleAttributeGroupSizeWidth);
              });
              _this24.overviewContext.fillStyle = "black";

              _this24.overviewContext.fillText("Groups size", (startX * 2 + maxGroupSizeBarLength - labelWidth) / 2, _this24.overviewModel.labelTextHeight);
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
            var _this25 = this;

            var startX = this.overviewModel.overviewWidth + this.config.overview.horizontalMarginBetweenMetrics;
            var maxEndX = 0;
            this.overviewModel.groupList.forEach(function (group, groupIndex) {
              var endX = _this25.drawGroupSizeWrapper(startX, group, groupIndex, _this25.config.overview.multipleAttributeGroupSizeWidth);

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

            for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
              var metric = this.overviewModel.metricList[i];
              var x = metric.endX + this.config.overview.horizontalMarginBetweenMetrics / 2;

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
          }
        }, {
          key: "drawUngroupedOverview",
          value: function drawUngroupedOverview() {
            var _this26 = this;

            this.overviewModel.overviewInstanceHeight = this.config.overview.ungroupedPointHeight;
            this.overviewModel.data.forEach(function (instance, instanceIndex) {
              var metricIndexList = _this26.getAllMetricIndexList();

              _this26.drawOverviewInstance(instance, instanceIndex, _this26.config.overview.ungroupedPointHeight, 0, metricIndexList);
            });
            this.drawGroupBars();
          }
        }, {
          key: "drawGroupBars",
          value: function drawGroupBars() {
            for (var i = 1; i < this.overviewModel.metricList.length; ++i) {
              var x = this.overviewModel.metricList[i].startX - this.config.overview.horizontalMarginBetweenMetrics / 2;
              this.drawGroupBarAtPosition(x);
            }
          }
        }, {
          key: "drawGroupBarAtPosition",
          value: function drawGroupBarAtPosition(x) {
            var _this27 = this;

            var y = this.overviewModel.overviewStartY;
            this.overviewModel.groupList.forEach(function (group) {
              _this27.overviewContext.fillStyle = group.color;
              var height = group.instanceList.length * _this27.config.overview.ungroupedPointHeight;

              _this27.overviewContext.fillRect(x - Math.floor(_this27.config.overview.groupBarWidth / 2), y, _this27.config.overview.groupBarWidth, height);

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
            this.focusModel.groupList = [];
            this.overviewModel.groupList.forEach(function (group) {
              group.isSelected = false;
            });
            this.overviewModel.metricList.forEach(function (metric) {
              if (metric.groupList) {
                metric.groupList.forEach(function (group) {
                  group.isSelected = false;
                });
              }
            });
            this.showFocus = false;
          }
        }, {
          key: "groupUngroup",
          value: function groupUngroup() {
            this.isGrouped = !this.isGrouped;
            this.changeGroupingSelection();
          }
        }, {
          key: "moveMouseOnOverview",
          value: function moveMouseOnOverview(evt) {
            this.setOverviewMousePosition(evt);

            if (this.isGrouped) {
              this.initialiseOverviewCanvasCursor();
              this.overviewModel.hoveredGroup = null;
              this.overviewModel.hoveredMarker = null;
              var found = this.checkMouseIsOnGroupAndSetGroupSelected();

              if (found) {
                this.drawTimeIndicators();
              } else {
                this.clearTimeIndicator();
                this.checkAndSetSelectedOverviewMarker();
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
          key: "getMousePos",
          value: function getMousePos(evt, canvas) {
            var rect = canvas.getBoundingClientRect();
            return {
              x: evt.clientX - rect.left,
              y: evt.clientY - rect.top
            };
          }
        }, {
          key: "checkMouseIsOnGroupAndSetGroupSelected",
          value: function checkMouseIsOnGroupAndSetGroupSelected() {
            for (var overviewIndex = 0; overviewIndex < this.overviewModel.metricList.length; ++overviewIndex) {
              var metric = this.overviewModel.metricList[overviewIndex];

              if (metric) {
                // only check if mouse is on a metric graph
                if (this.isBetween(this.overviewModel.mousePosition.x, metric.startX, metric.endX)) {
                  this.overviewModel.selectedMetric = metric;
                  this.overviewModel.mousePositionXOffset = this.overviewModel.mousePosition.x - metric.startX;

                  if (this.checkAndSetSelectedGroup(metric)) {
                    return true;
                  }
                }
              }
            }

            return false;
          }
        }, {
          key: "checkAndSetSelectedGroup",
          value: function checkAndSetSelectedGroup(metric) {
            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
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

            return false;
          }
        }, {
          key: "checkGroupIsSelected",
          value: function checkGroupIsSelected(group) {
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
                break;
              }
            }
          }
        }, {
          key: "drawTimeIndicators",
          value: function drawTimeIndicators() {
            var _this28 = this;

            this.clearTimeIndicator();
            this.timeIndicatorContext.strokeStyle = "black";

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.drawTimeIndicatorWrapper(this.overviewModel.selectedMetric);
            } else {
              this.overviewModel.metricList.forEach(function (metric) {
                _this28.drawTimeIndicatorWrapper(metric);
              });
            }

            this.drawSelectedTimeLabel();
          }
        }, {
          key: "drawTimeIndicatorWrapper",
          value: function drawTimeIndicatorWrapper(metric) {
            // horizontal line
            var horizontalLineY = this.overviewModel.hoveredGroup.y - this.config.overview.marginBetweenGroups / 2;
            this.timeIndicatorContext.beginPath();
            this.timeIndicatorContext.moveTo(metric.startX, horizontalLineY);
            this.timeIndicatorContext.lineTo(metric.endX, horizontalLineY);
            this.timeIndicatorContext.stroke();
            this.timeIndicatorContext.closePath(); // vertical line

            var verticalLineX = metric.startX + this.overviewModel.mousePositionXOffset;
            this.timeIndicatorContext.beginPath();
            this.timeIndicatorContext.moveTo(verticalLineX, horizontalLineY);
            this.timeIndicatorContext.lineTo(verticalLineX, this.overviewModel.hoveredGroup.y);
            this.timeIndicatorContext.stroke();
            this.timeIndicatorContext.closePath();
          }
        }, {
          key: "clearTimeIndicator",
          value: function clearTimeIndicator() {
            this.timeIndicatorContext.clearRect(0, 0, this.timeIndicatorCanvas.width, this.timeIndicatorCanvas.height);
          }
        }, {
          key: "drawSelectedTimeLabel",
          value: function drawSelectedTimeLabel() {
            for (var metricIndex = 0; metricIndex < this.overviewModel.metricList.length; ++metricIndex) {
              var instanceMetric = this.overviewModel.hoveredGroup.instanceList[0].metricList[metricIndex];

              for (var pointIndex = 0; pointIndex < instanceMetric.data.length; ++pointIndex) {
                var point = instanceMetric.data[pointIndex];

                if (this.isBetween(this.overviewModel.mousePosition.x, point.x, point.x + this.config.overview.pointWidth)) {
                  this.timeIndicatorContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
                  this.timeIndicatorContext.fillStyle = "black";
                  var date = this.getDateString(point.date * 1000);
                  var y = this.overviewModel.overviewStartY + this.overviewModel.overviewHeight + this.config.overview.marginBetweenLabelsAndOverview;
                  var x = Math.max(0, this.overviewModel.mousePosition.x - this.overviewModel.toDateWidth / 2);
                  this.timeIndicatorContext.fillText(date, x, y);
                  return;
                }
              }
            }
          }
        }, {
          key: "clickOnOverView",
          value: function clickOnOverView(evt) {
            var _this29 = this;

            this.setOverviewMousePosition(evt);

            if (this.isGrouped) {
              this.$timeout(function () {
                if (_this29.overviewModel.hoveredGroup) {
                  _this29.addOrRemoveGroupToFocus();

                  _this29.drawSelectedGroupsMarkers();
                } else if (_this29.overviewModel.hoveredMarker) {
                  _this29.startFocusMarkerInterval(_this29.overviewModel.hoveredMarker.group);
                } else {
                  _this29.stopInterval();
                }

                _this29.drawFocusGraph();
              });
            } else {
              this.fixFocusArea(evt);
            }
          }
        }, {
          key: "addOrRemoveGroupToFocus",
          value: function addOrRemoveGroupToFocus() {
            var _this30 = this;

            var focusGroup = _.find(this.focusModel.groupList, function (search) {
              return search.overviewGroup == _this30.overviewModel.hoveredGroup;
            });

            if (focusGroup) {
              this.overviewModel.hoveredGroup.isSelected = false;

              _.remove(this.focusModel.groupList, function (group) {
                return group.overviewGroup == _this30.overviewModel.hoveredGroup;
              });
            } else {
              this.overviewModel.hoveredGroup.isSelected = true;
              this.addGroupToFocus();
            }

            this.scope.$apply();
          }
        }, {
          key: "addGroupToFocus",
          value: function addGroupToFocus() {
            var _this31 = this;

            var focusGroup = {};
            focusGroup.instanceList = [];
            focusGroup.overviewGroup = this.overviewModel.hoveredGroup;
            this.overviewModel.hoveredGroup.instanceList.forEach(function (overviewInstance) {
              var metricWithMostData = _.maxBy(overviewInstance.metricList, function (metric) {
                return metric.data.length;
              });

              _this31.focusModel.focusedIndexList = Array.from(Array(metricWithMostData.data.length).keys());

              var focusInstance = _this31.getFocusInstance(overviewInstance, _this31.focusModel.focusedIndexList);

              focusGroup.instanceList.push(focusInstance);
            });
            this.focusModel.groupList.push(focusGroup);
          }
        }, {
          key: "drawSelectedGroupsMarkers",
          value: function drawSelectedGroupsMarkers() {
            var _this32 = this;

            this.clearFocusArea();
            this.overviewModel.groupMarkerList = [];

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
              this.overviewModel.metricList.forEach(function (metric) {
                metric.groupList.forEach(function (group) {
                  _this32.drawOverviewGroupMarker(group, [metric]);
                });
              });
            } else {
              this.overviewModel.groupList.forEach(function (group) {
                _this32.drawOverviewGroupMarker(group, _this32.overviewModel.metricList);
              });
            }
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

                _this33.overviewModel.groupMarkerList.push(marker);
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
                this.focusModel.overviewGroupWithIntervalList.forEach(function (overviewGroup) {
                  overviewGroup.markerX = 0;
                });
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
            var _this34 = this;

            this.focusMarkerMovingBackwards = false;
            this.focusGroupWithInterval.focusMarkerX = 0;
            this.currentFocusMarkerInterval = this.$interval(function () {
              if (_this34.focusMarkerMovingBackwards) {
                _this34.handleFocusMarkerMovingBackwardCase();
              } else {
                _this34.handleFocusMarkerMovingForwardCase();
              }

              _this34.drawGroupFocusMarkers();
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
            if (this.overviewModel.mousePosition) {
              var size = this.getFocusAreaSize();
              var minimumTopY = Math.max(this.overviewModel.overviewStartY, this.overviewModel.mousePosition.y - size / 2);
              this.focusModel.focusStartY = Math.min(minimumTopY, this.overviewModel.overviewEndY - size);
              this.drawFocusAreaAndLinkers(true);
            }
          }
        }, {
          key: "getFocusAreaSize",
          value: function getFocusAreaSize() {
            return Math.min(this.config.focusArea.focusAreaSize * 2, this.overviewModel.overviewEndY - this.overviewModel.overviewStartY);
          }
        }, {
          key: "drawFocusAreaAndLinkers",
          value: function drawFocusAreaAndLinkers(doDrawLinkers) {
            var _this35 = this;

            var size = this.getFocusAreaSize();
            var offset = this.getFocusAreaOffset();

            if (offset >= 0) {
              if (doDrawLinkers) {
                this.clearFocusArea();
              }

              this.focusAreaContext.strokeStyle = this.config.focusArea.color;
              this.overviewModel.metricList.forEach(function (metric) {
                metric.focusStartX = metric.startX + offset;

                _this35.focusAreaContext.strokeRect(metric.focusStartX, _this35.focusModel.focusStartY, size, size);
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
                this.focusModel.sourceMetricIndex = i;
                return Math.min(Math.max(metric.startX, this.overviewModel.mousePosition.x - this.config.focusArea.focusAreaSize), metric.endX - this.getFocusAreaSize()) - metric.startX;
              }
            }
          }
        }, {
          key: "drawLinkers",
          value: function drawLinkers() {
            var _this36 = this;

            var pixelData = this.overviewContext.getImageData(this.overviewModel.mousePosition.x, this.overviewModel.mousePosition.y, 1, 1).data;
            this.focusAreaContext.strokeStyle = "rgb(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + ")";
            var instance = this.getLinkerTargetInstance();
            instance = null; // temp flag to prevent drawing linkers

            if (instance) {
              this.overviewModel.metricList.forEach(function (metric, index) {
                if (!_this36.checkMouseIsInMetric(metric)) {
                  _this36.drawLinkersByMode(metric, instance, index);
                }
              });
            }
          }
        }, {
          key: "getLinkerTargetInstance",
          value: function getLinkerTargetInstance() {
            for (var i = 0; i < this.overviewModel.data.length; ++i) {
              var instance = this.overviewModel.data[i];

              if (this.isBetween(this.overviewModel.mousePosition.y, instance.y - this.config.overview.ungroupedPointHeight, instance.y)) {
                return instance;
              }
            }
          }
        }, {
          key: "drawLinkersByMode",
          value: function drawLinkersByMode(metric, instance, index) {
            switch (this.linkingMode) {
              case this.enumList.linkingMode.X_CROSS:
                this.drawXCross(metric, instance);
                break;

              case this.enumList.linkingMode.NORMAL_CROSS:
                this.drawNormalCross(metric, instance);
                break;

              case this.enumList.linkingMode.CHANGE_COLOR:
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
            var _this37 = this;

            if (index == 0) {
              this.clearFocusArea();
            }

            instance.metricList[index].data.forEach(function (instancePoint, pointIndex) {
              var colorList = _this37.panel.metricList[_this37.focusModel.sourceMetricIndex].colorList;

              var colorMap = _this37.getColorMap(metric, colorList);

              _this37.focusAreaContext.fillStyle = _this37.getColorFromMap(instancePoint.value, colorMap);

              _this37.focusAreaContext.fillRect(instancePoint.x, instance.y, _this37.overviewModel.overviewInstanceHeight, _this37.overviewModel.overviewInstanceHeight);

              if (instancePoint.x == metric.startX + _this37.overviewModel.mousePositionXOffset) {
                // vertical line
                metric.data.forEach(function (metricInstance, metricInstanceIndex) {
                  var metricPoint = metricInstance.values[pointIndex];
                  var value = metricPoint ? metricPoint[1] : 0;
                  _this37.focusAreaContext.fillStyle = _this37.getColorFromMap(value, colorMap);

                  _this37.focusAreaContext.fillRect(instancePoint.x, _this37.overviewModel.data[metricInstanceIndex].y, _this37.overviewModel.overviewInstanceHeight, _this37.overviewModel.overviewInstanceHeight);
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
            var _this38 = this;

            if (!this.isGrouped) {
              this.initialiseFocusGraphData();
            }

            if (this.isGrouped && this.focusModel.groupList.length > 0 || !this.isGrouped && this.focusModel.data.length > 0) {
              this.showFocus = true;
              this.$timeout(function () {
                _this38.focusGraphHeight = _this38.overviewModel.metricList.length * _this38.config.focusGraph.metricMaxHeight + (_this38.overviewModel.metricList.length - 1) * _this38.config.focusGraph.marginBetweenMetrics;
                _this38.focusGraphWidth = (_this38.focusModel.focusedIndexList.length - 1) * _this38.getFocusGraphPointWidth();

                _this38.scope.$apply();

                var focusGraphRow = _this38.getElementByID("focusGraphRow");

                if (focusGraphRow) {
                  _this38.focusModel.focusRowHeight = focusGraphRow.offsetHeight;

                  _this38.setFocusFromAndToDate();

                  _this38.positionFocusFromAndToDate();

                  _this38.drawFocusGraphData();

                  _this38.autoSrollFocusGraph();
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
            var _this39 = this;

            if (!this.focusModel.data) {
              this.focusModel.data = [];
            }

            this.focusModel.data.length = 0;
            this.overviewModel.data.forEach(function (overviewInstance) {
              if (_this39.checkInstanceInFocus(overviewInstance)) {
                _this39.focusModel.focusedIndexList = _this39.getIndexesOfPointsInFocus(overviewInstance);

                var focusInstance = _this39.getFocusInstance(overviewInstance, _this39.focusModel.focusedIndexList);

                _this39.focusModel.data.push(focusInstance);
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
            var _this40 = this;

            var indexes = [];

            for (var i = 0; i < overviewInstance.metricList.length; ++i) {
              var metric = overviewInstance.metricList[i];

              if (metric.data.length > 0) {
                var overviewMetric = this.overviewModel.metricList[i];
                metric.data.forEach(function (point, index) {
                  if (_this40.isBetween(point.x, overviewMetric.focusStartX, overviewMetric.focusStartX + _this40.getFocusAreaSize())) {
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
            var _this41 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              _this41.panel.metricList[metricIndex].colorList.forEach(function () {
                var layer = {};
                layer.valueList = [];
                metric.layerList.push(layer);
              });

              metric.data.forEach(function (point) {
                var value = point.value;
                metric.layerList.forEach(function (layer) {
                  layer.valueList.push(value > 0 ? value : 0);
                  value -= _this41.overviewModel.metricList[metricIndex].layerRange;
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
                  this.focusedFromDate = this.getDateString(metric.data[fromIndex].date * 1000);
                  this.focusedToDate = this.getDateString(metric.data[toIndex].date * 1000);
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
            var _this42 = this;

            if (this.isGrouped) {
              this.$timeout(function () {
                if (_this42.groupingMode == _this42.enumList.groupingMode.SINGLE) {
                  _this42.focusGraphMarkerWidth = (_this42.config.focusGraph.markerSize + _this42.config.focusGraph.marginBetweenMarkers) * _this42.overviewModel.metricList.length;
                } else {
                  _this42.focusGraphMarkerWidth = _this42.config.focusGraph.markerSize + _this42.config.focusGraph.marginBetweenMarkers;
                }

                _this42.focusGraphMarkerHeight = _this42.config.focusGraph.markerSize;

                _this42.scope.$apply();

                _this42.drawGroupFocusMarkers();

                _this42.drawGroupedFocusGraph();
              });
            } else {
              this.drawUngroupedFocusGraph();
            }
          }
        }, {
          key: "drawGroupFocusMarkers",
          value: function drawGroupFocusMarkers() {
            var _this43 = this;

            this.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  _this43.drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex);
                }
              });
            });
          }
        }, {
          key: "drawGroupedFocusMarker",
          value: function drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex) {
            var _this44 = this;

            var canvas = this.getElementByID("focusGroupMarkerCanvas-" + groupIndex + "-" + instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);

            if (this.groupingMode == this.enumList.groupingMode.SINGLE && group.showDetails) {
              instance.groupWithMarkerList = [];
              instance.overviewInstance.groupList.forEach(function (instanceGroup, instanceGroupIndex) {
                if (instanceGroup.isSelected) {
                  instance.groupWithMarkerList.push(instanceGroup);
                  var x = (_this44.config.focusGraph.markerSize + _this44.config.focusGraph.marginBetweenMarkers) * instanceGroupIndex;

                  _this44.drawGroupedFocusMarkerWrapper(context, instanceGroup, x);
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
            var _this45 = this;

            this.focusModel.groupList.forEach(function (group, groupIndex) {
              group.instanceList.forEach(function (instance, instanceIndex) {
                if (instanceIndex == 0 || group.showDetails) {
                  _this45.drawGroupedFocusGraphWrapper(groupIndex, instance, instanceIndex);
                }
              });
            });
          }
        }, {
          key: "drawGroupedFocusGraphWrapper",
          value: function drawGroupedFocusGraphWrapper(groupIndex, instance, instanceIndex) {
            var canvas = this.getElementByID("focusGraphCanvas-" + groupIndex + "-" + instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);
            this.drawFocusGraphInstance(instance, context);
          }
        }, {
          key: "drawFocusGraphInstance",
          value: function drawFocusGraphInstance(instance, context) {
            var _this46 = this;

            instance.metricList.forEach(function (metric, metricIndex) {
              metric.layerList.forEach(function (layer, layerIndex) {
                // start drawing from bottom
                var y = (_this46.config.focusGraph.metricMaxHeight + _this46.config.focusGraph.marginBetweenMetrics) * metricIndex + _this46.config.focusGraph.metricMaxHeight;
                context.beginPath();
                context.moveTo(0, y);
                var x = 0;
                var previousX = 0;
                var previousValue = 0;
                layer.valueList.forEach(function (value, valueIndex) {
                  x = _this46.getFocusGraphPointWidth() * valueIndex;

                  _this46.moveContextBasedOnValue(context, value, previousX, previousValue, layerIndex, x, y, _this46.overviewModel.metricList[metricIndex].layerRange);

                  previousX = x;
                  previousValue = value;
                });
                context.lineTo(x, y);
                context.lineTo(_this46.focusModel.graphBeginX, y);
                context.closePath();
                context.fillStyle = _this46.panel.metricList[metricIndex].colorList[layerIndex];
                context.fill();
              });
            });
          }
        }, {
          key: "drawUngroupedFocusGraph",
          value: function drawUngroupedFocusGraph() {
            var _this47 = this;

            this.focusModel.data.forEach(function (instance, instanceIndex) {
              var canvas = _this47.getElementByID("focusGraphCanvas-" + instanceIndex);

              var context = _this47.getCanvasContext(canvas);

              context.clearRect(0, 0, canvas.width, canvas.height);

              _this47.drawFocusGraphInstance(instance, context);
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
            var _this48 = this;

            this.overviewMarkerMovingBackwards = false;
            this.overviewGroupWithInterval.overviewMarkerX = 0;
            this.currentOverviewMarkerInterval = this.$interval(function () {
              if (_this48.overviewMarkerMovingBackwards) {
                _this48.handleOverviewMarkerMovingBackwardCase();
              } else {
                _this48.handleOverviewMarkerMovingForwardCase();
              }

              _this48.focusModel.overviewGroupWithIntervalList.forEach(function (overviewGroup) {
                overviewGroup.markerX = _this48.overviewGroupWithInterval.overviewMarkerX;
              });

              _this48.drawSelectedGroupsMarkers();
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
            var _this49 = this;

            event.preventDefault();
            this.$timeout(function () {
              group.showDetails = !group.showDetails;

              _this49.scope.$apply();

              _this49.drawFocusGraphData();
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
            var _this50 = this;

            this.variableSrv.variables.forEach(function (v) {
              if (v.name == "node") {
                _this50.variableSrv.setOptionAsCurrent(v, {
                  text: instance.instance,
                  value: instance.instance
                });

                _this50.isUpdatingVariable = true;

                _this50.variableSrv.variableUpdated(v, true);
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
