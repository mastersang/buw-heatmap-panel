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
        this.scope.focusModel = this.focusModel;
        this.initialiseConfig();
    }

    initialiseConfig() {
        this.config = {
            // color schemes for metrics
            colors: [
                ["f2d9e6", "d98cb3", "bf4080", "73264d"], // red
                ["ccddff", "6699ff", "0055ff", "003399"], // blue
                ["eeeedd", "cccc99", "aaaa55", "666633"], // green
            ],

            // determines which the order of attributes to use for sorting
            sortOrder: [0, 1, 2],

            apiAddress: "http://localhost:3000/api/datasources/proxy/1/api/v1/query_range?query=",
            marginBetweenOverviewAndFocus: 50,
        }

        this.initialiseOverviewConfig();
        this.initialiseFocusAreaConfig();
        this.initialiseFocusGraphConfig();
    }

    initialiseOverviewConfig() {
        this.config.overview = {
            pointWidth: 1,
            groupedPointHeight: 5,
            ungroupedPointHeight: 1,
            verticalMarginalBetweenMetrics: 2,
            horizontalMarginBetweenMetrics: 30,
            marginBetweenInstances: 6,
            startingGreyColor: 240,
            endingGrayColor: 80,
            groupBarWidth: 9,
        }
    }

    initialiseFocusAreaConfig() {
        this.config.focusArea = {
            color: "Aqua",
            size: 20,
            xCrossSize: 15
        }
    }

    initialiseFocusGraphConfig() {
        this.config.focusGraph = {
            pointWidth: 20,
            metricMaxHeight: 30,
            marginBetweenMetrics: 10,
            maxWidth: 10000,
            maxHeight: 10000
        }
    }

    link(scope, elem) {
        this.scope = scope;
        this.elem = elem;

        this.initialiseControl();
        this.initialiseUIFunctions();
        this.initialiseUIElements();
    }

    initialiseControl() {
        this.scope.ctrl.enums = {
            overviewMode: {
                SEPARATED: "1",
                INTEGRATED: "2"
            },

            linkingMode: {
                X_CROSS: "1",
                NORMAL_CROSS: "2",
                CHANGE_COLOR: "3",
            }
        };

        this.scope.ctrl.overviewMode = this.scope.ctrl.enums.overviewMode.SEPARATED;
        this.scope.ctrl.linkingMode = this.scope.ctrl.enums.linkingMode.X_CROSS;
        this.scope.ctrl.isGrouped = true;
    }

    initialiseUIFunctions() {
        var parent = this;

        this.scope.selectOverviewMode = function () {
            parent.selectOverviewMode();
        }

        this.scope.selectLinker = function () {
            parent.selectLinker();
        }

        this.scope.groupUngroup = function () {
            parent.groupUngroup();
        }

        this.scope.moveFocusArea = function (evt) {
            parent.moveFocusArea.bind(parent, evt)();
        }

        this.scope.fixFocusArea = function (evt) {
            parent.fixFocusArea.bind(parent, evt)();
        }

        this.scope.selectNode = function (instance) {
            parent.selectNode.bind(parent, instance)();
        }
    }

    initialiseUIElements() {
        // overview
        this.overviewCanvas = this.getElementByID("overviewCanvas");
        this.overviewContext = this.overviewCanvas.getContext("2d");

        // focus area
        this.focusAreaCanvas = this.getElementByID("focusAreaCanvas");
        this.focusAreaContext = this.focusAreaCanvas.getContext("2d");

        // focus graph
        this.scope.ctrl.focusGraphWidth = this.config.focusGraph.maxWidth;
        this.scope.ctrl.focusGraphHeight = this.config.focusGraph.maxHeight;
        this.focusGraphContainer = this.getElementByID("focusGraphContainer");
        this.focusGraphTable = this.getElementByID("focusGraphTable");
    }

    getElementByID(id) {
        return this.elem.find("#" + id)[0];
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
                this.fromDate = this.getDateInSeconds(this.timeSrv.timeRange().from._d);
                this.toDate = this.getDateInSeconds(this.timeSrv.timeRange().to._d);

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
        });
    }

    getDateInSeconds(date) {
        return Math.round(date.getTime() / 1000);
    }

    getDataFromAPI(metric, index) {
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            // received response
            if (xmlHttp.readyState == 4) {
                ++this.loadCount;

                if (xmlHttp.status == 200) {
                    var metric = {}
                    metric.data = JSON.parse(xmlHttp.responseText).data.result;
                    this.overviewModel.metricList[index] = metric;
                }
            }
        }

        var url = this.config.apiAddress + encodeURIComponent(metric) + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=60";
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
                    this.initialiseMetricMinMaxTotal();
                    this.initialiseColorMap();
                    this.initiliseOverviewData();
                    this.initialiseOverviewGroups();
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

    initialiseMetricMinMaxTotal() {
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
            metric.layerRange = metric.max / colors.length;

            // map a range of values to a color
            metric.colorMap = this.getColorMap(metric, colors);
        });
    }

    getColorMap(metric, colors) {
        var colorMap = new Map();

        for (var i = 0; i < colors.length; ++i) {
            var threshold = {};
            threshold.min = i * metric.layerRange;
            threshold.max = threshold.min + metric.layerRange;
            threshold.average = (threshold.max + threshold.min) / 2
            colorMap.set(threshold, colors[i]);
        }

        return colorMap;
    }

    initiliseOverviewData() {
        this.overviewModel.data = [];
        this.populateOverviewData();
        this.calculateInstanceMetricTotalMinMax();
        this.sortOverviewData();
    }

    populateOverviewData() {
        this.overviewModel.metricList.forEach((metric, metricIndex) => {
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
                    newInstance.metricList[metricIndex].data.push(point);
                });
            });
        });
    }

    initaliseNewInstance(metricInstance) {
        var newInstance = {};
        newInstance.instance = metricInstance.metric.instance;

        newInstance.metricList = [];

        for (var i = 0; i < this.config.colors.length; ++i) {
            var metric = {};
            metric.data = [];
            newInstance.metricList.push(metric);
        }

        this.overviewModel.data.push(newInstance);
        return newInstance;
    }

    calculateInstanceMetricTotalMinMax() {
        this.overviewModel.data.forEach((instance) => {
            instance.metricList.forEach((metric, metricIndex) => {
                metric.total = 0;
                metric.min = -1;
                metric.max = -1;

                metric.data.forEach((point) => {
                    // sum the "threshold" average of each data point instead of the actual value of the data point 
                    metric.total += this.getThresholdAverage(point.value, this.overviewModel.metricList[metricIndex].colorMap);

                    if (metric.min == -1 || point.value < metric.min) {
                        metric.min = point.value;
                    }

                    if (metric.max == -1 || point.value > metric.max) {
                        metric.max = point.value;
                    }
                })
            });
        });
    }

    getThresholdAverage(value, map) {
        var result;

        map.forEach((color, threshold) => {
            if (threshold.min <= value && value <= threshold.max) {
                result = threshold.average;
            }
        });

        return result;
    }

    sortOverviewData() {
        this.overviewModel.data.sort((first, second) => {
            for (var i = 0; i < this.config.sortOrder.length; ++i) {
                var metricIndex = this.config.sortOrder[i];

                if (first.metricList[metricIndex].total != second.metricList[metricIndex].total) {
                    return first.metricList[metricIndex].total - second.metricList[metricIndex].total;
                }
            }

            return 0;
        });
    }

    initialiseOverviewGroups() {
        this.overviewModel.groupList = [];

        this.overviewModel.data.forEach((instance) => {
            var group = _.find(this.overviewModel.groupList, (search) => {
                return this.checkInstanceInGroup(instance, search);
            });

            if (!group) {
                group = this.initialiseNewGroup(instance);
                this.overviewModel.groupList.push(group);
            }

            group.instanceList.push(instance);
        });
    }

    checkInstanceInGroup(instance, group) {
        for (var i = 0; i < instance.metricList.length; ++i) {
            if (instance.metricList[i].total != group.metricList[i].total) {
                return false;
            }
        }

        return true;
    }

    initialiseNewGroup(instance) {
        var group = {};
        group.metricList = [];
        group.instanceList = [];

        instance.metricList.forEach((instanceMetric) => {
            var groupMetric = {};
            groupMetric.total = instanceMetric.total;
            group.metricList.push(groupMetric);
        });

        return group;
    }

    renderOverview() {
        if (this.overviewModel.data.length > 0) {
            this.clearFocus();
            this.drawOverviewData();
        }
    }

    clearFocus() {
        this.hasFocus = false;
        this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
    }

    drawOverviewData() {
        this.$timeout(() => {
            this.overviewContext.clearRect(0, 0, this.overviewCanvas.width, this.overviewCanvas.height);
            var length = this.getInstanceHorizontalLength();

            if (this.scope.ctrl.overviewMode == this.scope.ctrl.enums.overviewMode.SEPARATED) {
                this.scope.ctrl.overviewWidth = length * this.config.overview.pointWidth;

                if (this.scope.ctrl.isGrouped) {
                    this.scope.ctrl.overviewHeight = this.overviewModel.groupList.length * this.config.overview.groupedPointHeight;
                } else {
                    this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.config.overview.ungroupedPointHeight;
                }

                this.scope.$apply();
                this.drawSeparated();
            } else {
                this.overviewModel.overviewInstanceHeight =
                    this.config.overview.ungroupedPointHeight * this.overviewModel.metricList.length +
                    this.config.overview.verticalMarginalBetweenMetrics * (this.overviewModel.metricList.length - 1) +
                    this.config.overview.marginBetweenInstances;
                this.scope.ctrl.overviewWidth = length * this.config.overview.pointWidth;
                this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.overviewModel.overviewInstanceHeight;
                this.scope.$apply();
                this.drawIntengrated();
            };

            this.scope.ctrl.focusGraphMarginTop = this.scope.ctrl.overviewHeight + this.config.marginBetweenOverviewAndFocus;
        });
    }

    getInstanceHorizontalLength() {
        var length = this.getMaxMetricLength();

        if (this.scope.ctrl.overviewMode == this.scope.ctrl.enums.overviewMode.SEPARATED) {
            return length * this.overviewModel.metricList.length +
                (this.overviewModel.metricList.length - 1) * this.config.overview.horizontalMarginBetweenMetrics;
        } else {
            return length;
        }
    }

    getMaxMetricLength() {
        var length = 0;

        this.overviewModel.metricList.forEach((metric) => {
            metric.data.forEach((point) => {
                if (point.values.length > length) {
                    length = point.values.length;
                }
            });
        });

        return length;
    }

    drawIntengrated() {
        this.overviewModel.data.forEach((instance, instanceIndex) => {
            instance.y = instanceIndex * this.overviewModel.overviewInstanceHeight;

            instance.metricList.forEach((metric, metricIndex) => {
                metric.data.forEach((point, pointIndex) => {
                    point.x = pointIndex * this.config.overview.pointWidth;
                    point.color = this.getColorFromMap(point.value, this.overviewModel.metricList[metricIndex].colorMap);
                    this.overviewContext.fillStyle = point.color;
                    var y = instance.y + metricIndex * this.config.overview.ungroupedPointHeight * this.config.overview.verticalMarginalBetweenMetrics;
                    this.overviewContext.fillRect(point.x, y, this.config.overview.ungroupedPointHeight, this.config.overview.ungroupedPointHeight);
                });
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

    drawSeparated() {
        this.overviewModel.metricWidth = this.getMaxMetricLength() * this.config.overview.pointWidth;

        if (this.scope.ctrl.isGrouped) {
            this.drawGrouped();
        } else {
            this.drawUngrouped();
        }
    }

    drawGrouped() {
        this.overviewModel.overviewInstanceHeight = this.config.overview.groupedPointHeight;

        this.overviewModel.groupList.forEach((group, groupIndex) => {
            var instance = group.instanceList[0];
            this.drawOverviewInstance(instance, groupIndex, this.config.overview.groupedPointHeight);
        });
    }

    drawOverviewInstance(instance, index, pointHeigh) {
        instance.metricList.forEach((metric, metricIndex) => {
            instance.y = index * pointHeigh;
            var overviewMetric = this.overviewModel.metricList[metricIndex];
            overviewMetric.startX = this.overviewModel.metricWidth * metricIndex;

            if (metricIndex > 0) {
                overviewMetric.startX += this.config.overview.horizontalMarginBetweenMetrics * metricIndex;
            }

            metric.data.forEach((point, pointIndex) => {
                point.x = overviewMetric.startX + pointIndex * this.config.overview.pointWidth;
                point.color = this.getColorFromMap(point.value, this.overviewModel.metricList[metricIndex].colorMap);
                this.overviewContext.fillStyle = point.color;
                this.overviewContext.fillRect(point.x, instance.y, this.config.overview.pointWidth, pointHeigh);
            });

            overviewMetric.endX = overviewMetric.startX + this.overviewModel.metricWidth;
        });
    }

    drawUngrouped() {
        this.overviewModel.overviewInstanceHeight = this.config.overview.ungroupedPointHeight;

        this.overviewModel.data.forEach((instance, instanceIndex) => {
            this.drawOverviewInstance(instance, instanceIndex, this.config.overview.ungroupedPointHeight);
        });

        this.drawGroupBars();
    }

    drawGroupBars() {
        var colorStep = (this.config.overview.startingGreyColor - this.config.overview.endingGrayColor) / this.overviewModel.groupList.length;

        for (var i = 1; i < this.overviewModel.metricList.length; ++i) {
            var x = this.overviewModel.metricList[i].startX - this.config.overview.horizontalMarginBetweenMetrics / 2;
            this.drawGroupBarAtPosition(x, colorStep);
        }
    }

    drawGroupBarAtPosition(x, colorStep) {
        var y = 0;

        this.overviewModel.groupList.forEach((group, groupIndex) => {
            var greyValue = Math.round(this.config.overview.startingGreyColor - colorStep * groupIndex);
            var fillStyle = "rgba(" + greyValue + ", " + greyValue + ", " + greyValue + ", 1)";
            this.overviewContext.fillStyle = fillStyle;
            var height = group.instanceList.length * this.config.overview.ungroupedPointHeight;
            this.overviewContext.fillRect(x - Math.floor(this.config.overview.groupBarWidth / 2), y,
                this.config.overview.groupBarWidth, height);
            y += height;
        });
    }

    selectOverviewMode() {
        this.drawOverviewData();
    }

    selectLinker() {
        this.drawFocusArea();
    }

    groupUngroup() {
        this.scope.ctrl.isGrouped = !this.scope.ctrl.isGrouped;
        this.drawOverviewData();
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

        for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
            var metric = this.overviewModel.metricList[i];

            // only update focus graph if mouse is pointing on one of metric overview graphs
            if (metric.startX <= this.focusModel.mousePosition.x && this.focusModel.mousePosition.x <= metric.endX) {
                this.drawFocusGraph();
                this.autoSrollFocusGraph();
                break;
            }
        }
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

            if (this.scope.ctrl.overviewMode == this.scope.ctrl.enums.overviewMode.SEPARATED) {
                this.drawMultipleFocusArea(true);
            } else {
                this.drawSingleFocusArea();
            }
        }
    }

    getFocusAreaSize() {
        return this.config.focusArea.size * 2;
    }

    drawSingleFocusArea() {
        this.clearFocus();
        var size = this.getFocusAreaSize();
        this.focusModel.focusStartY = Math.min(Math.max(0, this.focusModel.mousePosition.y - size / 2), this.overviewCanvas.height - this.getFocusAreaSize());
        this.focusModel.focusStartX = Math.min(Math.max(0, this.focusModel.mousePosition.x - this.config.focusArea.size), this.overviewCanvas.width - size);
        this.focusAreaContext.strokeStyle = this.config.focusArea.color;
        this.focusAreaContext.strokeRect(this.focusModel.focusStartX, this.focusModel.focusStartY, size, size);
    }

    drawMultipleFocusArea(doDrawLinkers) {
        var size = this.getFocusAreaSize();
        var offset = this.getFocusAreaOffset();

        if (offset >= 0) {
            if (doDrawLinkers) {
                this.clearFocus();
            }

            this.focusAreaContext.strokeStyle = this.config.focusArea.color;

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
                    this.focusModel.mousePosition.x - this.config.focusArea.size),
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
        instance = null; // temp flag to prevent drawing linkers

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

            if (instance.y - this.config.overview.ungroupedPointHeight <= this.focusModel.mousePosition.y &&
                this.focusModel.mousePosition.y <= instance.y) {
                return instance;
            }
        }
    }

    drawLinkersByMode(metric, instance, index) {
        switch (this.scope.ctrl.linkingMode) {
            case this.scope.ctrl.enums.linkingMode.X_CROSS:
                this.drawXCross(metric, instance);
                break;

            case this.scope.ctrl.enums.linkingMode.NORMAL_CROSS:
                this.drawNormalCross(metric, instance);
                break;

            case this.scope.ctrl.enums.linkingMode.CHANGE_COLOR:
                this.changeInstanceColor(metric, instance, index);
                break;

            default:
                break;
        }
    }

    drawXCross(metric, instance) {
        var centerX = metric.startX + this.focusModel.mousePositionXOffset;
        var leftBeginX = centerX - this.config.focusArea.xCrossSize;
        var rightBeginX = centerX + this.config.overview.pointWidth;
        var bottomInstance = instance.y + this.config.overview.ungroupedPointHeight;

        this.drawXCrossLine(leftBeginX, instance.y - this.config.focusArea.xCrossSize, instance.y);
        this.drawXCrossLine(rightBeginX, instance.y, instance.y - this.config.focusArea.xCrossSize);
        this.drawXCrossLine(leftBeginX, bottomInstance + this.config.focusArea.xCrossSize, bottomInstance);
        this.drawXCrossLine(rightBeginX, bottomInstance, bottomInstance + this.config.focusArea.xCrossSize);
    }

    drawXCrossLine(startX, startY, endY) {
        this.drawLineOnFocusAreaCanvas(startX, startY, startX + this.config.focusArea.xCrossSize, endY);
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
        var distanceBetweenLines = this.config.overview.pointWidth * 2;
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

        instance.metricList[index].data.forEach((instancePoint, pointIndex) => {
            var colorMap = this.getColorMap(metric, this.config.colors[this.focusModel.sourceMetricIndex]);
            this.focusAreaContext.fillStyle = this.getColorFromMap(instancePoint.value, colorMap);
            this.focusAreaContext.fillRect(instancePoint.x, instance.y, this.overviewModel.overviewInstanceHeight, this.overviewModel.overviewInstanceHeight);

            if (instancePoint.x == metric.startX + this.focusModel.mousePositionXOffset) {
                // vertical line
                metric.data.forEach((metricInstance, metricInstanceIndex) => {
                    var metricPoint = metricInstance.values[pointIndex];
                    var value = metricPoint ? metricPoint[1] : 0
                    this.focusAreaContext.fillStyle = this.getColorFromMap(value, colorMap);
                    this.focusAreaContext.fillRect(instancePoint.x, this.overviewModel.data[metricInstanceIndex].y,
                        this.overviewModel.overviewInstanceHeight, this.overviewModel.overviewInstanceHeight);
                });
            }
        });

        if (index == instance.metricList.length - 1) {
            this.drawMultipleFocusArea(false);
        }
    }

    drawFocusGraph() {
        this.initialiseFocusGraphData();

        this.$timeout(() => {
            this.scope.ctrl.focusGraphHeight = this.overviewModel.metricList.length * this.config.focusGraph.metricMaxHeight +
                (this.overviewModel.metricList.length - 1) * this.config.focusGraph.marginBetweenMetrics;
            this.scope.ctrl.focusGraphWidth = this.focusModel.data[0].metricList[0].data.length * this.config.focusGraph.pointWidth;
            this.scope.$apply();
            this.drawFocusGraphData();
        });
    }

    initialiseFocusGraphData() {
        this.focusModel.data = [];

        if (this.scope.ctrl.isGrouped) {
            this.overviewModel.groupList.forEach((group, groupIndex) => {
                var firstInstance = group.instanceList[0];

                if (this.checkInstanceInFocus(firstInstance)) {
                    var focusInstance = this.initialiseFocusInstance(firstInstance, this.getIndexesOfPointsInFocus(firstInstance));
                    focusInstance.groupIndex = groupIndex;
                }
            });
        } else {
            this.overviewModel.data.forEach((instance) => {
                if (this.checkInstanceInFocus(instance)) {
                    this.initialiseFocusInstance(instance, this.getIndexesOfPointsInFocus(instance));
                }
            });
        }
    }

    checkInstanceInFocus(instance) {
        return instance.y <= this.focusModel.focusStartY + this.getFocusAreaSize() &&
            instance.y + this.overviewModel.overviewInstanceHeight >= this.focusModel.focusStartY
    }

    getIndexesOfPointsInFocus(instance) {
        var indexes = [];

        for (var i = 0; i < instance.metricList.length; ++i) {
            var metric = instance.metricList[i];

            if (metric.data.length > 0) {
                var overviewMetric = this.overviewModel.metricList[i];

                metric.data.forEach((point, index) => {
                    if (overviewMetric.focusStartX <= point.x && point.x <= overviewMetric.focusStartX + this.getFocusAreaSize()) {
                        indexes.push(index);
                    }
                });

                break;
            }
        }

        return indexes;
    }

    initialiseFocusInstance(overviewInstance, indexList) {
        var focusInstance = {};
        focusInstance.instance = overviewInstance.instance;
        focusInstance.metricList = [];
        this.addFocusMetrics(focusInstance, overviewInstance, indexList);
        this.initialiseInstanceLayers(focusInstance);
        this.focusModel.data.push(focusInstance);
        return focusInstance;
    }

    addFocusMetrics(focusInstance, overviewInstance, indexList) {
        this.overviewModel.metricList.forEach((metric, metricIndex) => {
            var focusMetric = {};
            focusMetric.data = [];
            focusMetric.layerList = [];

            indexList.forEach((index) => {
                var point = overviewInstance.metricList[metricIndex].data[index];

                if (point) {
                    focusMetric.data.push(point);
                }
            });

            focusInstance.metricList.push(focusMetric);
        });
    }

    initialiseInstanceLayers(instance) {
        instance.metricList.forEach((metric, metricIndex) => {
            this.config.colors[metricIndex].forEach(() => {
                var layer = {};
                layer.valueList = [];
                metric.layerList.push(layer);
            });

            metric.data.forEach((point) => {
                var value = point.value;

                metric.layerList.forEach((layer) => {
                    layer.valueList.push(value > 0 ? value : 0);
                    value -= this.overviewModel.metricList[metricIndex].layerRange;
                });
            });
        });
    }

    drawFocusGraphData() {
        this.focusModel.data.forEach((instance, instanceIndex) => {
            var canvas = this.getElementByID("focusGraphCanvas-" + instanceIndex);
            var context = canvas.getContext("2d");

            instance.metricList.forEach((metric, metricIndex) => {
                metric.layerList.forEach((layer, layerIndex) => {
                    var y = (this.config.focusGraph.metricMaxHeight + this.config.focusGraph.marginBetweenMetrics) * metricIndex +
                        this.config.focusGraph.metricMaxHeight;
                    context.beginPath();
                    context.moveTo(0, y);
                    var x = 0;
                    var previousX = x;
                    var previousValue = 0;

                    layer.valueList.forEach((value) => {
                        x += this.config.focusGraph.pointWidth;
                        this.moveContextBasedOnValue(context, value, previousX, previousValue, layerIndex, x, y,
                            this.overviewModel.metricList[metricIndex].layerRange);
                        previousX = x;
                        previousValue = value;
                    });

                    context.lineTo(x, y);
                    context.lineTo(this.focusModel.graphBeginX, y);
                    context.closePath();
                    context.fillStyle = "#" + this.config.colors[metricIndex][layerIndex];
                    context.fill();
                });
            });
        });
    }

    moveContextBasedOnValue(context, value, previousX, previousValue, layerIndex, x, y, layerRange) {
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

    autoSrollFocusGraph() {
        if (this.scope.ctrl.isGrouped) {
            this.scrollByInstance(this.getFirstInstanceOfSelectedGroup());
        } else {
            this.scrollByInstance(this.getLinkerTargetInstance());
        }
    }

    getFirstInstanceOfSelectedGroup() {
        for (var i = 0; i < this.overviewModel.groupList.length; ++i) {
            var group = this.overviewModel.groupList[i];
            var firstInstance = group.instanceList[0];

            if (firstInstance.y <= this.focusModel.mousePosition.y && this.focusModel.mousePosition.y <=
                firstInstance.y + this.config.overview.groupedPointHeight) {
                return firstInstance;
            }
        }
    }

    scrollByInstance(instance) {
        for (var i = 0; i < this.focusModel.data.length; ++i) {
            var focusModelInstance = this.focusModel.data[i];

            if (instance.instance == focusModelInstance.instance) {
                focusModelInstance.isSelected = true;
                this.focusGraphContainer.scrollTop = this.scope.ctrl.focusGraphHeight * i;
            } else {
                focusModelInstance.isSelected = false;
            }
        }
    }

    selectNode(instance) {
        this.focusModel.data.forEach((focusInstance) => {
            focusInstance.isSelected = false;
        });

        instance.isSelected = true;
        this.updateVariable(instance);
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