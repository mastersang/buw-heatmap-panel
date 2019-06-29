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
              focusAreaColor: "aqua",
              focusAreaSize: 30,
              colors: [["f2d9e6", "d98cb3", "bf4080", "73264d"], ["ccddff", "6699ff", "0055ff", "003399"], ["eeeedd", "cccc99", "aaaa55", "666633"]],
              marginBetweenOverviewMetrics: 2,
              marginBetweenInstances: 6,
              overviewPointWidth: 1,
              overviewPointHeight: 2,
              paddingBetweenGraphs: 50,
              leftPadding: 0,
              horizontalMargin: 40,
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
            this.elem = elem;
            var parent = this;

            scope.moveFocusArea = function (evt) {
              parent.moveFocusArea.bind(parent, evt)();
            };

            scope.fixFocusArea = function (evt) {
              parent.fixFocusArea.bind(parent, evt)();
            };

            scope.selectNode = function (evt) {
              parent.selectNode.bind(parent, evt)();
            };

            this.initialiseCanvases();
          }
        }, {
          key: "onDataReceived",
          value: function onDataReceived(data) {
            if (this.updateVariable) {
              this.updateVariable = false;
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
              metric.colorMap = new Map();
              metric.layerRange = metric.max / (colors.length - 0.5);

              for (var i = 0; i < colors.length; ++i) {
                var threshold = {};
                threshold.min = i * metric.layerRange;
                threshold.max = threshold.min + metric.layerRange;
                metric.colorMap.set(threshold, colors[i]);
              }
            });
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
            var _this8 = this;

            var maxLength = this.getMaxLength();
            this.overviewModel.overviewInstantHeight = this.config.overviewPointHeight * this.overviewModel.metricList.length + this.config.marginBetweenOverviewMetrics * (this.overviewModel.metricList.length - 1) + this.config.marginBetweenInstances;
            this.scope.ctrl.overviewWidth = maxLength * this.config.overviewPointWidth;
            this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.overviewModel.overviewInstantHeight;
            this.scope.ctrl.focusGraphMarginTop = this.scope.ctrl.overviewHeight + this.config.paddingBetweenGraphs;
            this.scope.$apply();
            this.overviewModel.data.forEach(function (instance, instanceIndex) {
              instance.overviewY = instanceIndex * _this8.overviewModel.overviewInstantHeight;
              instance.metricList.forEach(function (metric, metricIndex) {
                metric.forEach(function (point, pointIndex) {
                  point.x = _this8.config.leftPadding + pointIndex * _this8.config.overviewPointWidth;
                  point.color = _this8.getColorFromMap(point.value, _this8.overviewModel.metricList[metricIndex].colorMap);
                  _this8.overviewContext.fillStyle = point.color;
                  var y = instance.overviewY + metricIndex * _this8.config.overviewPointHeight * _this8.config.marginBetweenOverviewMetrics;

                  _this8.overviewContext.fillRect(point.x, y, _this8.config.overviewPointHeight, _this8.config.overviewPointHeight);
                });
              });
            });
          }
        }, {
          key: "getMaxLength",
          value: function getMaxLength() {
            var firstInstance = this.overviewModel.data[0];
            var maxLength = 0;
            firstInstance.metricList.forEach(function (metric) {
              if (metric.length > maxLength) {
                maxLength = metric.length;
              }
            });
            return maxLength;
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
            this.mousePos = this.getMousePos(evt, this.overviewCanvas);
            this.clearFocus();
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
            var size = this.getFocusAreaSize();
            this.focusStartX = Math.min(Math.max(0, this.mousePos.x - this.config.focusAreaSize), this.overviewCanvas.width - size);
            this.focusStartY = Math.min(Math.max(0, this.mousePos.y - this.config.focusAreaSize), this.overviewCanvas.height - size);
            this.focusAreaContext.strokeStyle = this.config.focusAreaColor;
            this.focusAreaContext.strokeRect(this.focusStartX, this.focusStartY, size, size);
          }
        }, {
          key: "getFocusAreaSize",
          value: function getFocusAreaSize() {
            return this.config.focusAreaSize * 2;
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
            var _this9 = this;

            this.focusModel.data = [];
            this.overviewModel.data.forEach(function (overviewInstance) {
              if (overviewInstance.overviewY <= _this9.focusStartY + _this9.getFocusAreaSize() && overviewInstance.overviewY + _this9.overviewModel.overviewInstantHeight >= _this9.focusStartY) {
                var modalInstance = {};
                modalInstance.instance = overviewInstance.instance;
                modalInstance.metricList = [];

                _this9.addFocusMetrics(modalInstance, overviewInstance, _this9.getIndexesOfPointsInFocus(overviewInstance));

                _this9.initialiseInstanceLayers(modalInstance);

                _this9.focusModel.data.push(modalInstance);
              }
            });
          }
        }, {
          key: "getIndexesOfPointsInFocus",
          value: function getIndexesOfPointsInFocus(instance) {
            var _this10 = this;

            var indexes = [];

            for (var i = 0; i < instance.metricList.length; ++i) {
              var metric = instance.metricList[i];

              if (metric.length > 0) {
                metric.forEach(function (point, index) {
                  if (point.x >= _this10.focusStartX && point.x <= _this10.focusStartX + _this10.getFocusAreaSize()) {
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
                focusMetric.data.push(overviewInstance.metricList[metricIndex][index]);
              });
              modalInstance.metricList.push(focusMetric);
            });
          }
        }, {
          key: "initialiseInstanceLayers",
          value: function initialiseInstanceLayers(instance) {
            var _this11 = this;

            instance.metricList.forEach(function (metric, index) {
              _this11.config.colors.forEach(function () {
                var layer = {};
                layer.valueList = [];
                metric.layerList.push(layer);
              });

              metric.data.forEach(function (point) {
                var value = point.value;
                metric.layerList.forEach(function (layer) {
                  layer.valueList.push(value > 0 ? value : 0);
                  value -= _this11.overviewModel.metricList[index].layerRange;
                });
              });
            });
          }
        }, {
          key: "drawFocusGraphLabels",
          value: function drawFocusGraphLabels() {
            var _this12 = this;

            this.focusModel.horizontalX = 0;
            this.focusGraphContext.setLineDash([10, 10]);
            this.focusGraphContext.fillStyle = "black";
            var instanceHeight = this.config.focusMetricMaxHeight * this.overviewModel.metricList.length + this.config.marginBetweenFocusMetrics * (this.overviewModel.metricList.length - 1) + this.config.marginBetweenFocusInstances;
            this.focusModel.data.forEach(function (instance, index) {
              var x = _this12.config.leftPadding;
              var label = instance.instance;

              var metrics = _this12.focusGraphContext.measureText(label);

              instance.y = index * instanceHeight;
              var labelY = instance.y + instanceHeight / 2;

              _this12.focusGraphContext.fillText(label, x, labelY);

              if (index > 0) {
                _this12.drawSeperator(instance, x);
              }

              if (metrics.width > _this12.focusModel.horizontalX) {
                _this12.focusModel.horizontalX = metrics.width + _this12.config.leftPadding;
              }
            });
            this.focusModel.horizontalX += this.config.horizontalMargin;
          }
        }, {
          key: "drawSeperator",
          value: function drawSeperator(instance, x) {
            var lineY = instance.y - this.config.marginBetweenFocusInstances / 2;
            this.focusGraphContext.beginPath();
            this.focusGraphContext.moveTo(x, lineY);
            this.focusGraphContext.lineTo(10000, lineY);
            this.focusGraphContext.stroke();
          }
        }, {
          key: "drawFocusGraphData",
          value: function drawFocusGraphData() {
            var _this13 = this;

            this.focusModel.data.forEach(function (instance) {
              instance.metricList.forEach(function (metric, metricIndex) {
                metric.layerList.forEach(function (layer, layerIndex) {
                  var y = instance.y + (_this13.config.focusMetricMaxHeight + _this13.config.marginBetweenFocusMetrics) * metricIndex + _this13.config.focusMetricMaxHeight;

                  _this13.focusGraphContext.beginPath();

                  _this13.focusGraphContext.moveTo(_this13.focusModel.horizontalX, y);

                  var x = _this13.focusModel.horizontalX;
                  var previousX = x;
                  var previousValue = 0;
                  layer.valueList.forEach(function (value, valueIndex) {
                    x += valueIndex * _this13.config.focusPointWidth;

                    _this13.moveContextBasedOnValue(value, previousX, previousValue, layerIndex, x, y, _this13.overviewModel.metricList[metricIndex].layerRange);

                    previousX = x;
                    previousValue = value;
                  });

                  _this13.focusGraphContext.lineTo(x, y);

                  _this13.focusGraphContext.lineTo(_this13.focusModel.horizontalX, y);

                  _this13.focusGraphContext.closePath();

                  _this13.focusGraphContext.fillStyle = "#" + _this13.config.colors[metricIndex][layerIndex];

                  _this13.focusGraphContext.fill();
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
            var _this14 = this;

            if (!this.updateVariable) {
              var mousePos = this.getMousePos(event, this.focusGraphCanvas);
              this.scope.ctrl.menuX = mousePos.x;
              this.scope.ctrl.menuY = mousePos.y;
              var height = this.focusModel.instanceHeight + this.config.marginBetweenFocusInstances;

              for (var i = 0; i < this.focusModel.data.length; ++i) {
                if (height * i <= mousePos.y && mousePos.y <= height * (i + 1)) {
                  var instance = this.focusModel.data[i];
                  this.variableSrv.variables.forEach(function (v) {
                    if (v.name == 'node') {
                      _this14.variableSrv.setOptionAsCurrent(v, {
                        text: instance.instance,
                        value: instance.instance
                      });

                      _this14.updateVariable = true;

                      _this14.variableSrv.variableUpdated(v, true);
                    }
                  });
                  break;
                }
              }
            }
          }
        }]);

        return HeatmapCtrl;
      }(MetricsPanelCtrl));

      HeatmapCtrl.templateUrl = "module.html";
    }
  };
});
//# sourceMappingURL=heatmap_ctrl.js.map
