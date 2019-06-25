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
              metricCount: 3,
              CPUColors: ["f2d9e6", "d98cb3", "bf4080", "73264d"],
              memoryColors: ["ccddff", "6699ff", "0055ff", "003399"],
              storageColors: ["eeeedd", "cccc99", "aaaa55", "666633"],
              luminanceLevel: 0.5,
              overviewPointWidth: 1,
              overviewPointHeight: 1,
              paddingBetweenGraphs: 50,
              leftPadding: 0,
              horizontalMargin: 40,
              verticalMargin: 20,
              fontSize: 15,
              focusPointWidth: 5,
              focusPointHeight: 30,
              focusGraphMargins: 10
            };
          }
        }, {
          key: "onDataReceived",
          value: function onDataReceived() {
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
                _this2.rawData = {};
                _this2.maxLoadCount = 7;
                _this2.loadCount = 0;
                _this2.fromDate = Math.round(_this2.timeSrv.timeRange().from._d.getTime() / 1000);
                _this2.toDate = Math.round(_this2.timeSrv.timeRange().to._d.getTime() / 1000);

                _this2.getCPUData();

                _this2.getMemoryData();

                _this2.getStorageData();

                _this2.processRawData();
              }
            }, 100);
          }
        }, {
          key: "getCPUData",
          value: function getCPUData() {
            var _this3 = this;

            this.getDataFromAPI("node_load1{job='node'}", function (data) {
              _this3.rawData.CPU = data;
            });
          }
        }, {
          key: "getDataFromAPI",
          value: function getDataFromAPI(metric, callback) {
            var _this4 = this;

            var xmlHttp = new XMLHttpRequest();

            xmlHttp.onreadystatechange = function () {
              if (xmlHttp.readyState == 4) {
                ++_this4.loadCount;

                if (xmlHttp.status == 200) {
                  callback(JSON.parse(xmlHttp.responseText).data.result);
                }
              }
            };

            var url = this.config.apiAddress + encodeURIComponent(metric) + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=15";
            xmlHttp.open("GET", url, true);
            xmlHttp.send(null);
          }
        }, {
          key: "getMemoryData",
          value: function getMemoryData() {
            var _this5 = this;

            this.getDataFromAPI("node_memory_MemTotal_bytes{job='node'}", function (data) {
              _this5.rawData.totalMemory = data;
            });
            this.getDataFromAPI("node_memory_MemFree_bytes{job='node'}", function (data) {
              _this5.rawData.freeMemory = data;
            });
            this.getDataFromAPI("node_memory_Cached_bytes{job='node'}", function (data) {
              _this5.rawData.cachedMemory = data;
            });
            this.getDataFromAPI("node_memory_Buffers_bytes{job='node'}", function (data) {
              _this5.rawData.bufferMemory = data;
            });
          }
        }, {
          key: "getStorageData",
          value: function getStorageData() {
            var _this6 = this;

            this.getDataFromAPI("sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'})", function (data) {
              _this6.rawData.totalStorage = data;
            });
            this.getDataFromAPI("sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)',mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})", function (data) {
              _this6.rawData.freeStorage = data;
            });
          }
        }, {
          key: "processRawData",
          value: function processRawData() {
            var _this7 = this;

            this.$timeout(function () {
              if (_this7.loadCount < _this7.maxLoadCount) {
                _this7.processRawData.bind(_this7)();
              } else {
                _this7.scope.ctrl.isLoading = false;

                _this7.convertDataToFloat(_this7.rawData.CPU);

                _this7.overviewModel.CPU = {};
                _this7.overviewModel.CPU.data = _this7.rawData.CPU;

                _this7.processMemoryData();

                _this7.processStorageData();

                _this7.initiliseOverviewCanvasData();

                _this7.initialiseOverviewMixMax();

                _this7.initialiseColorMap();

                _this7.renderOverview();
              }
            }, 100);
          }
        }, {
          key: "convertDataToFloat",
          value: function convertDataToFloat(data) {
            data.forEach(function (instance) {
              instance.values.forEach(function (value) {
                value[0] = parseFloat(value[0]);
                value[1] = parseFloat(value[1]);
              });
            });
          }
        }, {
          key: "processMemoryData",
          value: function processMemoryData() {
            var _this8 = this;

            if (this.rawData.totalMemory.length > 0) {
              this.convertDataToFloat(this.rawData.totalMemory);
              this.convertDataToFloat(this.rawData.freeMemory);
              this.convertDataToFloat(this.rawData.cachedMemory);
              this.convertDataToFloat(this.rawData.bufferMemory);
              var memoryData = [];
              this.rawData.totalMemory.forEach(function (instance) {
                var memoryInstance = {};
                memoryInstance.metric = instance.metric;
                memoryInstance.totalValues = instance.values;
                memoryInstance.freeValues = _.find(_this8.rawData.freeMemory, function (search) {
                  return search.metric.instance == memoryInstance.metric.instance;
                }).values;
                memoryInstance.cachedValues = _.find(_this8.rawData.cachedMemory, function (search) {
                  return search.metric.instance == memoryInstance.metric.instance;
                }).values;
                memoryInstance.bufferValues = _.find(_this8.rawData.bufferMemory, function (search) {
                  return search.metric.instance == memoryInstance.metric.instance;
                }).values;

                _this8.addUsedMemoryData(memoryInstance);

                memoryData.push(memoryInstance);
              });
              this.overviewModel.memory = {};
              this.overviewModel.memory.data = memoryData;
            }
          }
        }, {
          key: "addUsedMemoryData",
          value: function addUsedMemoryData(memoryInstance) {
            memoryInstance.usedValues = [];
            memoryInstance.usedPercentageValues = [];

            if (memoryInstance.totalValues.length == memoryInstance.bufferValues.length && memoryInstance.bufferValues.length == memoryInstance.freeValues.length && memoryInstance.freeValues.length == memoryInstance.cachedValues.length) {
              for (var i = 0; i < memoryInstance.totalValues.length; ++i) {
                var time = memoryInstance.totalValues[i][0];
                var value = memoryInstance.totalValues[i][1] + memoryInstance.bufferValues[i][1] - memoryInstance.freeValues[i][1] - memoryInstance.cachedValues[i][1];
                memoryInstance.usedValues.push([time, value]);
              }

              for (var i = 0; i < memoryInstance.usedValues.length; ++i) {
                var time = memoryInstance.usedValues[i][0];
                var value = memoryInstance.usedValues[i][1] * 100 / (memoryInstance.totalValues[i][1] + memoryInstance.bufferValues[i][1]);
                memoryInstance.usedPercentageValues.push([time, value]);
              }
            }
          }
        }, {
          key: "processStorageData",
          value: function processStorageData() {
            var _this9 = this;

            if (this.rawData.totalStorage.length > 0) {
              this.convertDataToFloat(this.rawData.totalStorage);
              this.convertDataToFloat(this.rawData.freeStorage);
              var storageData = [];
              this.rawData.totalStorage.forEach(function (instance) {
                var storageInstance = {};
                storageInstance.metric = instance.metric;
                storageInstance.totalValues = instance.values;
                storageInstance.freeValues = _.find(_this9.rawData.freeStorage, function (search) {
                  return search.metric.instance == storageInstance.metric.instance;
                }).values;

                _this9.addUsedStorageData(storageInstance);

                storageData.push(storageInstance);
              });
              this.overviewModel.storage = {};
              this.overviewModel.storage.data = storageData;
            }
          }
        }, {
          key: "addUsedStorageData",
          value: function addUsedStorageData(storageInstance) {
            storageInstance.usedValues = [];
            storageInstance.usedPercentageValues = [];

            if (storageInstance.totalValues.length == storageInstance.freeValues.length) {
              for (var i = 0; i < storageInstance.totalValues.length; ++i) {
                var time = storageInstance.totalValues[i][0];
                var value = storageInstance.totalValues[i][1] - storageInstance.freeValues[i][1];
                storageInstance.usedValues.push([time, value]);
              }

              for (var i = 0; i < storageInstance.usedValues.length; ++i) {
                var time = storageInstance.usedValues[i][0];
                var value = storageInstance.usedValues[i][1] * 100 / storageInstance.totalValues[i][1];
                storageInstance.usedPercentageValues.push([time, value]);
              }
            }
          }
        }, {
          key: "initiliseOverviewCanvasData",
          value: function initiliseOverviewCanvasData() {
            var _this10 = this;

            this.overviewModel.canvasData = [];
            this.initialiseOverViewCanvasDataByMetric(this.overviewModel.CPU, function (newInstance, metricInstance) {
              _this10.convertValuePairToProperties(newInstance.CPUValues, metricInstance.values);

              _this10.overviewModel.canvasData.push(newInstance);
            });
            this.initialiseOverViewCanvasDataByMetric(this.overviewModel.memory, function (newInstance, metricInstance) {
              _this10.convertValuePairToProperties(newInstance.memoryValues, metricInstance.usedPercentageValues);
            });
            this.initialiseOverViewCanvasDataByMetric(this.overviewModel.storage, function (newInstance, metricInstance) {
              _this10.convertValuePairToProperties(newInstance.storageValues, metricInstance.usedPercentageValues);
            });
          }
        }, {
          key: "initialiseOverViewCanvasDataByMetric",
          value: function initialiseOverViewCanvasDataByMetric(metric, newInstanceCallback) {
            var _this11 = this;

            metric.data.forEach(function (metricInstance) {
              var newInstance = _.find(_this11.overviewModel.canvasData, function (search) {
                return metricInstance.metric.instance == search.instance;
              });

              if (!newInstance) {
                newInstance = {};
                newInstance.instance = metricInstance.metric.instance;
                newInstance.CPUValues = [];
                newInstance.memoryValues = [];
                newInstance.storageValues = [];
              }

              newInstanceCallback(newInstance, metricInstance);
            });
          }
        }, {
          key: "convertValuePairToProperties",
          value: function convertValuePairToProperties(newInstanceList, metricInstanceList) {
            metricInstanceList.forEach(function (value) {
              var point = {};
              point.date = value[0];
              point.value = value[1];
              newInstanceList.push(point);
            });
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
            this.drawFocusGraphLabels();
            this.drawFocusGraphData();
          }
        }, {
          key: "initialiseFocusGraphData",
          value: function initialiseFocusGraphData() {
            var _this12 = this;

            this.focusModel.data = [];
            this.overviewModel.canvasData.forEach(function (instance) {
              if (instance.overviewY >= _this12.focusStartY && instance.overviewY <= _this12.focusStartY + _this12.getFocusAreaSize()) {
                var modalInstance = {};
                modalInstance.instance = instance.instance;
                modalInstance.CPUValues = [];
                modalInstance.memoryValues = [];
                modalInstance.storageValues = [];
                var indexes = [];

                if (instance.CPUValues.length > 0) {
                  indexes = _this12.getPointIndexesInFocus(instance.CPUValues);
                } else if (instance.memoryValues.length > 0) {
                  indexes = _this12.getPointIndexesInFocus(instance.memoryValues);
                } else {
                  indexes = _this12.getPointIndexesInFocus(instance.storageValues);
                }

                _this12.addPointToFocusByList(modalInstance.CPUValues, instance.CPUValues, indexes);

                _this12.addPointToFocusByList(modalInstance.memoryValues, instance.memoryValues, indexes);

                _this12.addPointToFocusByList(modalInstance.storageValues, instance.storageValues, indexes);

                _this12.initialiseInstanceLayers(modalInstance);

                _this12.focusModel.data.push(modalInstance);
              }
            });
          }
        }, {
          key: "getPointIndexesInFocus",
          value: function getPointIndexesInFocus(list, indexes) {
            var _this13 = this;

            var indexes = [];
            list.forEach(function (point, index) {
              if (point.x >= _this13.focusStartX && point.x <= _this13.focusStartX + _this13.getFocusAreaSize()) {
                indexes.push(index);
              }
            });
            return indexes;
          }
        }, {
          key: "addPointToFocusByList",
          value: function addPointToFocusByList(focusList, overviewList, indexes) {
            indexes.forEach(function (index) {
              focusList.push(overviewList[index]);
            });
          }
        }, {
          key: "initialiseInstanceLayers",
          value: function initialiseInstanceLayers(instance) {
            instance.CPUlayers = [];
            this.initialiseLayersByMetric(instance.CPUlayers, this.config.CPUColors, instance.CPUValues, this.overviewModel.CPU.layerRange);
            instance.memoryLayers = [];
            this.initialiseLayersByMetric(instance.memoryLayers, this.config.memoryColors, instance.memoryValues, this.overviewModel.memory.layerRange);
            instance.storageLayers = [];
            this.initialiseLayersByMetric(instance.storageLayers, this.config.storageColors, instance.storageValues, this.overviewModel.storage.layerRange);
          }
        }, {
          key: "initialiseLayersByMetric",
          value: function initialiseLayersByMetric(layers, colors, valueList, layerRange) {
            colors.forEach(function () {
              var layer = {};
              layer.valueList = [];
              layers.push(layer);
            });
            valueList.forEach(function (point) {
              var value = point.value;
              layers.forEach(function (layer) {
                layer.valueList.push(value > 0 ? value : 0);
                value -= layerRange;
              });
            });
          }
        }, {
          key: "drawFocusGraphLabels",
          value: function drawFocusGraphLabels() {
            var _this14 = this;

            this.focusModel.horizontalX = 0;
            this.focusGraphContext.setLineDash([10, 10]);
            this.focusGraphContext.fillStyle = "black";
            this.focusModel.instanceHeight = (this.config.focusPointHeight + this.config.focusGraphMargins) * this.config.metricCount;
            this.focusModel.data.forEach(function (instance, index) {
              var x = _this14.config.leftPadding;
              var label = instance.instance;

              var metrics = _this14.focusGraphContext.measureText(label);

              instance.y = index * (_this14.focusModel.instanceHeight + _this14.config.verticalMargin);
              var labelY = instance.y + _this14.focusModel.instanceHeight / 2;

              _this14.focusGraphContext.fillText(label, x, labelY);

              if (index > 0) {
                var lineY = instance.y - _this14.config.verticalMargin / 2;

                _this14.focusGraphContext.beginPath();

                _this14.focusGraphContext.moveTo(x, lineY);

                _this14.focusGraphContext.lineTo(10000, lineY);

                _this14.focusGraphContext.stroke();
              }

              if (metrics.width > _this14.focusModel.horizontalX) {
                _this14.focusModel.horizontalX = metrics.width + _this14.config.leftPadding;
              }
            });
            this.focusModel.horizontalX += this.config.horizontalMargin;
          }
        }, {
          key: "drawFocusGraphData",
          value: function drawFocusGraphData() {
            var _this15 = this;

            this.focusModel.data.forEach(function (instance) {
              _this15.drawFocusGraphDataByLayers(instance, instance.CPUlayers, _this15.config.CPUColors, _this15.overviewModel.CPU.layerRange, 0);

              _this15.drawFocusGraphDataByLayers(instance, instance.memoryLayers, _this15.config.memoryColors, _this15.overviewModel.memory.layerRange, 1);

              _this15.drawFocusGraphDataByLayers(instance, instance.storageLayers, _this15.config.storageColors, _this15.overviewModel.storage.layerRange, 2);
            });
          }
        }, {
          key: "drawFocusGraphDataByLayers",
          value: function drawFocusGraphDataByLayers(instance, layers, colors, layerRange, metricIndex) {
            var _this16 = this;

            layers.forEach(function (layer, layerIndex) {
              var y = instance.y + (_this16.config.focusPointHeight + _this16.config.focusGraphMargins) * metricIndex + _this16.config.focusPointHeight;

              _this16.focusGraphContext.beginPath();

              _this16.focusGraphContext.moveTo(_this16.focusModel.horizontalX, y);

              var x = _this16.focusModel.horizontalX;
              var previousX = x;
              var previousValue = 0;
              layer.valueList.forEach(function (value, valueIndex) {
                x += valueIndex * _this16.config.focusPointWidth;

                _this16.moveContextBasedOnValue(value, previousX, previousValue, layerIndex, x, y, layerRange);

                previousX = x;
                previousValue = value;
              });

              _this16.focusGraphContext.lineTo(x, y);

              _this16.focusGraphContext.lineTo(_this16.focusModel.horizontalX, y);

              _this16.focusGraphContext.closePath();

              _this16.focusGraphContext.fillStyle = "#" + colors[layerIndex];

              _this16.focusGraphContext.fill();
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
                this.focusGraphContext.lineTo(x, y - this.config.focusPointHeight);
              } else {
                this.focusGraphContext.lineTo(x, y - value * this.config.focusPointHeight / layerRange);
              }
            }
          }
        }, {
          key: "selectNode",
          value: function selectNode(evt) {
            var _this17 = this;

            if (!this.updateVariable) {
              var mousePos = this.getMousePos(event, this.focusGraphCanvas);
              this.scope.ctrl.menuX = mousePos.x;
              this.scope.ctrl.menuY = mousePos.y;
              var height = this.focusModel.instanceHeight + this.config.verticalMargin;

              for (var i = 0; i < this.focusModel.data.length; ++i) {
                if (height * i <= mousePos.y && mousePos.y <= height * (i + 1)) {
                  var instance = this.focusModel.data[i];
                  this.variableSrv.variables.forEach(function (v) {
                    if (v.name == "node") {
                      _this17.variableSrv.setOptionAsCurrent(v, {
                        text: instance.instance,
                        value: instance.instance
                      });

                      _this17.updateVariable = true;

                      _this17.variableSrv.variableUpdated(v, true);
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
          key: "initialiseOverviewMixMax",
          value: function initialiseOverviewMixMax() {
            this.overviewModel.min = -1;
            this.overviewModel.max = -1;
            this.initialiseCPUMinMax();
            this.initialiseMemoryStorageMinMax(this.overviewModel.memory);
            this.initialiseMemoryStorageMinMax(this.overviewModel.storage);
          }
        }, {
          key: "initialiseCPUMinMax",
          value: function initialiseCPUMinMax(metric) {
            var _this18 = this;

            this.overviewModel.CPU.min = -1;
            this.overviewModel.CPU.max = -1;
            this.overviewModel.CPU.data.forEach(function (instance) {
              instance.values.forEach(function (point) {
                _this18.checkAndSetOverviewMinMax(_this18.overviewModel.CPU, point);
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
          key: "initialiseMemoryStorageMinMax",
          value: function initialiseMemoryStorageMinMax(metric) {
            var _this19 = this;

            metric.min = -1;
            metric.max = -1;
            metric.data.forEach(function (instance) {
              instance.usedPercentageValues.forEach(function (point) {
                _this19.checkAndSetOverviewMinMax(metric, point);
              });
            });
          }
        }, {
          key: "initialiseColorMap",
          value: function initialiseColorMap() {
            this.initialiseColorMapByMetric(this.overviewModel.CPU, this.config.CPUColors);
            this.initialiseColorMapByMetric(this.overviewModel.memory, this.config.memoryColors);
            this.initialiseColorMapByMetric(this.overviewModel.storage, this.config.storageColors);
          }
        }, {
          key: "initialiseColorMapByMetric",
          value: function initialiseColorMapByMetric(metric, colors) {
            metric.colorMap = new Map();
            metric.layerRange = metric.max / (colors.length - 0.5);

            for (var i = 0; i < colors.length; ++i) {
              var threshold = {};
              threshold.min = i * metric.layerRange;
              threshold.max = threshold.min + metric.layerRange;
              metric.colorMap.set(threshold, colors[i]);
            }
          }
        }, {
          key: "renderOverview",
          value: function renderOverview() {
            if (this.checkMetricHasData(this.overviewModel.CPU) || this.checkMetricHasData(this.overviewModel.memory) || this.checkMetricHasData(this.overviewModel.storage)) {
              this.overviewContext.clearRect(0, 0, this.overviewCanvas.width, this.overviewCanvas.height);
              this.clearFocus();
              this.drawOverviewData();
            }
          }
        }, {
          key: "checkMetricHasData",
          value: function checkMetricHasData(metric) {
            return metric.data && metric.data.length > 0;
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
            var _this20 = this;

            var firstInstance = this.overviewModel.canvasData[0];
            var maxLength = Math.max(firstInstance.CPUValues.length, firstInstance.memoryValues.length, firstInstance.storageValues.length);
            this.scope.ctrl.overviewWidth = maxLength * this.config.overviewPointHeight;
            this.scope.ctrl.overviewHeight = this.overviewModel.canvasData.length * this.config.overviewPointHeight * this.config.metricCount * 3;
            this.scope.ctrl.focusGraphMarginTop = this.scope.ctrl.overviewHeight + this.config.paddingBetweenGraphs;
            this.scope.$apply();
            this.overviewModel.canvasData.forEach(function (instance, index) {
              instance.overviewY = index * _this20.config.overviewPointHeight * _this20.config.metricCount * 3;

              _this20.drawMetricOverviewData(instance.CPUValues, instance, _this20.overviewModel.CPU.colorMap, 0);

              _this20.drawMetricOverviewData(instance.memoryValues, instance, _this20.overviewModel.memory.colorMap, 1);

              _this20.drawMetricOverviewData(instance.storageValues, instance, _this20.overviewModel.storage.colorMap, 2);
            });
          }
        }, {
          key: "drawMetricOverviewData",
          value: function drawMetricOverviewData(valueList, instance, colorMap, index) {
            for (var i = 0; i < valueList.length; ++i) {
              var point = valueList[i];
              point.x = this.config.leftPadding + i * this.config.overviewPointWidth;
              point.color = this.getColorFromMap(point.value, colorMap);
              this.overviewContext.fillStyle = point.color;
              var y = instance.overviewY + index * this.config.overviewPointHeight * 2;
              this.overviewContext.fillRect(point.x, y, this.config.overviewPointHeight, this.config.overviewPointHeight);
            }
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
        }]);

        return HeatmapCtrl;
      }(MetricsPanelCtrl));

      HeatmapCtrl.templateUrl = "module.html";
    }
  };
});
//# sourceMappingURL=heatmap_ctrl.js.map
