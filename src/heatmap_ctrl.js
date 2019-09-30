import { MetricsPanelCtrl } from "app/plugins/sdk";
import "./heatmap.css!";
import moment from "moment";
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
        this.overviewModel.groupMarkerList = [];
        this.focusModel = {};
        this.focusModel.groupList = [];

        this.initialiseConfig();
        this.initialisePanelDefaults();
        this.initialisePredefinedMetricOptionList();
        this.initialiseMetricsColorList();

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on("data-received", this.onDataReceived.bind(this));
    }

    initialiseConfig() {
        this.config = {
            apiAddress: "http://localhost:3000/api/datasources/proxy/1/api/v1/query_range?query=",
            dateFormat: "DD/MM/YY HH:mm:ss",
            colorCount: 4,
            maxLuminanceChange: 0.8,
            marginBetweenOverviewAndFocus: 20,

            startingGreyColor: 240,
            endingGrayColor: 80,

            // determines which the order of attributes to use for sorting
            sortOrder: [0, 1, 2],
            intervalTimer: 70
        }

        this.initialiseOverviewConfig();
        this.initialiseFocusAreaConfig();
        this.initialiseTimeIndicatorConfig()
        this.initialiseFocusGraphConfig();
    }

    initialiseOverviewConfig() {
        this.config.overview = {
            topAndBottomPadding: 20,
            metricFontSize: 12,
            timeFontSize: 10,
            marginBetweenLabelsAndOverview: 10,
            pointWidth: 1,
            ungroupedPointHeight: 1,
            groupedPointHeight: 5,
            compressedMarginBetweenMetrics: 100,
            decompressedMarginBetweenMetrics: 30,
            marginBetweenGroups: 10,
            groupBarWidth: 9,
            singleAttributeGroupSizeWidth: 1,
            multipleAttributeGroupSizeWidth: 2,
            marginBetweenMarkerAndGroup: 15,
            marginBetweenMetricAndGroupSize: 20
        }
    }

    initialiseFocusAreaConfig() {
        this.config.focusArea = {
            color: "Aqua",
            focusAreaSize: 20,
            xCrossSize: 15
        }
    }

    initialiseTimeIndicatorConfig() {
        this.config.timeIndicator = {
            color: "DarkGray"
        }
    }

    initialiseFocusGraphConfig() {
        this.config.focusGraph = {
            maxWidth: 10000,
            maxHeight: 10000,
            groupedPointWidth: 4,
            ungroupedPointWidth: 20,
            metricMaxHeight: 30,
            marginBetweenMetrics: 10,
            maxHeight: 10000,
            markerSize: 20,
            marginBetweenMarkers: 20
        }
    }

    initialisePanelDefaults() {
        this.panelDefaults = {
            predefinedMetricList: [
                {
                    name: "CPU",
                    query: "node_load1{job='node'}"
                },

                {
                    name: "Memory",
                    query: "100 - (node_memory_MemFree_bytes{job='node'} - node_memory_Cached_bytes{job='node'}) * 100 / (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'})",
                },

                {
                    name: "Disk",
                    query: "100 - (sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)', mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})) * 100 / (sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'}))",
                },

                {
                    name: "Network",
                    query: "sum by (instance) (node_network_receive_bytes_total{job='node',device!~'^(?:docker|vboxnet|veth|lo).*'})",
                },

                {
                    name: "Disk Temperature",
                    query: "sum by (instance) (smartmon_temperature_celsius_raw_value{job='node',smart_id='194'})",
                }
            ]
        };

        _.defaults(this.panel, this.panelDefaults);
        this.panel.predefinedMetricList = this.panelDefaults.predefinedMetricList;
    }

    initialisePredefinedMetricOptionList() {
        this.predefinedMetricOptionList = [];

        this.panelDefaults.predefinedMetricList.forEach((metric) => {
            this.predefinedMetricOptionList.push(metric.name);
        });
    }

    initialiseMetricsColorList() {
        this.panel.metricList.forEach((metric) => {
            metric.colorList = [];
            metric.colorList.push(metric.color);
            var luminanceChange = -this.config.maxLuminanceChange / this.config.colorCount;

            for (var i = 0; i < this.config.colorCount - 1; ++i) {
                var color = this.changeColorLuminance(metric.color, i * luminanceChange);
                metric.colorList.push(color);
            }
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

    selectPredefinedMetric(index) {
        var metric = this.panel.metricList[index];

        if (!metric.isCustom) {
            for (var i = 0; i < this.panel.predefinedMetricList.length; ++i) {
                var predefinedMetric = this.panel.predefinedMetricList[i];

                if (metric.name == predefinedMetric.name) {
                    this.panel.metricList[index] = JSON.parse(JSON.stringify(predefinedMetric));
                    break;
                }
            }
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
            groupingMode: {
                SINGLE: "1",
                MULTIPLE: "2",
            },

            timeHighlightMode: {
                POINT: "1",
                RANGE: "2"
            }
        };

        this.groupingMode = this.enumList.groupingMode.SINGLE;
        this.timeHighlightMode = this.enumList.timeHighlightMode.POINT;
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

        // focus area + overview group markers
        this.focusAreaCanvas = this.getElementByID("focusAreaCanvas");
        this.focusAreaContext = this.getCanvasContext(this.focusAreaCanvas);

        // overview time indicator
        this.overviewTimeIndicatorCanvas = this.getElementByID("overviewTimeIndicatorCanvas");
        this.overviewTimeIndicatorContext = this.getCanvasContext(this.overviewTimeIndicatorCanvas);

        // focus graph time indicator
        this.focusGraphTimeIndicatorCanvas = this.getElementByID("focusGraphTimeIndicatorCanvas");
        this.focusGraphTimeIndicatorContext = this.getCanvasContext(this.focusGraphTimeIndicatorCanvas);

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
        if (this.isUpdatingVariable) {
            this.isUpdatingVariable = false;
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
                    this.initialiseCompressedTimeIndexes();
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
            threshold.average = (threshold.max + threshold.min) / 2;
            colorMap.set(threshold, colorList[i]);
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

    isBetween(target, start, end) {
        return start <= target && target <= end;
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
        var luminanceChange = -this.config.maxLuminanceChange / metric.groupList.length;
        var originalColor = this.panel.metricList[metricIndex].colorList[0];

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

    initialiseCompressedTimeIndexes() {
        this.overviewModel.metricList.forEach((overviewMetric, metricIndex) => {
            overviewMetric.compressedTimeIndexList = [0];

            this.overviewModel.data.forEach((instance) => {
                this.initialiseInstanceCompressedTimeRangeList(instance, overviewMetric, metricIndex);
            });

            this.overviewModel.data.forEach((instance) => {
                var instanceMetric = instance.metricList[metricIndex];

                instanceMetric.compressedIndexRangeList.forEach((range) => {
                    if (!overviewMetric.compressedTimeIndexList.includes(range.end)) {
                        overviewMetric.compressedTimeIndexList.push(range.end);
                    }
                });
            });

            overviewMetric.compressedTimeIndexList.sort((first, second) => {
                return first - second;
            });
        });
    }

    initialiseInstanceCompressedTimeRangeList(instance, overviewMetric, metricIndex) {
        var instanceMetric = instance.metricList[metricIndex];
        instanceMetric.compressedIndexRangeList = [];
        var presviousRange;

        instanceMetric.data.forEach((point, pointIndex) => {
            var thresholdAverage = this.getThresholdAverage(point.value, overviewMetric.colorMap);

            if (pointIndex == 0) {
                presviousRange = this.initialiseNewCompressedTimeRange(instanceMetric, thresholdAverage);
            } else {
                if (thresholdAverage != presviousRange.value || pointIndex == instanceMetric.data.length - 1) {
                    presviousRange.end = pointIndex;

                    if (thresholdAverage != presviousRange.value) {
                        presviousRange = this.initialiseNewCompressedTimeRange(instanceMetric, thresholdAverage);
                    }
                }
            }
        });
    }

    initialiseNewCompressedTimeRange(instanceMetric, thresholdAverage) {
        var range = {};
        instanceMetric.compressedIndexRangeList.push(range);
        range.value = thresholdAverage;
        return range;
    }

    renderOverview() {
        if (this.overviewModel.data.length > 0) {
            this.clearFocusArea();
            this.drawOverview();
        }
    }

    clearFocusArea() {
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
        var marginBetweenMetrics = this.isCompressed ? this.config.overview.compressedMarginBetweenMetrics : this.config.overview.decompressedMarginBetweenMetrics;
        this.overviewModel.overviewWidth = this.config.overview.marginBetweenMarkerAndGroup * this.overviewModel.metricList.length +
            marginBetweenMetrics * (this.overviewModel.metricList.length - 1);

        // total width of overiew graph (groupsize excluded)
        if (this.isCompressed) {
            this.overviewModel.metricList.forEach((metric) => {
                this.overviewModel.overviewWidth += metric.compressedTimeIndexList.length * this.config.overview.pointWidth;
            });
        } else {
            this.overviewModel.overviewWidth += this.getMaxMetricLength() * this.overviewModel.metricList.length * this.config.overview.pointWidth;
        }

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
            this.overviewModel.overviewHeight = groupCount * (this.config.overview.groupedPointHeight + this.config.overview.marginBetweenGroups);
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
        this.overviewModel.overviewEndY = 0;
        this.setOverviewMetricStartXAndEndX();

        if (this.isGrouped) {
            this.drawGroupedOverview();
        } else {
            this.drawUngroupedOverview();
        }

        this.drawMetricLabels();
        this.drawToDateLabel();
    }

    setOverviewMetricStartXAndEndX() {
        var marginBetweenMetrics = this.isCompressed ? this.config.overview.compressedMarginBetweenMetrics : this.config.overview.decompressedMarginBetweenMetrics;

        this.overviewModel.metricList.forEach((metric, index) => {
            if (index > 0) {
                var previousMetric = this.overviewModel.metricList[index - 1];
                metric.startX = previousMetric.endX + marginBetweenMetrics;

                if (this.isGrouped) {
                    metric.startX += this.config.overview.marginBetweenMarkerAndGroup;

                    if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                        var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(previousMetric);
                        metric.startX += maxGroupSizeBarLength + this.config.overview.marginBetweenMetricAndGroupSize;
                    }
                }
            } else {
                metric.startX = this.config.overview.marginBetweenMarkerAndGroup;
            }

            if (this.isCompressed) {
                metric.endX = metric.startX + metric.compressedTimeIndexList.length * this.config.overview.pointWidth;
            } else {
                metric.endX = metric.startX + this.getMaxMetricLength() * this.config.overview.pointWidth;
            }
        });
    }

    drawGroupedOverview() {
        this.overviewModel.overviewInstanceHeight = this.config.overview.groupedPointHeight;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.overviewModel.metricList.forEach((metric, metricIndex) => {
                metric.groupList.forEach((group, groupIndex) => {
                    this.drawGroupOverviewWrapper(group, groupIndex, [metricIndex]);
                });

                this.drawMetricSeparator(metric);
            });
        } else {
            this.overviewModel.groupList.forEach((group, groupIndex) => {
                var metricIndexList = this.getAllMetricIndexList();
                this.drawGroupOverviewWrapper(group, groupIndex, metricIndexList);
            });

            this.drawMetricSeparator(this.overviewModel.metricList[this.overviewModel.metricList.length - 1]);
        }

        this.drawGroupSize();
    }

    drawGroupOverviewWrapper(group, groupIndex, metricIndexList) {
        var instance = group.instanceList[0];
        this.drawOverviewInstance(instance, groupIndex, this.config.overview.groupedPointHeight, this.config.overview.marginBetweenGroups, metricIndexList);
        group.y = instance.y;
    }

    drawOverviewInstance(instance, instanceIndex, pointHeight, marginBetweenInstances, metricIndexList) {
        instance.y = this.overviewModel.overviewStartY + instanceIndex * (pointHeight + marginBetweenInstances);
        var endY = instance.y + pointHeight;

        if (endY > this.overviewModel.overviewEndY) {
            this.overviewModel.overviewEndY = endY;
        }

        metricIndexList.forEach((metricIndex) => {
            this.drawOverviewInstancePoints(instance, metricIndex, pointHeight);
        });
    }

    drawOverviewInstancePoints(instance, metricIndex, pointHeight) {
        var overviewMetric = this.overviewModel.metricList[metricIndex];
        var instanceMetric = instance.metricList[metricIndex];

        if (this.isCompressed) {
            overviewMetric.compressedTimeIndexList.forEach((pointIndex, rangeIndex) => {
                var point = instanceMetric.data[pointIndex];

                if (point) {
                    this.drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, rangeIndex, this.config.overview.pointWidth, pointHeight);
                }
            });
        } else {
            instanceMetric.data.forEach((point, pointIndex) => {
                this.drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, pointIndex, this.config.overview.pointWidth, pointHeight);
            });
        }
    }

    drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, pointIndex, pointWidth, pointHeight) {
        point.x = overviewMetric.startX + pointIndex * pointWidth;
        point.color = this.getColorFromMap(point.value, this.overviewModel.metricList[metricIndex].colorMap);
        this.overviewContext.fillStyle = point.color;
        this.overviewContext.fillRect(point.x, instance.y, pointWidth, pointHeight);
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
        var startY = this.overviewModel.overviewStartY +
            groupIndex * (this.config.overview.groupedPointHeight + this.config.overview.marginBetweenGroups);
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
        var startX = this.overviewModel.overviewWidth + this.config.overview.decompressedMarginBetweenMetrics;
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

    drawMetricSeparator(metric) {
        this.overviewContext.strokeStyle = "gray";
        var x = metric.endX + this.config.overview.decompressedMarginBetweenMetrics / 2;

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

    drawUngroupedOverview() {
        this.overviewModel.overviewInstanceHeight = this.config.overview.ungroupedPointHeight;

        this.overviewModel.data.forEach((instance, instanceIndex) => {
            var metricIndexList = this.getAllMetricIndexList();
            this.drawOverviewInstance(instance, instanceIndex, this.config.overview.ungroupedPointHeight, 0, metricIndexList);
        });

        if (!this.isCompressed) {
            this.drawGroupBars();
        }
    }

    drawGroupBars() {
        for (var i = 1; i < this.overviewModel.metricList.length; ++i) {
            var x = this.overviewModel.metricList[i].startX - this.config.overview.decompressedMarginBetweenMetrics / 2;
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

    drawToDateLabel() {
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

    compressDecompress() {
        this.isCompressed = !this.isCompressed;
        this.drawOverview();
        this.clearFocusArea();
    }

    selectTimeHighlightMode() {
        this.clearTimeIndicator();

        if (this.overviewModel.groupList) {
            this.overviewModel.groupList.forEach((group) => {
                group.timeRangeIndexList = [];
            });
        }

        if (this.overviewModel.metricList) {
            this.overviewModel.metricList.forEach((metric) => {
                metric.groupList.forEach((group) => {
                    group.timeRangeIndexList = [];
                });
            });
        }
    }

    clearTimeIndicator() {
        this.overviewTimeIndicatorContext.clearRect(0, 0, this.overviewTimeIndicatorCanvas.width, this.overviewTimeIndicatorCanvas.height);
    }

    mouseDownOnOverview(evt) {
        if (this.isGrouped && this.overviewModel.hoveredGroup && this.timeHighlightMode == this.enumList.timeHighlightMode.RANGE) {
            this.overviewModel.isSelectingTimeRange = true;
            this.overviewModel.timeRangeStartOffset = this.overviewModel.mousePositionXOffset;
            this.overviewModel.timeRangeGroup = this.overviewModel.hoveredGroup;
        }
    }

    moveMouseOnOverview(evt) {
        this.setOverviewMousePosition(evt);

        if (this.isGrouped) {
            this.initialiseOverviewCanvasCursor();
            this.overviewModel.hoveredGroup = null;
            this.overviewModel.hoveredMarker = null;
            this.checkAndSetSelectedOverviewMarker();
            this.checkMouseIsOnGroupAndSetHoveredGroup();

            if (this.timeHighlightMode == this.enumList.timeHighlightMode.POINT) {
                if (this.overviewModel.hoveredGroup) {
                    this.drawTimeIndicators();
                } else {
                    this.clearTimeIndicator();
                }
            } else if (this.overviewModel.isSelectingTimeRange) {
                this.initialiseSelectedGroupTimeRangeIndexList();
                this.drawSelectedTimeRanges();
            }
        } else if (!this.isCompressed && !this.focusAreaIsFixed) {
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

    checkMouseIsOnGroupAndSetHoveredGroup() {
        for (var metricIndex = 0; metricIndex < this.overviewModel.metricList.length; ++metricIndex) {
            var metric = this.overviewModel.metricList[metricIndex];

            if (metric) {
                // only check if mouse is on a metric graph
                if (this.isBetween(this.overviewModel.mousePosition.x, metric.startX, metric.endX)) {
                    this.overviewModel.selectedMetricIndex = metricIndex;
                    this.overviewModel.mousePositionXOffset = this.overviewModel.mousePosition.x - metric.startX;

                    if (this.checkAndSetHoveredGroup(metric)) {
                        return;
                    }
                }
            }
        }
    }

    checkAndSetHoveredGroup(metric) {
        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            for (var i = 0; i < metric.groupList.length; ++i) {
                var group = metric.groupList[i];

                if (this.checkGroupIsHovered(group)) {
                    return true;
                }
            }
        } else {
            for (var i = 0; i < this.overviewModel.groupList.length; ++i) {
                var group = this.overviewModel.groupList[i];

                if (this.checkGroupIsHovered(group)) {
                    return true;
                }
            }
        }

        return false;
    }

    checkGroupIsHovered(group) {
        if (this.isBetween(this.overviewModel.mousePosition.y, group.y, group.y + this.config.overview.groupedPointHeight)) {
            this.overviewModel.hoveredGroup = group;
            this.overviewCursor = "pointer";
            return true;
        }
    }

    checkAndSetSelectedOverviewMarker() {
        for (var markerIndex = 0; markerIndex < this.overviewModel.groupMarkerList.length; ++markerIndex) {
            var marker = this.overviewModel.groupMarkerList[markerIndex];

            if (this.isBetween(this.overviewModel.mousePosition.x, marker.startX, marker.endX) &&
                this.isBetween(this.overviewModel.mousePosition.y, marker.startY, marker.endY)) {
                this.overviewCursor = "pointer";
                this.overviewModel.hoveredMarker = marker;
                return;
            }
        }
    }

    drawTimeIndicators() {
        this.clearTimeIndicator();
        this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.drawTimeIndicatorWrapper(this.overviewModel.metricList[this.overviewModel.selectedMetricIndex]);
        } else {
            this.overviewModel.metricList.forEach((metric) => {
                this.drawTimeIndicatorWrapper(metric);
            });
        }

        this.drawSelectedTimeLabel();
    }

    drawTimeIndicatorWrapper(metric) {
        var horizontalLineY = this.drawHorizontalTimeLine(metric, this.overviewModel.hoveredGroup);
        this.drawSelectedTimePoint(metric, horizontalLineY);
    }

    drawHorizontalTimeLine(metric, group) {
        var horizontalLineY = group.y - this.config.overview.marginBetweenGroups / 2;
        this.overviewTimeIndicatorContext.beginPath();
        this.overviewTimeIndicatorContext.moveTo(metric.startX, horizontalLineY);
        this.overviewTimeIndicatorContext.lineTo(metric.endX, horizontalLineY);
        this.overviewTimeIndicatorContext.stroke();
        this.overviewTimeIndicatorContext.closePath();
        return horizontalLineY;
    }

    drawSelectedTimePoint(metric, horizontalLineY) {
        var verticalLineX = metric.startX + this.overviewModel.mousePositionXOffset;
        this.overviewTimeIndicatorContext.beginPath();
        this.overviewTimeIndicatorContext.moveTo(verticalLineX, horizontalLineY);
        this.overviewTimeIndicatorContext.lineTo(verticalLineX, this.overviewModel.hoveredGroup.y);
        this.overviewTimeIndicatorContext.stroke();
        this.overviewTimeIndicatorContext.closePath();
    }

    drawSelectedTimeLabel() {
        for (var metricIndex = 0; metricIndex < this.overviewModel.metricList.length; ++metricIndex) {
            var instanceMetric = this.overviewModel.hoveredGroup.instanceList[0].metricList[metricIndex];
            var overviewMetric = this.overviewModel.metricList[metricIndex];

            if (this.isCompressed) {
                for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                    var point = instanceMetric.data[overviewMetric.compressedTimeIndexList[compressedTimeIndex]];

                    if (this.checkDataPointIsSelectedAndDrawTimeLabel(point, this.config.overview.pointWidth)) {
                        return;
                    }
                }
            } else {
                for (var compressedTimeIndex = 0; compressedTimeIndex < instanceMetric.data.length; ++compressedTimeIndex) {
                    var point = instanceMetric.data[compressedTimeIndex];

                    if (this.checkDataPointIsSelectedAndDrawTimeLabel(point, this.config.overview.pointWidth)) {
                        return;
                    }
                }
            }
        }
    }

    checkDataPointIsSelectedAndDrawTimeLabel(point, pointWidth) {
        if (this.isBetween(this.overviewModel.mousePosition.x, point.x, point.x + pointWidth)) {
            this.overviewTimeIndicatorContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
            this.overviewTimeIndicatorContext.fillStyle = "black";
            var date = this.getDateString(point.date * 1000);
            var y = this.overviewModel.overviewStartY + this.overviewModel.overviewHeight + this.config.overview.marginBetweenLabelsAndOverview;
            var x = Math.max(0, this.overviewModel.mousePosition.x - this.overviewModel.toDateWidth / 2);
            this.overviewTimeIndicatorContext.fillText(date, x, y);
            return true;
        } else {
            return false;
        }
    }

    initialiseSelectedGroupTimeRangeIndexList() {
        this.overviewModel.timeRangeGroup.timeRangeMetricIndex = this.overviewModel.selectedMetricIndex;
        this.overviewModel.timeRangeGroup.timeRangeIndexList = [];
        var instanceMetric = this.overviewModel.timeRangeGroup.instanceList[0].metricList[this.overviewModel.selectedMetricIndex];
        var overviewMetric = this.overviewModel.metricList[this.overviewModel.selectedMetricIndex];
        var startX = overviewMetric.startX + this.overviewModel.timeRangeStartOffset;
        var endX = overviewMetric.startX + this.overviewModel.mousePositionXOffset;

        if (startX > endX) {
            var temp = startX;
            startX = endX;
            endX = temp;
        }

        instanceMetric.data.forEach((point, pointIndex) => {
            if (this.isBetween(point.x, startX, endX)) {
                this.overviewModel.timeRangeGroup.timeRangeIndexList.push(pointIndex);
            }
        });
    }

    drawSelectedTimeRanges() {
        this.clearTimeIndicator();
        this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;
        this.overviewTimeIndicatorContext.fillStyle = this.config.timeIndicator.color;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.overviewModel.metricList.forEach((metric) => {
                metric.groupList.forEach((group) => {
                    this.drawSelectedTimeRangeWrapper(group, [group.timeRangeMetricIndex]);
                });
            });
        } else {
            this.overviewModel.groupList.forEach((group) => {
                this.drawSelectedTimeRangeWrapper(group, Array.from(Array(this.overviewModel.metricList.length).keys()));
            });
        }
    }

    drawSelectedTimeRangeWrapper(group, metricIndexList) {
        if (group.timeRangeIndexList && group.timeRangeIndexList.length > 0) {
            metricIndexList.forEach((metricIndex) => {
                var instanceMetric = group.instanceList[0].metricList[metricIndex];
                var startPoint = instanceMetric.data[group.timeRangeIndexList[0]];

                if (startPoint) {
                    var overviewMetric = this.overviewModel.metricList[metricIndex];
                    var startY = this.drawHorizontalTimeLine(overviewMetric, group);
                    var endIndex = group.timeRangeIndexList[group.timeRangeIndexList.length - 1];
                    var startX = startPoint.x;
                    var endX = instanceMetric.data[endIndex].x + this.config.overview.pointWidth;
                    var width = endX - startX;
                    var height = group.y - startY;
                    this.overviewTimeIndicatorContext.fillRect(startX, startY, width, height);
                }
            });
        }
    }

    mouseUpOnOverView(evt) {
        if (this.isGrouped) {
            if (this.overviewModel.hoveredMarker) {
                this.startFocusMarkerInterval(this.overviewModel.hoveredMarker.group);
            } else {
                this.updateSelectedGroupListAndDrawFocusGraph();
            }
        } else if (!this.isCompressed) {
            this.fixFocusArea(evt);
        }
    }

    updateSelectedGroupListAndDrawFocusGraph() {
        this.$timeout(() => {
            var updatedSelectedGroups = false;

            if (this.timeHighlightMode == this.enumList.timeHighlightMode.POINT) {
                if (this.overviewModel.hoveredGroup) {
                    this.addOrRemoveGroupToFocus(this.overviewModel.hoveredGroup, true);
                    updatedSelectedGroups = true;
                } else {
                    this.stopInterval();
                }
            } else if (this.overviewModel.isSelectingTimeRange) {
                var removeExisting = this.overviewModel.timeRangeStartOffset == this.overviewModel.mousePositionXOffset;
                this.addOrRemoveGroupToFocus(this.overviewModel.timeRangeGroup, removeExisting);
                updatedSelectedGroups = true;
            }

            this.scope.$apply();

            if (updatedSelectedGroups) {
                this.drawSelectedGroupsMarkers();
                this.drawFocusGraph();
            }

            this.overviewModel.isSelectingTimeRange = false;
        });
    }

    addOrRemoveGroupToFocus(group, removeExisting) {
        var focusGroup = _.find(this.focusModel.groupList, (search) => {
            return search.overviewGroup == group;
        })

        if (focusGroup) {
            if (removeExisting) {
                group.isSelected = false;

                _.remove(this.focusModel.groupList, (search) => {
                    return search.overviewGroup == group;
                });
            }
        } else {
            group.isSelected = true;
            this.addGroupToFocus(group);
        }
    }

    addGroupToFocus(group) {
        var focusGroup = {};
        focusGroup.instanceList = [];
        focusGroup.overviewGroup = group;

        group.instanceList.forEach((overviewInstance) => {
            var metricWithMostData = _.maxBy(overviewInstance.metricList, (metric) => {
                return metric.data.length;
            });

            this.focusModel.focusedIndexList = Array.from(Array(metricWithMostData.data.length).keys());
            var focusInstance = this.getFocusInstance(overviewInstance, this.focusModel.focusedIndexList);
            focusGroup.instanceList.push(focusInstance);
        });

        this.focusModel.groupList.push(focusGroup);
    }

    getFocusInstance(overviewInstance, indexList) {
        var focusInstance = {};
        focusInstance.instance = overviewInstance.instance;
        focusInstance.overviewInstance = overviewInstance;
        this.initialiseFocusInstanceData(focusInstance, overviewInstance, indexList);
        return focusInstance;
    }

    drawSelectedGroupsMarkers() {
        this.clearFocusArea();
        this.overviewModel.groupMarkerList = [];

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
                var marker = {};
                marker.group = group;
                marker.startX = metric.startX - this.config.overview.marginBetweenMarkerAndGroup + group.markerX;
                marker.endX = marker.startX + this.config.overview.groupedPointHeight;
                marker.startY = group.y;
                marker.endY = marker.startY + this.config.overview.groupedPointHeight;
                this.focusAreaContext.fillStyle = group.color;
                this.focusAreaContext.fillRect(marker.startX, marker.startY, this.config.overview.groupedPointHeight, this.config.overview.groupedPointHeight);
                this.overviewModel.groupMarkerList.push(marker);
            });
        }
    }

    startFocusMarkerInterval(group) {
        if (this.focusGroupWithInterval != group) {
            this.stopInterval();
            this.focusGroupWithInterval = group;
            this.initialiseFocusMarkerInterval();
        }
    }

    stopInterval() {
        this.stopOverviewMarkerInterval();
        this.stopFocusMarkerInterval();
    }

    stopOverviewMarkerInterval() {
        if (this.currentOverviewMarkerInterval) {
            this.$interval.cancel(this.currentOverviewMarkerInterval);

            if (this.overviewGroupWithInterval) {
                this.overviewGroupWithInterval.overviewMarkerX = 0;

                if (this.focusModel.overviewGroupWithIntervalList) {
                    this.focusModel.overviewGroupWithIntervalList.forEach((overviewGroup) => {
                        overviewGroup.markerX = 0;
                    });
                }

                this.drawSelectedGroupsMarkers();
            }

            this.overviewGroupWithInterval = null;
        }
    }

    stopFocusMarkerInterval() {
        if (this.currentFocusMarkerInterval) {
            this.$interval.cancel(this.currentFocusMarkerInterval);

            if (this.focusGroupWithInterval) {
                this.focusGroupWithInterval.focusMarkerX = 0;
                this.focusGroupWithInterval = null;
                this.drawGroupFocusMarkers();
            }
        }
    }

    initialiseFocusMarkerInterval() {
        this.focusMarkerMovingBackwards = false;
        this.focusGroupWithInterval.focusMarkerX = 0;

        this.currentFocusMarkerInterval = this.$interval(() => {
            if (this.focusMarkerMovingBackwards) {
                this.handleFocusMarkerMovingBackwardCase();
            } else {
                this.handleFocusMarkerMovingForwardCase();
            }

            this.drawGroupFocusMarkers();
        }, this.config.intervalTimer);
    }

    handleFocusMarkerMovingBackwardCase() {
        if (this.focusGroupWithInterval.focusMarkerX == 0) {
            this.focusMarkerMovingBackwards = false;
            ++this.focusGroupWithInterval.focusMarkerX;
        } else {
            --this.focusGroupWithInterval.focusMarkerX;
        }
    }

    handleFocusMarkerMovingForwardCase() {
        if (this.focusGroupWithInterval.focusMarkerX == Math.round(this.config.focusGraph.marginBetweenMarkers / 2)) {
            this.focusMarkerMovingBackwards = true;
            --this.focusGroupWithInterval.focusMarkerX;
        } else {
            ++this.focusGroupWithInterval.focusMarkerX;
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
            this.clearFocusArea();
            var size = this.getFocusAreaSize();
            var minimumTopY = Math.max(this.overviewModel.overviewStartY, this.overviewModel.mousePosition.y - size / 2);
            this.focusModel.focusStartY = Math.min(minimumTopY, this.overviewModel.overviewEndY - size);
            var size = this.getFocusAreaSize();
            var offset = this.getFocusAreaOffset();

            if (offset >= 0) {
                this.focusAreaContext.strokeStyle = this.config.focusArea.color;

                this.overviewModel.metricList.forEach((metric) => {
                    metric.focusStartX = metric.startX + offset;
                    this.focusAreaContext.strokeRect(metric.focusStartX, this.focusModel.focusStartY, size, size);
                });
            }
        }
    }

    getFocusAreaSize() {
        return Math.min(this.config.focusArea.focusAreaSize * 2, this.overviewModel.overviewEndY - this.overviewModel.overviewStartY);
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

                var focusGraphRow = this.getElementByID("focusGraphRow");

                if (focusGraphRow) {
                    this.focusModel.focusRowHeight = focusGraphRow.offsetHeight;
                    this.setFocusFromAndToDate();
                    this.positionFocusFromAndToDate();
                    this.drawFocusGraphData();
                    this.autoSrollFocusGraph();
                }
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
                this.drawGroupFocusMarkers();
                this.drawGroupedFocusGraph();
            });
        } else {
            this.drawUngroupedFocusGraph();
        }
    }

    drawGroupFocusMarkers() {
        this.focusModel.groupList.forEach((group, groupIndex) => {
            group.instanceList.forEach((instance, instanceIndex) => {
                if (instanceIndex == 0 || group.showDetails) {
                    this.drawGroupedFocusMarker(group, groupIndex, instance, instanceIndex);
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
                    this.drawGroupedFocusMarkerWrapper(context, instanceGroup, x);
                }
            });
        } else {
            this.drawGroupedFocusMarkerWrapper(context, group.overviewGroup, 0);
        }
    }

    drawGroupedFocusMarkerWrapper(context, group, x) {
        if (group == this.focusGroupWithInterval) {
            x += this.focusGroupWithInterval.focusMarkerX;
        }

        context.fillStyle = group.color;
        context.fillRect(x, 0, this.config.focusGraph.markerSize, this.config.focusGraph.markerSize);
    }

    drawGroupedFocusGraph() {
        this.focusModel.groupList.forEach((group, groupIndex) => {
            group.instanceList.forEach((instance, instanceIndex) => {
                if (instanceIndex == 0 || group.showDetails) {
                    this.drawGroupedFocusGraphWrapper(group, groupIndex, instance, instanceIndex);
                }
            });
        });
    }

    drawGroupedFocusGraphWrapper(group, groupIndex, instance, instanceIndex) {
        // full time range
        var canvas = this.getElementByID("focusGraphCanvas-" + groupIndex + "-" + instanceIndex);
        var maxMetricLength = this.getMaxMetricLength();
        this.drawGroupedFocusGraphInstance(canvas, instance, Array.from(Array(maxMetricLength).keys()));

        // selected time range
        if (group.overviewGroup.timeRangeIndexList) {
            var canvas = this.getElementByID("focusGraphHighlightedTimeRangeCanvas-" + groupIndex + "-" + instanceIndex);
            this.drawGroupedFocusGraphInstance(canvas, instance, group.overviewGroup.timeRangeIndexList);
        }
    }

    drawGroupedFocusGraphInstance(canvas, instance, valueIndexList) {
        var context = this.getCanvasContext(canvas);
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.drawFocusGraphInstance(instance, context, valueIndexList);
    }

    drawFocusGraphInstance(instance, context, valueIndexList) {
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

                valueIndexList.forEach((valueIndex, positionIndex) => {
                    var value = layer.valueList[valueIndex];

                    if (value != undefined) {
                        x = this.getFocusGraphPointWidth() * positionIndex;
                        this.moveContextBasedOnValue(context, value, previousX, previousValue, layerIndex, x, y,
                            this.overviewModel.metricList[metricIndex].layerRange);
                        previousX = x;
                        previousValue = value;
                    }
                });

                context.lineTo(x, y);
                context.lineTo(this.focusModel.graphBeginX, y);
                context.closePath();
                context.fillStyle = this.panel.metricList[metricIndex].colorList[layerIndex];
                context.fill();
            });
        });
    }

    drawUngroupedFocusGraph() {
        this.focusModel.data.forEach((instance, instanceIndex) => {
            var canvas = this.getElementByID("focusGraphCanvas-" + instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);
            this.drawFocusGraphInstance(instance, context, Array.from(Array(this.getMaxMetricLength()).keys()));
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
        var instance = this.getHoveredInstance();

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

    getHoveredInstance() {
        for (var i = 0; i < this.overviewModel.data.length; ++i) {
            var instance = this.overviewModel.data[i];

            if (this.isBetween(this.overviewModel.mousePosition.y, instance.y - this.config.overview.ungroupedPointHeight, instance.y)) {
                return instance;
            }
        }
    }

    moveMouseOnFocusGroup(group, instance) {
        if (this.groupingMode == this.enumList.groupingMode.MULTIPLE || !group.showDetails) {
            this.focusModel.overviewGroupWithIntervalList = [group.overviewGroup];
            this.startOverviewMarkerInterval(group);
        } else {
            this.focusModel.overviewGroupWithIntervalList = instance.groupWithMarkerList;
            this.startOverviewMarkerInterval(group);
        }
    }

    startOverviewMarkerInterval(group) {
        if (this.overviewGroupWithInterval != group) {
            this.stopInterval();
            this.overviewGroupWithInterval = group;
            this.initialiseOverviewMarkerInterval();
        }
    }

    initialiseOverviewMarkerInterval() {
        this.overviewMarkerMovingBackwards = false;
        this.overviewGroupWithInterval.overviewMarkerX = 0;

        this.currentOverviewMarkerInterval = this.$interval(() => {
            if (this.overviewMarkerMovingBackwards) {
                this.handleOverviewMarkerMovingBackwardCase();
            } else {
                this.handleOverviewMarkerMovingForwardCase();
            }

            if (this.focusModel.overviewGroupWithIntervalList) {
                this.focusModel.overviewGroupWithIntervalList.forEach((overviewGroup) => {
                    overviewGroup.markerX = this.overviewGroupWithInterval.overviewMarkerX;
                });
            }

            this.drawSelectedGroupsMarkers();
        }, this.config.intervalTimer);
    }

    handleOverviewMarkerMovingBackwardCase() {
        if (this.overviewGroupWithInterval.overviewMarkerX == 0) {
            this.overviewMarkerMovingBackwards = false;
            ++this.overviewGroupWithInterval.overviewMarkerX;
        } else {
            --this.overviewGroupWithInterval.overviewMarkerX;
        }
    }

    handleOverviewMarkerMovingForwardCase() {
        if (this.overviewGroupWithInterval.overviewMarkerX == Math.round(this.config.overview.marginBetweenMarkerAndGroup / 2)) {
            this.overviewMarkerMovingBackwards = true;
            --this.overviewGroupWithInterval.overviewMarkerX;
        } else {
            ++this.overviewGroupWithInterval.overviewMarkerX;
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
        metric.color = "#000000";
        this.panel.metricList.push(metric);
    }
}

HeatmapCtrl.templateUrl = "module.html";