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
            focusAreaColor: "Aqua",
            focusAreaSize: 20,
            colors: [
                ["f2d9e6", "d98cb3", "bf4080", "73264d"],
                ["ccddff", "6699ff", "0055ff", "003399"],
                ["eeeedd", "cccc99", "aaaa55", "666633"]
            ],
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
        }
    }

    link(scope, elem, attrs, ctrl) {
        this.scope = scope;
        this.scope.ctrl.overviewMode = "1";
        this.scope.ctrl.linkingMode = "xCross";
        this.elem = elem;
        var parent = this;

        scope.selectOverviewMode = function () {
            parent.selectOverviewMode();
        }

        scope.selectLinker = function () {
            parent.selectLinker();
        }

        scope.moveFocusArea = function (evt) {
            parent.moveFocusArea.bind(parent, evt)();
        }

        scope.fixFocusArea = function (evt) {
            parent.fixFocusArea.bind(parent, evt)();
        }

        scope.selectNode = function () {
            parent.selectNode.bind(parent)();
        }

        this.initialiseCanvases();
    }

    onDataReceived(data) {
        if (this.isUpdatingVariable) {
            this.isUpdatingVariable = false;
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
                this.scope.$apply();
                this.overviewModel.metricList = [null, null, null];
                this.loadCount = 0;
                this.fromDate = Math.round(this.timeSrv.timeRange().from._d.getTime() / 1000);
                this.toDate = Math.round(this.timeSrv.timeRange().to._d.getTime() / 1000);

                this.getDataFromAPI("node_load1{job='node'}", 0);

                this.getDataFromAPI(`
                        100 - (node_memory_MemFree_bytes{job='node'} - node_memory_Cached_bytes{job='node'}) 
                                * 100 / 
                                (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'})
                    `, 1);

                this.getDataFromAPI(`
                    100 - (sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)',
                                                                            mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})) 
                                * 100 / 
                            (sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'}))
                `, 2);

                this.processRawData();
            }
        }, 100);
    }

    getDataFromAPI(metric, index) {
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (xmlHttp.readyState == 4) {
                ++this.loadCount;

                if (xmlHttp.status == 200) {
                    var metric = {}
                    metric.data = JSON.parse(xmlHttp.responseText).data.result;
                    this.overviewModel.metricList[index] = metric;
                }
            }
        }

        var url = this.config.apiAddress + encodeURIComponent(metric) + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=15";
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }

    processRawData() {
        this.$timeout(() => {
            if (this.loadCount < this.overviewModel.metricList.length) {
                this.processRawData.bind(this)();
            } else {
                this.scope.ctrl.isLoading = false;

                if (!this.overviewModel.metricList.includes(null)) {
                    this.convertDataToFloat();
                    this.initialiseMetricMinMax();
                    this.initialiseColorMap();
                    this.initiliseOverviewData();
                    this.renderOverview();
                }
            }
        }, 100);
    }

    convertDataToFloat() {
        this.overviewModel.metricList.forEach((metric) => {
            metric.data.forEach((instance) => {
                instance.values.forEach((value) => {
                    value[0] = parseFloat(value[0]);
                    value[1] = parseFloat(value[1]);
                });
            });
        });
    }

    initialiseMetricMinMax() {
        this.overviewModel.metricList.forEach((metric) => {
            metric.min = -1;
            metric.max = -1;

            metric.data.forEach((instance) => {
                instance.values.forEach((point) => {
                    this.checkAndSetOverviewMinMax(metric, point);
                });
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

    initialiseColorMap() {
        this.overviewModel.metricList.forEach((metric, index) => {
            var colors = this.config.colors[index];
            metric.layerRange = metric.max / (colors.length - 0.5);
            metric.colorMap = this.getColorMap(metric, colors);
        });
    }

    getColorMap(metric, colors) {
        var colorMap = new Map();

        for (var i = 0; i < colors.length; ++i) {
            var threshold = {};
            threshold.min = i * metric.layerRange;
            threshold.max = threshold.min + metric.layerRange;
            colorMap.set(threshold, colors[i]);
        }

        return colorMap;
    }

    initiliseOverviewData() {
        this.overviewModel.data = [];

        this.overviewModel.metricList.forEach((metric, index) => {
            metric.data.forEach((metricInstance) => {
                var newInstance = _.find(this.overviewModel.data, (search) => {
                    return metricInstance.metric.instance == search.instance;
                });

                if (!newInstance) {
                    newInstance = this.initaliseNewInstance(metricInstance);
                }

                metricInstance.values.forEach((value) => {
                    var point = {};
                    point.date = value[0];
                    point.value = value[1];
                    newInstance.metricList[index].push(point);
                });
            });
        });
    }

    initaliseNewInstance(metricInstance) {
        var newInstance = {};
        newInstance.instance = metricInstance.metric.instance;
        newInstance.metricList = [
            [],
            [],
            []
        ];
        this.overviewModel.data.push(newInstance);
        return newInstance;
    }

    renderOverview() {
        if (this.overviewModel.data.length > 0) {
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
        var length = this.getInstanceHorizontalLength();

        if (this.scope.ctrl.overviewMode == "1") {
            this.overviewModel.overviewInstantHeight = this.config.overviewPointHeight * this.overviewModel.metricList.length +
                this.config.verticalMarginBetweenOverviewMetrics * (this.overviewModel.metricList.length - 1) + this.config.marginBetweenInstances;
            this.scope.ctrl.overviewWidth = length * this.config.overviewPointWidth;
            this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.overviewModel.overviewInstantHeight;
            this.scope.$apply();
            this.drawSingleOverview();
        } else {
            this.scope.ctrl.overviewWidth = length * this.config.overviewPointWidth;
            this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.config.overviewPointHeight;
            this.scope.$apply();
            this.drawMultipleOverview();
        };

        this.scope.ctrl.focusGraphMarginTop = this.scope.ctrl.overviewHeight + this.config.marginBetweenOverviewAndFocus;
    }

    getInstanceHorizontalLength() {
        var firstInstance = this.overviewModel.data[0];
        var length = 0;

        firstInstance.metricList.forEach((metric, index) => {
            if (this.scope.ctrl.overviewMode == "1") {
                if (metric.length > length) {
                    length = metric.length;
                }
            } else {
                length += metric.length;

                if (index > 0) {
                    length += this.config.horizontalMarginBetweenOverviewMetrics;
                }
            }
        });

        return length;
    }

    drawSingleOverview() {
        this.overviewModel.data.forEach((instance, instanceIndex) => {
            instance.y = instanceIndex * this.overviewModel.overviewInstantHeight;

            instance.metricList.forEach((metric, metricIndex) => {
                metric.forEach((point, pointIndex) => {
                    point.x = pointIndex * this.config.overviewPointWidth;
                    point.color = this.getColorFromMap(point.value, this.overviewModel.metricList[metricIndex].colorMap);
                    this.overviewContext.fillStyle = point.color;
                    var y = instance.y + metricIndex * this.config.overviewPointHeight * this.config.verticalMarginBetweenOverviewMetrics;
                    this.overviewContext.fillRect(point.x, y, this.config.overviewPointHeight, this.config.overviewPointHeight);
                });
            });
        });
    }

    drawMultipleOverview() {
        this.overviewModel.overviewInstantHeight = this.config.overviewPointHeight;

        this.overviewModel.data.forEach((instance, instanceIndex) => {
            var endX = 0;

            instance.metricList.forEach((metric, metricIndex) => {
                instance.y = instanceIndex * this.config.overviewPointHeight;
                var overviewMetric = this.overviewModel.metricList[metricIndex];
                overviewMetric.startX = endX;

                if (metricIndex > 0) {
                    overviewMetric.startX += this.config.horizontalMarginBetweenOverviewMetrics
                }

                metric.forEach((point, pointIndex) => {
                    point.x = overviewMetric.startX + pointIndex * this.config.overviewPointWidth;
                    point.color = this.getColorFromMap(point.value, this.overviewModel.metricList[metricIndex].colorMap);
                    this.overviewContext.fillStyle = point.color;
                    this.overviewContext.fillRect(point.x, instance.y, this.config.overviewPointHeight, this.config.overviewPointHeight);
                    endX = point.x;
                });

                overviewMetric.endX = endX;
            });
        });
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

    initialiseCanvases() {
        this.overviewCanvas = this.elem.find("#overviewCanvas")[0];
        this.overviewContext = this.overviewCanvas.getContext("2d");

        this.focusAreaCanvas = this.elem.find("#focusAreaCanvas")[0];
        this.focusAreaContext = this.focusAreaCanvas.getContext("2d");

        this.focusGraphCanvas = this.elem.find("#focusGraphCanvas")[0];
        this.focusGraphContext = this.focusGraphCanvas.getContext("2d");
        this.focusGraphContext.font = this.config.fontSize + "px arial";
    }

    selectOverviewMode() {
        this.drawOverviewData();
    }

    selectLinker() {
        this.drawFocusArea();
    }

    moveFocusArea(evt) {
        if (!this.focusAreaIsFixed) {
            this.drawFocus(evt);
            evt.preventDefault();
        }
    }

    fixFocusArea(evt) {
        if (this.focusAreaIsFixed) {
            this.drawFocus(evt);
        }

        this.focusAreaIsFixed = !this.focusAreaIsFixed;
        evt.preventDefault();
    }

    drawFocus(evt) {
        this.focusModel.mousePosition = this.getMousePos(evt, this.overviewCanvas);
        this.drawFocusArea();
        this.drawFocusGraph();
    }

    clearFocus() {
        this.hasFocus = false;
        this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
        this.focusGraphContext.clearRect(0, 0, this.focusGraphCanvas.width, this.focusGraphCanvas.height);
    }

    getMousePos(evt, canvas) {
        var rect = canvas.getBoundingClientRect();

        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    drawFocusArea() {
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

    getFocusAreaSize() {
        return this.config.focusAreaSize * 2;
    }

    drawSingleFocusArea() {
        this.clearFocus();
        var size = this.getFocusAreaSize();
        this.focusModel.focusStartY = Math.min(Math.max(0, this.focusModel.mousePosition.y - size / 2), this.overviewCanvas.height - this.getFocusAreaSize());
        this.focusModel.focusStartX = Math.min(Math.max(0, this.focusModel.mousePosition.x - this.config.focusAreaSize), this.overviewCanvas.width - size);
        this.focusAreaContext.strokeStyle = this.config.focusAreaColor;
        this.focusAreaContext.strokeRect(this.focusModel.focusStartX, this.focusModel.focusStartY, size, size);
    }

    drawMultipleFocusArea(doDrawLinkers) {
        var size = this.getFocusAreaSize();
        var offset = this.getFocusAreaOffset();

        if (offset >= 0) {
            if (doDrawLinkers) {
                this.clearFocus();
            }

            this.focusAreaContext.strokeStyle = this.config.focusAreaColor;

            this.overviewModel.metricList.forEach((metric) => {
                metric.focusStartX = metric.startX + offset;
                this.focusAreaContext.strokeRect(metric.focusStartX, this.focusModel.focusStartY, size, size);
            });

            if (doDrawLinkers) {
                this.drawLinkers();
            }
        }
    }

    getFocusAreaOffset() {
        for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
            var metric = this.overviewModel.metricList[i];

            if (this.checkMouseIsInMetric(metric)) {
                this.focusModel.mousePositionXOffset = this.focusModel.mousePosition.x - metric.startX;
                this.focusModel.sourceMetricIndex = i;
                return Math.min(Math.max(metric.startX,
                    this.focusModel.mousePosition.x - this.config.focusAreaSize),
                    metric.endX - this.getFocusAreaSize()) - metric.startX;
            }
        }
    }

    checkMouseIsInMetric(metric) {
        return metric.startX <= this.focusModel.mousePosition.x && this.focusModel.mousePosition.x <= metric.endX;
    }

    drawLinkers() {
        var pixelData = this.overviewContext.getImageData(this.focusModel.mousePosition.x, this.focusModel.mousePosition.y, 1, 1).data;
        this.focusAreaContext.strokeStyle = "rgb(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + ")";
        var instance = this.getLinkerTargetInstance();

        if (instance) {
            this.overviewModel.metricList.forEach((metric, index) => {
                if (!this.checkMouseIsInMetric(metric)) {
                    this.drawLinkersByMode(metric, instance, index);
                }
            });
        }
    }

    getLinkerTargetInstance() {
        for (var i = 0; i < this.overviewModel.data.length; ++i) {
            var instance = this.overviewModel.data[i];

            if (instance.y <= this.focusModel.mousePosition.y && this.focusModel.mousePosition.y <= instance.y + this.config.overviewPointHeight) {
                return instance;
            }
        }
    }

    drawLinkersByMode(metric, instance, index) {
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

    drawXCross(metric, instance) {
        var centerX = metric.startX + this.focusModel.mousePositionXOffset;
        var leftBeginX = centerX - this.config.xCrossSize;
        var rightBeginX = centerX + this.config.overviewPointWidth;
        var bottomInstance = instance.y + this.config.overviewPointHeight;

        this.drawXCrossLine(leftBeginX, instance.y - this.config.xCrossSize, instance.y);
        this.drawXCrossLine(rightBeginX, instance.y, instance.y - this.config.xCrossSize);
        this.drawXCrossLine(leftBeginX, bottomInstance + this.config.xCrossSize, bottomInstance);
        this.drawXCrossLine(rightBeginX, bottomInstance, bottomInstance + this.config.xCrossSize);
    }

    drawXCrossLine(startX, startY, endY) {
        this.drawLineOnFocusAreaCanvas(startX, startY, startX + this.config.xCrossSize, endY);
    }

    drawLineOnFocusAreaCanvas(startX, startY, endX, endY) {
        this.focusAreaContext.beginPath();
        this.focusAreaContext.moveTo(startX, startY);
        this.focusAreaContext.lineTo(endX, endY);
        this.focusAreaContext.stroke();
        this.focusAreaContext.closePath();
    }

    drawNormalCross(metric, instance) {
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

    drawNormalCrossLines(metric, endX, leftLineX, rightLineX, topLineY, bottomLineY, endY) {
        // top horizontal
        this.drawLineOnFocusAreaCanvas(metric.focusStartX, topLineY, leftLineX, topLineY);
        this.drawLineOnFocusAreaCanvas(rightLineX, topLineY, endX, topLineY);

        // botton horizontal
        this.drawLineOnFocusAreaCanvas(metric.focusStartX, bottomLineY, leftLineX, bottomLineY);
        this.drawLineOnFocusAreaCanvas(rightLineX, bottomLineY, endX, bottomLineY);

        // left vertical
        this.drawLineOnFocusAreaCanvas(leftLineX, this.focusModel.focusStartY, leftLineX, topLineY);
        this.drawLineOnFocusAreaCanvas(leftLineX, bottomLineY, leftLineX, endY);

        // right vertical
        this.drawLineOnFocusAreaCanvas(rightLineX, this.focusModel.focusStartY, rightLineX, topLineY);
        this.drawLineOnFocusAreaCanvas(rightLineX, bottomLineY, rightLineX, endY);
    }

    changeInstanceColor(metric, instance, index) {
        if (index == 0) {
            this.clearFocus();
        }

        instance.metricList[index].forEach((instancePoint, pointIndex) => {
            var colorMap = this.getColorMap(metric, this.config.colors[this.focusModel.sourceMetricIndex]);
            this.focusAreaContext.fillStyle = this.getColorFromMap(instancePoint.value, colorMap);
            this.focusAreaContext.fillRect(instancePoint.x, instance.y, this.config.overviewPointHeight, this.config.overviewPointHeight);

            if (instancePoint.x == metric.startX + this.focusModel.mousePositionXOffset) {
                metric.data.forEach((metricInstance, metricInstanceIndex) => {
                    var metricPoint = metricInstance.values[pointIndex];
                    var value = metricPoint ? metricPoint[1] : 0
                    this.focusAreaContext.fillStyle = this.getColorFromMap(value, colorMap);
                    this.focusAreaContext.fillRect(instancePoint.x, this.overviewModel.data[metricInstanceIndex].y,
                        this.config.overviewPointHeight, this.config.overviewPointHeight);
                });
            }
        });

        if (index == instance.metricList.length - 1) {
            this.drawMultipleFocusArea(false);
        }
    }

    drawFocusGraph() {
        this.initialiseFocusGraphData();
        this.drawFocusGraphLabels();
        this.drawFocusGraphData();
    }

    initialiseFocusGraphData() {
        this.focusModel.data = [];

        this.overviewModel.data.forEach((overviewInstance) => {
            if (overviewInstance.y <= this.focusModel.focusStartY + this.getFocusAreaSize() &&
                overviewInstance.y + this.overviewModel.overviewInstantHeight >= this.focusModel.focusStartY) {
                var modalInstance = {};
                modalInstance.instance = overviewInstance.instance;
                modalInstance.metricList = [];
                this.addFocusMetrics(modalInstance, overviewInstance, this.getIndexesOfPointsInFocus(overviewInstance));
                this.initialiseInstanceLayers(modalInstance);
                this.focusModel.data.push(modalInstance);
            }
        });
    }

    getIndexesOfPointsInFocus(instance) {
        var indexes = [];

        for (var i = 0; i < instance.metricList.length; ++i) {
            var metric = instance.metricList[i];

            if (metric.length > 0) {
                var overviewMetric = this.overviewModel.metricList[i];

                metric.forEach((point, index) => {
                    if (overviewMetric.focusStartX <= point.x && point.x <= overviewMetric.focusStartX + this.getFocusAreaSize()) {
                        indexes.push(index);
                    }
                });

                break;
            }
        }

        return indexes;
    }

    addFocusMetrics(modalInstance, overviewInstance, indexes) {
        this.overviewModel.metricList.forEach((metric, metricIndex) => {
            var focusMetric = {};
            focusMetric.data = [];
            focusMetric.layerList = [];

            indexes.forEach((index) => {
                var point = overviewInstance.metricList[metricIndex][index];

                if (point) {
                    focusMetric.data.push(point);
                }
            });

            modalInstance.metricList.push(focusMetric);
        });
    }

    initialiseInstanceLayers(instance) {
        instance.metricList.forEach((metric, index) => {
            this.config.colors.forEach(() => {
                var layer = {};
                layer.valueList = [];
                metric.layerList.push(layer);
            });

            metric.data.forEach((point) => {
                var value = point.value;

                metric.layerList.forEach((layer) => {
                    layer.valueList.push(value > 0 ? value : 0);
                    value -= this.overviewModel.metricList[index].layerRange;
                });
            });
        });
    }

    drawFocusGraphLabels() {
        this.focusModel.horizontalX = 0;
        this.focusGraphContext.setLineDash([10, 10]);
        this.focusGraphContext.fillStyle = "black";
        this.focusModel.instanceHeight = this.config.focusMetricMaxHeight * this.overviewModel.metricList.length +
            this.config.marginBetweenFocusMetrics * (this.overviewModel.metricList.length - 1) + this.config.marginBetweenFocusInstances;

        this.focusModel.data.forEach((instance, index) => {
            this.drawFocusGraphLabelByInstance(instance, index);
        });

        this.focusModel.horizontalX += this.config.focusGraphLeftMargin;
    }

    drawFocusGraphLabelByInstance(instance, index) {
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

    drawSeperator(instance) {
        var lineY = instance.y - this.config.marginBetweenFocusInstances / 2;
        this.focusGraphContext.beginPath();
        this.focusGraphContext.moveTo(0, lineY);
        this.focusGraphContext.lineTo(10000, lineY);
        this.focusGraphContext.stroke();
    }

    drawFocusGraphData() {
        this.focusModel.data.forEach((instance) => {
            instance.metricList.forEach((metric, metricIndex) => {
                metric.layerList.forEach((layer, layerIndex) => {
                    var y = instance.y + (this.config.focusMetricMaxHeight + this.config.marginBetweenFocusMetrics) * metricIndex + this.config.focusMetricMaxHeight;
                    this.focusGraphContext.beginPath();
                    this.focusGraphContext.moveTo(this.focusModel.horizontalX, y);
                    var x = this.focusModel.horizontalX;
                    var previousX = x;
                    var previousValue = 0;

                    layer.valueList.forEach((value, valueIndex) => {
                        x += valueIndex * this.config.focusPointWidth;
                        this.moveContextBasedOnValue(value, previousX, previousValue, layerIndex, x, y, this.overviewModel.metricList[metricIndex].layerRange);
                        previousX = x;
                        previousValue = value;
                    });

                    this.focusGraphContext.lineTo(x, y);
                    this.focusGraphContext.lineTo(this.focusModel.horizontalX, y);
                    this.focusGraphContext.closePath();
                    this.focusGraphContext.fillStyle = "#" + this.config.colors[metricIndex][layerIndex];
                    this.focusGraphContext.fill();
                });
            });
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
                this.focusGraphContext.lineTo(x, y - this.config.focusMetricMaxHeight);
            } else {
                this.focusGraphContext.lineTo(x, y - value * this.config.focusMetricMaxHeight / layerRange);
            }
        }
    }

    selectNode() {
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

    updateVariable(instance) {
        this.variableSrv.variables.forEach((v) => {
            if (v.name == "node") {
                this.variableSrv.setOptionAsCurrent(v, {
                    text: instance.instance,
                    value: instance.instance
                });

                this.isUpdatingVariable = true;
                this.variableSrv.variableUpdated(v, true);
            }
        });
    }
}

HeatmapCtrl.templateUrl = "module.html";