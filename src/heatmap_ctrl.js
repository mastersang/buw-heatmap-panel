import { MetricsPanelCtrl } from "app/plugins/sdk";
import "./heatmap.css!";
import _ from "lodash";

export class HeatmapCtrl extends MetricsPanelCtrl {
    constructor($scope, $injector, $timeout, variableSrv, timeSrv) {
        super($scope, $injector);
        this.$timeout = $timeout;
        this.variableSrv = variableSrv;
        this.timeSrv = timeSrv;
        this.events.on("data-received", this.onDataReceived.bind(this));
        this.overviewModel = {};
        this.focusModel = {};
        this.initialiseConfig();
    }

    initialiseConfig() {
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
            focusGraphMargins: 10,
        }
    }

    onDataReceived() {
        if (this.updateVariable) {
            this.updateVariable = false;
        } else {
            this.load();
        }
    }

    load() {
        this.$timeout(() => {
            if (this.scope.ctrl.isLoading) {
                this.load();
            } else {
                this.scope.ctrl.isLoading = true;
                this.rawData = {};
                this.maxLoadCount = 7;
                this.loadCount = 0;
                this.fromDate = Math.round(this.timeSrv.timeRange().from._d.getTime() / 1000);
                this.toDate = Math.round(this.timeSrv.timeRange().to._d.getTime() / 1000);

                this.getCPUData();
                this.getMemoryData();
                this.getStorageData();

                this.processRawData();
            }
        }, 100);
    }

    getCPUData() {
        this.getDataFromAPI("node_load1{job='node'}", (data) => {
            this.rawData.CPU = data;
        });
    }

    getDataFromAPI(metric, callback) {
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                ++this.loadCount;

                if (xmlHttp.status == 200) {
                    callback(JSON.parse(xmlHttp.responseText).data.result);
                }
            }
        }

        var url = this.config.apiAddress + encodeURIComponent(metric) + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=15";
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }

    getMemoryData() {
        this.getDataFromAPI("node_memory_MemTotal_bytes{job='node'}", (data) => {
            this.rawData.totalMemory = data;
        });

        this.getDataFromAPI("node_memory_MemFree_bytes{job='node'}", (data) => {
            this.rawData.freeMemory = data;
        });

        this.getDataFromAPI("node_memory_Cached_bytes{job='node'}", (data) => {
            this.rawData.cachedMemory = data;
        });

        this.getDataFromAPI("node_memory_Buffers_bytes{job='node'}", (data) => {
            this.rawData.bufferMemory = data;
        });
    }

    getStorageData() {
        this.getDataFromAPI("sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'})", (data) => {
            this.rawData.totalStorage = data;
        });

        this.getDataFromAPI("sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)',mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})", (data) => {
            this.rawData.freeStorage = data;
        });
    }

    processRawData() {
        this.$timeout(() => {
            if (this.loadCount < this.maxLoadCount) {
                this.processRawData.bind(this)();
            } else {
                this.scope.ctrl.isLoading = false;

                this.convertDataToFloat(this.rawData.CPU);
                this.overviewModel.CPU = {};
                this.overviewModel.CPU.data = this.rawData.CPU;

                this.processMemoryData();
                this.processStorageData();

                this.initiliseOverviewCanvasData();
                this.initialiseOverviewMixMax();
                this.initialiseColorMap();
                this.renderOverview();
            }
        }, 100);
    }

    convertDataToFloat(data) {
        data.forEach((instance) => {
            instance.values.forEach((value) => {
                value[0] = parseFloat(value[0]);
                value[1] = parseFloat(value[1]);
            });
        });
    }

    processMemoryData() {
        if (this.rawData.totalMemory.length > 0) {
            this.convertDataToFloat(this.rawData.totalMemory);
            this.convertDataToFloat(this.rawData.freeMemory);
            this.convertDataToFloat(this.rawData.cachedMemory);
            this.convertDataToFloat(this.rawData.bufferMemory);
            var memoryData = [];

            this.rawData.totalMemory.forEach((instance) => {
                var memoryInstance = {};
                memoryInstance.metric = instance.metric;
                memoryInstance.totalValues = instance.values;

                memoryInstance.freeValues = _.find(this.rawData.freeMemory, (search) => {
                    return search.metric.instance == memoryInstance.metric.instance;
                }).values;

                memoryInstance.cachedValues = _.find(this.rawData.cachedMemory, (search) => {
                    return search.metric.instance == memoryInstance.metric.instance;
                }).values;

                memoryInstance.bufferValues = _.find(this.rawData.bufferMemory, (search) => {
                    return search.metric.instance == memoryInstance.metric.instance;
                }).values;

                this.addUsedMemoryData(memoryInstance);
                memoryData.push(memoryInstance);
            });

            this.overviewModel.memory = {};
            this.overviewModel.memory.data = memoryData;
        }
    }

    addUsedMemoryData(memoryInstance) {
        memoryInstance.usedValues = [];
        memoryInstance.usedPercentageValues = [];

        if (memoryInstance.totalValues.length == memoryInstance.bufferValues.length &&
            memoryInstance.bufferValues.length == memoryInstance.freeValues.length &&
            memoryInstance.freeValues.length == memoryInstance.cachedValues.length) {
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

    processStorageData() {
        if (this.rawData.totalStorage.length > 0) {
            this.convertDataToFloat(this.rawData.totalStorage);
            this.convertDataToFloat(this.rawData.freeStorage);
            var storageData = [];

            this.rawData.totalStorage.forEach((instance) => {
                var storageInstance = {};
                storageInstance.metric = instance.metric;
                storageInstance.totalValues = instance.values;

                storageInstance.freeValues = _.find(this.rawData.freeStorage, (search) => {
                    return search.metric.instance == storageInstance.metric.instance;
                }).values;

                this.addUsedStorageData(storageInstance);
                storageData.push(storageInstance);
            });

            this.overviewModel.storage = {};
            this.overviewModel.storage.data = storageData;
        }
    }

    addUsedStorageData(storageInstance) {
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

    initiliseOverviewCanvasData() {
        this.overviewModel.canvasData = [];

        this.initialiseOverViewCanvasDataByMetric(this.overviewModel.CPU, (newInstance, metricInstance) => {
            this.convertValuePairToProperties(newInstance.CPUValues, metricInstance.values);
            this.overviewModel.canvasData.push(newInstance);
        });

        this.initialiseOverViewCanvasDataByMetric(this.overviewModel.memory, (newInstance, metricInstance) => {
            this.convertValuePairToProperties(newInstance.memoryValues, metricInstance.usedPercentageValues);
        });

        this.initialiseOverViewCanvasDataByMetric(this.overviewModel.storage, (newInstance, metricInstance) => {
            this.convertValuePairToProperties(newInstance.storageValues, metricInstance.usedPercentageValues);
        });
    }

    initialiseOverViewCanvasDataByMetric(metric, newInstanceCallback) {
        metric.data.forEach((metricInstance) => {
            var newInstance = _.find(this.overviewModel.canvasData, (search) => {
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

    convertValuePairToProperties(newInstanceList, metricInstanceList) {
        metricInstanceList.forEach((value) => {
            var point = {};
            point.date = value[0];
            point.value = value[1];
            newInstanceList.push(point);
        });
    }

    link(scope, elem, attrs, ctrl) {
        this.scope = scope;
        this.elem = elem;
        var parent = this;

        scope.toggleFocus = function () {
            parent.toggleFocus.bind(parent)();
        }

        scope.moveFocusArea = function (evt) {
            parent.moveFocusArea.bind(parent, evt)();
        }

        scope.fixFocusArea = function (evt) {
            parent.fixFocusArea.bind(parent, evt)();
        }

        scope.selectNode = function (evt) {
            parent.selectNode.bind(parent, evt)();
        }

        this.initialiseCanvases();
    }

    toggleFocus() {
        this.scope.ctrl.focusMode = !this.scope.ctrl.focusMode;

        if (!this.scope.ctrl.focusMode) {
            this.clearFocus();
            this.focusAreaIsFixed = false;
        }
    }

    clearFocus() {
        this.hasFocus = false;
        this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
        this.focusGraphContext.clearRect(0, 0, this.focusGraphCanvas.width, this.focusGraphCanvas.height);
    }

    moveFocusArea(evt) {
        if (this.scope.ctrl.focusMode) {
            if (!this.focusAreaIsFixed) {
                this.drawFocus(evt);
                evt.preventDefault();
            }
        }
    }

    fixFocusArea(evt) {
        if (this.scope.ctrl.focusMode) {
            if (this.focusAreaIsFixed) {
                this.drawFocus(evt);
            }

            this.focusAreaIsFixed = !this.focusAreaIsFixed;
            evt.preventDefault();
        }
    }

    drawFocus(evt) {
        this.mousePos = this.getMousePos(evt, this.overviewCanvas);
        this.clearFocus();
        this.drawFocusArea();
        this.drawFocusGraph();
    }

    getMousePos(evt, canvas) {
        var rect = canvas.getBoundingClientRect();

        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    drawFocusArea() {
        var size = this.getFocusAreaSize();
        this.focusStartX = Math.min(Math.max(0, this.mousePos.x - this.config.focusAreaSize), this.overviewCanvas.width - size);
        this.focusStartY = Math.min(Math.max(0, this.mousePos.y - this.config.focusAreaSize), this.overviewCanvas.height - size);
        this.focusAreaContext.strokeStyle = this.config.focusAreaColor;
        this.focusAreaContext.strokeRect(this.focusStartX, this.focusStartY, size, size);
    }

    getFocusAreaSize() {
        return this.config.focusAreaSize * 2;
    }

    drawFocusGraph() {
        this.initialiseFocusGraphData();
        this.drawFocusGraphLabels();
        this.drawFocusGraphData();
    }

    initialiseFocusGraphData() {
        this.focusModel.data = [];

        this.overviewModel.canvasData.forEach((instance) => {
            if (instance.overviewY >= this.focusStartY && instance.overviewY <= this.focusStartY + this.getFocusAreaSize()) {
                var modalInstance = {};
                modalInstance.instance = instance.instance;
                modalInstance.CPUValues = [];
                modalInstance.memoryValues = [];
                modalInstance.storageValues = [];
                var indexes = [];

                if (instance.CPUValues.length > 0) {
                    indexes = this.getPointIndexesInFocus(instance.CPUValues);
                } else if (instance.memoryValues.length > 0) {
                    indexes = this.getPointIndexesInFocus(instance.memoryValues);
                } else {
                    indexes = this.getPointIndexesInFocus(instance.storageValues);
                }

                this.addPointToFocusByList(modalInstance.CPUValues, instance.CPUValues, indexes);
                this.addPointToFocusByList(modalInstance.memoryValues, instance.memoryValues, indexes);
                this.addPointToFocusByList(modalInstance.storageValues, instance.storageValues, indexes);

                this.initialiseInstanceLayers(modalInstance);
                this.focusModel.data.push(modalInstance);
            }
        });
    }

    getPointIndexesInFocus(list, indexes) {
        var indexes = [];

        list.forEach((point, index) => {
            if (point.x >= this.focusStartX && point.x <= this.focusStartX + this.getFocusAreaSize()) {
                indexes.push(index);
            }
        });

        return indexes;
    }

    addPointToFocusByList(focusList, overviewList, indexes) {
        indexes.forEach((index) => {
            focusList.push(overviewList[index]);
        });
    }

    initialiseInstanceLayers(instance) {
        instance.CPUlayers = [];
        this.initialiseLayersByMetric(instance.CPUlayers, this.config.CPUColors, instance.CPUValues, this.overviewModel.CPU.layerRange);

        instance.memoryLayers = [];
        this.initialiseLayersByMetric(instance.memoryLayers, this.config.memoryColors, instance.memoryValues, this.overviewModel.memory.layerRange);

        instance.storageLayers = [];
        this.initialiseLayersByMetric(instance.storageLayers, this.config.storageColors, instance.storageValues, this.overviewModel.storage.layerRange);
    }

    initialiseLayersByMetric(layers, colors, valueList, layerRange) {
        colors.forEach(() => {
            var layer = {};
            layer.valueList = [];
            layers.push(layer);
        });

        valueList.forEach((point) => {
            var value = point.value;

            layers.forEach((layer) => {
                layer.valueList.push(value > 0 ? value : 0);
                value -= layerRange;
            });
        });
    }

    drawFocusGraphLabels() {
        this.focusModel.horizontalX = 0;
        this.focusGraphContext.setLineDash([10, 10]);
        this.focusGraphContext.fillStyle = "black";
        this.focusModel.instanceHeight = (this.config.focusPointHeight + this.config.focusGraphMargins) * this.config.metricCount;

        this.focusModel.data.forEach((instance, index) => {
            var x = this.config.leftPadding;
            var label = instance.instance;
            var metrics = this.focusGraphContext.measureText(label);
            instance.y = index * (this.focusModel.instanceHeight + this.config.verticalMargin);
            var labelY = instance.y + this.focusModel.instanceHeight / 2;
            this.focusGraphContext.fillText(label, x, labelY);

            if (index > 0) {
                var lineY = instance.y - this.config.verticalMargin / 2;
                this.focusGraphContext.beginPath();
                this.focusGraphContext.moveTo(x, lineY);
                this.focusGraphContext.lineTo(10000, lineY);
                this.focusGraphContext.stroke();
            }

            if (metrics.width > this.focusModel.horizontalX) {
                this.focusModel.horizontalX = metrics.width + this.config.leftPadding;
            }
        });

        this.focusModel.horizontalX += this.config.horizontalMargin;
    }

    drawFocusGraphData() {
        this.focusModel.data.forEach((instance) => {
            this.drawFocusGraphDataByLayers(instance, instance.CPUlayers, this.config.CPUColors, this.overviewModel.CPU.layerRange, 0);
            this.drawFocusGraphDataByLayers(instance, instance.memoryLayers, this.config.memoryColors, this.overviewModel.memory.layerRange, 1);
            this.drawFocusGraphDataByLayers(instance, instance.storageLayers, this.config.storageColors, this.overviewModel.storage.layerRange, 2);
        });
    }

    drawFocusGraphDataByLayers(instance, layers, colors, layerRange, metricIndex) {
        layers.forEach((layer, layerIndex) => {
            var y = instance.y + (this.config.focusPointHeight + this.config.focusGraphMargins) * metricIndex + this.config.focusPointHeight;
            this.focusGraphContext.beginPath();
            this.focusGraphContext.moveTo(this.focusModel.horizontalX, y);
            var x = this.focusModel.horizontalX;
            var previousX = x;
            var previousValue = 0;

            layer.valueList.forEach((value, valueIndex) => {
                x += valueIndex * this.config.focusPointWidth;
                this.moveContextBasedOnValue(value, previousX, previousValue, layerIndex, x, y, layerRange);
                previousX = x;
                previousValue = value;
            });

            this.focusGraphContext.lineTo(x, y);
            this.focusGraphContext.lineTo(this.focusModel.horizontalX, y);
            this.focusGraphContext.closePath();
            this.focusGraphContext.fillStyle = "#" + colors[layerIndex];
            this.focusGraphContext.fill();
        });
    }

    moveContextBasedOnValue(value, previousX, previousValue, layerIndex, x, y, layerRange) {
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

    selectNode(evt) {
        if (!this.updateVariable) {
            var mousePos = this.getMousePos(event, this.focusGraphCanvas);
            this.scope.ctrl.menuX = mousePos.x;
            this.scope.ctrl.menuY = mousePos.y;

            for (var i = 0; i < this.focusModel.data.length; ++i) {
                if (this.focusModel.instanceHeight * i <= mousePos.y && mousePos.y <= this.focusModel.instanceHeight * (i + 1)) {
                    var instance = this.focusModel.data[i];

                    this.variableSrv.variables.forEach((v) => {
                        if (v.name == "node") {
                            this.variableSrv.setOptionAsCurrent(v, {
                                text: instance.instance,
                                value: instance.instance
                            });

                            this.updateVariable = true;
                            this.variableSrv.variableUpdated(v, true);
                        }
                    });

                    break;
                }
            }
        }
    }

    initialiseCanvases() {
        this.overviewCanvas = this.elem.find("#overviewCanvas")[0];
        this.overviewContext = this.overviewCanvas.getContext("2d");

        this.focusAreaCanvas = this.elem.find("#focusAreaCanvas")[0];
        this.focusAreaContext = this.focusAreaCanvas.getContext("2d");

        this.focusGraphCanvas = this.elem.find("#focusGraphCanvas")[0];
        this.focusGraphContext = this.focusGraphCanvas.getContext("2d");
        this.focusGraphContext.font = this.config.fontSize + "px arial";
    }

    initialiseOverviewMixMax() {
        this.overviewModel.min = -1;
        this.overviewModel.max = -1;
        this.initialiseCPUMinMax();
        this.initialiseMemoryStorageMinMax(this.overviewModel.memory);
        this.initialiseMemoryStorageMinMax(this.overviewModel.storage);
    }

    initialiseCPUMinMax(metric) {
        this.overviewModel.CPU.min = -1;
        this.overviewModel.CPU.max = -1;

        this.overviewModel.CPU.data.forEach((instance) => {
            instance.values.forEach((point) => {
                this.checkAndSetOverviewMinMax(this.overviewModel.CPU, point);
            });
        });
    }

    checkAndSetOverviewMinMax(metric, point) {
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

    initialiseMemoryStorageMinMax(metric) {
        metric.min = -1;
        metric.max = -1;

        metric.data.forEach((instance) => {
            instance.usedPercentageValues.forEach((point) => {
                this.checkAndSetOverviewMinMax(metric, point);
            });
        });
    }

    initialiseColorMap() {
        this.initialiseColorMapByMetric(this.overviewModel.CPU, this.config.CPUColors);
        this.initialiseColorMapByMetric(this.overviewModel.memory, this.config.memoryColors);
        this.initialiseColorMapByMetric(this.overviewModel.storage, this.config.storageColors);
    }

    initialiseColorMapByMetric(metric, colors) {
        metric.colorMap = new Map();
        metric.layerRange = metric.max / (colors.length - 0.5);

        for (var i = 0; i < colors.length; ++i) {
            var threshold = {};
            threshold.min = i * metric.layerRange;
            threshold.max = threshold.min + metric.layerRange;
            metric.colorMap.set(threshold, colors[i]);
        }
    }

    renderOverview() {
        if (this.checkMetricHasData(this.overviewModel.CPU) ||
            this.checkMetricHasData(this.overviewModel.memory) ||
            this.checkMetricHasData(this.overviewModel.storage)) {
            this.overviewContext.clearRect(0, 0, this.overviewCanvas.width, this.overviewCanvas.height);
            this.clearFocus();
            this.drawOverviewData();
        }
    }

    checkMetricHasData(metric) {
        return metric.data && metric.data.length > 0;
    }

    drawOverviewData() {
        var parent = this;

        this.$timeout(() => {
            parent.drawOverviewDataWrapper.bind(parent)();
        }, 100);
    }

    drawOverviewDataWrapper() {
        var firstInstance = this.overviewModel.canvasData[0];
        var maxLength = Math.max(firstInstance.CPUValues.length, firstInstance.memoryValues.length, firstInstance.storageValues.length);

        this.scope.ctrl.overviewWidth = maxLength * this.config.overviewPointHeight;
        this.scope.ctrl.overviewHeight = this.overviewModel.canvasData.length * this.config.overviewPointHeight * this.config.metricCount * 3;
        this.scope.ctrl.focusGraphMarginTop = this.scope.ctrl.overviewHeight + this.config.paddingBetweenGraphs;
        this.scope.$apply();

        this.overviewModel.canvasData.forEach((instance, index) => {
            instance.overviewY = index * this.config.overviewPointHeight * this.config.metricCount * 3;
            this.drawMetricOverviewData(instance.CPUValues, instance, this.overviewModel.CPU.colorMap, 0);
            this.drawMetricOverviewData(instance.memoryValues, instance, this.overviewModel.memory.colorMap, 1);
            this.drawMetricOverviewData(instance.storageValues, instance, this.overviewModel.storage.colorMap, 2);
        });
    }

    drawMetricOverviewData(valueList, instance, colorMap, index) {
        for (var i = 0; i < valueList.length; ++i) {
            var point = valueList[i];
            point.x = this.config.leftPadding + i * this.config.overviewPointWidth;
            point.color = this.getColorFromMap(point.value, colorMap);
            this.overviewContext.fillStyle = point.color;
            var y = instance.overviewY + index * this.config.overviewPointHeight * 2;
            this.overviewContext.fillRect(point.x, y, this.config.overviewPointHeight, this.config.overviewPointHeight);
        }
    }

    getColorFromMap(value, map) {
        var result;

        map.forEach((color, threshold) => {
            if (threshold.min <= value && value <= threshold.max) {
                result = color;
            }
        });

        return "#" + result;
    }
}

HeatmapCtrl.templateUrl = "module.html";