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

          _this.initialiseConfig();

          return _this;
        }

        _createClass(HeatmapCtrl, [{
          key: "initialiseConfig",
          value: function initialiseConfig() {
            this.config = {
              apiAddress: "http://localhost:3000/api/datasources/proxy/1/api/v1/query_range?query=",
              instancePropertyName: "instance",
              dateFormat: "DD-MM-YYYY HH:mm",
              focusAreaColor: "Aqua",
              focusAreaSize: 20,
              colors: [["f2d9e6", "d98cb3", "bf4080", "73264d"], ["ccddff", "6699ff", "0055ff", "003399"], ["eeeedd", "cccc99", "aaaa55", "666633"]],
              overviewPointWidth: 1,
              overviewPointHeight: 1,
              verticalMarginBetweenOverviewMetrics: 2,
              horizontalMarginBetweenOverviewMetrics: 20,
              marginBetweenInstances: 6,
              focusGraphLeftMargin: 40,
              xCrossSize: 15,
              marginBetweenOverviewAndFocus: 50,
              fontSize: 15,
              focusPointWidth: 5,
              focusMetricMaxHeight: 30,
              marginBetweenFocusMetrics: 10,
              marginBetweenFocusInstances: 20
            };
          }
        }, {
          key: "link",
          value: function link(scope, elem, attrs, ctrl) {
            this.scope = scope;
            this.scope.ctrl.overviewMode = "1";
            this.scope.ctrl.linkingMode = "xCross";
            this.elem = elem;
            var parent = this;

            scope.selectOverviewMode = function () {
              parent.selectOverviewMode();
            };

            scope.selectLinker = function () {
              parent.selectLinker();
            };

            scope.moveFocusArea = function (evt) {
              parent.moveFocusArea.bind(parent, evt)();
            };

            scope.fixFocusArea = function (evt) {
              parent.fixFocusArea.bind(parent, evt)();
            };

            scope.selectNode = function () {
              parent.selectNode.bind(parent)();
            };

            this.initialiseCanvases();
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
                _this2.fromDate = Math.round(_this2.timeSrv.timeRange().from._d.getTime() / 1000);
                _this2.toDate = Math.round(_this2.timeSrv.timeRange().to._d.getTime() / 1000);

                _this2.getDataFromAPI("node_load1{job='node'}", 0);

                _this2.getDataFromAPI("\n                        100 - (node_memory_MemFree_bytes{job='node'} - node_memory_Cached_bytes{job='node'}) \n                                * 100 / \n                                (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'})\n                    ", 1);

                _this2.getDataFromAPI("\n                    100 - (sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)',\n                                                                            mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})) \n                                * 100 / \n                            (sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'}))\n                ", 2);

                _this2.processRawData();
              }
            }, 100);
          }
        }, {
          key: "getDataFromAPI",
          value: function getDataFromAPI(metric, index) {
            var _this3 = this;

            var xmlHttp = new XMLHttpRequest();

            xmlHttp.onreadystatechange = function () {
              if (xmlHttp.readyState == 4) {
                ++_this3.loadCount;

                if (xmlHttp.status == 200) {
                  var metric = {};
                  metric.data = JSON.parse(xmlHttp.responseText).data.result;
                  _this3.overviewModel.metricList[index] = metric;
                }
              }
            };

            var url = this.config.apiAddress + encodeURIComponent(metric) + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=15";
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

                  _this4.initialiseMetricMinMax();

                  _this4.initialiseColorMap();

                  _this4.initiliseOverviewData();

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
          key: "initialiseMetricMinMax",
          value: function initialiseMetricMinMax() {
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
              metric.layerRange = metric.max / (colors.length - 0.5);
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
              colorMap.set(threshold, colors[i]);
            }

            return colorMap;
          }
        }, {
          key: "initiliseOverviewData",
          value: function initiliseOverviewData() {
            var _this7 = this;

            this.overviewModel.data = [];
            this.overviewModel.metricList.forEach(function (metric, index) {
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
                  newInstance.metricList[index].push(point);
                });
              });
            });
          }
        }, {
          key: "initaliseNewInstance",
          value: function initaliseNewInstance(metricInstance) {
            var newInstance = {};
            newInstance.instance = metricInstance.metric.instance;
            newInstance.metricList = [[], [], []];
            this.overviewModel.data.push(newInstance);
            return newInstance;
          }
        }, {
          key: "renderOverview",
          value: function renderOverview() {
            if (this.overviewModel.data.length > 0) {
              this.overviewContext.clearRect(0, 0, this.overviewCanvas.width, this.overviewCanvas.height);
              this.clearFocus();
              this.drawOverviewData();
            }
          }
        }, {
          key: "drawOverviewData",
          value: function drawOverviewData() {
            var parent = this;
            this.$timeout(function () {
              parent.drawOverviewDataWrapper.bind(parent)();
            }, 100);
          }
        }, {
          key: "drawOverviewDataWrapper",
          value: function drawOverviewDataWrapper() {
            var length = this.getInstanceHorizontalLength();

            if (this.scope.ctrl.overviewMode == "1") {
              this.overviewModel.overviewInstantHeight = this.config.overviewPointHeight * this.overviewModel.metricList.length + this.config.verticalMarginBetweenOverviewMetrics * (this.overviewModel.metricList.length - 1) + this.config.marginBetweenInstances;
              this.scope.ctrl.overviewWidth = length * this.config.overviewPointWidth;
              this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.overviewModel.overviewInstantHeight;
              this.scope.$apply();
              this.drawSingleOverview();
            } else {
              this.scope.ctrl.overviewWidth = length * this.config.overviewPointWidth;
              this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.config.overviewPointHeight;
              this.scope.$apply();
              this.drawMultipleOverview();
            }

            ;
            this.scope.ctrl.focusGraphMarginTop = this.scope.ctrl.overviewHeight + this.config.marginBetweenOverviewAndFocus;
          }
        }, {
          key: "getInstanceHorizontalLength",
          value: function getInstanceHorizontalLength() {
            var _this8 = this;

            var firstInstance = this.overviewModel.data[0];
            var length = 0;
            firstInstance.metricList.forEach(function (metric, index) {
              if (_this8.scope.ctrl.overviewMode == "1") {
                if (metric.length > length) {
                  length = metric.length;
                }
              } else {
                length += metric.length;

                if (index > 0) {
                  length += _this8.config.horizontalMarginBetweenOverviewMetrics;
                }
              }
            });
            return length;
          }
        }, {
          key: "drawSingleOverview",
          value: function drawSingleOverview() {
            var _this9 = this;

            this.overviewModel.data.forEach(function (instance, instanceIndex) {
              instance.y = instanceIndex * _this9.overviewModel.overviewInstantHeight;
              instance.metricList.forEach(function (metric, metricIndex) {
                metric.forEach(function (point, pointIndex) {
                  point.x = pointIndex * _this9.config.overviewPointWidth;
                  point.color = _this9.getColorFromMap(point.value, _this9.overviewModel.metricList[metricIndex].colorMap);
                  _this9.overviewContext.fillStyle = point.color;
                  var y = instance.y + metricIndex * _this9.config.overviewPointHeight * _this9.config.verticalMarginBetweenOverviewMetrics;

                  _this9.overviewContext.fillRect(point.x, y, _this9.config.overviewPointHeight, _this9.config.overviewPointHeight);
                });
              });
            });
          }
        }, {
          key: "drawMultipleOverview",
          value: function drawMultipleOverview() {
            var _this10 = this;

            this.overviewModel.overviewInstantHeight = this.config.overviewPointHeight;
            this.overviewModel.data.forEach(function (instance, instanceIndex) {
              var endX = 0;
              instance.metricList.forEach(function (metric, metricIndex) {
                instance.y = instanceIndex * _this10.config.overviewPointHeight;
                var overviewMetric = _this10.overviewModel.metricList[metricIndex];
                overviewMetric.startX = endX;

                if (metricIndex > 0) {
                  overviewMetric.startX += _this10.config.horizontalMarginBetweenOverviewMetrics;
                }

                metric.forEach(function (point, pointIndex) {
                  point.x = overviewMetric.startX + pointIndex * _this10.config.overviewPointWidth;
                  point.color = _this10.getColorFromMap(point.value, _this10.overviewModel.metricList[metricIndex].colorMap);
                  _this10.overviewContext.fillStyle = point.color;

                  _this10.overviewContext.fillRect(point.x, instance.y, _this10.config.overviewPointHeight, _this10.config.overviewPointHeight);

                  endX = point.x;
                });
                overviewMetric.endX = endX;
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
          key: "initialiseCanvases",
          value: function initialiseCanvases() {
            this.overviewCanvas = this.elem.find("#overviewCanvas")[0];
            this.overviewContext = this.overviewCanvas.getContext("2d");
            this.focusAreaCanvas = this.elem.find("#focusAreaCanvas")[0];
            this.focusAreaContext = this.focusAreaCanvas.getContext("2d");
            this.focusGraphCanvas = this.elem.find("#focusGraphCanvas")[0];
            this.focusGraphContext = this.focusGraphCanvas.getContext("2d");
            this.focusGraphContext.font = this.config.fontSize + "px arial";
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
            this.drawFocusGraph();
          }
        }, {
          key: "clearFocus",
          value: function clearFocus() {
            this.hasFocus = false;
            this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
            this.focusGraphContext.clearRect(0, 0, this.focusGraphCanvas.width, this.focusGraphCanvas.height);
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

              if (this.scope.ctrl.overviewMode == "1") {
                this.drawSingleFocusArea();
              } else {
                this.drawMultipleFocusArea(true);
              }
            }
          }
        }, {
          key: "getFocusAreaSize",
          value: function getFocusAreaSize() {
            return this.config.focusAreaSize * 2;
          }
        }, {
          key: "drawSingleFocusArea",
          value: function drawSingleFocusArea() {
            this.clearFocus();
            var size = this.getFocusAreaSize();
            this.focusModel.focusStartY = Math.min(Math.max(0, this.focusModel.mousePosition.y - size / 2), this.overviewCanvas.height - this.getFocusAreaSize());
            this.focusModel.focusStartX = Math.min(Math.max(0, this.focusModel.mousePosition.x - this.config.focusAreaSize), this.overviewCanvas.width - size);
            this.focusAreaContext.strokeStyle = this.config.focusAreaColor;
            this.focusAreaContext.strokeRect(this.focusModel.focusStartX, this.focusModel.focusStartY, size, size);
          }
        }, {
          key: "drawMultipleFocusArea",
          value: function drawMultipleFocusArea(doDrawLinkers) {
            var _this11 = this;

            var size = this.getFocusAreaSize();
            var offset = this.getFocusAreaOffset();

            if (offset >= 0) {
              if (doDrawLinkers) {
                this.clearFocus();
              }

              this.focusAreaContext.strokeStyle = this.config.focusAreaColor;
              this.overviewModel.metricList.forEach(function (metric) {
                metric.focusStartX = metric.startX + offset;

                _this11.focusAreaContext.strokeRect(metric.focusStartX, _this11.focusModel.focusStartY, size, size);
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
                return Math.min(Math.max(metric.startX, this.focusModel.mousePosition.x - this.config.focusAreaSize), metric.endX - this.getFocusAreaSize()) - metric.startX;
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
            var _this12 = this;

            var pixelData = this.overviewContext.getImageData(this.focusModel.mousePosition.x, this.focusModel.mousePosition.y, 1, 1).data;
            this.focusAreaContext.strokeStyle = "rgb(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + ")";
            var instance = this.getLinkerTargetInstance();

            if (instance) {
              this.overviewModel.metricList.forEach(function (metric, index) {
                if (!_this12.checkMouseIsInMetric(metric)) {
                  _this12.drawLinkerByMode(metric, instance, index);
                }
              });
            }
          }
        }, {
          key: "getLinkerTargetInstance",
          value: function getLinkerTargetInstance() {
            for (var i = 0; i < this.overviewModel.data.length; ++i) {
              var instance = this.overviewModel.data[i];

              if (instance.y <= this.focusModel.mousePosition.y && this.focusModel.mousePosition.y <= instance.y + this.config.overviewPointHeight) {
                return instance;
              }
            }
          }
        }, {
          key: "drawLinkerByMode",
          value: function drawLinkerByMode(metric, instance, index) {
            switch (this.scope.ctrl.linkingMode) {
              case "xCross":
                this.drawXCross(metric, instance);
                break;

              case "normalCross":
                this.drawNormalCross(metric, instance);
                break;

              case "changeColor":
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
            var leftBeginX = centerX - this.config.xCrossSize;
            var rightBeginX = centerX + this.config.overviewPointWidth;
            var bottomInstance = instance.y + this.config.overviewPointHeight;
            this.drawXCrossLine(leftBeginX, instance.y - this.config.xCrossSize, instance.y);
            this.drawXCrossLine(rightBeginX, instance.y, instance.y - this.config.xCrossSize);
            this.drawXCrossLine(leftBeginX, bottomInstance + this.config.xCrossSize, bottomInstance);
            this.drawXCrossLine(rightBeginX, bottomInstance, bottomInstance + this.config.xCrossSize);
          }
        }, {
          key: "drawXCrossLine",
          value: function drawXCrossLine(startX, startY, endY) {
            this.drawLineOnFocusAreaCanvas(startX, startY, startX + this.config.xCrossSize, endY);
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
            var distanceBetweenLines = this.config.overviewPointWidth * 2;
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
            var _this13 = this;

            if (index == 0) {
              this.clearFocus();
            }

            instance.metricList[index].forEach(function (instancePoint, pointIndex) {
              var colorMap = _this13.getColorMap(metric, _this13.config.colors[_this13.focusModel.sourceMetricIndex]);

              _this13.focusAreaContext.fillStyle = _this13.getColorFromMap(instancePoint.value, colorMap);

              _this13.focusAreaContext.fillRect(instancePoint.x, instance.y, _this13.config.overviewPointHeight, _this13.config.overviewPointHeight);

              if (instancePoint.x == metric.startX + _this13.focusModel.mousePositionXOffset) {
                metric.data.forEach(function (metricInstance, metricInstanceIndex) {
                  var metricPoint = metricInstance.values[pointIndex];
                  var value = metricPoint ? metricPoint[1] : 0;
                  _this13.focusAreaContext.fillStyle = _this13.getColorFromMap(value, colorMap);

                  _this13.focusAreaContext.fillRect(instancePoint.x, _this13.overviewModel.data[metricInstanceIndex].y, _this13.config.overviewPointHeight, _this13.config.overviewPointHeight);
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
            this.initialiseFocusGraphData();
            this.drawFocusGraphLabels();
            this.drawFocusGraphData();
          }
        }, {
          key: "initialiseFocusGraphData",
          value: function initialiseFocusGraphData() {
            var _this14 = this;

            this.focusModel.data = [];
            this.overviewModel.data.forEach(function (overviewInstance) {
              if (overviewInstance.y <= _this14.focusModel.focusStartY + _this14.getFocusAreaSize() && overviewInstance.y + _this14.overviewModel.overviewInstantHeight >= _this14.focusModel.focusStartY) {
                var modalInstance = {};
                modalInstance.instance = overviewInstance.instance;
                modalInstance.metricList = [];

                _this14.addFocusMetrics(modalInstance, overviewInstance, _this14.getIndexesOfPointsInFocus(overviewInstance));

                _this14.initialiseInstanceLayers(modalInstance);

                _this14.focusModel.data.push(modalInstance);
              }
            });
          }
        }, {
          key: "getIndexesOfPointsInFocus",
          value: function getIndexesOfPointsInFocus(instance) {
            var _this15 = this;

            var indexes = [];

            for (var i = 0; i < instance.metricList.length; ++i) {
              var metric = instance.metricList[i];

              if (metric.length > 0) {
                var overviewMetric = this.overviewModel.metricList[i];
                metric.forEach(function (point, index) {
                  if (overviewMetric.focusStartX <= point.x && point.x <= overviewMetric.focusStartX + _this15.getFocusAreaSize()) {
                    indexes.push(index);
                  }
                });
                break;
              }
            }

            return indexes;
          }
        }, {
          key: "addFocusMetrics",
          value: function addFocusMetrics(modalInstance, overviewInstance, indexes) {
            this.overviewModel.metricList.forEach(function (metric, metricIndex) {
              var focusMetric = {};
              focusMetric.data = [];
              focusMetric.layerList = [];
              indexes.forEach(function (index) {
                var point = overviewInstance.metricList[metricIndex][index];

                if (point) {
                  focusMetric.data.push(point);
                }
              });
              modalInstance.metricList.push(focusMetric);
            });
          }
        }, {
          key: "initialiseInstanceLayers",
          value: function initialiseInstanceLayers(instance) {
            var _this16 = this;

            instance.metricList.forEach(function (metric, index) {
              _this16.config.colors.forEach(function () {
                var layer = {};
                layer.valueList = [];
                metric.layerList.push(layer);
              });

              metric.data.forEach(function (point) {
                var value = point.value;
                metric.layerList.forEach(function (layer) {
                  layer.valueList.push(value > 0 ? value : 0);
                  value -= _this16.overviewModel.metricList[index].layerRange;
                });
              });
            });
          }
        }, {
          key: "drawFocusGraphLabels",
          value: function drawFocusGraphLabels() {
            var _this17 = this;

            this.focusModel.horizontalX = 0;
            this.focusGraphContext.setLineDash([10, 10]);
            this.focusGraphContext.fillStyle = "black";
            this.focusModel.instanceHeight = this.config.focusMetricMaxHeight * this.overviewModel.metricList.length + this.config.marginBetweenFocusMetrics * (this.overviewModel.metricList.length - 1) + this.config.marginBetweenFocusInstances;
            this.focusModel.data.forEach(function (instance, index) {
              _this17.drawFocusGraphLabelByInstance(instance, index);
            });
            this.focusModel.horizontalX += this.config.focusGraphLeftMargin;
          }
        }, {
          key: "drawFocusGraphLabelByInstance",
          value: function drawFocusGraphLabelByInstance(instance, index) {
            var label = instance.instance;
            var metrics = this.focusGraphContext.measureText(label);
            instance.y = index * this.focusModel.instanceHeight;
            var labelY = instance.y + this.focusModel.instanceHeight / 2;
            this.focusGraphContext.fillText(label, 0, labelY);

            if (index > 0) {
              this.drawSeperator(instance);
            }

            if (metrics.width > this.focusModel.horizontalX) {
              this.focusModel.horizontalX = metrics.width;
            }
          }
        }, {
          key: "drawSeperator",
          value: function drawSeperator(instance) {
            var lineY = instance.y - this.config.marginBetweenFocusInstances / 2;
            this.focusGraphContext.beginPath();
            this.focusGraphContext.moveTo(0, lineY);
            this.focusGraphContext.lineTo(10000, lineY);
            this.focusGraphContext.stroke();
          }
        }, {
          key: "drawFocusGraphData",
          value: function drawFocusGraphData() {
            var _this18 = this;

            this.focusModel.data.forEach(function (instance) {
              instance.metricList.forEach(function (metric, metricIndex) {
                metric.layerList.forEach(function (layer, layerIndex) {
                  var y = instance.y + (_this18.config.focusMetricMaxHeight + _this18.config.marginBetweenFocusMetrics) * metricIndex + _this18.config.focusMetricMaxHeight;

                  _this18.focusGraphContext.beginPath();

                  _this18.focusGraphContext.moveTo(_this18.focusModel.horizontalX, y);

                  var x = _this18.focusModel.horizontalX;
                  var previousX = x;
                  var previousValue = 0;
                  layer.valueList.forEach(function (value, valueIndex) {
                    x += valueIndex * _this18.config.focusPointWidth;

                    _this18.moveContextBasedOnValue(value, previousX, previousValue, layerIndex, x, y, _this18.overviewModel.metricList[metricIndex].layerRange);

                    previousX = x;
                    previousValue = value;
                  });

                  _this18.focusGraphContext.lineTo(x, y);

                  _this18.focusGraphContext.lineTo(_this18.focusModel.horizontalX, y);

                  _this18.focusGraphContext.closePath();

                  _this18.focusGraphContext.fillStyle = "#" + _this18.config.colors[metricIndex][layerIndex];

                  _this18.focusGraphContext.fill();
                });
              });
            });
          }
        }, {
          key: "moveContextBasedOnValue",
          value: function moveContextBasedOnValue(value, previousX, previousValue, layerIndex, x, y, layerRange) {
            if (value == 0) {
              this.focusGraphContext.lineTo(previousX, y);
            } else {
              if (layerIndex > 0 && previousValue == 0) {
                this.focusGraphContext.lineTo(x, y);
              }

              if (value >= layerRange) {
                this.focusGraphContext.lineTo(x, y - this.config.focusMetricMaxHeight);
              } else {
                this.focusGraphContext.lineTo(x, y - value * this.config.focusMetricMaxHeight / layerRange);
              }
            }
          }
        }, {
          key: "selectNode",
          value: function selectNode() {
            if (!this.isUpdatingVariable) {
              var mousePos = this.getMousePos(event, this.focusGraphCanvas);
              var height = this.focusModel.instanceHeight;

              for (var i = 0; i < this.focusModel.data.length; ++i) {
                if (height * i <= mousePos.y && mousePos.y <= height * (i + 1)) {
                  this.updateVariable(this.focusModel.data[i]);
                  break;
                }
              }
            }
          }
        }, {
          key: "updateVariable",
          value: function updateVariable(instance) {
            var _this19 = this;

            this.variableSrv.variables.forEach(function (v) {
              if (v.name == "node") {
                _this19.variableSrv.setOptionAsCurrent(v, {
                  text: instance.instance,
                  value: instance.instance
                });

                _this19.isUpdatingVariable = true;

                _this19.variableSrv.variableUpdated(v, true);
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
