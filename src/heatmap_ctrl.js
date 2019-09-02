import { MetricsPanelCtrl } from "app/plugins/sdk";
import "./heatmap.css!";
import moment, { relativeTimeThreshold } from "moment";
import _ from "lodash";

export class HeatmapCtrl extends MetricsPanelCtrl {
    constructor($scope, $injector, $timeout, $interval, variableSrv, timeSrv) {
        super($scope, $injector);
        this.$timeout = $timeout;
        this.$interval = $interval;
        this.variableSrv = variableSrv;
        this.timeSrv = timeSrv;

        this.firstLoad = true;
        this.overviewModel = {};
        this.focusModel = {};
        this.focusModel.groupList = [];

        this.initialisePanelDefaults();
        this.initialiseConfig();

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on("data-received", this.onDataReceived.bind(this));
    }

    initialisePanelDefaults() {
        var panelDefaults = {
            metricList: [
                {
                    name: "CPU",
                    query: "node_load1{job='node'}",

                    colorList: [
                        {
                            value: "#f2d9e6"
                        },
                        {
                            value: "#d98cb3"
                        },
                        {
                            value: "#bf4080"
                        },
                        {
                            value: "#73264d"
                        }
                    ]
                },

                {
                    name: "Memory",

                    query: "100 - (node_memory_MemFree_bytes{job='node'} - node_memory_Cached_bytes{job='node'}) * 100 / (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'})",

                    colorList: [
                        {
                            value: "#ccddff"
                        },
                        {
                            value: "#6699ff"
                        },
                        {
                            value: "#0055ff"
                        },
                        {
                            value: "#003399"
                        }
                    ]
                },


                {
                    name: "CPU",

                    query: "100 - (sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)', mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})) * 100 / (sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'}))",

                    colorList: [
                        {
                            value: "#eeeedd"
                        },
                        {
                            value: "#cccc99"
                        },
                        {
                            value: "#aaaa55"
                        },
                        {
                            value: "#666633"
                        }
                    ]
                }
            ]
        };

        _.defaults(this.panel, panelDefaults);
    }

    initialiseConfig() {
        this.config = {
            apiAddress: "http://localhost:3000/api/datasources/proxy/1/api/v1/query_range?query=",
            dateFormat: "DD/MM/YY hh:mm:ss",
            marginBetweenOverviewAndFocus: 20,

            startingGreyColor: 240,
            endingGrayColor: 80,

            // determines which the order of attributes to use for sorting
            sortOrder: [0, 1, 2],
        }

        this.initialiseOverviewConfig();
        this.initialiseFocusAreaConfig();
        this.initialiseFocusGraphConfig();
    }

