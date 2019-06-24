import { MetricsPanelCtrl } from "app/plugins/sdk";
import "./heatmap.css!";

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
        this.loadData();
    }

    initialiseConfig() {
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
            paddingBetweenGraphs: 50,
        }
    }

    loadData() {
        this.rawData = {};
        this.maxLoadCount = 5;
        this.loadCount = 0;
        this.fromDate = Math.round(this.timeSrv.timeRange().from._d.getTime() / 1000);
        this.toDate = Math.round(this.timeSrv.timeRange().to._d.getTime() / 1000);

        this.getDataFromAPI("node_load1", (data) => {
            this.rawData.cpu_load = data;
        });

        this.getDataFromAPI("node_memory_MemTotal_bytes", (data) => {
            this.rawData.totalMemory = data;
        });

        this.getDataFromAPI("node_memory_MemFree_bytes", (data) => {
            this.rawData.freeMemory = data;
        });

        this.getDataFromAPI("node_memory_Cached_bytes", (data) => {
            this.rawData.cachedMemory = data;
        });

        this.getDataFromAPI("node_memory_Buffers_bytes", (data) => {
            this.rawData.bufferMemory = data;
        });

        this.processRawData();
    }

    getDataFromAPI(metric, callback) {
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            ++this.loadCount;

            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                callback(JSON.parse(xmlHttp.responseText).data.result);
            }
        }

        var url = this.config.apiAddress + metric + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=15";
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }

    processRawData() {
        this.$timeout(() => {
            if (this.loadCount < this.maxLoadCount) {
                this.processRawData();
            } else {
            }
        }, 100);
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
        this.drawVertical();
        this.drawFocusGraphData();
    }

    initialiseFocusGraphData() {
        this.focusModel.data = [];

        this.overviewModel.data.forEach((instance, index) => {
            if (this.checkInstanceIsFocused(instance)) {
                var modalInstance = {};
                modalInstance.pointList = [];
                modalInstance.instance = instance.instance;
                this.focusModel.data.push(modalInstance);

                instance.pointList.forEach((point) => {
                    if (this.checkPointIsFocused(point)) {
                        modalInstance.pointList.push(point);
                    }
                });

                this.initialiseInstanceLayers(modalInstance);
            }
        });
    }

    initialiseInstanceLayers(instance) {
        instance.layers = [];

        this.config.colors.forEach((color) => {
            var layer = {};
            layer.valueList = [];
            instance.layers.push(layer);
        });

        instance.pointList.forEach((point) => {
            var value = point.Value;

            instance.layers.forEach((layer) => {
                layer.valueList.push(value > 0 ? value : 0);
                value -= this.layerRange;
            });
        });
    }

    checkInstanceIsFocused(instance) {
        return instance.overviewY >= this.focusStartY && instance.overviewY <= this.focusStartY + this.getFocusAreaSize();
    }

    checkPointIsFocused(point) {
        return point.x >= this.focusStartX && point.x <= this.focusStartX + this.getFocusAreaSize();
    }

    drawVertical() {
        this.focusModel.horizontalX = 0;
        this.focusGraphContext.fillStyle = "black";

        this.focusModel.data.forEach((instance, index) => {
            var label = instance.instance;
            instance.y = this.config.focusPointHeight + index * (this.config.focusPointHeight + this.config.verticalPadding);
            this.focusGraphContext.fillText(label, this.config.leftPadding, instance.y);
            var metrics = this.focusGraphContext.measureText(label);

            if (metrics.width > this.focusModel.horizontalX) {
                this.focusModel.horizontalX = metrics.width;
            }
        });

        this.focusModel.horizontalX += this.config.horizontalPadding;
    }

    drawFocusGraphData() {
        this.focusModel.data.forEach((instance) => {
            instance.layers.forEach((layer, layerIndex) => {
                this.focusGraphContext.beginPath();
                this.focusGraphContext.moveTo(this.focusModel.horizontalX, instance.y);
                var x = this.focusModel.horizontalX;
                var previousX = 0;
                var previousValue = 0;

                layer.valueList.forEach((value, valueIndex) => {
                    x += valueIndex * this.config.focusPointWidth;
                    this.moveContextBasedOnValue(value, previousValue, previousX, instance, layerIndex, x);
                    previousX = x;
                    previousValue = value;
                });

                this.focusGraphContext.lineTo(x, instance.y);
                this.focusGraphContext.lineTo(this.focusModel.horizontalX, instance.y);
                this.focusGraphContext.closePath();
                this.focusGraphContext.fillStyle = "#" + this.config.colors[layerIndex];
                this.focusGraphContext.fill();
            });
        });
    }

    moveContextBasedOnValue(value, previousValue, previousX, instance, layerIndex, x) {
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

    selectNode(evt) {
        if (!this.updateVariable) {
            var mousePos = this.getMousePos(event, this.focusGraphCanvas);
            this.scope.ctrl.menuX = mousePos.x;
            this.scope.ctrl.menuY = mousePos.y;
            var instanceHeight = this.config.focusPointHeight + this.config.verticalPadding;

            for (var i = 0; i < this.focusModel.data.length; ++i) {
                if (instanceHeight * i <= mousePos.y && mousePos.y <= instanceHeight * (i + 1)) {
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

    onDataReceived(dataList) {
        if (this.updateVariable) {
            this.updateVariable = false;
        } else {
            this.parseTable(dataList);
            this.initialiseColorMap();
            this.renderOverview();
        }
    }

    parseTable(dataList) {
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

    getInstanceColumnIndex(table) {
        for (var i = 0; i < table.columns.length; ++i) {
            if (table.columns[i].text == this.config.instancePropertyName) {
                return i;
            }
        }

        return -1;
    }

    getExistingInstance(instanceName) {
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

    initialiseColorMap() {
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

    initialiseOverviewMixMax() {
        this.overviewModel.min = -1;
        this.overviewModel.max = -1;

        this.overviewModel.data.forEach((instance) => {
            instance.pointList.forEach((point) => {
                this.checkAndSetOverviewMinMax(point);
            });
        });
    }

    checkAndSetOverviewMinMax(point) {
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

    renderOverview() {
        if (this.overviewModel.data && this.overviewModel.data.length > 0) {
            this.overviewContext.clearRect(0, 0, this.overviewCanvas.width, this.overviewCanvas.height);
            this.clearFocus();
            this.drawOverviewData();
        }
    }

    drawOverviewData() {
        var parent = this;

        this.$timeout(() => {
            parent.drawOverviewDataWrapper.bind(parent)();
        }, 100);
    }

    drawOverviewDataWrapper() {
        this.scope.ctrl.overviewWidth = this.overviewModel.data[0].pointList.length * this.config.overviewPointSize;
        this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.config.overviewPointSize;
        this.scope.ctrl.focusGraphMarginTop = this.scope.ctrl.overviewHeight + this.config.paddingBetweenGraphs;
        this.scope.$apply();

        this.overviewModel.data.forEach((instance, index) => {
            instance.overviewY = index * this.config.overviewPointSize;

            for (var i = 0; i < instance.pointList.length; ++i) {
                var point = instance.pointList[i];
                point.x = this.config.leftPadding + i * this.config.overviewPointSize;
                point.color = this.getColorFromMap(point.Value);
                this.overviewContext.fillStyle = point.color;
                this.overviewContext.fillRect(point.x, instance.overviewY, this.config.overviewPointSize, this.config.overviewPointSize);
            }
        });
    }

    getColorFromMap(value) {
        var result;

        this.overviewModel.colorMap.forEach((color, threshold) => {
            if (threshold.min <= value && value <= threshold.max) {
                result = color;
            }
        });

        return "#" + result;
    }
}

HeatmapCtrl.templateUrl = "module.html";