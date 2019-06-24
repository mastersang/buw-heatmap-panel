"use strict";

System.register(["app/plugins/sdk", "./heatmap.css!"], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, HeatmapCtrl;

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
    }, function (_heatmapCss) {}],
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

          _this.loadData();

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
              focusAreaSize: 20,
              colors: ["ff9494", "ff3030", "c70000", "600000"],
              luminanceLevel: 0.5,
              fontSize: 15,
              overviewPointSize: 1,
              focusPointWidth: 5,
              focusPointHeight: 30,
              leftPadding: 0,
              horizontalPadding: 40,
              verticalPadding: 20,
              paddingBetweenGraphs: 50
            };
          }
        }, {
          key: "loadData",
          value: function loadData() {
            var _this2 = this;

            this.rawData = {};
            this.maxLoadCount = 5;
            this.loadCount = 0;
            this.fromDate = Math.round(this.timeSrv.timeRange().from._d.getTime() / 1000);
            this.toDate = Math.round(this.timeSrv.timeRange().to._d.getTime() / 1000);
            this.getDataFromAPI("node_load1", function (data) {
              _this2.rawData.totalMemory = data;
            });
            this.getDataFromAPI("node_memory_MemTotal_bytes", function (data) {
              _this2.rawData.totalMemory = data;
            });
            this.getDataFromAPI("node_memory_MemFree_bytes", function (data) {
              _this2.rawData.freeMemory = data;
            });
            this.getDataFromAPI("node_memory_Cached_bytes", function (data) {
              _this2.rawData.cachedMemory = data;
            });
            this.getDataFromAPI("node_memory_Buffers_bytes", function (data) {
              _this2.rawData.bufferMemory = data;
            });
            this.processRawData();
          }
        }, {
          key: "getDataFromAPI",
          value: function getDataFromAPI(metric, callback) {
            var _this3 = this;

            var xmlHttp = new XMLHttpRequest();

            xmlHttp.onreadystatechange = function () {
              ++_this3.loadCount;

              if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                callback(JSON.parse(xmlHttp.responseText).data.result);
              }
            };

            var url = this.config.apiAddress + metric + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=15";
            xmlHttp.open("GET", url, true);
            xmlHttp.send(null);
          }
        }, {
          key: "processRawData",
          value: function processRawData() {
            var _this4 = this;

            this.$timeout(function () {
              if (_this4.loadCount < _this4.maxLoadCount) {
                _this4.processRawData();
              } else {}
            }, 100);
          }
        }, {
          key: "link",
          value: function link(scope, elem, attrs, ctrl) {
            this.scope = scope;
            this.elem = elem;
            var parent = this;

            scope.toggleFocus = function () {
              parent.toggleFocus.bind(parent)();
            };

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
          key: "toggleFocus",
          value: function toggleFocus() {
            this.scope.ctrl.focusMode = !this.scope.ctrl.focusMode;

            if (!this.scope.ctrl.focusMode) {
              this.clearFocus();
              this.focusAreaIsFixed = false;
            }
          }
        }, {
          key: "clearFocus",
          value: function clearFocus() {
            this.hasFocus = false;
            this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
            this.focusGraphContext.clearRect(0, 0, this.focusGraphCanvas.width, this.focusGraphCanvas.height);
          }
        }, {
          key: "moveFocusArea",
          value: function moveFocusArea(evt) {
            if (this.scope.ctrl.focusMode) {
              if (!this.focusAreaIsFixed) {
                this.drawFocus(evt);
                evt.preventDefault();
              }
            }
          }
        }, {
          key: "fixFocusArea",
          value: function fixFocusArea(evt) {
            if (this.scope.ctrl.focusMode) {
              if (this.focusAreaIsFixed) {
                this.drawFocus(evt);
              }

              this.focusAreaIsFixed = !this.focusAreaIsFixed;
              evt.preventDefault();
            }
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
            this.drawVertical();
            this.drawFocusGraphData();
          }
        }, {
          key: "initialiseFocusGraphData",
          value: function initialiseFocusGraphData() {
            var _this5 = this;

            this.focusModel.data = [];
            this.overviewModel.data.forEach(function (instance, index) {
              if (_this5.checkInstanceIsFocused(instance)) {
                var modalInstance = {};
                modalInstance.pointList = [];
                modalInstance.instance = instance.instance;

                _this5.focusModel.data.push(modalInstance);

                instance.pointList.forEach(function (point) {
                  if (_this5.checkPointIsFocused(point)) {
                    modalInstance.pointList.push(point);
                  }
                });

                _this5.initialiseInstanceLayers(modalInstance);
              }
            });
          }
        }, {
          key: "initialiseInstanceLayers",
          value: function initialiseInstanceLayers(instance) {
            var _this6 = this;

            instance.layers = [];
            this.config.colors.forEach(function (color) {
              var layer = {};
              layer.valueList = [];
              instance.layers.push(layer);
            });
            instance.pointList.forEach(function (point) {
              var value = point.Value;
              instance.layers.forEach(function (layer) {
                layer.valueList.push(value > 0 ? value : 0);
                value -= _this6.layerRange;
              });
            });
          }
        }, {
          key: "checkInstanceIsFocused",
          value: function checkInstanceIsFocused(instance) {
            return instance.overviewY >= this.focusStartY && instance.overviewY <= this.focusStartY + this.getFocusAreaSize();
          }
        }, {
          key: "checkPointIsFocused",
          value: function checkPointIsFocused(point) {
            return point.x >= this.focusStartX && point.x <= this.focusStartX + this.getFocusAreaSize();
          }
        }, {
          key: "drawVertical",
          value: function drawVertical() {
            var _this7 = this;

            this.focusModel.horizontalX = 0;
            this.focusGraphContext.fillStyle = "black";
            this.focusModel.data.forEach(function (instance, index) {
              var label = instance.instance;
              instance.y = _this7.config.focusPointHeight + index * (_this7.config.focusPointHeight + _this7.config.verticalPadding);

              _this7.focusGraphContext.fillText(label, _this7.config.leftPadding, instance.y);

              var metrics = _this7.focusGraphContext.measureText(label);

              if (metrics.width > _this7.focusModel.horizontalX) {
                _this7.focusModel.horizontalX = metrics.width;
              }
            });
            this.focusModel.horizontalX += this.config.horizontalPadding;
          }
        }, {
          key: "drawFocusGraphData",
          value: function drawFocusGraphData() {
            var _this8 = this;

            this.focusModel.data.forEach(function (instance) {
              instance.layers.forEach(function (layer, layerIndex) {
                _this8.focusGraphContext.beginPath();

                _this8.focusGraphContext.moveTo(_this8.focusModel.horizontalX, instance.y);

                var x = _this8.focusModel.horizontalX;
                var previousX = 0;
                var previousValue = 0;
                layer.valueList.forEach(function (value, valueIndex) {
                  x += valueIndex * _this8.config.focusPointWidth;

                  _this8.moveContextBasedOnValue(value, previousValue, previousX, instance, layerIndex, x);

                  previousX = x;
                  previousValue = value;
                });

                _this8.focusGraphContext.lineTo(x, instance.y);

                _this8.focusGraphContext.lineTo(_this8.focusModel.horizontalX, instance.y);

                _this8.focusGraphContext.closePath();

                _this8.focusGraphContext.fillStyle = "#" + _this8.config.colors[layerIndex];

                _this8.focusGraphContext.fill();
              });
            });
          }
        }, {
          key: "moveContextBasedOnValue",
          value: function moveContextBasedOnValue(value, previousValue, previousX, instance, layerIndex, x) {
            if (value == 0) {
              this.focusGraphContext.lineTo(previousX, instance.y);
            } else {
              if (layerIndex > 0 && previousValue == 0) {
                this.focusGraphContext.lineTo(x, instance.y);
              }

              if (value >= this.layerRange) {
                this.focusGraphContext.lineTo(x, instance.y - this.config.focusPointHeight);
              } else {
                this.focusGraphContext.lineTo(x, instance.y - value * this.config.focusPointHeight / this.layerRange);
              }
            }
          }
        }, {
          key: "selectNode",
          value: function selectNode(evt) {
            var _this9 = this;

            if (!this.updateVariable) {
              var mousePos = this.getMousePos(event, this.focusGraphCanvas);
              this.scope.ctrl.menuX = mousePos.x;
              this.scope.ctrl.menuY = mousePos.y;
              var instanceHeight = this.config.focusPointHeight + this.config.verticalPadding;

              for (var i = 0; i < this.focusModel.data.length; ++i) {
                if (instanceHeight * i <= mousePos.y && mousePos.y <= instanceHeight * (i + 1)) {
                  var instance = this.focusModel.data[i];
                  this.variableSrv.variables.forEach(function (v) {
                    if (v.name == "node") {
                      _this9.variableSrv.setOptionAsCurrent(v, {
                        text: instance.instance,
                        value: instance.instance
                      });

                      _this9.updateVariable = true;

                      _this9.variableSrv.variableUpdated(v, true);
                    }
                  });
                  break;
                }
              }
            }
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
          key: "onDataReceived",
          value: function onDataReceived(dataList) {
            if (this.updateVariable) {
              this.updateVariable = false;
            } else {
              this.parseTable(dataList);
              this.initialiseColorMap();
              this.renderOverview();
            }
          }
        }, {
          key: "parseTable",
          value: function parseTable(dataList) {
            this.overviewModel.data = [];

            if (dataList.length == 1) {
              var table = dataList[0];
              console.log("Table: ");
              console.log(table);
              var instanceColumnIndex = this.getInstanceColumnIndex(table);

              for (var rowIndex = 0; rowIndex < table.rows.length; ++rowIndex) {
                var row = table.rows[rowIndex];
                var instance = this.getExistingInstance(row[instanceColumnIndex]);
                var point = {};

                for (var columnIndex = 0; columnIndex < table.columns.length; ++columnIndex) {
                  point[table.columns[columnIndex].text] = row[columnIndex];
                }

                instance.pointList.push(point);
              }

              console.log(this.overviewModel.data);
            }
          }
        }, {
          key: "getInstanceColumnIndex",
          value: function getInstanceColumnIndex(table) {
            for (var i = 0; i < table.columns.length; ++i) {
              if (table.columns[i].text == this.config.instancePropertyName) {
                return i;
              }
            }

            return -1;
          }
        }, {
          key: "getExistingInstance",
          value: function getExistingInstance(instanceName) {
            for (var i = 0; i < this.overviewModel.data.length; ++i) {
              var current = this.overviewModel.data[i];

              if (current.instance == instanceName) {
                return current;
              }
            }

            var instance = {};
            instance.instance = instanceName;
            instance.pointList = [];
            this.overviewModel.data.push(instance);
            return instance;
          }
        }, {
          key: "initialiseColorMap",
          value: function initialiseColorMap() {
            this.initialiseOverviewMixMax();
            this.overviewModel.colorMap = new Map();
            this.layerRange = this.overviewModel.max / (this.config.colors.length - 0.5);

            for (var i = 0; i < this.config.colors.length; ++i) {
              var threshold = {};
              threshold.min = i * this.layerRange;
              threshold.max = threshold.min + this.layerRange;
              this.overviewModel.colorMap.set(threshold, this.config.colors[i]);
            }
          }
        }, {
          key: "initialiseOverviewMixMax",
          value: function initialiseOverviewMixMax() {
            var _this10 = this;

            this.overviewModel.min = -1;
            this.overviewModel.max = -1;
            this.overviewModel.data.forEach(function (instance) {
              instance.pointList.forEach(function (point) {
                _this10.checkAndSetOverviewMinMax(point);
              });
            });
          }
        }, {
          key: "checkAndSetOverviewMinMax",
          value: function checkAndSetOverviewMinMax(point) {
            var value = point.Value;

            if (this.overviewModel.min == -1) {
              this.overviewModel.min = value;
              this.overviewModel.max = value;
            } else {
              if (value < this.overviewModel.min) {
                this.overviewModel.min = value;
              }

              if (value > this.overviewModel.max) {
                this.overviewModel.max = value;
              }
            }
          }
        }, {
          key: "renderOverview",
          value: function renderOverview() {
            if (this.overviewModel.data && this.overviewModel.data.length > 0) {
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
            var _this11 = this;

            this.scope.ctrl.overviewWidth = this.overviewModel.data[0].pointList.length * this.config.overviewPointSize;
            this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.config.overviewPointSize;
            this.scope.ctrl.focusGraphMarginTop = this.scope.ctrl.overviewHeight + this.config.paddingBetweenGraphs;
            this.scope.$apply();
            this.overviewModel.data.forEach(function (instance, index) {
              instance.overviewY = index * _this11.config.overviewPointSize;

              for (var i = 0; i < instance.pointList.length; ++i) {
                var point = instance.pointList[i];
                point.x = _this11.config.leftPadding + i * _this11.config.overviewPointSize;
                point.color = _this11.getColorFromMap(point.Value);
                _this11.overviewContext.fillStyle = point.color;

                _this11.overviewContext.fillRect(point.x, instance.overviewY, _this11.config.overviewPointSize, _this11.config.overviewPointSize);
              }
            });
          }
        }, {
          key: "getColorFromMap",
          value: function getColorFromMap(value) {
            var result;
            this.overviewModel.colorMap.forEach(function (color, threshold) {
              if (threshold.min <= value && value <= threshold.max) {
                result = color;
              }
            });
            return "#" + result;
          }
        }]);

        return HeatmapCtrl;
      }(MetricsPanelCtrl));

      HeatmapCtrl.templateUrl = "module.html";
    }
  };
});
//# sourceMappingURL=heatmap_ctrl.js.map