    initialiseOverviewConfig() {
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
            marginBetweenInstances: 6,
            groupBarWidth: 9,
            singleAttributeGroupSizeWidth: 1,
            multipleAttributeGroupSizeWidth: 2,
            marginBetweenMarkerAndGroup: 15,
            marginBetweenMetricAndGroupSize: 10
        }
    }

    initialiseFocusAreaConfig() {
        this.config.focusArea = {
            color: "Aqua",
            maxLuminanceChange: 0.7,
            focusAreaSize: 20,
            xCrossSize: 15,
            intervalTimer: 50
        }
    }

    initialiseFocusGraphConfig() {
        this.config.focusGraph = {
            maxWidth: 10000,
            maxHeight: 10000,
            groupedPointWidth: 3,
            ungroupedPointWidth: 20,
            metricMaxHeight: 30,
            marginBetweenMetrics: 10,
            maxHeight: 10000,
            markerSize: 20,
            marginBetweenMarkers: 10
        }
    }

    link(scope, elem) {
        this.scope = scope;
        this.elem = elem;

        this.initialiseControl();
        this.initialiseUIElements();
    }

    initialiseControl() {
        this.enumList = {
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

        this.linkingMode = this.enumList.linkingMode.X_CROSS;
        this.groupingMode = this.enumList.groupingMode.SINGLE;
        this.isGrouped = true;
        this.initialiseOverviewCanvasCursor();
    }

    initialiseOverviewCanvasCursor() {
        this.overviewCursor = "crosshair";
    }

    initialiseUIElements() {
        // overview
        this.overviewCanvas = this.getElementByID("overviewCanvas");
        this.overviewContext = this.getCanvasContext(this.overviewCanvas);

        // focus area
        this.focusAreaCanvas = this.getElementByID("focusAreaCanvas");
        this.focusAreaContext = this.getCanvasContext(this.focusAreaCanvas);

        // focus graph
        this.focusGraphWidth = this.config.focusGraph.maxWidth;
        this.focusGraphHeight = this.config.focusGraph.maxHeight;
        this.focusGraphContainer = this.getElementByID("focusGraphContainer");
    }

    getElementByID(id) {
        var find = this.elem.find("#" + id);
        return find[0];
    }

    getCanvasContext(canvas) {
        return canvas.getContext("2d");
    }

    onInitEditMode() {
        this.addEditorTab('Options', 'public/plugins/buw-heatmap-panel/editor.html', 2);
    }

    onDataReceived(data) {
        if (this.updatingVariable) {
            this.updatingVariable = false;
        } else {
            this.load();
        }
    }

    load() {
        this.$timeout(() => {
            this.isLoading = true;

            this.scope.$apply();

            this.overviewModel.metricList = [];

            this.panel.metricList.forEach(() => {
                this.overviewModel.metricList.push(null);
            });

            this.loadCount = 0;
            this.fromDate = this.getDateInSeconds(this.timeSrv.timeRange().from._d);
            this.toDate = this.getDateInSeconds(this.timeSrv.timeRange().to._d);

            this.panel.metricList.forEach((metric, index) => {
                this.getDataFromAPI(metric.query, index);
            });

            this.processRawData();
        });
    }

    getDateInSeconds(date) {
        return Math.round(date.getTime() / 1000);
    }

    getDataFromAPI(query, index) {
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

        var url = this.config.apiAddress + encodeURIComponent(query) + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=60";
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }

    processRawData() {
        this.$timeout(() => {
            if (this.loadCount < this.overviewModel.metricList.length) {
                this.processRawData.bind(this)();
            } else {
                this.isLoading = false;

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
            var colorList = this.panel.metricList[index].colorList;
            metric.layerRange = metric.max / colorList.length;

            // map a range of values to a color
            metric.colorMap = this.getColorMap(metric, colorList);
        });
    }

    getColorMap(metric, colorList) {
        var colorMap = new Map();

        for (var i = 0; i < colorList.length; ++i) {
            var threshold = {};
            threshold.min = i * metric.layerRange;
            threshold.max = threshold.min + metric.layerRange;
            threshold.average = (threshold.max + threshold.min) / 2
            colorMap.set(threshold, colorList[i].value);
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

        for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
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
            if (this.isBetween(value, threshold.min, threshold.max)) {
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
        this.initialiseSingleAttributeGroups();
        this.initialiseMultiAttributeGroups();
    }

    initialiseSingleAttributeGroups() {
        this.overviewModel.metricList.forEach((metric, metricIndex) => {
            metric.groupList = [];

            this.overviewModel.data.forEach((instance) => {
                var group = _.find(metric.groupList, (search) => {
                    return instance.metricList[metricIndex].total == search.total;
                });

                if (!group) {
                    group = this.initialiseNewSingleAttributeGroups(instance, metricIndex);
                    metric.groupList.push(group);
                }

                group.instanceList.push(instance);
            });

            metric.groupList.sort((first, second) => {
                return first.total - second.total;
            });

            this.initialiseSingleAttributeGroupsColor(metric, metricIndex);
        });

        this.initialiseSingleAttributeInstanceGroupList();
    }

    initialiseNewSingleAttributeGroups(instance, metricIndex) {
        var group = {};
        group.instanceList = [];
        group.markerX = 0;
        group.total = instance.metricList[metricIndex].total;
        return group;
    }

    initialiseSingleAttributeGroupsColor(metric, metricIndex) {
        var luminanceChange = -this.config.focusArea.maxLuminanceChange / metric.groupList.length;
        var originalColor = this.panel.metricList[metricIndex].colorList[0].value;

        metric.groupList.forEach((group, groupIndex) => {
            group.color = this.changeColorLuminance(originalColor, groupIndex * luminanceChange);
        });
    }

    initialiseSingleAttributeInstanceGroupList() {
        this.overviewModel.data.forEach((instance) => {
            instance.groupList = [];

            this.overviewModel.metricList.forEach((metric, metricIndex) => {
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

    changeColorLuminance(hex, lum) {
        hex = String(hex).replace(/[^0-9a-f]/gi, '');

        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        lum = lum || 0;
        var rgb = "#", c, i;

        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }

        return rgb;
    }

    initialiseMultiAttributeGroups() {
        this.overviewModel.groupList = [];

        this.overviewModel.data.forEach((instance) => {
            var group = _.find(this.overviewModel.groupList, (search) => {
                for (var i = 0; i < instance.metricList.length; ++i) {
                    if (instance.metricList[i].total != search.metricList[i].total) {
                        return false;
                    }
                }

                return true;
            });

            if (!group) {
                group = this.initialiseNewMultiAttributeGroup(instance);
                this.overviewModel.groupList.push(group);
            }

            group.instanceList.push(instance);
        });

        this.initialiseMultiAttributeGroupsColor();
    }

    initialiseNewMultiAttributeGroup(instance) {
        var group = {};
        group.metricList = [];
        group.instanceList = [];
        group.markerX = 0;

        instance.metricList.forEach((instanceMetric) => {
            var groupMetric = {};
            groupMetric.total = instanceMetric.total;
            group.metricList.push(groupMetric);
        });

        return group;
    }

    initialiseMultiAttributeGroupsColor() {
        var colorStep = (this.config.startingGreyColor - this.config.endingGrayColor) / this.overviewModel.groupList.length;

        this.overviewModel.groupList.forEach((group, groupIndex) => {
            var greyValue = Math.round(this.config.startingGreyColor - colorStep * groupIndex);
            group.color = "rgba(" + greyValue + ", " + greyValue + ", " + greyValue + ", 1)";
        });
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
            this.focusGraphMarginTop = this.overviewCanvasHeight + this.config.marginBetweenOverviewAndFocus;
            this.drawOverviewData();
        });
    }

    setOverviewCanvasSize() {
        this.setOverviewContextLabelFont();
        this.overviewModel.labelTextHeight = this.overviewContext.measureText("M").width;
        this.overviewModel.overviewStartY = this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview;
        this.setOverviewWidth();
        this.setOverviewHeight();
        this.scope.$apply();
    }

    setOverviewWidth() {
        this.setOverviewContextTimeFont();
        this.overviewModel.toDate = this.getDateString(this.toDate * 1000);
        this.overviewModel.toDateWidth = this.overviewContext.measureText(this.overviewModel.toDate).width;

        // total width of overiew graph (groupsize excluded)
        this.overviewModel.overviewWidth = this.getMaxMetricLength() * this.overviewModel.metricList.length * this.config.overview.pointWidth +
            this.config.overview.marginBetweenMarkerAndGroup * this.overviewModel.metricList.length +
            this.config.overview.horizontalMarginBetweenMetrics * (this.overviewModel.metricList.length - 1);
        this.overviewCanvasWidth = this.overviewModel.overviewWidth;

        if (this.isGrouped) {
            this.setGroupedOverviewCanvasWidth();
        } else {
            this.overviewCanvasWidth += this.overviewModel.toDateWidth / 2;
        }
    }

    getMaxMetricLength() {
        var length = 0;

        this.overviewModel.metricList.forEach((metric) => {
            var instanceWithMostPoints = _.maxBy(metric.data, (point) => {
                return point.values.length;
            });

            length = instanceWithMostPoints.values.length;
        });

        return length;
    }

    setGroupedOverviewCanvasWidth() {
        this.overviewCanvasWidth += this.config.overview.marginBetweenMarkerAndGroup * this.overviewModel.metricList.length;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize * this.overviewModel.metricList.length;

            this.overviewModel.metricList.forEach((metric) => {
                this.overviewCanvasWidth += this.getMaxGroupSizeBarLength(metric) * this.config.overview.singleAttributeGroupSizeWidth;
            });
        } else {
            this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize +
                this.getMaxMultiAttributeGroupSize() * this.config.overview.multipleAttributeGroupSizeWidth;
        }
    }

    getMaxGroupSizeBarLength(metric) {
        var largestGroup = _.maxBy(metric.groupList, (group) => {
            return group.instanceList.length;
        });

        return largestGroup.instanceList.length * this.config.overview.singleAttributeGroupSizeWidth;
    }

    getMaxMultiAttributeGroupSize() {
        var result = 0;

        this.overviewModel.groupList.forEach((group) => {
            if (group.instanceList.length > result) {
                result = group.instanceList.length;
            }
        });

        return result;
    }

    setOverviewHeight() {
        // height of tallest graph
        if (this.isGrouped) {
            var groupCount = this.getMaxGroupCount();
            this.overviewModel.overviewHeight = groupCount * (this.config.overview.groupedPointHeight * 2); // 2 = group + margin
        } else {
            this.overviewModel.overviewHeight = this.overviewModel.data.length * this.config.overview.ungroupedPointHeight;
        }

        // 2 = Metric and time labels
        this.overviewCanvasHeight = this.overviewModel.overviewHeight +
            (this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 2;
    }

    getMaxGroupCount() {
        var groupCount;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            var metricWithMostGroups = _.maxBy(this.overviewModel.metricList, (metric) => {
                return metric.groupList.length;
            });

            groupCount = metricWithMostGroups.groupList.length;
        } else {
            groupCount = this.overviewModel.groupList.length;
        }

        return groupCount;
    }

    setOverviewContextLabelFont() {
        this.overviewContext.font = "bold " + this.config.overview.metricFontSize + "px Arial";
    }

    drawOverviewData() {
        this.overviewModel.metricWidth = this.getMaxMetricLength() * this.config.overview.pointWidth;
        this.overviewModel.overviewEndY = 0;

        if (this.isGrouped) {
            this.drawGroupedOverview();
        } else {
            this.drawUngroupedOverview();
        }

        this.drawMetricLabels();
        this.drawTimeLabels();
    }

    drawGroupedOverview() {
        this.overviewModel.overviewInstanceHeight = this.config.overview.groupedPointHeight;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.overviewModel.metricList.forEach((metric, metricIndex) => {
                metric.groupList.forEach((group, groupIndex) => {
                    this.drawGroupOverviewWrapper(group, groupIndex, [metricIndex]);
                });
            });
        } else {
            this.overviewModel.groupList.forEach((group, groupIndex) => {
                var metricIndexList = this.getAllMetricIndexList();
                this.drawGroupOverviewWrapper(group, groupIndex, metricIndexList);
            });
        }

        this.drawGroupSize();
        this.drawMetricSeparator();
    }

    drawGroupOverviewWrapper(group, groupIndex, metricIndexList) {
        var instance = group.instanceList[0];
        this.drawOverviewInstance(instance, groupIndex, this.config.overview.groupedPointHeight,
            this.config.overview.groupedPointHeight, metricIndexList);
        group.y = instance.y;
    }

    drawOverviewInstance(instance, index, pointHeight, marginBetweenInstances, metricIndexList) {
        var endY = instance.y + pointHeight;

        if (endY > this.overviewModel.overviewEndY) {
            this.overviewModel.overviewEndY = endY;
        }

        instance.y = this.overviewModel.overviewStartY + index * (pointHeight + marginBetweenInstances);

        metricIndexList.forEach((metricIndex) => {
            this.drawOverviewInstanceMetric(instance, metricIndex, pointHeight);
        });
    }

    drawOverviewInstanceMetric(instance, metricIndex, pointHeight) {
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

    drawOverviewInstancePoints(instance, metricIndex, overviewMetric, pointHeight) {
        var instanceMetric = instance.metricList[metricIndex];

        instanceMetric.data.forEach((point, pointIndex) => {
            point.x = overviewMetric.startX + pointIndex * this.config.overview.pointWidth;
            point.color = this.getColorFromMap(point.value, this.overviewModel.metricList[metricIndex].colorMap);
            this.overviewContext.fillStyle = point.color;
            this.overviewContext.fillRect(point.x, instance.y, this.config.overview.pointWidth, pointHeight);
        });
    }

    getColorFromMap(value, map) {
        var result;

        map.forEach((color, threshold) => {
            if (this.isBetween(value, threshold.min, threshold.max)) {
                result = color;
            }
        });

        return result;
    }

    getAllMetricIndexList() {
        return Array.from(Array(this.overviewModel.metricList.length).keys());
    }

    drawGroupSize() {
        this.setOverviewContextLabelFont();
        var label = "Groups size";
        var labelWidth = this.overviewContext.measureText(label).width;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.drawSingleAttributeGroupSize(labelWidth);
        } else {
            this.drawMultipleAttributeGroupSize(labelWidth);
        }
    }

    drawSingleAttributeGroupSize(labelWidth) {
        this.overviewModel.metricList.forEach((metric) => {
            var startX = metric.endX + this.config.overview.marginBetweenMetricAndGroupSize;
            var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(metric);

            metric.groupList.forEach((group, groupIndex) => {
                this.drawGroupSizeWrapper(startX, group, groupIndex, this.config.overview.singleAttributeGroupSizeWidth);
            });

            this.overviewContext.fillStyle = "black";
            this.overviewContext.fillText("Groups size", (startX * 2 + maxGroupSizeBarLength - labelWidth) / 2, this.overviewModel.labelTextHeight);
        });
    }

    drawGroupSizeWrapper(startX, group, groupIndex, groupSizeWidth) {
        var endX = startX + group.instanceList.length * groupSizeWidth;
        var startY = this.overviewModel.overviewStartY + groupIndex * this.config.overview.groupedPointHeight * 2; // 2 = instance + margin between instances
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

    drawMultipleAttributeGroupSize(labelWidth) {
        var startX = this.overviewModel.overviewWidth + this.config.overview.horizontalMarginBetweenMetrics;
        var maxEndX = 0;

        this.overviewModel.groupList.forEach((group, groupIndex) => {
            var endX = this.drawGroupSizeWrapper(startX, group, groupIndex, this.config.overview.multipleAttributeGroupSizeWidth);

            if (endX > maxEndX) {
                maxEndX = endX;
            }
        });

        this.overviewContext.fillStyle = "black";
        this.overviewContext.fillText("Groups size", (startX + maxEndX - labelWidth) / 2, this.overviewModel.labelTextHeight);
    }

    drawMetricSeparator() {
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

    drawUngroupedOverview() {
        this.overviewModel.overviewInstanceHeight = this.config.overview.ungroupedPointHeight;

        this.overviewModel.data.forEach((instance, instanceIndex) => {
            var metricIndexList = this.getAllMetricIndexList();
            this.drawOverviewInstance(instance, instanceIndex, this.config.overview.ungroupedPointHeight, 0, metricIndexList);
        });

        this.drawGroupBars();
    }

    drawGroupBars() {
        for (var i = 1; i < this.overviewModel.metricList.length; ++i) {
            var x = this.overviewModel.metricList[i].startX - this.config.overview.horizontalMarginBetweenMetrics / 2;
            this.drawGroupBarAtPosition(x);
        }
    }

    drawGroupBarAtPosition(x) {
        var y = this.overviewModel.overviewStartY;

        this.overviewModel.groupList.forEach((group) => {
            this.overviewContext.fillStyle = group.color;
            var height = group.instanceList.length * this.config.overview.ungroupedPointHeight;
            this.overviewContext.fillRect(x - Math.floor(this.config.overview.groupBarWidth / 2), y,
                this.config.overview.groupBarWidth, height);
            y += height;
        });
    }

    drawMetricLabels() {
        this.setOverviewContextLabelFont();
        this.overviewContext.fillStyle = "black";

        for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
            var metric = this.overviewModel.metricList[i];
            var label = this.panel.metricList[i].name;
            var width = this.overviewContext.measureText(label).width;
            this.overviewContext.fillText(label, (metric.startX + metric.endX - width) / 2, this.overviewModel.labelTextHeight);
        }
    }

    drawTimeLabels() {
        this.setOverviewContextTimeFont();
        var y = this.overviewModel.overviewStartY + this.overviewModel.overviewHeight + this.config.overview.marginBetweenLabelsAndOverview;
        var metric = this.overviewModel.metricList[this.overviewModel.metricList.length - 1];
        this.overviewContext.fillStyle = "black";
        this.overviewContext.fillText(this.overviewModel.toDate, metric.endX - this.overviewModel.toDateWidth / 2, y);
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
        this.changeGroupingSelection();
    }

    changeGroupingSelection() {
        this.drawOverview();
        this.focusModel.groupList = [];

        this.overviewModel.groupList.forEach((group) => {
            group.isSelected = false;
        })

        this.overviewModel.metricList.forEach((metric) => {
            if (metric.groupList) {
                metric.groupList.forEach((group) => {
                    group.isSelected = false;
                });
            }
        });

        this.showFocus = false;
    }

    groupUngroup() {
        this.isGrouped = !this.isGrouped;
        this.changeGroupingSelection();
    }

    moveMouseOnOverview(evt) {
        this.setOverviewMousePosition(evt);

        if (this.isGrouped) {
            this.initialiseOverviewCanvasCursor();
            var found = false;

            for (var overviewIndex = 0; overviewIndex < this.overviewModel.metricList.length; ++overviewIndex) {
                var metric = this.overviewModel.metricList[overviewIndex];

                if (metric) {
                    // only check if mouse is on a metric graph
                    if (this.isBetween(this.overviewModel.mousePosition.x, metric.startX, metric.endX)) {
                        found = this.checkAndSetSelectedGroup(metric);
                    }
                }

                if (found) {
                    break;
                }
            }
        } else if (!this.focusAreaIsFixed) {
            this.drawFocus(evt);
        }
    }

    setOverviewMousePosition(evt) {
        this.overviewModel.mousePosition = this.getMousePos(evt, this.focusAreaCanvas);
    }

    getMousePos(evt, canvas) {
        var rect = canvas.getBoundingClientRect();

        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    checkAndSetSelectedGroup(metric) {
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

        this.overviewModel.hoveredGroup = null;
        return false;
    }

    checkGroupIsSelected(group) {
        if (this.isBetween(this.overviewModel.mousePosition.y, group.y, group.y + this.config.overview.groupedPointHeight)) {
            this.overviewModel.hoveredGroup = group;
            this.overviewCursor = "pointer";
            return true;
        }
    }

    isBetween(target, start, end) {
        return start <= target && target <= end;
    }

    clickOnOverView(evt) {
        this.setOverviewMousePosition(evt);

        if (this.isGrouped) {
            this.checkAndAddGroupToFocus();
        } else {
            this.fixFocusArea(evt);
        }
    }

    checkAndAddGroupToFocus() {
        if (this.overviewModel.hoveredGroup) {
            this.$timeout(() => {
                var focusGroup = _.find(this.focusModel.groupList, (search) => {
                    return search.overviewGroup == this.overviewModel.hoveredGroup;
                })

                if (focusGroup) {
                    this.overviewModel.hoveredGroup.isSelected = false;

                    _.remove(this.focusModel.groupList, (group) => {
                        return group.overviewGroup == this.overviewModel.hoveredGroup;
                    });
                } else {
                    this.overviewModel.hoveredGroup.isSelected = true;
                    this.addGroupToFocus();
                }

                this.scope.$apply();
                this.drawSelectedGroupsMarkers();
                this.drawFocusGraph();
            })
        }
    }

    addGroupToFocus() {
        var focusGroup = {};
        focusGroup.instanceList = [];
        focusGroup.overviewGroup = this.overviewModel.hoveredGroup;

        this.overviewModel.hoveredGroup.instanceList.forEach((overviewInstance) => {
            var metricWithMostData = _.maxBy(overviewInstance.metricList, (metric) => {
                return metric.data.length;
            });

            this.focusModel.focusedIndexList = Array.from(Array(metricWithMostData.data.length).keys());
            var focusInstance = this.getFocusInstance(overviewInstance, this.focusModel.focusedIndexList);
            focusGroup.instanceList.push(focusInstance);
        });

        this.focusModel.groupList.push(focusGroup);
    }

    drawSelectedGroupsMarkers() {
        this.clearFocus();

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.overviewModel.metricList.forEach((metric) => {
                metric.groupList.forEach((group) => {
                    this.drawOverviewGroupMarker(group, [metric])
                });
            });
        } else {
            this.overviewModel.groupList.forEach((group) => {
                this.drawOverviewGroupMarker(group, this.overviewModel.metricList)
            });
        }
    }

    drawOverviewGroupMarker(group, metricList) {
        if (group.isSelected) {
            metricList.forEach((metric) => {
                var x = metric.startX - this.config.overview.marginBetweenMarkerAndGroup + group.markerX;
                this.focusAreaContext.fillStyle = group.color;
                this.focusAreaContext.fillRect(x, group.y, this.config.overview.groupedPointHeight, this.config.overview.groupedPointHeight);
            });
        }
    }

    fixFocusArea(evt) {
        this.initialiseOverviewCanvasCursor();

        if (this.focusAreaIsFixed) {
            this.drawFocus(evt);
        }

        this.focusAreaIsFixed = !this.focusAreaIsFixed;
    }

    drawFocus(evt) {
        this.drawFocusArea();

        for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
            var metric = this.overviewModel.metricList[i];

            // only update focus graph if mouse is pointing on one of metric overview graphs
            if (this.checkMouseIsInMetric(metric)) {
                this.drawFocusGraph();
                break;
            }
        }
    }

    checkMouseIsInMetric(metric) {
        return this.isBetween(this.overviewModel.mousePosition.x, metric.startX, metric.endX);
    }

    drawFocusArea() {
        if (this.overviewModel.mousePosition) {
            var size = this.getFocusAreaSize();
            var minimumTopY = Math.max(this.overviewModel.overviewStartY, this.overviewModel.mousePosition.y - size / 2);
            this.focusModel.focusStartY = Math.min(minimumTopY, this.overviewModel.overviewEndY - size);
            this.drawFocusAreaAndLinkers(true);
        }
    }

    getFocusAreaSize() {
        return Math.min(this.config.focusArea.focusAreaSize * 2, this.overviewModel.overviewEndY - this.overviewModel.overviewStartY);
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
                this.overviewModel.mousePositionXOffset = this.overviewModel.mousePosition.x - metric.startX;
                this.focusModel.sourceMetricIndex = i;

                return Math.min(Math.max(metric.startX,
                    this.overviewModel.mousePosition.x - this.config.focusArea.focusAreaSize),
                    metric.endX - this.getFocusAreaSize()) - metric.startX;
            }
        }
    }

    drawLinkers() {
        var pixelData = this.overviewContext.getImageData(this.overviewModel.mousePosition.x, this.overviewModel.mousePosition.y, 1, 1).data;
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

            if (this.isBetween(this.overviewModel.mousePosition.y, instance.y - this.config.overview.ungroupedPointHeight, instance.y)) {
                return instance;
            }
        }
    }

    drawLinkersByMode(metric, instance, index) {
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

    drawXCross(metric, instance) {
        var centerX = metric.startX + this.overviewModel.mousePositionXOffset;
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
            var colorList = this.panel.metricList[this.focusModel.sourceMetricIndex].colorList;
            var colorMap = this.getColorMap(metric, colorList);
            this.focusAreaContext.fillStyle = this.getColorFromMap(instancePoint.value, colorMap);
            this.focusAreaContext.fillRect(instancePoint.x, instance.y, this.overviewModel.overviewInstanceHeight, this.overviewModel.overviewInstanceHeight);

            if (instancePoint.x == metric.startX + this.overviewModel.mousePositionXOffset) {
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
        if (!this.isGrouped) {
            this.initialiseFocusGraphData();
        }

        if ((this.isGrouped && this.focusModel.groupList.length > 0) ||
            (!this.isGrouped && this.focusModel.data.length > 0)) {
            this.showFocus = true;

            this.$timeout(() => {
                this.focusGraphHeight = this.overviewModel.metricList.length * this.config.focusGraph.metricMaxHeight +
                    (this.overviewModel.metricList.length - 1) * this.config.focusGraph.marginBetweenMetrics;
                this.focusGraphWidth = (this.focusModel.focusedIndexList.length - 1) * this.getFocusGraphPointWidth();
                this.scope.$apply();
                this.focusModel.focusRowHeight = this.getElementByID("focusGraphRow").offsetHeight;
                this.setFocusFromAndToDate();
                this.positionFocusFromAndToDate();
                this.drawFocusGraphData();
                this.autoSrollFocusGraph();
            });
        } else {
            this.showFocus = false;
        }
    }

    getFocusGraphPointWidth() {
        return this.isGrouped ? this.config.focusGraph.groupedPointWidth : this.config.focusGraph.ungroupedPointWidth;
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
                    if (this.isBetween(point.x, overviewMetric.focusStartX, overviewMetric.focusStartX + this.getFocusAreaSize())) {
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
        focusInstance.overviewInstance = overviewInstance;
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
            this.panel.metricList[metricIndex].colorList.forEach(() => {
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

    positionFocusFromAndToDate() {
        this.timeFontSize = this.config.overview.timeFontSize;
        this.setOverviewContextTimeFont();
        var canvasStartX = this.getElementByID("canvasCell").offsetLeft;
        var fromDateWidth = this.overviewContext.measureText(this.focusedFromDate).width;
        this.fromDateLeftMargin = canvasStartX - (fromDateWidth / 2);
        this.toDateLeftMargin = this.focusGraphWidth - fromDateWidth;
    }

    drawFocusGraphData() {
        if (this.isGrouped) {
            this.$timeout(() => {
                if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                    this.focusGraphMarkerWidth = (this.config.focusGraph.markerSize + this.config.focusGraph.marginBetweenMarkers) *
                        this.overviewModel.metricList.length;
                } else {
                    this.focusGraphMarkerWidth = this.config.focusGraph.markerSize + this.config.focusGraph.marginBetweenMarkers;
                }

                this.focusGraphMarkerHeight = this.config.focusGraph.markerSize;
                this.scope.$apply();
                this.drawGroupedFocusMarkerAndGraph();
            });
        } else {
            this.drawUngroupedFocusGraph();
        }
    }

    drawGroupedFocusMarkerAndGraph() {
        this.focusModel.groupList.forEach((group, groupIndex) => {
            group.instanceList.forEach((instance, instanceIndex) => {
                if (instanceIndex == 0 || group.showDetails) {
                    this.drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex);
                    this.drawGroupedFocusGraph(groupIndex, instance, instanceIndex);
                }
            });
        });
    }

    drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex) {
        var canvas = this.getElementByID("focusGroupMarkerCanvas-" + groupIndex + "-" + instanceIndex);
        var context = this.getCanvasContext(canvas);
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (this.groupingMode == this.enumList.groupingMode.SINGLE && group.showDetails) {
            instance.groupWithMarkerList = [];

            instance.overviewInstance.groupList.forEach((instanceGroup, instanceGroupIndex) => {
                if (instanceGroup.isSelected) {
                    instance.groupWithMarkerList.push(instanceGroup);
                    var x = (this.config.focusGraph.markerSize + this.config.focusGraph.marginBetweenMarkers) * instanceGroupIndex;
                    this.drawGroupedFocusMarkerWrapper(context, instanceGroup.color, x);
                }
            });
        } else {
            this.drawGroupedFocusMarkerWrapper(context, group.overviewGroup.color, 0);
        }
    }

    drawGroupedFocusMarkerWrapper(context, color, x) {
        context.fillStyle = color;
        context.fillRect(x, 0, this.config.focusGraph.markerSize, this.config.focusGraph.markerSize);
    }

    drawGroupedFocusGraph(groupIndex, instance, instanceIndex) {
        var canvas = this.getElementByID("focusGraphCanvas-" + groupIndex + "-" + instanceIndex);
        var context = this.getCanvasContext(canvas);
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.drawFocusGraphInstance(instance, context);
    }

    drawFocusGraphInstance(instance, context) {
        instance.metricList.forEach((metric, metricIndex) => {
            metric.layerList.forEach((layer, layerIndex) => {
                // start drawing from bottom
                var y = (this.config.focusGraph.metricMaxHeight + this.config.focusGraph.marginBetweenMetrics) * metricIndex +
                    this.config.focusGraph.metricMaxHeight;
                context.beginPath();
                context.moveTo(0, y);
                var x = 0;
                var previousX = 0;
                var previousValue = 0;

                layer.valueList.forEach((value, valueIndex) => {
                    x = this.getFocusGraphPointWidth() * valueIndex;
                    this.moveContextBasedOnValue(context, value, previousX, previousValue, layerIndex, x, y,
                        this.overviewModel.metricList[metricIndex].layerRange);
                    previousX = x;
                    previousValue = value;
                });

                context.lineTo(x, y);
                context.lineTo(this.focusModel.graphBeginX, y);
                context.closePath();
                context.fillStyle = this.panel.metricList[metricIndex].colorList[layerIndex].value;
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
        if (this.isGrouped) {
            if (this.overviewModel.hoveredGroup && this.overviewModel.hoveredGroup.isSelected) {
                var rowCount = 0;

                this.focusModel.groupList.forEach((group) => {
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

    moveMouseOnFocusGroup(group, instance) {
        if (this.groupingMode == this.enumList.groupingMode.MULTIPLE || !group.showDetails) {
            this.focusModel.overviewGroupWithIntervalList = [group.overviewGroup];
            this.startMarkerMovingInterval(group);
        } else {
            this.focusModel.overviewGroupWithIntervalList = instance.groupWithMarkerList;
            this.startMarkerMovingInterval(group);
        }
    }

    startMarkerMovingInterval(group) {
        if (this.focusModel.groupWithInterval != group) {
            this.stopInterval();
            this.focusModel.groupWithInterval = group;
            this.initialiseInterval();
        }
    }

    stopInterval() {
        if (this.currentInterval) {
            this.$interval.cancel(this.currentInterval);

            if (this.focusModel.groupWithInterval) {
                this.focusModel.groupWithInterval.markerX = 0;
                this.focusModel.groupWithInterval = null;

                this.focusModel.overviewGroupWithIntervalList.forEach((overviewGroup) => {
                    overviewGroup.markerX = 0;
                });

                this.drawSelectedGroupsMarkers();
            }
        }
    }

    stopCurrentInterval() {
        this.stopInterval();
    }

    initialiseInterval() {
        this.focusModel.markerMovingBackwards = false;
        this.focusModel.groupWithInterval.markerX = 0;

        this.currentInterval = this.$interval(() => {
            if (this.focusModel.markerMovingBackwards) {
                this.handleMarkerMovingBackwardCase();
            } else {
                this.handleMarkerMovingForwardCase();
            }

            this.focusModel.overviewGroupWithIntervalList.forEach((overviewGroup) => {
                overviewGroup.markerX = this.focusModel.groupWithInterval.markerX;
            });

            this.drawSelectedGroupsMarkers();
        }, this.config.focusArea.intervalTimer);
    }

    handleMarkerMovingBackwardCase() {
        if (this.focusModel.groupWithInterval.markerX == 0) {
            this.focusModel.markerMovingBackwards = false;
            ++this.focusModel.groupWithInterval.markerX;
        } else {
            --this.focusModel.groupWithInterval.markerX;
        }
    }

    handleMarkerMovingForwardCase() {
        if (this.focusModel.groupWithInterval.markerX == Math.round(this.config.overview.marginBetweenMarkerAndGroup / 2)) {
            this.focusModel.markerMovingBackwards = true;
            --this.focusModel.groupWithInterval.markerX;
        } else {
            ++this.focusModel.groupWithInterval.markerX;
        }
    }

    showNodes(group, event) {
        event.preventDefault();

        this.$timeout(() => {
            group.showDetails = !group.showDetails;
            this.scope.$apply();
            this.drawFocusGraphData();
        });
    }

    selectNode(instance) {
        if (this.isGrouped) {
            this.focusModel.groupList.forEach((group) => {
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

    removeMetric(metric) {
        _.remove(this.panel.metricList, (search) => {
            return search == metric;
        });
    }

    addMetric() {
        var metric = {};
        metric.colorList = [];

        for (var i = 0; i < 4; ++i) {
            var color = {};
            color.value = "#000000";
            metric.colorList.push(color);
        }

        this.panel.metricList.push(metric);
    }
}

HeatmapCtrl.templateUrl = "module.html";