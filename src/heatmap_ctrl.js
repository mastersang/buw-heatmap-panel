import { MetricsPanelCtrl } from "app/plugins/sdk";
import "./heatmap.css!";
import moment from "moment";
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
            apiAddress: "http://localhost:3000/api/datasources/proxy/1/api/v1/query_range?query=",
            dateFormat: "DD/MM/YY hh:mm:ss",
            marginBetweenOverviewAndFocus: 50,

            // color schemes for metrics
            metricLabelList: ["CPU", "Memory", "Disk"],

            // color schemes for metrics
            colors: [
                ["f2d9e6", "d98cb3", "bf4080", "73264d"], // red
                ["ccddff", "6699ff", "0055ff", "003399"], // blue
                ["eeeedd", "cccc99", "aaaa55", "666633"], // green
            ],

            // determines which the order of attributes to use for sorting
            sortOrder: [0, 1, 2],
        }

        this.initialiseOverviewConfig();
        this.initialiseFocusAreaConfig();
        this.initialiseFocusGraphConfig();
    }

    initialiseOverviewConfig() {
        this.config.overview = {
            metricFontSize: 15,
            timeFontSize: 10,
            marginBetweenLabelsAndOverview: 10,
            pointWidth: 1,
            groupedPointHeight: 5,
            ungroupedPointHeight: 1,
            verticalMarginBetweenMetrics: 2,
            horizontalMarginBetweenMetrics: 30,
            marginBetweenInstances: 6,
            startingGreyColor: 240,
            endingGrayColor: 80,
            groupBarWidth: 9,
            groupSizeWidth: 2
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
        this.scope.ctrl.enumList = {
            linkingMode: {
                X_CROSS: "1",
                NORMAL_CROSS: "2",
                CHANGE_COLOR: "3",
            },

            groupingMode: {
                SINGLE: "1",
                MULTIPLE: "2",
            }
        };

        this.scope.ctrl.linkingMode = this.scope.ctrl.enumList.linkingMode.X_CROSS;
        this.scope.ctrl.groupingMode = this.scope.ctrl.enumList.groupingMode.SINGLE;
        this.scope.ctrl.attributeForGrouping = "0";
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

        this.scope.selectGroupingMode = function () {
            parent.selectGroupingMode();
        }

        this.scope.selectAttributeForGrouping = function () {
            parent.selectAttributeForGrouping();
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

        this.scope.showNodes = function (group, event) {
            parent.showNodes.bind(parent, group, event)();
        }

        this.scope.selectNode = function (instance) {
            parent.selectNode.bind(parent, instance)();
        }
    }

    initialiseUIElements() {
        // overview
        this.overviewCanvas = this.getElementByID("overviewCanvas");
        this.overviewContext = this.getCanvasContext(this.overviewCanvas);

        // focus area
        this.focusAreaCanvas = this.getElementByID("focusAreaCanvas");
        this.focusAreaContext = this.getCanvasContext(this.focusAreaCanvas);

        // focus graph
        this.scope.ctrl.focusGraphWidth = this.config.focusGraph.maxWidth;
        this.scope.ctrl.focusGraphHeight = this.config.focusGraph.maxHeight;
        this.focusGraphContainer = this.getElementByID("focusGraphContainer");
    }

    getElementByID(id) {
        var find = this.elem.find("#" + id);
        return find[0];
    }

    getCanvasContext(canvas) {
        return canvas.getContext("2d");
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
            var colorList = this.config.colors[index];
            metric.layerRange = metric.max / colorList.length;

            // map a range of values to a color
            metric.colorMap = this.getColorMap(metric, colorList);
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
        if (this.scope.ctrl.groupingMode == this.scope.ctrl.enumList.groupingMode.SINGLE) {
            var index = parseInt(this.scope.ctrl.attributeForGrouping);
            return instance.metricList[index].total == group.metricList[index].total;
        } else {
            for (var i = 0; i < instance.metricList.length; ++i) {
                if (instance.metricList[i].total != group.metricList[i].total) {
                    return false;
                }
            }

            return true;
        }
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
            this.drawOverview();
        }
    }

    clearFocus() {
        this.hasFocus = false;
        this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
    }

    drawOverview() {
        this.$timeout(() => {
            this.overviewContext.clearRect(0, 0, this.overviewCanvas.width, this.overviewCanvas.height);
            this.setOverviewCanvasSize();
            this.scope.ctrl.focusGraphMarginTop = this.scope.ctrl.overviewHeight + this.config.marginBetweenOverviewAndFocus;
            this.drawOverviewData();
        });
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

    setOverviewCanvasSize() {
        var instanceHorizontalLength = this.getMaxMetricLength() * this.overviewModel.metricList.length +
            (this.overviewModel.metricList.length - 1) * this.config.overview.horizontalMarginBetweenMetrics;
        this.scope.ctrl.overviewWidth = instanceHorizontalLength * this.config.overview.pointWidth;

        if (this.scope.ctrl.isGrouped) {
            this.scope.ctrl.overviewHeight = this.overviewModel.groupList.length * (this.config.overview.groupedPointHeight * 2);
        } else {
            this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.config.overview.ungroupedPointHeight;
        }

        this.scope.ctrl.overviewCanvasWidth = this.scope.ctrl.overviewWidth + this.getMaxGroupSize() +
            this.config.overview.horizontalMarginBetweenMetrics;
        this.setOverviewContextLabelFont();
        this.overviewModel.labelTextHeight = this.overviewContext.measureText("M").width;
        this.overviewModel.overviewStartY = this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview;
        this.scope.ctrl.overviewHeight += (this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 2; // Metric and time labels
        this.scope.$apply();
    }

    getMaxGroupSize() {
        var result = 0;

        this.overviewModel.groupList.forEach((group) => {
            if (group.instanceList.length > result) {
                result = group.instanceList.length;
            }
        });

        return result;
    }

    setOverviewContextLabelFont() {
        this.overviewContext.font = "bold " + this.config.overview.metricFontSize + "px Arial";
    }

    drawOverviewData() {
        this.overviewModel.metricWidth = this.getMaxMetricLength() * this.config.overview.pointWidth;
        this.overviewModel.overviewEndY = 0;

        if (this.scope.ctrl.isGrouped) {
            this.drawGroupedOverview();
        } else {
            this.drawUngroupedOverview();
        }

        this.drawMetricLabels();
        this.drawTimeLabels();
    }

    drawGroupedOverview() {
        this.overviewModel.overviewInstanceHeight = this.config.overview.groupedPointHeight;

        this.overviewModel.groupList.forEach((group, groupIndex) => {
            var instance = group.instanceList[0];
            this.drawOverviewInstance(instance, groupIndex, this.config.overview.groupedPointHeight, this.config.overview.groupedPointHeight);
        });

        this.drawGroupSize();
    }

    drawOverviewInstance(instance, index, pointHeigh, marginBetweenInstances) {
        instance.y = this.overviewModel.overviewStartY + index * (pointHeigh + marginBetweenInstances);
        var endY = instance.y + pointHeigh;

        if (endY > this.overviewModel.overviewEndY) {
            this.overviewModel.overviewEndY = endY;
        }

        instance.metricList.forEach((metric, metricIndex) => {
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

    getColorFromMap(value, map) {
        var result;

        map.forEach((color, threshold) => {
            if (threshold.min <= value && value <= threshold.max) {
                result = color;
            }
        });

        return "#" + result;
    }

    drawGroupSize() {
        var startX = this.scope.ctrl.overviewWidth + this.config.overview.horizontalMarginBetweenMetrics;

        this.overviewModel.groupList.forEach((group, groupIndex) => {
            var endX = startX + group.instanceList.length * this.config.overview.groupSizeWidth;
            var startY = this.overviewModel.overviewStartY + groupIndex * this.config.overview.groupedPointHeight;
            var endY = startY + this.config.overview.groupedPointHeight;
            this.overviewContext.beginPath();
            this.overviewContext.moveTo(startX, startY);
            this.overviewContext.lineTo(endX, startY);
            this.overviewContext.lineTo(endX, endY);
            this.overviewContext.lineTo(startX, endY);
            this.overviewContext.closePath();
            this.overviewContext.fillStyle = "black";
            this.overviewContext.fill();
        });
    }

    drawUngroupedOverview() {
        this.overviewModel.overviewInstanceHeight = this.config.overview.ungroupedPointHeight;

        this.overviewModel.data.forEach((instance, instanceIndex) => {
            this.drawOverviewInstance(instance, instanceIndex, this.config.overview.ungroupedPointHeight, 0);
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
        var y = this.overviewModel.overviewStartY;

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

    drawMetricLabels() {
        this.setOverviewContextLabelFont();
        this.overviewContext.fillStyle = "black";

        for (var i = 0; i < this.config.metricLabelList.length; ++i) {
            var metric = this.overviewModel.metricList[i];
            var label = this.config.metricLabelList[i];
            var width = this.overviewContext.measureText(label).width;
            this.overviewContext.fillText(label, (metric.startX + metric.endX - width) / 2, this.overviewModel.labelTextHeight);
        }
    }

    drawTimeLabels() {
        this.setOverviewContextTimeFont();
        var textHeight = this.overviewContext.measureText("M").width;
        var fromDate = this.getDateString(this.fromDate * 1000);
        var fromDateWidth = this.overviewContext.measureText(fromDate).width;
        var toDate = this.getDateString(this.toDate * 1000);
        var toDateWidth = this.overviewContext.measureText(toDate).width;
        var y = this.scope.ctrl.overviewHeight - textHeight;

        var metric = this.overviewModel.metricList[this.overviewModel.metricList.length - 1];
        // this.overviewContext.fillText(fromDate, metric.startX - fromDateWidth / 2, y);
        this.overviewContext.fillText(toDate, metric.endX - toDateWidth / 2, y);

        for (var i = 0; i < this.config.metricLabelList.length; ++i) {
        }
    }

    setOverviewContextTimeFont() {
        this.overviewContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
    }

    getDateString(date) {
        return moment(date).format(this.config.dateFormat);
    }

    selectOverviewMode() {
        this.drawOverview();
    }

    selectLinker() {
        this.drawFocusArea();
    }

    selectGroupingMode() {
        this.updateGrouping();
    }

    updateGrouping() {
        this.initialiseOverviewGroups();
        this.drawOverview();
        this.showFocus = false;
        this.initialiseAllFocusGraphGroups();
    }

    selectAttributeForGrouping() {
        this.updateGrouping();
    }

    groupUngroup() {
        this.scope.ctrl.isGrouped = !this.scope.ctrl.isGrouped;
        this.drawOverview();
        this.showFocus = false;
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
            var minimumTopY = Math.max(this.overviewModel.overviewStartY, this.focusModel.mousePosition.y - size / 2);
            this.focusModel.focusStartY = Math.min(minimumTopY, this.overviewModel.overviewEndY - size);
            this.drawFocusAreaAndLinkers(true);
        }
    }

    getFocusAreaSize() {
        return Math.min(this.config.focusArea.size * 2, this.overviewModel.overviewEndY - this.overviewModel.overviewStartY);
    }

    drawSingleFocusArea() {
        this.clearFocus();
        var size = this.getFocusAreaSize();
        this.focusModel.focusStartY = Math.min(Math.max(0, this.focusModel.mousePosition.y - size / 2), this.overviewCanvas.height - this.getFocusAreaSize());
        this.focusModel.focusStartX = Math.min(Math.max(0, this.focusModel.mousePosition.x - this.config.focusArea.size), this.overviewCanvas.width - size);
        this.focusAreaContext.strokeStyle = this.config.focusArea.color;
        this.focusAreaContext.strokeRect(this.focusModel.focusStartX, this.focusModel.focusStartY, size, size);
    }

    drawFocusAreaAndLinkers(doDrawLinkers) {
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
            case this.scope.ctrl.enumList.linkingMode.X_CROSS:
                this.drawXCross(metric, instance);
                break;

            case this.scope.ctrl.enumList.linkingMode.NORMAL_CROSS:
                this.drawNormalCross(metric, instance);
                break;

            case this.scope.ctrl.enumList.linkingMode.CHANGE_COLOR:
                this.changeInstanceColor(metric, instance, index);
                break;

            default:
                break;
        }
    }

    drawXCross(metric, instance) {
        var centerX = metric.startX + this.focusModel.mousePositionXOffset;
        var leftStartX = centerX - this.config.focusArea.xCrossSize;
        var rightStartX = centerX + this.config.overview.pointWidth;
        var bottomInstance = instance.y + this.config.overview.ungroupedPointHeight;

        this.drawXCrossLine(leftStartX, instance.y - this.config.focusArea.xCrossSize, instance.y);
        this.drawXCrossLine(rightStartX, instance.y, instance.y - this.config.focusArea.xCrossSize);
        this.drawXCrossLine(leftStartX, bottomInstance + this.config.focusArea.xCrossSize, bottomInstance);
        this.drawXCrossLine(rightStartX, bottomInstance, bottomInstance + this.config.focusArea.xCrossSize);
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
            this.drawFocusAreaAndLinkers(false);
        }
    }

    drawFocusGraph() {
        if (this.scope.ctrl.isGrouped) {
            this.initialiseFocusGraphGroups();
        } else {
            this.initialiseFocusGraphData();
        }

        if ((this.scope.ctrl.isGrouped && this.focusModel.focusedGroupList.length > 0) ||
            (!this.scope.ctrl.isGrouped && this.focusModel.data.length > 0)) {
            this.scope.ctrl.showFocus = true;
            this.$timeout(() => {
                this.scope.ctrl.focusGraphHeight = this.overviewModel.metricList.length * this.config.focusGraph.metricMaxHeight +
                    (this.overviewModel.metricList.length - 1) * this.config.focusGraph.marginBetweenMetrics;
                var firstInstance = this.scope.ctrl.isGrouped ? this.focusModel.focusedGroupList[0].instanceList[0] : this.focusModel.data[0];
                this.scope.ctrl.focusGraphWidth = (this.focusModel.focusedIndexList.length - 1) * this.config.focusGraph.pointWidth;
                this.scope.$apply();
                this.focusModel.focusRowHeight = this.getElementByID("focusGraphRow").offsetHeight;
                this.setFocusFromAndToDate();
                this.positionFocusFromAndToDate();
                this.drawFocusGraphData();
            });
        } else {
            this.scope.ctrl.showFocus = false;
        }
    }

    initialiseFocusGraphGroups() {
        if (!this.focusModel.allGroupList) {
            this.initialiseAllFocusGraphGroups();
        }

        if (!this.focusModel.focusedGroupList) {
            this.focusModel.focusedGroupList = [];
        }

        this.focusModel.focusedGroupList.length = 0;
        this.initialiseFocusGraphFocusedGroups();
    }

    initialiseAllFocusGraphGroups() {
        this.focusModel.allGroupList = [];

        this.overviewModel.groupList.forEach((group, groupIndex) => {
            var focusGroup = {};
            this.focusModel.allGroupList.push(focusGroup);
            focusGroup.index = groupIndex + 1;
            focusGroup.instanceList = [];

            group.instanceList.forEach((overviewInstance) => {
                var focusInstance = this.getFocusInstance(overviewInstance, [0, 0]);
                focusGroup.instanceList.push(focusInstance);
            });
        });
    }

    initialiseFocusGraphFocusedGroups() {
        this.overviewModel.groupList.forEach((group, groupIndex) => {
            var firstInstance = group.instanceList[0];

            if (this.checkInstanceInFocus(firstInstance)) {
                this.focusModel.focusedIndexList = this.getIndexesOfPointsInFocus(firstInstance);

                group.instanceList.forEach((overviewInstance, instanceIndex) => {
                    var focusInstance = this.focusModel.allGroupList[groupIndex].instanceList[instanceIndex];
                    this.initialiseFocusInstanceData(focusInstance, overviewInstance, this.focusModel.focusedIndexList);
                });

                var focusGroup = this.focusModel.allGroupList[groupIndex];
                focusGroup.showDetails = false;
                this.focusModel.focusedGroupList.push(focusGroup);
            }
        });
    }

    initialiseFocusGraphData() {
        if (!this.focusModel.data) {
            this.focusModel.data = [];
        }

        this.focusModel.data.length = 0;

        this.overviewModel.data.forEach((overviewInstance) => {
            if (this.checkInstanceInFocus(overviewInstance)) {
                this.focusModel.focusedIndexList = this.getIndexesOfPointsInFocus(overviewInstance);
                var focusInstance = this.getFocusInstance(overviewInstance, this.focusModel.focusedIndexList);
                this.focusModel.data.push(focusInstance);
            }
        });
    }

    checkInstanceInFocus(instance) {
        return instance.y <= this.focusModel.focusStartY + this.getFocusAreaSize() &&
            instance.y + this.overviewModel.overviewInstanceHeight >= this.focusModel.focusStartY
    }

    getIndexesOfPointsInFocus(overviewInstance) {
        var indexes = [];

        for (var i = 0; i < overviewInstance.metricList.length; ++i) {
            var metric = overviewInstance.metricList[i];

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

    getFocusInstance(overviewInstance, indexList) {
        var focusInstance = {};
        focusInstance.instance = overviewInstance.instance;
        this.initialiseFocusInstanceData(focusInstance, overviewInstance, indexList);
        return focusInstance;
    }

    initialiseFocusInstanceData(focusInstance, overviewInstance, indexList) {
        focusInstance.metricList = [];
        this.addFocusMetrics(focusInstance, overviewInstance, indexList);
        this.initialiseInstanceLayers(focusInstance);
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

    setFocusFromAndToDate() {
        for (var instanceIndex = 0; instanceIndex < this.overviewModel.data.length; ++instanceIndex) {
            var instance = this.overviewModel.data[instanceIndex];
            var set = false;

            for (var metricIndex = 0; metricIndex < instance.metricList.length; ++metricIndex) {
                var metric = instance.metricList[metricIndex];
                var fromIndex = this.focusModel.focusedIndexList[0];
                var toIndex = this.focusModel.focusedIndexList[this.focusModel.focusedIndexList.length - 1];

                if (metric.data[fromIndex] && metric.data[toIndex]) {
                    this.scope.ctrl.focusedFromDate = this.getDateString(metric.data[fromIndex].date * 1000);
                    this.scope.ctrl.focusedToDate = this.getDateString(metric.data[toIndex].date * 1000);
                    set = true;
                    break;
                }
            }

            if (set) {
                break;
            }
        }
    }

    positionFocusFromAndToDate() {
        this.scope.ctrl.timeFontSize = this.config.overview.timeFontSize;
        this.setOverviewContextTimeFont();
        var canvasStartX = this.getElementByID("canvasCell").offsetLeft;
        var fromDateWidth = this.overviewContext.measureText(this.scope.ctrl.focusedFromDate).width;
        this.scope.ctrl.fromDateLeftMargin = canvasStartX - (fromDateWidth / 2);
        this.scope.ctrl.toDateLeftMargin = this.scope.ctrl.focusGraphWidth - fromDateWidth;
    }

    drawFocusGraphData() {
        if (this.scope.ctrl.isGrouped) {
            this.drawGroupedFocusGraph();
        } else {
            this.drawUngroupedFocusGraph();
        }
    }

    drawGroupedFocusGraph() {
        this.focusModel.focusedGroupList.forEach((group) => {
            group.instanceList.forEach((instance, instanceIndex) => {
                if (instanceIndex == 0 || group.showDetails) {
                    var canvas = this.getElementByID("focusGraphCanvas-" + group.index + "-" + instanceIndex);
                    var context = this.getCanvasContext(canvas);
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    this.drawFocusGraphInstance(instance, context);
                }
            });
        });
    }

    drawFocusGraphInstance(instance, context) {
        instance.metricList.forEach((metric, metricIndex) => {
            metric.layerList.forEach((layer, layerIndex) => {
                var y = (this.config.focusGraph.metricMaxHeight + this.config.focusGraph.marginBetweenMetrics) * metricIndex +
                    this.config.focusGraph.metricMaxHeight;
                context.beginPath();
                context.moveTo(0, y);
                var x = 0;
                var previousX = 0;
                var previousValue = 0;

                layer.valueList.forEach((value, valueIndex) => {
                    x = this.config.focusGraph.pointWidth * valueIndex;
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
    }

    drawUngroupedFocusGraph() {
        this.focusModel.data.forEach((instance, instanceIndex) => {
            var canvas = this.getElementByID("focusGraphCanvas-" + instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);
            this.drawFocusGraphInstance(instance, context);
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
            this.scrollByGroup();
        } else {
            this.scrollByInstance();
        }
    }

    scrollByGroup() {
        for (var allGroupIndex = 0; allGroupIndex < this.focusModel.allGroupList.length; ++allGroupIndex) {
            var group = this.focusModel.allGroupList[allGroupIndex];
            var overviewInstance = this.overviewModel.groupList[allGroupIndex].instanceList[0];
            var focusInstance = group.instanceList[0];

            if (overviewInstance.y <= this.focusModel.mousePosition.y && this.focusModel.mousePosition.y <=
                overviewInstance.y + this.config.overview.groupedPointHeight) {
                focusInstance.isSelected = true;

                for (var focusedGroupIndex = 0; focusedGroupIndex < this.focusModel.focusedGroupList.length; ++focusedGroupIndex) {
                    if (this.focusModel.focusedGroupList[focusedGroupIndex] == group) {
                        this.focusGraphContainer.scrollTop = this.focusModel.focusRowHeight * focusedGroupIndex;
                        break;
                    }
                }
            } else {
                focusInstance.isSelected = false;
            }
        }
    }

    scrollByInstance() {
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

    showNodes(group, event) {
        event.preventDefault();

        this.$timeout(() => {
            group.showDetails = !group.showDetails;
            this.scope.$apply();

            if (group.showDetails) {
                this.drawFocusGraphData();
            }

            this.selectNode(group.instanceList[0]);
        });
    }

    selectNode(instance) {
        if (this.scope.ctrl.isGrouped) {
            this.focusModel.focusedGroupList.forEach((group) => {
                group.instanceList.forEach((instance) => {
                    instance.isSelected = false;
                })
            });
        } else {
            this.focusModel.data.forEach((focusInstance) => {
                focusInstance.isSelected = false;
            });
        }

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