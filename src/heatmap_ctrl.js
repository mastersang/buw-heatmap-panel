import { MetricsPanelCtrl } from "app/plugins/sdk";
import "./heatmap.css!";
import moment from "moment";
import _ from "lodash";

export class HeatmapCtrl extends MetricsPanelCtrl {
    constructor($scope, $injector, $timeout, $interval, variableSrv, timeSrv) {
        super($scope, $injector);
        this.scope = $scope;
        this.$timeout = $timeout;
        this.$interval = $interval;
        this.variableSrv = variableSrv;
        this.timeSrv = timeSrv;

        this.initialiseConfig();
        this.initialisePanelDefaults();
        this.initialisePredefinedMetricOptionList();
        this.initialiseMetricsColorList();
        this.initialiseStartingVariables();

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on("data-received", this.onDataReceived.bind(this));
    }

    initialiseConfig() {
        this.initialiseGeneralConfig();
        this.initialiseOverviewConfig();
        this.initialiseFocusAreaConfig();
        this.initialiseHistogramConfig();
        this.initialiseTimeIndicatorConfig()
        this.initialiseHistogramConfig();
        this.initialiseFocusGraphConfig();
    }

    initialiseGeneralConfig() {
        this.config = {
            apiAddress: "http://localhost:3000/api/datasources/proxy/1/api/v1/query_range?query=",
            dateFormat: "DD/MM/YY HH:mm:ss",
            colorCount: 4,
            maxLuminanceChange: 0.8,
            marginBetweenOverviewAndFocus: 20,
            groupingThresholdCount: 50,
            startingGreyColor: 240,
            endingGrayColor: 80,
            intervalTimer: 70
        }
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
            decompressedMarginBetweenMetrics: 25,
            marginBetweenGroups: 10,
            groupSizeBarWidth: 1,
            pieRadius: 8,
            marginBetweenMarkerAndGroup: 15,
            marginBetweenMetricAndGroupSize: 30,
            groupSizeColor: "lightgray",
            overlapColor: "black",
            selectedInstancesForFocusOffset: 10
        }
    }

    initialiseFocusAreaConfig() {
        this.config.focusArea = {
            color: "Aqua"
        }
    }

    initialiseTimeIndicatorConfig() {
        this.config.timeIndicator = {
            color: "DarkGray"
        }
    }

    initialiseHistogramConfig() {
        this.config.histogram = {
            marginBetweenAxesAndNumbers: 20,
            verticalAxisLength: 500,
            barWidth: 5,
            minimumBarHeight: 2,
            marginBetweenSliderAndChart: 50,
            thresholdBarLength: 10
        }
    }

    initialiseFocusGraphConfig() {
        this.config.focusGraph = {
            groupedPointWidth: 5,
            ungroupedPointWidth: 40,
            metricMaxHeight: 20,
            marginBetweenMetrics: 10,
            maxWidth: 1200,
            markerSize: 20,
            marginBetweenMarkers: 20
        }
    }

    initialisePanelDefaults() {
        this.panelDefaults = {
            predefinedMetricList: [
                {
                    name: "CPU",
                    unit: "%",
                    //    query: "node_load1{job='node'}) * 100 / count by (instance) (count by (instance, cpu) (node_cpu_seconds_total{job='node'}))"
                    query: "node_load1{job='node'}"
                },

                {
                    name: "Memory",
                    unit: "%",
                    query: "100 - (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'} - node_memory_MemFree_bytes{job='node'} - node_memory_Cached_bytes{job='node'}) * 100 / (node_memory_MemTotal_bytes{job='node'} + node_memory_Buffers_bytes{job='node'})",
                },

                {
                    name: "Disk",
                    unit: "%",
                    query: "100 - (sum by (instance) (node_filesystem_avail_bytes{job='node',device!~'(?:rootfs|/dev/loop.+)', mountpoint!~'(?:/mnt/nfs/|/run|/var/run|/cdrom).*'})) * 100 / (sum by (instance) (node_filesystem_size_bytes{job='node',device!~'rootfs'}))",
                },

                {
                    name: "Network",
                    unit: "MiB",
                    query: "sum by (instance) (rate(node_network_receive_bytes_total{job='node',device!~'^(?: docker | vboxnet | veth | lo).*'}[5m])) / 1048576",
                },

                {
                    name: "Disk Temperature",
                    unit: "°C",
                    query: "avg by (instance) (smartmon_temperature_celsius_raw_value{job='node',smart_id='194'})",
                }
            ]
        };

        // this.panel.predefinedMetricList = this.panelDefaults.predefinedMetricList;
        //   this.panel.metricList = this.panel.predefinedMetricList;
        _.defaults(this.panel, this.panelDefaults);

        if (!this.panel.metricList) {
            this.panel.metricList = this.panel.predefinedMetricList;
        }
    }

    initialisePredefinedMetricOptionList() {
        this.predefinedMetricOptionList = [];

        this.panelDefaults.predefinedMetricList.forEach((metric) => {
            this.predefinedMetricOptionList.push(metric.name);
        });
    }

    initialiseMetricsColorList() {
        if (this.panel.metricList) {
            this.panel.metricList.forEach((metric) => {
                this.initialiseColorListByMetric(metric);
            });
        }
    }

    initialiseColorListByMetric(metric) {
        // add lightest shade as defined by user
        metric.colorList = [];
        metric.colorList.push(metric.color);
        var luminanceChange = -this.config.maxLuminanceChange / this.config.colorCount;

        // add the other shades
        for (var i = 1; i < this.config.colorCount; ++i) {
            var color = this.changeColorLuminance(metric.color, i * luminanceChange);
            metric.colorList.push(color);
        }
    }

    initialiseStartingVariables() {
        this.firstLoad = true;
        this.overviewModel = {};
        this.histogramModel = {};
        this.focusAreaModel = {};
        this.overviewModel.groupMarkerList = [];
        this.focusModel = {};
        this.focusModel.groupList = [];
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

            groupSizeChart: {
                HORIZONTAL_BAR: "1",
                PIE: "2",
            },

            timeHighlightMode: {
                POINT: "1",
                RANGE: "2"
            }
        };

        this.groupingMode = this.enumList.groupingMode.SINGLE;
        this.groupSizeChart = this.enumList.groupSizeChart.HORIZONTAL_BAR;
        this.groupingThreshold = 0;
        this.timeHighlightMode = this.enumList.timeHighlightMode.POINT;
        this.initialiseOverviewCanvasCursor();
    }

    initialiseOverviewCanvasCursor() {
        this.overviewCursor = this.isGrouped ? "default" : "crosshair";
    }

    initialiseUIElements() {
        // overview
        this.overviewCanvas = this.getElementByID("overviewCanvas");
        this.overviewContext = this.getCanvasContext(this.overviewCanvas);

        // focus area + overview group markers
        this.focusAreaCanvas = this.getElementByID("focusAreaCanvas");
        this.focusAreaContext = this.getCanvasContext(this.focusAreaCanvas);

        // histogram
        this.histogramCanvas = this.getElementByID("histogramCanvas");
        this.histogramCanvasContext = this.getCanvasContext(this.histogramCanvas);

        // overview time indicator
        this.overviewTimeIndicatorCanvas = this.getElementByID("overviewTimeIndicatorCanvas");
        this.overviewTimeIndicatorContext = this.getCanvasContext(this.overviewTimeIndicatorCanvas);

        // focus graph
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
        this.load();
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
                    this.initialiseOverviewData();
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
                    value[1] = Math.round(parseFloat(value[1]));
                });
            });
        });
    }

    initialiseMetricMinMaxTotal() {
        this.overviewModel.metricList.forEach((metric, metricIndex) => {
            metric.min = -1;
            metric.max = -1;

            metric.data.forEach((instance) => {
                instance.values.forEach((point) => {
                    this.checkAndSetOverviewMinMax(metric, point);
                });

                if (metricIndex == 0 && metric.max > 100) {
                    console.log(instance.metric.instance);
                }
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
        this.overviewModel.metricList.forEach((overviewMetric, index) => {
            var panelMetric = this.panel.metricList[index];
            this.initialiseColorMapByMetric(overviewMetric, panelMetric);
        });
    }

    initialiseColorMapByMetric(overviewMetric, panelMetric) {
        var colorList = panelMetric.colorList;
        overviewMetric.layerRange = Math.round(overviewMetric.max / colorList.length);

        // map a range of values to a color
        overviewMetric.colorMap = this.getColorMap(overviewMetric, colorList);
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

    initialiseOverviewData() {
        this.overviewModel.data = [];
        this.populateOverviewDataAndInitialiseHistogramData();
        this.calculateInstanceMetricTotalMinMax();
        this.sortOverviewData();
    }

    populateOverviewDataAndInitialiseHistogramData() {
        this.overviewModel.metricList.forEach((metric, metricIndex) => {
            metric.histogram = {};
            metric.histogram.data = new Map();

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

                    if (metric.histogram.data.has(point.value)) {
                        var occurences = metric.histogram.data.get(point.value);
                        metric.histogram.data.set(point.value, occurences + 1);
                    } else {
                        metric.histogram.data.set(point.value, 1);
                    }
                });
            });

            metric.histogram.data = new Map([...metric.histogram.data].sort((first, second) => {
                return first[0] - second[0];
            }));

            this.setHistogramMinMax(metric.histogram);
        });
    }

    setHistogramMinMax(histogram) {
        histogram.min = -1;
        histogram.max = -1;

        histogram.data.forEach((occurences, value) => {
            if (histogram.min == -1) {
                histogram.min = occurences;
                histogram.max = occurences;
            } else {
                if (histogram.min > occurences) {
                    histogram.min = occurences;
                }

                if (histogram.max < occurences) {
                    histogram.max = occurences;
                }
            }
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
                    //    metric.total += this.getThresholdAverage(point.value, this.overviewModel.metricList[metricIndex].colorMap);
                    metric.total += point.value;

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
            for (var i = 0; i < first.metricList.length; ++i) {
                if (first.metricList[i].total != second.metricList[i].total) {
                    return first.metricList[i].total - second.metricList[i].total;
                }
            }

            return 0;
        });
    }

    initialiseOverviewGroups() {
        this.initialiseSingleMetricGroups();
        this.initialiseMultiMetricGroups();
    }

    initialiseSingleMetricGroups() {
        this.overviewModel.metricList.forEach((metric, metricIndex) => {
            this.initialiseSingleMetricGroupsByMetric(metric, metricIndex);
            this.initialiseSingleMetricGroupsColor(metric, metricIndex);
        });

        this.initialiseSingleMetricInstanceGroupList();
    }

    initialiseSingleMetricGroupsByMetric(metric, metricIndex) {
        metric.thresholdGroupListMap = new Map();

        for (var groupingThreshold = 0; groupingThreshold <= this.config.groupingThresholdCount; ++groupingThreshold) {
            var groupList = [];
            this.populateSingleMetricGroupList(groupList, metricIndex, groupingThreshold);

            groupList.sort((first, second) => {
                return first.total - second.total;
            });

            for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
                var group = groupList[groupIndex];
                group.name = this.panel.metricList[metricIndex].name + " group " + (groupIndex + 1);
            }

            metric.thresholdGroupListMap.set(groupingThreshold, groupList);
        }
    }

    populateSingleMetricGroupList(groupList, metricIndex, groupingThreshold) {
        this.overviewModel.data.forEach((instance) => {
            var group = _.find(groupList, (search) => {
                return this.checkInstanceIsInGroup(search.total, instance.metricList[metricIndex].total, groupingThreshold);
            });

            if (!group) {
                group = this.initialiseNewSingleMetricGroup(instance, metricIndex);
                groupList.push(group);
            }

            group.instanceList.push(instance);
        });
    }

    checkInstanceIsInGroup(groupTotal, instanceTotal, groupingThreshold) {
        var thresholdValue = groupingThreshold * 0.01;
        var min = groupTotal * (1 - thresholdValue);
        var max = groupTotal * (1 + thresholdValue);
        return this.isBetween(instanceTotal, min, max);
    }

    initialiseNewSingleMetricGroup(instance, metricIndex) {
        var group = {};
        group.metricIndex = metricIndex;
        group.instanceList = [];
        group.markerX = 0;
        group.total = instance.metricList[metricIndex].total;
        return group;
    }

    initialiseSingleMetricGroupsColor(metric, metricIndex) {
        var originalColor = this.panel.metricList[metricIndex].colorList[0];

        metric.thresholdGroupListMap.forEach((groupList) => {
            var luminanceChange = -this.config.maxLuminanceChange / groupList.length;

            groupList.forEach((group, groupIndex) => {
                group.color = this.changeColorLuminance(originalColor, groupIndex * luminanceChange);
            });
        });
    }

    initialiseSingleMetricInstanceGroupList() {
        this.overviewModel.data.forEach((instance) => {
            instance.groupList = [];

            this.overviewModel.metricList.forEach((metric, metricIndex) => {
                var groupList = this.getCurrentSingleMetricGroupList(metric);

                for (var i = 0; i < groupList.length; ++i) {
                    var group = groupList[i];

                    if (this.checkInstanceIsInGroup(group.total, instance.metricList[metricIndex].total, this.groupingThreshold)) {
                        instance.groupList.push(group);
                        break;
                    }
                }
            });
        });
    }

    initialiseMultiMetricGroups() {
        this.overviewModel.thresholdGroupListMap = new Map();

        for (var groupingThreshold = 0; groupingThreshold <= this.config.groupingThresholdCount; ++groupingThreshold) {
            var groupList = [];
            this.populateMultiMetricGroupList(groupList, groupingThreshold);
            this.overviewModel.thresholdGroupListMap.set(groupingThreshold, groupList);
        }

        this.initialiseMultiMetricGroupsColor();
    }

    populateMultiMetricGroupList(groupList, groupingThreshold) {
        this.overviewModel.data.forEach((instance) => {
            var group = this.findExistingMultiMetricGroup(groupList, instance, groupingThreshold);

            if (!group) {
                group = this.initialiseNewMultiMetricGroup(instance, groupList);
                groupList.push(group);
            }

            group.instanceList.push(instance);

            for (var i = 0; i < instance.metricList.length; ++i) {
                var metric = group.metricList[i];
                metric.total = (metric.total * (group.instanceList.length - 1) + instance.metricList[i].total) / group.instanceList.length;
            }
        });
    }

    findExistingMultiMetricGroup(groupList, instance, groupingThreshold) {
        var group = _.find(groupList, (search) => {
            for (var i = 0; i < instance.metricList.length; ++i) {
                var metric = search.metricList[i];

                if (!this.checkInstanceIsInGroup(metric.total, instance.metricList[i].total, groupingThreshold)) {
                    return false;
                }
            }

            return true;
        });

        return group;
    }

    initialiseNewMultiMetricGroup(instance, groupList) {
        var group = {};
        group.metricList = [];
        group.instanceList = [];
        group.name = "Group " + (groupList.length + 1);
        group.markerX = 0;

        instance.metricList.forEach((instanceMetric) => {
            var groupMetric = {};
            groupMetric.total = instanceMetric.total;
            group.metricList.push(groupMetric);
        });

        return group;
    }

    initialiseMultiMetricGroupsColor() {
        this.overviewModel.thresholdGroupListMap.forEach((groupList) => {
            var luminanceChange = (this.config.startingGreyColor - this.config.endingGrayColor) / groupList.length;

            groupList.forEach((group, groupIndex) => {
                var greyValue = Math.round(this.config.startingGreyColor - luminanceChange * groupIndex);
                group.color = "rgba(" + greyValue + ", " + greyValue + ", " + greyValue + ", 1)";
            });
        })
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
        range.end = 0;
        return range;
    }

    renderOverview() {
        this.clearFocusArea();
        this.drawOverview();
    }

    clearFocusArea() {
        this.focusAreaContext.clearRect(0, 0, this.focusAreaCanvas.width, this.focusAreaCanvas.height);
    }

    drawOverview() {
        if (!this.isLoading) {
            this.$timeout(() => {
                this.overviewContext.clearRect(0, 0, this.overviewCanvas.width, this.overviewCanvas.height);
                this.setOverviewCanvasSize();
                this.focusGraphMarginTop = this.overviewCanvasHeight + this.config.marginBetweenOverviewAndFocus;
                this.scope.$apply();
                this.drawOverviewData();
            });
        }
    }

    setOverviewCanvasSize() {
        this.setOverviewContextLabelFont();
        this.overviewModel.labelTextHeight = this.overviewContext.measureText("M").width;
        this.overviewModel.overviewStartY = this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview;
        this.setOverviewWidth();
        this.setOverviewHeight();
    }

    setOverviewWidth() {
        this.setOverviewContextTimeFont();
        var marginBetweenMetrics = this.getMarginBetweenMetrics();

        this.overviewModel.overviewWidth = this.config.overview.marginBetweenMarkerAndGroup * this.overviewModel.metricList.length +
            marginBetweenMetrics * (this.overviewModel.metricList.length - 1);

        // total width of overiew graph
        if (this.isCompressed) {
            this.overviewModel.metricList.forEach((metric) => {
                this.overviewModel.overviewWidth += metric.compressedTimeIndexList.length * this.config.overview.pointWidth;
            });
        } else {
            this.overviewModel.overviewWidth += this.getMaxMetricLength() * this.overviewModel.metricList.length * this.config.overview.pointWidth;
        }

        this.overviewCanvasWidth = this.overviewModel.overviewWidth;
        this.overviewModel.toDate = this.convertDateToString(this.toDate * 1000);
        this.overviewModel.toDateWidth = this.overviewContext.measureText(this.overviewModel.toDate).width;

        if (this.isGrouped) {
            this.setGroupedOverviewCanvasWidth();
        } else {
            this.overviewCanvasWidth += this.overviewModel.toDateWidth / 2;
        }
    }

    getMarginBetweenMetrics() {
        var marginBetweenMetrics;

        if (this.isGrouped) {
            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                marginBetweenMetrics = this.config.overview.decompressedMarginBetweenMetrics;
            } else {
                marginBetweenMetrics = this.config.overview.compressedMarginBetweenMetrics;
            }
        } else if (this.isCompressed) {
            marginBetweenMetrics = this.config.overview.compressedMarginBetweenMetrics;
        } else {
            marginBetweenMetrics = this.config.overview.decompressedMarginBetweenMetrics;
        }

        return marginBetweenMetrics;
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
                this.overviewCanvasWidth += this.getMaxGroupSizeBarLength(metric) * this.config.overview.groupSizeBarWidth;
            });

            /*
            if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                this.overviewModel.metricList.forEach((metric) => {
                    this.overviewCanvasWidth += this.getMaxGroupSizeBarLength(metric) * this.config.overview.groupSizeBarWidth;
                });
            } else {
                this.overviewCanvasWidth += this.overviewModel.metricList.length + this.config.overview.pieRadius * 2;
            }*/
        } else {
            if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize +
                    this.getMaxMultiMetricGroupSize() * this.config.overview.groupSizeBarWidth;
            } else {
                this.overviewCanvasWidth += this.config.overview.pieRadius * 2;
            }
        }
    }

    getMaxGroupSizeBarLength(metric) {
        var groupList = this.getCurrentSingleMetricGroupList(metric);

        var largestGroup = _.maxBy(groupList, (group) => {
            return group.instanceList.length;
        });

        return largestGroup.instanceList.length * this.config.overview.groupSizeBarWidth;
    }

    getCurrentSingleMetricGroupList(metric) {
        return metric.thresholdGroupListMap.get(this.groupingThreshold);
    }

    getMaxMultiMetricGroupSize() {
        var result = 0;
        var groupList = this.getCurrentMultiMetricGroupList();

        groupList.forEach((group) => {
            if (group.instanceList.length > result) {
                result = group.instanceList.length;
            }
        });

        return result;
    }

    getCurrentMultiMetricGroupList() {
        return this.overviewModel.thresholdGroupListMap.get(this.groupingThreshold);
    }

    setOverviewHeight() {
        // height of tallest graph
        if (this.isGrouped) {
            var groupCount = this.getMaxGroupCount();

            if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                this.overviewModel.instanceHeight = this.config.overview.groupedPointHeight + this.config.overview.marginBetweenGroups;
            } else {
                this.overviewModel.instanceHeight = this.config.overview.pieRadius * 2 + this.config.overview.marginBetweenGroups;
            }

            this.overviewModel.overviewHeight = groupCount * this.overviewModel.instanceHeight;
        } else {
            this.overviewModel.instanceHeight = this.config.overview.ungroupedPointHeight;
            this.overviewModel.overviewHeight = this.overviewModel.data.length * this.config.overview.ungroupedPointHeight;
        }

        // 2 = Metric and time labels
        this.overviewCanvasHeight = this.overviewModel.overviewHeight +
            (this.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 2;
    }

    getMaxGroupCount() {
        var groupCount = 0;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.overviewModel.metricList.forEach((metric) => {
                var groupList = this.getCurrentSingleMetricGroupList(metric);
                var length = groupList.length;

                if (length > groupCount) {
                    groupCount = length;
                }
            });
        } else {
            var groupList = this.getCurrentMultiMetricGroupList();
            groupCount = groupList.length;
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
        var marginBetweenMetrics = this.getMarginBetweenMetrics();

        this.overviewModel.metricList.forEach((metric, metricIndex) => {
            this.setOverviewMetricStartX(metric, metricIndex, marginBetweenMetrics);

            if (this.isCompressed) {
                metric.endX = metric.startX + metric.compressedTimeIndexList.length * this.config.overview.pointWidth;
            } else {
                metric.endX = metric.startX + this.getMaxMetricLength() * this.config.overview.pointWidth;
            }
        });
    }

    setOverviewMetricStartX(metric, metricIndex, marginBetweenMetrics) {
        if (metricIndex > 0) {
            var previousMetric = this.overviewModel.metricList[metricIndex - 1];
            metric.startX = previousMetric.endX + marginBetweenMetrics;

            if (this.isGrouped) {
                metric.startX += this.config.overview.marginBetweenMarkerAndGroup;

                if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                    metric.startX += this.config.overview.marginBetweenMetricAndGroupSize;

                    if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                        var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(previousMetric);
                        metric.startX += maxGroupSizeBarLength;
                    } else {
                        metric.startX += this.config.overview.pieRadius * 2;
                    }
                }
            }
        } else {
            metric.startX = this.config.overview.marginBetweenMarkerAndGroup;
        }
    }

    drawGroupedOverview() {
        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.drawSingeMetricGroupedOverview();
        } else {
            this.drawMultiMetricGroupedOverview();
        }

        this.drawGroupSize();
    }

    drawSingeMetricGroupedOverview() {
        this.overviewModel.metricList.forEach((metric, metricIndex) => {
            var groupList = this.getCurrentSingleMetricGroupList(metric);

            groupList.forEach((group, groupIndex) => {
                this.drawGroupedOverviewWrapper(group, groupIndex, [metricIndex]);
            });

            if (metricIndex < this.overviewModel.metricList.length - 1) {
                this.drawMetricSeparator(metric);
            }
        });
    }

    drawGroupedOverviewWrapper(group, groupIndex, metricIndexList) {
        var instance = group.instanceList[0];
        instance.y = this.overviewModel.overviewStartY + groupIndex * this.overviewModel.instanceHeight;

        if (this.groupSizeChart == this.enumList.groupSizeChart.PIE) {
            instance.y += this.overviewModel.instanceHeight / 2;
        }

        this.drawOverviewInstance(instance, this.config.overview.groupedPointHeight, metricIndexList);
        group.y = instance.y;
    }

    drawOverviewInstance(instance, pointHeight, metricIndexList) {
        var endY = instance.y + this.overviewModel.instanceHeight;

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
        var result = null;

        map.forEach((color, threshold) => {
            if (!result && this.isBetween(value, threshold.min, threshold.max)) {
                result = color;
            }
        });

        return result;
    }

    drawMultiMetricGroupedOverview() {
        var groupList = this.getCurrentMultiMetricGroupList();

        groupList.forEach((group, groupIndex) => {
            var metricIndexList = this.getAllMetricIndexList();
            this.drawGroupedOverviewWrapper(group, groupIndex, metricIndexList);
        });

        this.drawMetricSeparator(this.overviewModel.metricList[this.overviewModel.metricList.length - 1]);
    }

    getAllMetricIndexList() {
        return Array.from(Array(this.overviewModel.metricList.length).keys());
    }

    drawGroupSize() {
        this.setOverviewContextLabelFont();
        var label = "Groups size";
        this.overviewModel.groupSizeLabelWidth = this.overviewContext.measureText(label).width;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.drawSingleMetricGroupSize();
        } else {
            this.drawMultipleMetricGroupSize();
        }
    }

    drawSingleMetricGroupSize() {
        this.overviewModel.metricList.forEach((metric) => {
            var startX = metric.endX + this.config.overview.marginBetweenMetricAndGroupSize;
            var groupList = this.getCurrentSingleMetricGroupList(metric);

            groupList.forEach((group) => {
                if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                    this.drawSingleMetricBarGroupSize(group, startX);
                } else {
                    this.drawSingleMetricPieGroupSize(group, startX);
                }
            });

            if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(metric);
                this.drawGroupSizeLabel((startX * 2 + maxGroupSizeBarLength - this.overviewModel.groupSizeLabelWidth) / 2);
            } else {
                this.drawGroupSizeLabel((startX * 2 + this.config.overview.pieRadius - this.overviewModel.groupSizeLabelWidth) / 2);
            }
        });
    }

    drawSingleMetricBarGroupSize(group, startX) {
        this.drawBarGroupSizeWrapper(group, startX, group.instanceList.length, this.config.overview.groupSizeColor);
        this.drawBarGroupSizeWrapper(group, startX, group.overlapCount, this.config.overview.overlapColor);
    }

    drawBarGroupSizeWrapper(group, startX, length, color) {
        var endX = startX + length * this.config.overview.groupSizeBarWidth;
        var endY = group.y + this.config.overview.groupedPointHeight;
        this.overviewContext.beginPath();
        this.overviewContext.moveTo(startX, group.y);
        this.overviewContext.lineTo(endX, group.y);
        this.overviewContext.lineTo(endX, endY);
        this.overviewContext.lineTo(startX, endY);
        this.overviewContext.closePath();
        this.overviewContext.fillStyle = color;
        this.overviewContext.fill();
        return endX;
    }

    drawSingleMetricPieGroupSize(group, startX) {
        var startAngle = -0.5 * Math.PI;
        this.drawPieGroupSizeWrapper(group, startX, startAngle, group.instanceList.length, this.config.overview.groupSizeColor);
        this.drawPieGroupSizeWrapper(group, startX, startAngle, group.overlapCount, this.config.overview.overlapColor);
    }

    drawPieGroupSizeWrapper(group, startX, startAngle, size, color) {
        var x = startX + this.config.overview.pieRadius;
        var endAngle = startAngle + size * 2 * Math.PI / 360;
        this.overviewContext.beginPath();
        this.overviewContext.moveTo(x, group.y);
        this.overviewContext.arc(x, group.y, this.config.overview.pieRadius, startAngle, endAngle);
        this.overviewContext.lineTo(x, group.y);
        this.overviewContext.closePath();
        this.overviewContext.fillStyle = color;
        this.overviewContext.fill();
        return endAngle;
    }

    drawGroupSizeLabel(x) {
        this.overviewContext.fillStyle = "black";
        this.overviewContext.fillText("Groups size", x, this.overviewModel.labelTextHeight);
    }

    drawMultipleMetricGroupSize() {
        var startX = this.overviewModel.overviewWidth + this.config.overview.marginBetweenMetricAndGroupSize +
            this.overviewModel.groupSizeLabelWidth / 2;
        var maxEndX = 0;
        var groupList = this.getCurrentMultiMetricGroupList();

        groupList.forEach((group, groupIndex) => {
            var endX = this.drawBarGroupSizeWrapper(group, startX, group.instanceList.length, this.config.overview.groupSizeColor);

            if (endX > maxEndX) {
                maxEndX = endX;
            }
        });

        this.drawGroupSizeLabel((startX + maxEndX - this.overviewModel.groupSizeLabelWidth) / 2);
    }

    drawMetricSeparator(metric) {
        this.overviewContext.strokeStyle = "gray";
        var x = metric.endX + this.config.overview.decompressedMarginBetweenMetrics / 2;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            x += this.config.overview.marginBetweenMetricAndGroupSize;

            if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(metric);
                x += maxGroupSizeBarLength;
            } else {
                x += this.config.overview.pieRadius * 2;
            }
        }

        this.overviewContext.beginPath();
        this.overviewContext.moveTo(x, this.overviewModel.overviewStartY);
        this.overviewContext.lineTo(x, this.overviewModel.overviewStartY + this.overviewModel.overviewHeight);
        this.overviewContext.stroke();
        this.overviewContext.closePath();
    }

    drawUngroupedOverview() {
        this.overviewModel.data.forEach((instance, instanceIndex) => {
            var metricIndexList = this.getAllMetricIndexList();
            instance.y = this.overviewModel.overviewStartY + instanceIndex * this.overviewModel.instanceHeight;
            this.drawOverviewInstance(instance, this.overviewModel.instanceHeight, metricIndexList);
        });
    }

    drawMetricLabels() {
        this.setOverviewContextLabelFont();

        for (var metricIndex = 0; metricIndex < this.overviewModel.metricList.length; ++metricIndex) {
            var metric = this.overviewModel.metricList[metricIndex];
            var label = this.panel.metricList[metricIndex].name;
            var width = this.overviewContext.measureText(label).width;
            this.overviewContext.fillStyle = this.getMetricDarkestColor(this.panel.metricList[metricIndex]);
            this.overviewContext.fillText(label, (metric.startX + metric.endX - width) / 2, this.overviewModel.labelTextHeight);
        }
    }

    getMetricDarkestColor(metric) {
        var colorList = metric.colorList;
        return colorList[colorList.length - 1];
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

    convertDateToString(date) {
        return moment(date).format(this.config.dateFormat);
    }

    closeHistogram() {
        this.showHistogram = false;

        if (this.changedColorThreshold) {
            this.changedColorThreshold = false;
            this.drawOverview();

            if (this.isGrouped) {
                var temp = this.focusModel.groupList;
                this.focusModel.groupList = [];

                temp.forEach((group) => {
                    this.addOrRemoveGroupToFocus(group.overviewGroup, true);
                });

                this.drawFocusGraph();
            } else {
                this.drawFocusGraph();
            }
        }
    }

    addOrRemoveGroupToFocus(group, removeExisting) {
        var focusGroup = _.find(this.focusModel.groupList, (search) => {
            return search.overviewGroup == group;
        });

        if (focusGroup) {
            if (removeExisting) {
                group.isSelected = false;

                // deselect group from focus
                _.remove(this.focusModel.groupList, (search) => {
                    return search.overviewGroup == group;
                });
            }
        } else {
            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                this.removeExistingFocusGroupInSameMetric(group);
            }

            group.isSelected = true;
            this.addGroupToFocus(group);
        }

        this.setShowMergeGroupsButton();
    }

    removeExistingFocusGroupInSameMetric(group) {
        var newGroupList = [];

        this.focusModel.groupList.forEach((existingGroup) => {
            if (existingGroup.overviewGroup.metricIndex == group.metricIndex) {
                existingGroup.overviewGroup.isSelected = false;
            } else {
                newGroupList.push(existingGroup);
            }
        });

        this.focusModel.groupList = newGroupList;
    }

    setShowMergeGroupsButton() {
        this.showMergeSelectedGroups = false;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.overviewModel.metricList.forEach((metric) => {
                var groupList = this.getCurrentSingleMetricGroupList(metric);
                this.setShowMergeGroupsButtonWrapper(groupList);
            });
        } else {
            var groupList = this.getCurrentMultiMetricGroupList();
            this.setShowMergeGroupsButtonWrapper(groupList);
        }
    }

    setShowMergeGroupsButtonWrapper(groupList) {
        var selectedGroupCount = 0;

        for (var i = 0; i < groupList.length; ++i) {
            var group = groupList[i];

            if (group.isSelected) {
                ++selectedGroupCount;
            }

            if (selectedGroupCount == 2) {
                this.showMergeSelectedGroups = true;
                return;
            }
        };
    }

    drawSelectedGroupsMarkers() {
        this.$timeout(() => {
            this.clearFocusArea();
            this.overviewModel.groupMarkerList = [];

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                this.overviewModel.metricList.forEach((metric) => {
                    var groupList = this.getCurrentSingleMetricGroupList(metric);

                    groupList.forEach((group) => {
                        this.drawOverviewGroupMarker(group, [metric])
                    });
                });
            } else {
                var groupList = this.getCurrentMultiMetricGroupList();

                groupList.forEach((group) => {
                    this.drawOverviewGroupMarker(group, this.overviewModel.metricList)
                });
            }
        });
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

    drawFocusGraph(initialiseData) {
        if (!this.isGrouped && initialiseData) {
            this.initialiseFocusGraphData();
        }

        if ((this.isGrouped && this.focusModel.groupList.length > 0) ||
            (!this.isGrouped && this.focusModel.data.length > 0)) {
            this.showFocus = true;

            this.$timeout(() => {
                this.setFocusGraphCanvasHeight();
                var pointCount = this.focusModel.focusedIndexList.length - 1;
                var pointWidth = this.isGrouped ? this.config.focusGraph.groupedPointWidth : this.config.focusGraph.ungroupedPointWidth;
                this.focusGraphWidth = Math.min(this.config.focusGraph.maxWidth, pointCount * pointWidth);
                this.scope.$apply();
                this.focusModel.pointWidth = Math.max(1, Math.floor(this.focusGraphWidth / pointCount));
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

    setFocusGraphCanvasHeight() {
        if (this.isGrouped) {
            this.focusModel.groupList.forEach((group) => {
                if (group.showAllMetrics) {
                    group.focusGraphHeight = this.overviewModel.metricList.length * this.config.focusGraph.metricMaxHeight +
                        (this.overviewModel.metricList.length - 1) * this.config.focusGraph.marginBetweenMetrics;
                } else {
                    group.focusGraphHeight = this.config.focusGraph.metricMaxHeight;
                }
            });
        } else {
            this.focusModel.data.forEach((instance) => {
                if (instance.showAllMetrics) {
                    instance.focusGraphHeight = this.overviewModel.metricList.length * this.config.focusGraph.metricMaxHeight +
                        (this.overviewModel.metricList.length - 1) * this.config.focusGraph.marginBetweenMetrics;
                } else {
                    instance.focusGraphHeight = this.config.focusGraph.metricMaxHeight;
                }
            });
        }
    }

    moveMouseOnHistogram(evt) {
        this.histogramModel.mousePosition = this.getMousePos(evt, this.histogramCanvas);

        if (this.histogramModel.isSelectingBar) {
            this.setNewThresholdValue();
        } else {
            this.checkAndSetSelectedHistogramThresholdBar();
        }
    }

    setNewThresholdValue() {
        this.changedColorThreshold = true;
        var value = Math.round((this.histogramModel.mousePosition.x - this.histogramModel.horizontalAxisStartX) / this.config.histogram.barWidth);
        value = Math.max(value, 1);
        value = Math.min(value, this.histogramModel.metric.max - 1);

        this.histogramModel.metric.colorMap.forEach((color, threshold) => {
            if (threshold != this.histogramModel.selectedBar.threshold) {
                if (value >= this.histogramModel.selectedBar.threshold.max) {
                    // move right
                    if (threshold.min == this.histogramModel.selectedBar.threshold.max) {
                        value = Math.min(value, threshold.max - 1);
                        threshold.min = value;
                    }
                } else {
                    // move left
                    if (this.histogramModel.selectedBar.threshold.min == 0) {
                        // left most threshold
                        if (threshold.min == this.histogramModel.selectedBar.threshold.max) {
                            threshold.min = value;
                        }
                    } else {
                        // left threshold
                        if (threshold.max == this.histogramModel.selectedBar.threshold.min) {
                            value = Math.max(value, threshold.max + 1);
                        }

                        // right threshold
                        if (threshold.min == this.histogramModel.selectedBar.threshold.max) {
                            threshold.min = value;
                        }
                    }
                }
            }
        });

        this.histogramModel.selectedBar.threshold.max = value;
        this.drawHistogram();
    }

    checkAndSetSelectedHistogramThresholdBar() {
        this.histogramCursor = "default";
        this.histogramModel.selectedBar = null;
        var topY = this.histogramModel.sliderY - this.config.histogram.thresholdBarLength / 2;
        var bottomY = this.histogramModel.sliderY + this.config.histogram.thresholdBarLength / 2;

        if (this.isBetween(this.histogramModel.mousePosition.y, topY, bottomY)) {
            for (var i = 0; i < this.histogramModel.thresholdBarList.length; ++i) {
                var bar = this.histogramModel.thresholdBarList[i];
                var leftX = bar.x - this.config.histogram.barWidth;
                var rightX = bar.x + this.config.histogram.barWidth;

                if (this.isBetween(this.histogramModel.mousePosition.x, leftX, rightX)) {
                    this.histogramCursor = "pointer";
                    this.histogramModel.selectedBar = bar;
                    break;
                }
            }
        }
    }

    mouseDownOnHistogram() {
        if (this.histogramModel.selectedBar) {
            this.histogramModel.isSelectingBar = true;
        }
    }

    mouseUpOnHistogram() {
        this.histogramModel.isSelectingBar = false;
        this.histogramModel.selectedBar = null;
        this.histogramCursor = "default";
    }

    selectGroupingMode() {
        this.changeGroupingSelection();
    }

    changeGroupingSelection() {
        if (!this.isLoading) {
            this.drawOverview();
            this.clearFocusArea();
            this.clearTimeIndicator();
            this.deselectAllGroups();
            this.showFocus = false;
            this.showMergeSelectedGroups = false;
        }
    }

    deselectAllGroups() {
        this.focusModel.groupList = [];
        this.deselectSingleMetricGroups();
        this.deselectMultiMetricGroups();
    }

    deselectSingleMetricGroups() {
        this.overviewModel.metricList.forEach((metric) => {
            if (metric.originalGroupList) {
                metric.thresholdGroupListMap.set(this.previousGroupThreshold, metric.originalGroupList);
                metric.originalGroupList = null;
            }

            var groupList = this.getCurrentSingleMetricGroupList(metric);

            if (groupList) {
                groupList.forEach((group) => {
                    group.isSelected = false;
                    group.timeRangeIndexList = null;
                });
            }
        });
    }

    deselectMultiMetricGroups() {
        if (this.overviewModel.originalGroupList) {
            this.overviewModel.thresholdGroupListMap.set(this.previousGroupThreshold, this.overviewModel.originalGroupList);
            this.overviewModel.originalGroupList = null;
        }

        var groupList = this.getCurrentMultiMetricGroupList();

        groupList.forEach((group) => {
            group.isSelected = false;
            group.timeRangeIndexList = null;
        });
    }

    changeGroupingThreshold() {
        this.initialiseSingleMetricInstanceGroupList();
        this.changeGroupingSelection();
    }

    selectGroupsizeChart() {
        this.drawOverview();
    }

    groupUngroup() {
        this.isGrouped = !this.isGrouped;
        this.changeGroupingSelection();
    }

    mergeSelectedGroups() {
        this.showMergeSelectedGroups = false;

        // store current threshold value to restore original groups when threshold is changed
        this.previousGroupThreshold = this.groupingThreshold;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.mergeSingleMetricGroups();
        } else {
            this.mergeMultipleMetricGroups();
        }

        this.mergeFocusGroupList();
        this.initialiseGroupsOverlapCount();
        this.drawOverview();
        this.drawSelectedGroupsMarkers();
        this.drawFocusGraph(false);
    }

    mergeSingleMetricGroups() {
        this.overviewModel.metricList.forEach((metric) => {
            var groupList = this.getCurrentSingleMetricGroupList(metric);

            if (!metric.originalGroupList) {
                metric.originalGroupList = [];

                groupList.forEach((group) => {
                    metric.originalGroupList.push(group);
                });
            }

            this.mergeSelectedGroupsWrapper(groupList);
        });
    }

    mergeSelectedGroupsWrapper(groupList) {
        var currentGroupList = [];

        groupList.forEach((group) => {
            currentGroupList.push(group);
        });

        groupList.length = 0;
        this.populateMergedGroupList(currentGroupList, groupList);
    }

    populateMergedGroupList(currentGroupList, groupList) {
        var mergedGroup;

        currentGroupList.forEach((group) => {
            if (group.isSelected) {
                if (mergedGroup) {
                    group.instanceList.forEach((instance) => {
                        mergedGroup.instanceList.push(instance)
                    });
                } else {
                    mergedGroup = this.getCopyOfGroup(group);
                    groupList.push(mergedGroup);
                }
            } else {
                groupList.push(group);
            }
        });
    }

    getCopyOfGroup(group) {
        var newGroup = {};
        newGroup.name = group.name;
        newGroup.metricIndex = group.metricIndex;
        newGroup.instanceList = group.instanceList;
        newGroup.total = group.total;
        newGroup.color = group.color;
        newGroup.isSelected = group.isSelected;
        newGroup.markerX = group.markerX;
        newGroup.y = group.y;
        return newGroup;
    }

    mergeFocusGroupList() {
        var oldFocusGroupList = this.focusModel.groupList;
        this.focusModel.groupList = [];

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.overviewModel.metricList.forEach((metric) => {
                var groupList = this.getCurrentSingleMetricGroupList(metric);
                this.mergeFocusGroupListWrapper(groupList);
            })
        } else {
            this.mergeFocusGroupListWrapper(this.getCurrentMultiMetricGroupList());
        }

        this.setMainMetricIndexAfterMerging(oldFocusGroupList);
    }

    mergeFocusGroupListWrapper(groupList) {
        groupList.forEach((group) => {
            if (group.isSelected) {
                this.addGroupToFocus(group);
            }
        });
    }

    addGroupToFocus(group) {
        var focusGroup = {};
        focusGroup.instanceList = [];
        focusGroup.overviewGroup = group;
        focusGroup.mainMetricIndex = this.overviewModel.selectedMetricIndex;

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

    setMainMetricIndexAfterMerging(oldFocusGroupList) {
        this.focusModel.groupList.forEach((group) => {
            var oldGroup = _.find(oldFocusGroupList, (search) => {
                return search.overviewGroup == group.overviewGroup;
            });

            if (oldGroup) {
                group = oldGroup.mainMetricIndex;
            }
        });
    }

    initialiseGroupsOverlapCount() {
        this.overviewModel.selectedMetricIndexList = [];

        this.focusModel.groupList.forEach((group) => {
            this.overviewModel.selectedMetricIndexList.push(group.overviewGroup.metricIndex);
        });

        this.overviewModel.metricList.forEach((metric, metricIndex) => {
            var groupList = this.getCurrentSingleMetricGroupList(metric);

            groupList.forEach((group) => {
                group.overlapCount = 0;

                if (this.focusModel.groupList.length > 0 && !this.overviewModel.selectedMetricIndexList.includes(metricIndex)) {
                    this.checkOverlappingGroups(group);
                }
            });
        });
    }

    checkOverlappingGroups(group) {
        group.instanceList.forEach((instance) => {
            var check = 0;

            this.focusModel.groupList.forEach((group) => {
                var overlappingInstance = _.find(group.overviewGroup.instanceList, (search) => {
                    return search.instance == instance.instance;
                });

                if (overlappingInstance) {
                    ++check;
                }
            });

            if (check == this.overviewModel.selectedMetricIndexList.length) {
                ++group.overlapCount;
            }
        });
    }

    mergeMultipleMetricGroups() {
        var groupList = this.getCurrentMultiMetricGroupList();

        if (!this.overviewModel.originalGroupList) {
            this.overviewModel.originalGroupList = [];

            groupList.forEach((group) => {
                this.overviewModel.originalGroupList.push(group);
            });
        }

        this.mergeSelectedGroupsWrapper(groupList);
    }

    compressDecompress() {
        this.isCompressed = !this.isCompressed;
        this.changeGroupingSelection();
    }

    selectTimeHighlightMode() {
        this.clearTimeIndicator();

        if (this.overviewModel.thresholdGroupListMap) {
            this.overviewModel.thresholdGroupListMap.forEach((group) => {
                group.timeRangeIndexList = [];
            });
        }

        if (this.overviewModel.metricList) {
            this.overviewModel.metricList.forEach((metric) => {
                metric.thresholdGroupListMap.forEach((group) => {
                    group.timeRangeIndexList = [];
                });
            });
        }
    }

    clearTimeIndicator() {
        this.overviewTimeIndicatorContext.clearRect(0, 0, this.overviewTimeIndicatorCanvas.width, this.overviewTimeIndicatorCanvas.height);
    }

    mouseDownOnOverview(evt) {
        if (this.isSelectingMetricLabel) {
            this.showHistogram = true;
            this.drawHistogram();
        } else if (this.isGrouped) {
            if (this.overviewModel.hoveredGroup && this.timeHighlightMode == this.enumList.timeHighlightMode.RANGE) {
                this.overviewModel.isSelectingTimeRange = true;
                this.overviewModel.timeRangeStartOffset = this.overviewModel.mousePositionXOffset - this.overviewModel.metricList[0].startX;
                this.overviewModel.timeRangeGroup = this.overviewModel.hoveredGroup;
            }
        } else {
            this.overviewModel.focusAreaStartPoint = {};
            this.focusInArea = false;
            var firstMetric = this.overviewModel.metricList[0];
            this.overviewModel.focusAreaStartPoint.x = Math.max(firstMetric.startX, this.overviewModel.mousePositionXOffset - firstMetric.startX);
            this.overviewModel.focusAreaStartPoint.y = this.overviewModel.mousePosition.y;
            this.isDrawingFocusArea = true;
        }
    }

    drawHistogram() {
        this.histogramCanvasContext.clearRect(0, 0, this.histogramCanvas.width, this.histogramCanvas.height);
        this.histogramModel.metric = this.overviewModel.metricList[this.overviewModel.selectedMetricIndex];
        this.histogramMetric = this.panel.metricList[this.overviewModel.selectedMetricIndex];

        this.scope.$watch("ctrl.histogramMetric.color", (newValue, oldValue) => {
            if (newValue != oldValue) {
                this.initialiseColorListByMetric(this.histogramMetric);
                this.initialiseColorMapByMetric(this.histogramModel.metric, this.histogramMetric);
                this.drawHistogram();
            }
        });

        this.drawHistogramAxes();
        this.drawHistogramMaxValueAndOccurence();
        this.drawHistogramBars();
        this.drawHistogramThresholdSlider();
    }

    drawHistogramAxes() {
        this.histogramCanvasContext.font = this.config.overview.metricFontSize + "px Arial";
        this.histogramModel.verticalAxisStartY = this.overviewModel.labelTextHeight + this.config.histogram.marginBetweenAxesAndNumbers;
        this.histogramCanvasContext.lineWdith = 1;
        this.histogramCanvasContext.fillStyle = "black";
        this.histogramCanvasContext.strokeStyle = "gray";
        this.histogramCanvasContext.font = "bold " + this.config.overview.metricFontSize + "px Arial";
        this.drawHistogramVerticalAxis();
        this.drawHistogramHorizontalAxis();
    }

    drawHistogramVerticalAxis() {
        var occurences = "occurences";
        var verticalLabelWidth = this.histogramCanvasContext.measureText(occurences).width;
        var maxOccurenceWidth = this.histogramCanvasContext.measureText(this.histogramModel.metric.histogram.max).width;
        this.histogramModel.horizontalAxisStartX = maxOccurenceWidth + this.config.histogram.marginBetweenAxesAndNumbers;
        this.histogramCanvasContext.fillText("occurences", this.histogramModel.horizontalAxisStartX - verticalLabelWidth / 2, this.overviewModel.labelTextHeight);
        this.histogramModel.horizontalAxisY = this.histogramModel.verticalAxisStartY + this.config.histogram.verticalAxisLength;
        this.histogramCanvasContext.beginPath();
        this.histogramCanvasContext.moveTo(this.histogramModel.horizontalAxisStartX, this.histogramModel.verticalAxisStartY);
        this.histogramCanvasContext.lineTo(this.histogramModel.horizontalAxisStartX, this.histogramModel.horizontalAxisY);
        this.histogramCanvasContext.stroke();
        this.histogramCanvasContext.closePath();
    }

    drawHistogramHorizontalAxis() {
        this.histogramModel.horizontalAxisEndX = this.histogramModel.horizontalAxisStartX +
            this.config.histogram.barWidth * (this.histogramModel.metric.max + 1);
        var labelX = this.histogramModel.horizontalAxisEndX + this.config.histogram.marginBetweenAxesAndNumbers;
        var labelY = this.histogramModel.horizontalAxisY + this.overviewModel.labelTextHeight / 2;
        this.histogramCanvasContext.fillText(this.histogramMetric.unit, labelX, labelY);
        this.histogramCanvasContext.beginPath();
        this.histogramCanvasContext.moveTo(this.histogramModel.horizontalAxisStartX, this.histogramModel.horizontalAxisY);
        this.histogramCanvasContext.lineTo(this.histogramModel.horizontalAxisEndX, this.histogramModel.horizontalAxisY);
        this.histogramCanvasContext.stroke();
        this.histogramCanvasContext.closePath();
    }

    drawHistogramMaxValueAndOccurence() {
        this.histogramCanvasContext.font = this.config.overview.metricFontSize + "px Arial";
        var occurenceLabelY = this.histogramModel.verticalAxisStartY + this.overviewModel.labelTextHeight / 2
        this.histogramCanvasContext.fillText(this.histogramModel.metric.histogram.max, 0, occurenceLabelY);
        var maxValueWidth = this.histogramCanvasContext.measureText(this.histogramModel.metric.max).width;
        var valueLabelY = this.histogramModel.horizontalAxisY + this.config.histogram.marginBetweenAxesAndNumbers + this.overviewModel.labelTextHeight;
        this.histogramCanvasContext.fillText(this.histogramModel.metric.max, this.histogramModel.horizontalAxisEndX - maxValueWidth / 2, valueLabelY);
        var originX = this.histogramModel.horizontalAxisStartX - this.overviewModel.labelTextHeight - this.config.histogram.marginBetweenAxesAndNumbers;
        this.histogramCanvasContext.fillText(0, originX, valueLabelY);
    }

    drawHistogramBars() {
        var occurenceStep = this.config.histogram.verticalAxisLength / this.histogramModel.metric.histogram.max;

        this.histogramModel.metric.histogram.data.forEach((occurences, value) => {
            this.histogramCanvasContext.fillStyle = this.getColorFromMap(value, this.histogramModel.metric.colorMap);
            var x = this.histogramModel.horizontalAxisStartX + this.config.histogram.barWidth * value;
            var y = this.histogramModel.horizontalAxisY - occurenceStep * occurences;
            var height = this.histogramModel.horizontalAxisY - y;
            var minHeight = this.config.histogram.minimumBarHeight;

            if (height < minHeight) {
                y = this.histogramModel.horizontalAxisY - minHeight;
                height = minHeight;
            }

            this.histogramCanvasContext.fillRect(x, y, this.config.histogram.barWidth, height);
        });
    }

    drawHistogramThresholdSlider() {
        this.histogramCanvasContext.strokeStyle = "black";
        this.drawHistogramSliderLine();
        this.drawHistogramThresholdBars();
    }

    drawHistogramSliderLine() {
        this.histogramModel.sliderY = this.histogramModel.horizontalAxisY + this.config.histogram.marginBetweenSliderAndChart;
        this.histogramCanvasContext.beginPath();
        this.histogramCanvasContext.moveTo(this.histogramModel.horizontalAxisStartX, this.histogramModel.sliderY);
        this.histogramCanvasContext.lineTo(this.histogramModel.horizontalAxisEndX, this.histogramModel.sliderY);
        this.histogramCanvasContext.stroke();
        this.histogramCanvasContext.closePath();
    }

    drawHistogramThresholdBars() {
        var thresholdBarY = this.histogramModel.sliderY - this.config.histogram.thresholdBarLength / 2;
        this.histogramModel.thresholdBarList = [];
        var i = 0;

        this.histogramModel.metric.colorMap.forEach((color, threshold) => {
            var bar = {};
            bar.threshold = threshold;
            bar.x = this.histogramModel.horizontalAxisStartX + this.config.histogram.barWidth * (threshold.max + 1);

            // no need to draw slider bar for last threshold
            if (i < this.histogramModel.metric.colorMap.size - 1) {
                this.histogramCanvasContext.beginPath();
                this.histogramCanvasContext.moveTo(bar.x, thresholdBarY);
                this.histogramCanvasContext.lineTo(bar.x, thresholdBarY + this.config.histogram.thresholdBarLength);
                this.histogramCanvasContext.stroke();
                this.histogramCanvasContext.closePath();
                ++i;
            }

            this.histogramModel.thresholdBarList.push(bar);
        });
    }

    moveMouseOnOverview(evt) {
        if (this.overviewModel.metricList) {
            this.setOverviewMousePosition(evt);
            this.setSelectedMetricIndex();

            if (this.overviewModel.selectedMetricIndex > -1) {
                // check if mouse is on metric label
                if (this.isBetween(this.overviewModel.mousePosition.y, 0, this.overviewModel.overviewStartY)) {
                    this.isSelectingMetricLabel = true;
                    this.setOverviewCursorToPointer();
                } else {
                    this.deselectMetricLabel();
                }
            } else {
                this.deselectMetricLabel();
            }

            if (this.isGrouped) {
                this.handleMouseMoveOnGroupedOverview();
            } else if (this.overviewModel.selectedMetricIndex > -1) {
                if (this.isDrawingFocusArea) {
                    this.drawfocusArea();
                } else if (!this.focusAreaIsFixed) {
                    this.clearFocusArea();
                    this.drawFocus();
                }
            }
        } else {
            this.deselectMetricLabel();
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

    setSelectedMetricIndex() {
        this.overviewModel.selectedMetricIndex = -1;

        for (var metricIndex = 0; metricIndex < this.overviewModel.metricList.length; ++metricIndex) {
            var metric = this.overviewModel.metricList[metricIndex];

            if (metric) {
                // only check if mouse is on a metric graph
                if (this.checkMouseIsInMetric(metric)) {
                    this.overviewModel.selectedMetricIndex = metricIndex;
                    // set x position of mouse per overview graph for easier manipulation with mouse positions
                    this.overviewModel.mousePositionXOffset = this.overviewModel.mousePosition.x - metric.startX + this.overviewModel.metricList[0].startX;
                    break;
                }
            }
        }
    }

    checkMouseIsInMetric(metric) {
        return this.isBetween(this.overviewModel.mousePosition.x, metric.startX, metric.endX);
    }

    setOverviewCursorToPointer() {
        this.overviewCursor = "pointer";
    }

    deselectMetricLabel() {
        this.isSelectingMetricLabel = false;
        this.initialiseOverviewCanvasCursor();
    }

    handleMouseMoveOnGroupedOverview() {
        this.overviewModel.hoveredGroup = null;
        this.overviewModel.hoveredMarker = null;
        this.checkAndSetSelectedOverviewMarker();

        if (this.overviewModel.selectedMetricIndex >= 0) {
            this.checkAndSetHoveredGroup();
        }

        if (this.timeHighlightMode == this.enumList.timeHighlightMode.POINT) {
            if (this.overviewModel.hoveredGroup) {
                if (this.isCompressed && this.groupingMode == this.enumList.groupingMode.MULTIPLE) {
                    this.setSelectedTimeIndex();
                }

                this.drawTimeIndicators();
            } else {
                this.clearTimeIndicator();
            }
        } else if (this.overviewModel.isSelectingTimeRange) {
            this.initialiseSelectedGroupTimeRangeIndexList();
            this.drawSelectedTimeRanges();
        }
    }

    checkAndSetSelectedOverviewMarker() {
        for (var markerIndex = 0; markerIndex < this.overviewModel.groupMarkerList.length; ++markerIndex) {
            var marker = this.overviewModel.groupMarkerList[markerIndex];

            if (this.isBetween(this.overviewModel.mousePosition.x, marker.startX, marker.endX) &&
                this.isBetween(this.overviewModel.mousePosition.y, marker.startY, marker.endY)) {
                this.setOverviewCursorToPointer();
                this.overviewModel.hoveredMarker = marker;
                return;
            }
        }
    }

    checkAndSetHoveredGroup() {
        var groupList;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            var metric = this.overviewModel.metricList[this.overviewModel.selectedMetricIndex];
            groupList = this.getCurrentSingleMetricGroupList(metric);
        } else {
            groupList = this.getCurrentMultiMetricGroupList();
        }

        return this.checkAndSetHoveredGroupInGroupList(groupList);
    }

    checkAndSetHoveredGroupInGroupList(groupList) {
        for (var i = 0; i < groupList.length; ++i) {
            var group = groupList[i];

            if (this.checkGroupIsHovered(group)) {
                return true;
            }
        }

        return false;
    }

    checkGroupIsHovered(group) {
        if (this.isBetween(this.overviewModel.mousePosition.y, group.y, group.y + this.config.overview.groupedPointHeight)) {
            this.overviewModel.hoveredGroup = group;
            this.setOverviewCursorToPointer();
            return true;
        }
    }

    setSelectedTimeIndex() {
        var overviewMetric = this.overviewModel.metricList[this.overviewModel.selectedMetricIndex];
        var groupList = this.getCurrentMultiMetricGroupList();

        for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
            var instanceMetric = groupList[groupIndex].instanceList[0].metricList[this.overviewModel.selectedMetricIndex];

            for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                var pointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];
                var point = instanceMetric.data[pointIndex];

                if (point) {
                    if (this.checkDataPointIsSelected(point)) {
                        this.overviewModel.selectedTimeIndex = pointIndex;
                        return;
                    }
                }
            }
        }
    }

    checkDataPointIsSelected(point) {
        return this.isBetween(this.overviewModel.mousePosition.x, point.x, point.x + this.config.overview.pointWidth);
    }

    drawTimeIndicators() {
        this.clearTimeIndicator();
        this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.drawTimeIndicatorWrapper(this.overviewModel.metricList[this.overviewModel.selectedMetricIndex]);
        } else {
            this.overviewModel.metricList.forEach((metric, metricIndex) => {
                this.drawTimeIndicatorWrapper(metric, metricIndex);
            });
        }

        this.drawSelectedTimeLabel();
    }

    drawTimeIndicatorWrapper(overviewMetric, metricIndex) {
        var horizontalLineY = this.drawHorizontalTimeLine(overviewMetric, this.overviewModel.hoveredGroup);
        var verticalLineX;

        if (this.isCompressed && this.groupingMode == this.enumList.groupingMode.MULTIPLE &&
            metricIndex != null && metricIndex != this.overviewModel.selectedMetricIndex) {
            verticalLineX = this.getTimeIndicatorXForNonSelectedMetric(overviewMetric, metricIndex);
        } else {
            verticalLineX = overviewMetric.startX + this.overviewModel.mousePositionXOffset - this.overviewModel.metricList[0].startX;
        }

        this.drawSelectedTimePoint(overviewMetric, horizontalLineY, verticalLineX);
    }

    getTimeIndicatorXForNonSelectedMetric(overviewMetric, metricIndex) {
        var previousPointIndex = 0;

        for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
            var currentPointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];

            if (this.isBetween(this.overviewModel.selectedTimeIndex, previousPointIndex, currentPointIndex)) {
                var groupList = this.getCurrentMultiMetricGroupList();

                for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
                    var instanceMetric = groupList[groupIndex].instanceList[0].metricList[metricIndex];
                    var point = instanceMetric.data[overviewMetric.compressedTimeIndexList[compressedTimeIndex]];

                    if (point) {
                        return point.x;
                    }
                }
            }

            previousPointIndex = currentPointIndex;
        }
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

    drawSelectedTimePoint(metric, horizontalLineY, verticalLineX) {
        this.overviewTimeIndicatorContext.beginPath();
        this.overviewTimeIndicatorContext.moveTo(verticalLineX, horizontalLineY);
        this.overviewTimeIndicatorContext.lineTo(verticalLineX, this.overviewModel.hoveredGroup.y);
        this.overviewTimeIndicatorContext.stroke();
        this.overviewTimeIndicatorContext.closePath();
    }

    drawSelectedTimeLabel() {
        for (var metricIndex = 0; metricIndex < this.overviewModel.metricList.length; ++metricIndex) {
            var overviewMetric = this.overviewModel.metricList[metricIndex];

            // some groups are empty -> need to iterate through group list until find one that isn't
            var groupList = this.getCurrentSingleMetricGroupList(overviewMetric)

            for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
                var instanceMetric = groupList[groupIndex].instanceList[0].metricList[metricIndex];

                if (this.isCompressed) {
                    for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                        var point = instanceMetric.data[overviewMetric.compressedTimeIndexList[compressedTimeIndex]];

                        if (point) {
                            if (this.checkDataPointIsSelectedAndDrawTimeLabel(point)) {
                                return;
                            }
                        }
                    }
                } else {
                    for (var pointIndex = 0; pointIndex < instanceMetric.data.length; ++pointIndex) {
                        var point = instanceMetric.data[pointIndex];

                        if (this.checkDataPointIsSelectedAndDrawTimeLabel(point)) {
                            return;
                        }
                    }
                }
            }
        }
    }

    checkDataPointIsSelectedAndDrawTimeLabel(point) {
        if (this.checkDataPointIsSelected(point)) {
            this.overviewTimeIndicatorContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
            this.overviewTimeIndicatorContext.fillStyle = "black";
            var date = this.convertDateToString(point.date * 1000);
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

        if (this.overviewModel.timeRangeGroup.timeRangeIndexList.length > 0) {
            this.setTimeRangeStartAndEndDate();
        }
    }

    setTimeRangeStartAndEndDate() {
        var timeRangeGroup = this.overviewModel.timeRangeGroup;
        var metric = timeRangeGroup.instanceList[0].metricList[this.overviewModel.selectedMetricIndex];
        var timeRangeIndexList = timeRangeGroup.timeRangeIndexList;
        var startPoint = metric.data[timeRangeIndexList[0]];
        timeRangeGroup.startTimeRangeDate = this.convertDateToString(startPoint.date * 1000);
        var endPoint = metric.data[timeRangeIndexList[timeRangeIndexList.length - 1]];
        timeRangeGroup.endTimeRangeDate = this.convertDateToString(endPoint.date * 1000);
    }

    drawSelectedTimeRanges() {
        this.clearTimeIndicator();
        this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;
        this.overviewTimeIndicatorContext.fillStyle = this.config.timeIndicator.color;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.overviewModel.metricList.forEach((metric) => {
                var groupList = this.getCurrentSingleMetricGroupList(metric);

                groupList.forEach((group) => {
                    this.drawSelectedTimeRangeWrapper(group, [group.timeRangeMetricIndex]);
                });
            });
        } else {
            var groupList = this.getCurrentMultiMetricGroupList();

            groupList.forEach((group) => {
                this.drawSelectedTimeRangeWrapper(group, Array.from(Array(this.overviewModel.metricList.length).keys()));
            });
        }
    }

    drawSelectedTimeRangeWrapper(group, metricIndexList) {
        if (group.timeRangeIndexList && group.timeRangeIndexList.length > 0) {
            metricIndexList.forEach((metricIndex) => {
                var instanceMetric = group.instanceList[0].metricList[metricIndex];
                var overviewMetric = this.overviewModel.metricList[metricIndex];
                var startPoint, endPoint;
                var startRangeIndex = group.timeRangeIndexList[0];
                var endRangeIndex = group.timeRangeIndexList[group.timeRangeIndexList.length - 1];

                if (this.isCompressed && metricIndex != group.timeRangeMetricIndex) {
                    var previousPointIndex = 0;
                    var groupList = this.getCurrentMultiMetricGroupList();

                    for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                        var currentPointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];

                        if (this.isBetween(startRangeIndex, previousPointIndex, currentPointIndex)) {
                            startPoint = this.getTimeRangePointWrapper(previousPointIndex, groupList, metricIndex);
                        }

                        if (this.isBetween(endRangeIndex, previousPointIndex, currentPointIndex)) {
                            endPoint = this.getTimeRangePointWrapper(currentPointIndex, groupList, metricIndex);
                        }

                        previousPointIndex = currentPointIndex;
                    }

                } else {
                    startPoint = instanceMetric.data[startRangeIndex];
                    endPoint = instanceMetric.data[endRangeIndex];
                }

                if (startPoint) {
                    this.drawSelectedTimeRangeLines(overviewMetric, group, startPoint, endPoint);
                }
            });
        }
    }

    getTimeRangePointWrapper(pointIndex, groupList, metricIndex) {
        for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
            var instance = groupList[groupIndex].instanceList[0];
            var point = instance.metricList[metricIndex].data[pointIndex];

            if (point) {
                return point;
            }
        }
    }

    drawSelectedTimeRangeLines(overviewMetric, group, startPoint, endPoint) {
        var startY = this.drawHorizontalTimeLine(overviewMetric, group);
        var startX = startPoint.x;
        var endX = endPoint.x + this.config.overview.pointWidth;
        var width = endX - startX;
        var height = group.y - startY;
        this.overviewTimeIndicatorContext.fillRect(startX, startY, width, height);
    }

    drawfocusArea() {
        this.initialiseFocusAreaPoints();

        if (this.focusAreaModel.startX != this.focusAreaModel.endX &&
            this.focusAreaModel.startY != this.focusAreaModel.endY) {
            this.focusInArea = true;
            this.focusAreaIsFixed = false;
            this.drawFocusAreaSquare();
            this.drawFocus();
        } else {
            this.focusInArea = false;
        }
    }

    initialiseFocusAreaPoints() {
        var firstMetric = this.overviewModel.metricList[0];
        this.focusAreaModel.startX = this.overviewModel.focusAreaStartPoint.x;
        this.focusAreaModel.endX = this.overviewModel.mousePositionXOffset - firstMetric.startX;

        if (this.focusAreaModel.startX > this.overviewModel.mousePositionXOffset) {
            this.focusAreaModel.startX = this.overviewModel.mousePositionXOffset;
            this.focusAreaModel.endX = this.overviewModel.focusAreaStartPoint.x;
        }

        this.focusAreaModel.startY = this.overviewModel.focusAreaStartPoint.y;
        this.focusAreaModel.endY = this.overviewModel.mousePosition.y;

        if (this.focusAreaModel.startY > this.overviewModel.mousePosition.y) {
            this.focusAreaModel.startY = this.overviewModel.mousePosition.y;
            this.focusAreaModel.endY = this.overviewModel.focusAreaStartPoint.y;
        }

        this.focusAreaModel.startX = Math.max(this.focusAreaModel.startX, firstMetric.startX);
        this.focusAreaModel.endX = Math.min(this.focusAreaModel.endX, firstMetric.endX);
        this.focusAreaModel.startY = Math.max(this.focusAreaModel.startY, this.overviewModel.overviewStartY);
        this.focusAreaModel.endY = Math.min(this.focusAreaModel.endY, this.overviewModel.overviewEndY);
    }

    drawFocusAreaSquare() {
        this.clearFocusArea();
        this.focusAreaContext.strokeStyle = this.config.focusArea.color;
        var width = this.focusAreaModel.endX - this.focusAreaModel.startX;
        var height = this.focusAreaModel.endY - this.focusAreaModel.startY;

        this.overviewModel.metricList.forEach((metric) => {
            this.focusAreaContext.strokeRect(metric.startX + this.focusAreaModel.startX, this.focusAreaModel.startY, width, height);
        });
    }

    mouseUpOnOverView() {
        if (this.isGrouped) {
            if (this.overviewModel.hoveredMarker) {
                this.startFocusMarkerInterval(this.overviewModel.hoveredMarker.group);
            } else {
                this.updateSelectedGroupListAndDrawFocusGraph(false);
            }
        } else {
            if (this.isDrawingFocusArea) {
                this.isDrawingFocusArea = false;
            }

            this.focusAreaIsFixed = !this.focusAreaIsFixed;
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
                if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                    this.initialiseGroupsOverlapCount();
                    this.drawOverview();
                }

                this.drawSelectedGroupsMarkers();
                this.drawFocusGraph(false);
            }

            this.overviewModel.isSelectingTimeRange = false;
        });
    }

    drawFocus() {
        for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
            var metric = this.overviewModel.metricList[i];

            if (metric) {
                // only update focus graph if mouse is pointing on one of metric overview graphs
                if (this.checkMouseIsInMetric(metric)) {
                    this.drawFocusGraph(true);
                    break;
                }
            }
        }
    }

    initialiseFocusGraphData() {
        if (!this.focusModel.data) {
            this.focusModel.data = [];
        }

        this.focusModel.data.length = 0;
        var topY = Math.max(0, this.overviewModel.mousePosition.y - this.config.overview.selectedInstancesForFocusOffset);
        var bottomY = Math.min(this.overviewModel.overviewEndY, this.overviewModel.mousePosition.y + this.config.overview.selectedInstancesForFocusOffset);

        if (this.focusInArea) {
            topY = this.focusAreaModel.startY;
            bottomY = this.focusAreaModel.endY;
        }

        this.overviewModel.data.forEach((overviewInstance) => {
            if (this.isBetween(overviewInstance.y, topY, bottomY)) {
                this.focusModel.focusedIndexList = this.getIndexesOfPointsInFocus(overviewInstance);
                var focusInstance = this.getFocusInstance(overviewInstance, this.focusModel.focusedIndexList);
                this.focusModel.data.push(focusInstance);
            }
        });
    }

    getIndexesOfPointsInFocus(overviewInstance) {
        var indexes = [];

        for (var metricIndex = 0; metricIndex < overviewInstance.metricList.length; ++metricIndex) {
            var instanceMetric = overviewInstance.metricList[metricIndex];

            if (instanceMetric.data.length > 0) {
                var overviewMetric = this.overviewModel.metricList[metricIndex];
                var leftX = Math.max(overviewMetric.startX, this.overviewModel.mousePositionXOffset - this.config.overview.selectedInstancesForFocusOffset);
                var rightX = Math.min(overviewMetric.endX, this.overviewModel.mousePositionXOffset + this.config.overview.selectedInstancesForFocusOffset);

                if (this.focusInArea) {
                    leftX = overviewMetric.startX + this.focusAreaModel.startX;
                    rightX = overviewMetric.startX + this.focusAreaModel.endX;
                }

                instanceMetric.data.forEach((point, index) => {
                    if (this.isBetween(point.x, leftX, rightX)) {
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
        instance.metricList.forEach((instanceMetric, metricIndex) => {
            for (var i = 0; i < this.config.colorCount; ++i) {
                var layer = {};
                layer.valueList = [];
                instanceMetric.layerList.push(layer);
            }

            var overviewMetric = this.overviewModel.metricList[metricIndex];

            instanceMetric.data.forEach((point) => {
                var value = point.value;
                var colorList = this.panel.metricList[metricIndex].colorList;

                instanceMetric.layerList.forEach((layer, layerIndex) => {
                    overviewMetric.colorMap.forEach((color, threshold) => {
                        if (color == colorList[layerIndex]) {
                            layer.valueList.push(value > 0 ? value : 0);
                            value -= threshold.max;
                            layer.range = threshold.max - threshold.min;
                        }
                    });
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
                    this.focusedFromDate = this.convertDateToString(metric.data[fromIndex].date * 1000);
                    this.focusedToDate = this.convertDateToString(metric.data[toIndex].date * 1000);
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
        var toDateWidth = this.overviewContext.measureText(this.focusedToDate).width;
        this.toDateLeftMargin = this.focusGraphWidth - (fromDateWidth + toDateWidth) / 2;
    }

    drawFocusGraphData() {
        if (this.overviewModel.selectedMetricIndex > -1) {
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
        var maxMetricLength = this.getMaxMetricLength();
        var canvas = this.getGroupedFocusCanvas(groupIndex, instanceIndex);
        var valueList = Array.from(Array(maxMetricLength).keys());
        var metricList = instance.metricList;
        var metricIndexList = Array.from(Array(instance.metricList.length).keys())

        if (this.groupingMode == this.enumList.groupingMode.SINGLE && !group.showAllMetrics) {
            metricList = [instance.metricList[group.mainMetricIndex]];
            metricIndexList = [group.mainMetricIndex];
        }


        this.drawGroupedFocusGraphInstance(canvas, valueList, this.focusModel.pointWidth, metricList, metricIndexList);

        // selected time range
        if (group.overviewGroup.timeRangeIndexList) {
            var canvas = this.getElementByID("focusGraphHighlightedTimeRangeCanvas-" + groupIndex + "-" + instanceIndex);
            var pointWidth = Math.max(1, Math.floor(this.focusGraphWidth / group.overviewGroup.timeRangeIndexList.length));
            this.drawGroupedFocusGraphInstance(canvas, group.overviewGroup.timeRangeIndexList, pointWidth, metricList, metricIndexList);
        }
    }

    getGroupedFocusCanvas(groupIndex, instanceIndex) {
        return this.getElementByID("focusGraphCanvas-" + groupIndex + "-" + instanceIndex);
    }

    drawGroupedFocusGraphInstance(canvas, valueIndexList, pointWidth, metricList, metricIndexList) {
        var context = this.getCanvasContext(canvas);
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.drawFocusGraphInstance(context, valueIndexList, pointWidth, metricList, metricIndexList);
    }

    drawFocusGraphInstance(context, valueIndexList, pointWidth, metricList, metricIndexList) {
        metricList.forEach((metric, metricListIndex) => {
            metric.layerList.forEach((layer, layerIndex) => {
                // start drawing from bottom
                var panelMetric = this.panel.metricList[metricIndexList[metricListIndex]];
                context.fillStyle = panelMetric.colorList[layerIndex];
                var y = (this.config.focusGraph.metricMaxHeight + this.config.focusGraph.marginBetweenMetrics) * metricListIndex +
                    this.config.focusGraph.metricMaxHeight;
                context.beginPath();
                context.moveTo(0, y);
                var x = 0;
                var previousX = 0;
                var previousValue = 0;

                valueIndexList.forEach((valueIndex, positionIndex) => {
                    var value = layer.valueList[valueIndex];

                    if (value != null) {
                        x = pointWidth * positionIndex;
                        this.moveFocusGraphContextBasedOnValue(context, value, previousValue, layer, layerIndex, x, y, previousX);
                        previousX = x;
                        previousValue = value;
                    }
                });

                context.lineTo(x, y);
                context.lineTo(this.focusModel.graphBeginX, y);
                context.closePath();
                context.fill();
            });
        });
    }

    drawUngroupedFocusGraph() {
        this.focusModel.data.forEach((instance, instanceIndex) => {
            var canvas = this.getUngroupedFocusCanvas(instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);
            var valueIndexList = Array.from(Array(this.getMaxMetricLength()).keys());
            var metricList = [instance.metricList[this.overviewModel.selectedMetricIndex]];
            var metricIndexList = [this.overviewModel.selectedMetricIndex];

            if (instance.showAllMetrics) {
                metricList = instance.metricList;
                metricIndexList = Array.from(Array(instance.metricList.length).keys());
            }

            this.drawFocusGraphInstance(context, valueIndexList, this.focusModel.pointWidth, metricList, metricIndexList);
        });
    }

    getUngroupedFocusCanvas(instanceIndex) {
        return this.getElementByID("focusGraphCanvas-" + instanceIndex);
    }

    moveFocusGraphContextBasedOnValue(context, value, previousValue, layer, layerIndex, x, y, previousX) {
        if (value == 0) {
            // draw line straight down to base if value is 0
            context.lineTo(x, y);
        } else {
            // move to previous position at base if previous value is 0
            if (layerIndex > 0 && previousValue == 0) {
                context.lineTo(previousX, y);
            }

            var height;

            if (value >= layer.range) {
                height = this.config.focusGraph.metricMaxHeight;
            } else {
                height = value * this.config.focusGraph.metricMaxHeight / layer.range;
            }

            height = Math.max(5, height);
            context.lineTo(x, y - height);
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

    showHideAllMetrics() {
        this.drawFocusGraph(false);
    }

    selectGroup(instance, evt, groupIndex, instanceIndex) {
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
        var canvas = this.getGroupedFocusCanvas(groupIndex, instanceIndex);
        this.showPopup(instance, evt, groupIndex, instanceIndex, canvas)
    }

    showPopup(instance, evt, canvas) {
        var mousePos = this.getMousePos(evt, canvas);
        var metricHeight = this.config.focusGraph.metricMaxHeight + this.config.focusGraph.marginBetweenMetrics;

        for (var i = 0; i < this.overviewModel.metricList.length; ++i) {
            if (this.isBetween(mousePos.y, i * metricHeight, (i + 1) * metricHeight)) {
                var metric = this.panel.metricList[i];

                if (metric.popupURL && metric.popupURL != "") {
                    window.open(metric.popupURL + "?orgId=1&var-node=" + instance.instance,
                        instance.instance, "top=300, left=300, width=600, height=500");
                }

                break;
            }
        }
    }

    selectNode(index, evt) {
        var instance = this.focusModel.data[index];
        instance.isSelected = true;
        var canvas = this.getUngroupedFocusCanvas(index);
        this.showPopup(instance, evt, canvas)
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