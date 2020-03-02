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

        this.focusPanelHeight = this.config.focusGraph.graphHeight;
        this.overviewPanelHeight = this.config.overview.minOverviewPanelHeight;

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
            dateFormat: "DD.MM HH:mm",
            colorCount: 4,
            maxLuminanceChange: 0.8,
            marginBetweenOverviewAndFocus: 20,
            groupingThresholdCount: 100,
            startingGreyColor: 240,
            endingGrayColor: 80,
            intervalTimer: 70
        }
    }

    initialiseOverviewConfig() {
        this.config.overview = {
            maxSingleMetricGroupedWidth: 1700,
            minOverviewPanelHeight: 350,
            topAndBottomPadding: 20,
            metricFontSize: 12,
            timeFontSize: 9,
            marginBetweenLabelsAndOverview: 15,
            pointWidth: 1,
            ungroupedPointHeight: 1,
            groupedPointHeight: 10,
            compressedMarginBetweenMetrics: 100,
            decompressedMarginBetweenMetrics: 25,
            marginBetweenGroups: 10,
            groupSizeBarWidth: 1,
            pieRadius: 8,
            marginBetweenMarkerAndGroup: 25,
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
            minHeight: 50,
            graphHeight: 300,
            groupedPointWidth: 5,
            ungroupedPointWidth: 50,
            metricMaxHeight: 20,
            metricMinHeight: 5,
            marginBetweenMetrics: 10,
            maxWidth: 1000,
            markerSize: 20,
            marginBetweenMarkers: 5
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

    initialiseNewTab() {
        var tab = {};
        tab.overviewModel = {};
        tab.overviewModel.timeRangePositionMap = new Map();
        tab.histogramModel = {};
        tab.overviewModel.data = [];
        tab.overviewModel.metricList = [];
        tab.focusAreaModel = {};
        tab.overviewModel.groupMarkerList = [];
        tab.focusModel = {};
        tab.focusModel.groupList = [];
        this.tabList.push(tab);
        return tab;
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
        this.groupingThreshold = 20;
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

            this.loadCount = 0;
            this.fromDate = this.getDateInSeconds(this.timeSrv.timeRange().from._d);
            this.toDate = this.getDateInSeconds(this.timeSrv.timeRange().to._d);

            this.tabList = [];
            this.currentTab = this.initialiseNewTab();

            // time is in milliseconds
            this.currentTab.fromDateString = this.convertDateToString(this.fromDate);
            this.currentTab.toDateString = this.convertDateToString(this.toDate);

            this.panel.metricList.forEach(() => {
                this.currentTab.overviewModel.metricList.push(null);
            });

            this.panel.metricList.forEach((metric, index) => {
                this.getDataFromAPI(metric.query, index);
            });

            this.processRawData();
        });
    }

    getDateInSeconds(date) {
        return Math.round(date.getTime() / 1000);
    }

    // convert date in timestamp (seconds) to string
    convertDateToString(date) {
        return moment(date * 1000).format(this.config.dateFormat);
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
                    this.currentTab.overviewModel.metricList[index] = metric;
                }
            }
        }

        var url = this.config.apiAddress + encodeURIComponent(query) + "&start=" + this.fromDate + "&end=" + this.toDate + "&step=60";
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }

    processRawData() {
        this.$timeout(() => {
            if (this.loadCount < this.currentTab.overviewModel.metricList.length) {
                this.processRawData.bind(this)();
            } else {
                this.isLoading = false;

                if (!this.currentTab.overviewModel.metricList.includes(null)) {
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
        this.currentTab.overviewModel.metricList.forEach((metric) => {
            metric.data.forEach((instance) => {
                instance.values.forEach((value) => {
                    value[0] = parseFloat(value[0]);
                    value[1] = Math.round(parseFloat(value[1]));
                });
            });
        });
    }

    initialiseMetricMinMaxTotal() {
        this.currentTab.overviewModel.metricList.forEach((metric, metricIndex) => {
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
        this.currentTab.overviewModel.metricList.forEach((overviewMetric, index) => {
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
        this.currentTab.overviewModel.data = [];
        this.populateOverviewDataAndInitialiseHistogramData();
        this.calculateInstanceMetricTotalMinMax();
        this.sortOverviewData();
    }

    populateOverviewDataAndInitialiseHistogramData() {
        this.currentTab.overviewModel.metricList.forEach((metric, metricIndex) => {
            metric.histogram = {};
            metric.histogram.data = new Map();

            metric.data.forEach((metricInstance) => {
                var newInstance = _.find(this.currentTab.overviewModel.data, (search) => {
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

        for (var i = 0; i < this.currentTab.overviewModel.metricList.length; ++i) {
            var metric = {};
            metric.data = [];
            newInstance.metricList.push(metric);
        }

        this.currentTab.overviewModel.data.push(newInstance);
        return newInstance;
    }

    calculateInstanceMetricTotalMinMax() {
        this.currentTab.overviewModel.data.forEach((instance) => {
            instance.metricList.forEach((metric, metricIndex) => {
                metric.total = 0;
                metric.min = -1;
                metric.max = -1;

                metric.data.forEach((point) => {
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
        this.currentTab.overviewModel.data.sort((first, second) => {
            for (var i = 0; i < first.metricList.length; ++i) {
                if (first.metricList[i].total != second.metricList[i].total) {
                    return first.metricList[i].total - second.metricList[i].total;
                }
            }

            return 0;
        });
    }

    initialiseOverviewGroups() {
        var tab = this.currentTab;
        tab.clusteredMetricCount = 0;
        tab.isClustering = true;
        var newMetricList = tab.overviewModel.metricList.slice();

        newMetricList.forEach((metric, metricIndex) => {
            var worker = new Worker("/public/plugins/buw-heatmap-panel/single_metric_worker.js");
            var param = this.getSingleMetricWorkerParam(metric, metricIndex);
            worker.postMessage([param]);

            worker.onmessage = (e) => {
                this.handleFinishedSingleMetricClustering(e, tab, metricIndex);
            }
        });
    }

    getSingleMetricWorkerParam(metric, metricIndex) {
        var param = this.getWorkerParam();
        var panelMetric = this.panel.metricList[metricIndex];
        var metricName = panelMetric.name;
        var colorList = panelMetric.colorList;
        param.metric = metric;
        param.metricIndex = metricIndex;
        param.metricName = metricName;
        param.colorList = colorList;
        return param;
    }

    getWorkerParam() {
        return {
            tab: this.currentTab,
            config: this.config
        }
    }

    handleFinishedSingleMetricClustering(e, tab, metricIndex) {
        this.$timeout(() => {
            var result = e.data[0];
            var metric = tab.overviewModel.metricList[metricIndex];
            metric.DTPList = result.DTPList;
            metric.thresholdGroupListMap = result.thresholdGroupListMap;
            ++tab.clusteredMetricCount;
            this.scope.$apply();

            if (tab.clusteredMetricCount == tab.overviewModel.metricList.length) {
                this.initialiseMultiMetricGroups();
            }
        });
    }

    initialiseMultiMetricGroups() {
        var tab = this.currentTab;
        var worker = new Worker("/public/plugins/buw-heatmap-panel/multi_metric_worker.js");
        var param = this.getWorkerParam();
        worker.postMessage([param]);

        worker.onmessage = (e) => {
            this.handleFinishedMultiMetricClustering(e, tab);
        }
    }

    handleFinishedMultiMetricClustering(e, tab) {
        tab.isClustering = false;
        tab.overviewModel.thresholdGroupListMap = e.data[0];
        this.referenceGroupInstanceToDataInstance(tab);
        this.initialiseSingleMetricInstanceGroupList(tab);
    }

    referenceGroupInstanceToDataInstance(tab) {
        tab.overviewModel.thresholdGroupListMap.forEach((groupList) => {
            this.referenceGroupInstanceToDataInstanceByGroupList(tab, groupList);
        });

        tab.overviewModel.metricList.forEach((metric) => {
            metric.thresholdGroupListMap.forEach((groupList) => {
                this.referenceGroupInstanceToDataInstanceByGroupList(tab, groupList);
            });
        });
    }

    referenceGroupInstanceToDataInstanceByGroupList(tab, groupList) {
        groupList.forEach((group) => {
            var newInstanceList = [];

            group.instanceList.forEach((groupInstance) => {
                var dataInstance = _.find(tab.overviewModel.data, (search) => {
                    return groupInstance.instance == search.instance;
                });

                newInstanceList.push(dataInstance);
            });

            group.instanceList = newInstanceList;
        });
    }

    initialiseSingleMetricInstanceGroupList(tab) {
        tab.overviewModel.data.forEach((instance) => {
            instance.groupList = [];

            tab.overviewModel.metricList.forEach((metric) => {
                var groupList = this.getCurrentSingleMetricGroupList(metric);

                for (var i = 0; i < groupList.length; ++i) {
                    var group = groupList[i];

                    var check = _.find(group.instanceList, (search) => {
                        return search.instance == instance.instance;
                    })

                    if (check) {
                        instance.groupList.push(group);
                        break;
                    }
                }
            });
        });
    }

    initialiseCompressedTimeIndexes() {
        this.currentTab.overviewModel.metricList.forEach((overviewMetric, metricIndex) => {
            overviewMetric.compressedTimeIndexList = [0];

            this.currentTab.overviewModel.data.forEach((instance) => {
                this.initialiseInstanceCompressedTimeRangeList(instance, overviewMetric, metricIndex);
            });

            this.currentTab.overviewModel.data.forEach((instance) => {
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
                this.setOverviewPanelAndCanvasSize();
                this.focusGraphMarginTop = this.overviewCanvasHeight + this.config.marginBetweenOverviewAndFocus;
                this.scope.$apply();
                this.drawOverviewData();
            });
        }
    }

    setOverviewPanelAndCanvasSize() {
        this.setOverviewContextLabelFont();
        this.currentTab.overviewModel.labelTextHeight = this.overviewContext.measureText("M").width;
        this.currentTab.overviewModel.overviewStartY = this.currentTab.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview;
        this.setOverviewCanvasWidth();
        this.setOverviewCanvasHeight();
    }

    setOverviewCanvasWidth() {
        this.setOverviewContextTimeFont();
        this.setMarginBetweenMetrics();
        this.currentTab.overviewModel.pointWidth = this.config.overview.pointWidth;

        if (this.isGrouped) {
            this.setGroupedOverviewPointWidth();
        }

        if (this.isSingleGrouped()) {
            this.setSingleMetricGroupedCanvasWidth();
        } else {
            this.setMultipleGroupedAndUngroupedCanvasWidth();
        }
    }

    setOverviewContextTimeFont() {
        this.overviewContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
    }

    setMarginBetweenMetrics() {
        if (this.isGrouped) {
            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                this.currentTab.overviewModel.marginBetweenMetrics = this.config.overview.decompressedMarginBetweenMetrics;
            } else {
                this.currentTab.overviewModel.marginBetweenMetrics = this.config.overview.compressedMarginBetweenMetrics;
            }
        } else if (this.isCompressed) {
            this.currentTab.overviewModel.marginBetweenMetrics = this.config.overview.compressedMarginBetweenMetrics;
        } else {
            this.currentTab.overviewModel.marginBetweenMetrics = this.config.overview.decompressedMarginBetweenMetrics;
        }
    }

    isSingleGrouped() {
        return this.isGrouped && this.groupingMode == this.enumList.groupingMode.SINGLE;
    }

    setSingleMetricGroupedCanvasWidth() {
        this.currentTab.overviewModel.metricWidth = this.getMaxMetricLength() * this.currentTab.overviewModel.pointWidth;
        this.currentTab.overviewModel.maxGroupSizeBarLength = 0;

        this.currentTab.overviewModel.metricList.forEach((metric) => {
            var metricMaxGroupSizeBarLength = this.getMaxGroupSizeBarLength(metric);
            this.currentTab.overviewModel.maxGroupSizeBarLength = Math.max(this.currentTab.overviewModel.maxGroupSizeBarLength, metricMaxGroupSizeBarLength);
        });

        this.currentTab.overviewModel.metricWidth += this.currentTab.overviewModel.maxGroupSizeBarLength + this.currentTab.overviewModel.marginBetweenMetrics +
            this.config.overview.marginBetweenMarkerAndGroup + this.config.overview.marginBetweenMetricAndGroupSize;
        this.overviewCanvasWidth = this.config.overview.maxSingleMetricGroupedWidth;
        this.currentTab.overviewModel.metricsPerRow = Math.floor(this.overviewCanvasWidth / this.currentTab.overviewModel.metricWidth);
    }

    setMultipleGroupedAndUngroupedCanvasWidth() {
        this.currentTab.overviewModel.overviewWidth = this.config.overview.marginBetweenMarkerAndGroup * this.currentTab.overviewModel.metricList.length +
            this.currentTab.overviewModel.marginBetweenMetrics * (this.currentTab.overviewModel.metricList.length - 1);

        // total width of overiew graph
        if (this.isCompressed) {
            this.currentTab.overviewModel.metricList.forEach((metric) => {
                this.currentTab.overviewModel.overviewWidth += metric.compressedTimeIndexList.length * this.currentTab.overviewModel.pointWidth;
            });
        } else {
            this.currentTab.overviewModel.overviewWidth +=
                this.getMaxMetricLength() * this.currentTab.overviewModel.metricList.length * this.currentTab.overviewModel.pointWidth;
        }

        this.overviewCanvasWidth = this.currentTab.overviewModel.overviewWidth;
        this.setFromDateAndToDateWidth();

        if (this.isGrouped) {
            this.setGroupedOverviewCanvasWidth();
        } else {
            this.overviewCanvasWidth += this.currentTab.overviewModel.toDateWidth / 2;
        }
    }

    setGroupedOverviewPointWidth() {
        if (this.currentTab != this.tabList[0]) {
            var maxOriginalLength = this.getMaxMetricLengthByTab(this.tabList[0]);

            if (maxOriginalLength > 0) {
                var originalLength = this.getMaxMetricLength();

                if (originalLength > 0) {
                    var currentLength = originalLength;
                    var nextScaledLength = currentLength;
                    var scale = 1;

                    while (currentLength < maxOriginalLength && nextScaledLength < maxOriginalLength) {
                        currentLength = nextScaledLength;
                        ++scale;
                        nextScaledLength = originalLength * scale;
                    }

                    this.currentTab.overviewModel.pointWidth *= scale;
                }
            }
        }
    }

    getMaxMetricLength() {
        return this.getMaxMetricLengthByTab(this.currentTab);
    }

    getMaxMetricLengthByTab(tab) {
        var length = 0;

        if (tab.overviewModel.metricList) {
            tab.overviewModel.metricList.forEach((metric) => {
                var instanceWithMostPoints = _.maxBy(metric.data, (point) => {
                    return point.values.length;
                });

                if (instanceWithMostPoints) {
                    length = instanceWithMostPoints.values.length;
                }
            });
        }

        return length;
    }

    setFromDateAndToDateWidth() {
        this.currentTab.overviewModel.fromDate = this.convertDateToString(this.fromDate);
        this.currentTab.overviewModel.toDate = this.convertDateToString(this.toDate);
        this.currentTab.overviewModel.toDateWidth = this.overviewContext.measureText(this.currentTab.overviewModel.toDate).width;
    }

    setGroupedOverviewCanvasWidth() {
        this.overviewCanvasWidth += this.config.overview.marginBetweenMarkerAndGroup * this.currentTab.overviewModel.metricList.length;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.overviewCanvasWidth += this.config.overview.marginBetweenMetricAndGroupSize * this.currentTab.overviewModel.metricList.length;

            this.currentTab.overviewModel.metricList.forEach((metric) => {
                this.overviewCanvasWidth += this.getMaxGroupSizeBarLength(metric) * this.config.overview.groupSizeBarWidth;
            });
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

        if (largestGroup) {
            return largestGroup.instanceList.length * this.config.overview.groupSizeBarWidth;
        } else {
            return 0;
        }
    }

    getCurrentSingleMetricGroupList(metric) {
        return metric.thresholdGroupListMap.get(this.groupingThreshold);
    }

    getMaxMultiMetricGroupSize() {
        var result = 0;
        var groupList = this.getCurrentMultiMetricGroupList();

        groupList.forEach((group) => {
            result = Math.max(result, group.instanceList.length);
        });

        return result;
    }

    getCurrentMultiMetricGroupList() {
        return this.currentTab.overviewModel.thresholdGroupListMap.get(this.groupingThreshold);
    }

    setOverviewCanvasHeight() {
        if (this.isGrouped) {
            if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                this.currentTab.overviewModel.instanceHeight = this.config.overview.groupedPointHeight + this.config.overview.marginBetweenGroups;
            } else {
                this.currentTab.overviewModel.instanceHeight = this.config.overview.pieRadius * 2 + this.config.overview.marginBetweenGroups;
            }
        } else {
            this.currentTab.overviewModel.instanceHeight = this.config.overview.ungroupedPointHeight;
        }

        if (this.isSingleGrouped()) {
            this.setSingleMetricGroupedCanvasHeight();
        } else {
            this.setMultipleMetricGroupedAndUngroupedCanvasHeight();
        }
    }

    setSingleMetricGroupedCanvasHeight() {
        var rowIndex = 0;
        this.currentTab.overviewModel.overviewHeight = 0;
        this.currentTab.overviewModel.rowHeightList = [];

        // get height of each row of metrics
        while (this.currentTab.overviewModel.metricList.length / this.currentTab.overviewModel.metricsPerRow > rowIndex) {
            var maxGroupCount = 0;

            for (var columnIndex = 0; columnIndex < this.currentTab.overviewModel.metricsPerRow; ++columnIndex) {
                var metricIndex = rowIndex * this.currentTab.overviewModel.metricsPerRow + columnIndex;

                if (metricIndex < this.currentTab.overviewModel.metricList.length) {
                    var metric = this.currentTab.overviewModel.metricList[metricIndex];
                    var groupList = this.getCurrentSingleMetricGroupList(metric);
                    maxGroupCount = Math.max(maxGroupCount, groupList.length);
                }
            }

            var height = maxGroupCount * this.currentTab.overviewModel.instanceHeight +
                (this.currentTab.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 3; // metric label, from/to date, selected date
            this.currentTab.overviewModel.rowHeightList.push(height);
            this.currentTab.overviewModel.overviewHeight += height;
            ++rowIndex;
        }

        this.currentTab.overviewModel.rowsOfMetric = Math.ceil(this.currentTab.overviewModel.metricList.length / this.currentTab.overviewModel.metricsPerRow);
        this.overviewCanvasHeight = this.currentTab.overviewModel.overviewHeight;
    }

    setMultipleMetricGroupedAndUngroupedCanvasHeight() {
        // height of tallest graph
        if (this.isGrouped) {
            var groupCount = this.getMaxGroupCount();
            this.currentTab.overviewModel.overviewHeight = groupCount * this.currentTab.overviewModel.instanceHeight;
        } else {
            this.currentTab.overviewModel.overviewHeight = this.currentTab.overviewModel.data.length * this.config.overview.ungroupedPointHeight;
        }

        this.overviewCanvasHeight = this.currentTab.overviewModel.overviewHeight +
            (this.currentTab.overviewModel.labelTextHeight + this.config.overview.marginBetweenLabelsAndOverview) * 3; // metric label, from/to date, selected date
    }

    getMaxGroupCount() {
        var groupCount = 0;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.currentTab.overviewModel.metricList.forEach((metric) => {
                var groupList = this.getCurrentSingleMetricGroupList(metric);
                groupCount = Math.max(groupCount, groupList.length);
            });
        } else {
            var groupList = this.getCurrentMultiMetricGroupList();
            groupCount = groupList.length;
        }

        return groupCount;
    }

    setOverviewContextLabelFont() {
        this.overviewContext.font = "italic " + (this.config.overview.metricFontSize - 1) + "px Arial";
    }

    drawOverviewData() {
        this.currentTab.overviewModel.overviewEndY = 0;

        this.currentTab.overviewModel.metricList.forEach((metric, metricIndex) => {
            this.setOverviewMetricStartEndX(metric, metricIndex);
        });

        if (this.isGrouped) {
            this.drawGroupedOverview();
        } else {
            this.drawUngroupedOverview();
        }

        this.drawMetricLabels();
    }

    setOverviewMetricStartEndX(metric, metricIndex) {
        if (this.isSingleGrouped()) {
            this.setSingleGroupedOverviewMetricStartEndX(metric, metricIndex);
        } else {
            this.setMultipleGroupedAndUngroupedMetricStartEndX(metric, metricIndex);
        }
    }

    setSingleGroupedOverviewMetricStartEndX(metric, metricIndex) {
        var columnIndex = metricIndex % this.currentTab.overviewModel.metricsPerRow;
        metric.startX = columnIndex * this.currentTab.overviewModel.metricWidth + this.config.overview.marginBetweenMarkerAndGroup;
        metric.endX = metric.startX + this.getMaxMetricLength() * this.currentTab.overviewModel.pointWidth;
    }

    setMultipleGroupedAndUngroupedMetricStartEndX(metric, metricIndex) {
        if (metricIndex > 0) {
            var previousMetric = this.currentTab.overviewModel.metricList[metricIndex - 1];
            metric.startX = previousMetric.endX + this.currentTab.overviewModel.marginBetweenMetrics;

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

        if (this.isCompressed) {
            metric.endX = metric.startX + metric.compressedTimeIndexList.length * this.currentTab.overviewModel.pointWidth;
        } else {
            metric.endX = metric.startX + this.getMaxMetricLength() * this.currentTab.overviewModel.pointWidth;
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
        this.currentTab.overviewModel.metricList.forEach((metric, metricIndex) => {
            metric.startY = this.currentTab.overviewModel.overviewStartY;
            var rowIndex = Math.floor(metricIndex / this.currentTab.overviewModel.metricsPerRow);

            for (var previousRowIndex = 0; previousRowIndex < rowIndex; ++previousRowIndex) {
                metric.startY += this.currentTab.overviewModel.rowHeightList[previousRowIndex];
            }

            var groupList = this.getCurrentSingleMetricGroupList(metric);

            groupList.forEach((group, groupIndex) => {
                this.drawGroupedOverviewWrapper(group, groupIndex, metric.startY, [metricIndex]);
                metric.endY = group.y + this.config.overview.groupedPointHeight;
            });

            var columnIndex = metricIndex % this.currentTab.overviewModel.metricsPerRow;

            if (columnIndex < this.currentTab.overviewModel.metricsPerRow - 1) {
                this.drawMetricSeparator(metric);
            }
        });
    }

    drawGroupedOverviewWrapper(group, groupIndex, startY, metricIndexList) {
        var instance = group.instanceList[0];
        instance.y = startY + groupIndex * this.currentTab.overviewModel.instanceHeight;

        if (this.groupSizeChart == this.enumList.groupSizeChart.PIE) {
            instance.y += this.currentTab.overviewModel.instanceHeight / 2;
        }

        this.drawOverviewInstance(instance, this.config.overview.groupedPointHeight, metricIndexList);
        group.y = instance.y;
    }

    drawOverviewInstance(instance, pointHeight, metricIndexList) {
        var endY = instance.y + this.currentTab.overviewModel.instanceHeight;

        if (endY > this.currentTab.overviewModel.overviewEndY) {
            this.currentTab.overviewModel.overviewEndY = endY;
        }

        metricIndexList.forEach((metricIndex) => {
            this.drawOverviewInstancePoints(instance, metricIndex, pointHeight);
        });
    }

    drawOverviewInstancePoints(instance, metricIndex, pointHeight) {
        var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex];
        var instanceMetric = instance.metricList[metricIndex];

        if (this.isCompressed) {
            overviewMetric.compressedTimeIndexList.forEach((pointIndex, rangeIndex) => {
                var point = instanceMetric.data[pointIndex];

                if (point) {
                    this.drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, rangeIndex, pointHeight);
                }
            });
        } else {
            instanceMetric.data.forEach((point, pointIndex) => {
                this.drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, pointIndex, pointHeight);
            });
        }
    }

    drawOverviewInstancePoint(instance, metricIndex, overviewMetric, point, pointIndex, pointHeight) {
        if (point.value != null) {
            point.x = overviewMetric.startX + pointIndex * this.currentTab.overviewModel.pointWidth;
            point.color = this.getColorFromMap(point.value, this.currentTab.overviewModel.metricList[metricIndex].colorMap);
            this.overviewContext.fillStyle = point.color;
            this.overviewContext.fillRect(point.x, instance.y, this.currentTab.overviewModel.pointWidth, pointHeight);
        }
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
            this.drawGroupedOverviewWrapper(group, groupIndex, this.currentTab.overviewModel.overviewStartY, metricIndexList);
        });

        this.drawMetricSeparator(this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.metricList.length - 1]);
    }

    getAllMetricIndexList() {
        return Array.from(Array(this.currentTab.overviewModel.metricList.length).keys());
    }

    drawGroupSize() {
        this.setOverviewContextLabelFont();
        var label = "Groups size";
        this.currentTab.overviewModel.groupSizeLabelWidth = this.overviewContext.measureText(label).width;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.drawSingleMetricGroupSize();
        } else {
            this.drawMultipleMetricGroupSize();
        }
    }

    drawSingleMetricGroupSize() {
        this.currentTab.overviewModel.metricList.forEach((metric, metricIndex) => {
            var startX = metric.endX + this.config.overview.marginBetweenMetricAndGroupSize;
            var groupList = this.getCurrentSingleMetricGroupList(metric);

            groupList.forEach((group) => {
                if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                    this.drawSingleMetricBarGroupSize(group, startX);
                } else {
                    this.drawSingleMetricPieGroupSize(group, startX);
                }
            });
            var y = this.currentTab.overviewModel.labelTextHeight;
            var rowIndex = Math.floor(metricIndex / this.currentTab.overviewModel.metricsPerRow);

            for (var previousRowIndex = 0; previousRowIndex < rowIndex; ++previousRowIndex) {
                y += this.currentTab.overviewModel.rowHeightList[previousRowIndex];
            }

            if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                var maxGroupSizeBarLength = this.getMaxGroupSizeBarLength(metric);
                this.drawGroupSizeLabel((startX * 2 + maxGroupSizeBarLength - this.currentTab.overviewModel.groupSizeLabelWidth) / 2, y);
            } else {
                this.drawGroupSizeLabel((startX * 2 + this.config.overview.pieRadius - this.currentTab.overviewModel.groupSizeLabelWidth) / 2, y);
            }
        });
    }

    drawSingleMetricBarGroupSize(group, startX) {
        this.drawBarGroupSizeWrapper(group, startX, group.instanceList.length, this.config.overview.groupSizeColor);

        // don't draw overlap if group isn't selected and is in a selected metric
        if (this.currentTab.overviewModel.selectedMetricIndexSet &&
            (!this.currentTab.overviewModel.selectedMetricIndexSet.has(group.metricIndex) || group.isSelected)) {
            this.drawBarGroupSizeWrapper(group, startX, group.overlapCount, this.config.overview.overlapColor);
        }
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

    drawGroupSizeLabel(x, y) {
        this.overviewContext.fillStyle = "black";
        this.overviewContext.fillText("Groups size", x, y);
    }

    drawMultipleMetricGroupSize() {
        var startX = this.currentTab.overviewModel.overviewWidth + this.config.overview.marginBetweenMetricAndGroupSize +
            this.currentTab.overviewModel.groupSizeLabelWidth / 2;
        var maxEndX = 0;
        var groupList = this.getCurrentMultiMetricGroupList();

        groupList.forEach((group, groupIndex) => {
            var endX = this.drawBarGroupSizeWrapper(group, startX, group.instanceList.length, this.config.overview.groupSizeColor);

            if (endX > maxEndX) {
                maxEndX = endX;
            }
        });

        this.drawGroupSizeLabel((startX + maxEndX - this.currentTab.overviewModel.groupSizeLabelWidth) / 2);
    }

    drawMetricSeparator(metric) {
        this.overviewContext.strokeStyle = "gray";
        var x = metric.endX + this.config.overview.decompressedMarginBetweenMetrics / 2;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            x += this.config.overview.marginBetweenMetricAndGroupSize;

            if (this.groupSizeChart == this.enumList.groupSizeChart.HORIZONTAL_BAR) {
                x += this.currentTab.overviewModel.maxGroupSizeBarLength;
            } else {
                x += this.config.overview.pieRadius * 2;
            }
        }

        this.overviewContext.beginPath();
        this.overviewContext.moveTo(x, this.currentTab.overviewModel.overviewStartY);
        this.overviewContext.lineTo(x, this.currentTab.overviewModel.overviewStartY + this.currentTab.overviewModel.overviewHeight);
        this.overviewContext.stroke();
        this.overviewContext.closePath();
    }

    drawUngroupedOverview() {
        this.currentTab.overviewModel.data.forEach((instance, instanceIndex) => {
            var metricIndexList = this.getAllMetricIndexList();
            instance.y = this.currentTab.overviewModel.overviewStartY + instanceIndex * this.currentTab.overviewModel.instanceHeight;
            this.drawOverviewInstance(instance, this.currentTab.overviewModel.instanceHeight, metricIndexList);
        });
    }

    drawMetricLabels() {
        for (var metricIndex = 0; metricIndex < this.currentTab.overviewModel.metricList.length; ++metricIndex) {
            this.setOverviewContextLabelFont();
            var metric = this.currentTab.overviewModel.metricList[metricIndex];
            var label = this.panel.metricList[metricIndex].name;
            var width = this.overviewContext.measureText(label).width;
            this.overviewContext.fillStyle = this.getMetricDarkestColor(this.panel.metricList[metricIndex]);
            var y = this.currentTab.overviewModel.labelTextHeight;

            if (this.isSingleGrouped()) {
                var rowIndex = Math.floor(metricIndex / this.currentTab.overviewModel.metricsPerRow);

                for (var previousRowIndex = 0; previousRowIndex < rowIndex; ++previousRowIndex) {
                    y += this.currentTab.overviewModel.rowHeightList[previousRowIndex];
                }
            }

            this.overviewContext.fillText(label, metric.startX, y);

            if (this.isGrouped && !this.isCompressed) {
                this.drawTimeLabels(metric);
            }
        }
    }

    getMetricDarkestColor(metric) {
        var colorList = metric.colorList;
        return colorList[colorList.length - 1];
    }

    drawTimeLabels(metric) {
        this.setOverviewContextTimeFont();
        metric.timeLabelY = this.config.overview.marginBetweenLabelsAndOverview;
        var groupList;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            groupList = this.getCurrentSingleMetricGroupList(metric);
        } else {
            groupList = this.getCurrentMultiMetricGroupList();
        }

        if (groupList.length > 0) {
            metric.timeLabelY += groupList[groupList.length - 1].y + this.config.overview.groupedPointHeight;
        }

        this.overviewContext.fillStyle = "black";
        this.overviewContext.fillText(this.currentTab.overviewModel.fromDate, metric.startX - this.currentTab.overviewModel.toDateWidth / 2, metric.timeLabelY);
        this.overviewContext.fillText(this.currentTab.overviewModel.toDate, metric.endX - this.currentTab.overviewModel.toDateWidth / 2, metric.timeLabelY);
    }

    closeHistogram() {
        this.showHistogram = false;

        if (this.changedColorThreshold) {
            this.changedColorThreshold = false;
            this.drawOverview();

            if (this.isGrouped) {
                var temp = this.currentTab.focusModel.groupList;
                this.currentTab.focusModel.groupList = [];

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
        var focusGroup = _.find(this.currentTab.focusModel.groupList, (search) => {
            return search.overviewGroup == group;
        });

        if (focusGroup) {
            if (removeExisting) {
                group.isSelected = false;
                group.timeRangeIndexList = null;

                // deselect group from focus
                _.remove(this.currentTab.focusModel.groupList, (search) => {
                    return search.overviewGroup == group;
                });
            }
        } else {
            group.isSelected = true;
            this.addGroupToFocus(group);
        }

        this.setShowMergeGroupsButton();
    }

    removeExistingFocusGroupInSameMetric(group) {
        var newGroupList = [];

        this.currentTab.focusModel.groupList.forEach((existingGroup) => {
            if (existingGroup.overviewGroup.metricIndex == group.metricIndex) {
                existingGroup.overviewGroup.isSelected = false;
            } else {
                newGroupList.push(existingGroup);
            }
        });

        this.currentTab.focusModel.groupList = newGroupList;
    }

    setShowMergeGroupsButton() {
        this.showMergeSelectedGroups = false;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.currentTab.overviewModel.metricList.forEach((metric) => {
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
            this.focusAreaContext.font = this.config.overview.groupedPointHeight + "px calculator";
            this.clearFocusArea();
            this.currentTab.overviewModel.groupMarkerList = [];

            if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                this.currentTab.overviewModel.metricList.forEach((metric) => {
                    var groupList = this.getCurrentSingleMetricGroupList(metric);

                    groupList.forEach((group) => {
                        this.drawOverviewGroupMarker(group, [metric])
                    });
                });
            } else {
                var groupList = this.getCurrentMultiMetricGroupList();

                groupList.forEach((group) => {
                    this.drawOverviewGroupMarker(group, this.currentTab.overviewModel.metricList)
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
                //this.focusAreaContext.fillRect(marker.startX, marker.startY, this.config.overview.groupedPointHeight, this.config.overview.groupedPointHeight);
                this.focusAreaContext.fillText(this.getGroupNumber(group), marker.startX, marker.startY + this.config.overview.groupedPointHeight);
                this.currentTab.overviewModel.groupMarkerList.push(marker);
            });
        }
    }

    getGroupNumber(group) {
        var split = group.name.split(" ");
        return split[split.length - 1];
    }

    drawFocusGraph(initialiseData) {
        if (!this.isGrouped && initialiseData) {
            this.initialiseFocusGraphData();
        }

        if ((this.isGrouped && this.currentTab.focusModel.groupList.length > 0) ||
            (!this.isGrouped && this.currentTab.focusModel.data.length > 0)) {
            this.showFocus = true;

            this.$timeout(() => {
                this.setFocusGraphCanvasHeight();
                this.setFocusGraphPointWidth();
                this.scope.$apply();
                var focusGraphRow = this.getElementByID("focusGraphRow");

                if (focusGraphRow) {
                    this.setFocusFromAndToDate();

                    if (!this.isGrouped) {
                        this.positionFocusFromAndToDate();
                    }

                    this.currentTab.focusModel.focusRowHeight = focusGraphRow.offsetHeight;
                    this.drawFocusGraphData();
                    this.autoSrollFocusGraph();
                }
            });
        } else {
            this.showFocus = false;
        }
    }

    initialiseFocusGraphData() {
        if (!this.currentTab.focusModel.data) {
            this.currentTab.focusModel.data = [];
        }

        this.currentTab.focusModel.data.length = 0;
        var topY = Math.max(0, this.currentTab.overviewModel.mousePosition.y - this.config.overview.selectedInstancesForFocusOffset);
        var bottomY = Math.min(this.currentTab.overviewModel.overviewEndY, this.currentTab.overviewModel.mousePosition.y + this.config.overview.selectedInstancesForFocusOffset);

        if (this.focusInArea) {
            topY = this.currentTab.focusAreaModel.startY;
            bottomY = this.currentTab.focusAreaModel.endY;
        }

        this.currentTab.overviewModel.data.forEach((overviewInstance) => {
            if (this.isBetween(overviewInstance.y, topY, bottomY)) {
                this.currentTab.focusModel.focusedIndexList = this.getIndexesOfPointsInFocus(overviewInstance);
                var focusInstance = this.getFocusInstance(overviewInstance, this.currentTab.focusModel.focusedIndexList);
                this.currentTab.focusModel.data.push(focusInstance);
            }
        });
    }

    getIndexesOfPointsInFocus(overviewInstance) {
        var indexes = [];

        for (var metricIndex = 0; metricIndex < overviewInstance.metricList.length; ++metricIndex) {
            var instanceMetric = overviewInstance.metricList[metricIndex];

            if (instanceMetric.data.length > 0) {
                var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex];
                var leftX = Math.max(overviewMetric.startX, this.currentTab.overviewModel.mousePositionXOffset - this.config.overview.selectedInstancesForFocusOffset);
                var rightX = Math.min(overviewMetric.endX, this.currentTab.overviewModel.mousePositionXOffset + this.config.overview.selectedInstancesForFocusOffset);

                if (this.focusInArea) {
                    leftX = overviewMetric.startX + this.currentTab.focusAreaModel.startX;
                    rightX = overviewMetric.startX + this.currentTab.focusAreaModel.endX;
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
        this.currentTab.overviewModel.metricList.forEach((metric, metricIndex) => {
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

            var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex];

            instanceMetric.data.forEach((point) => {
                var value = point.value;
                var colorList = this.panel.metricList[metricIndex].colorList;

                instanceMetric.layerList.forEach((layer, layerIndex) => {
                    overviewMetric.colorMap.forEach((color, threshold) => {
                        if (color == colorList[layerIndex]) {
                            layer.valueList.push(value > 0 ? value : 0);
                            layer.range = threshold.max - threshold.min;
                            value -= layer.range;
                        }
                    });
                });
            });
        });
    }

    setFocusGraphCanvasHeight() {
        if (this.isGrouped) {
            this.currentTab.focusModel.groupList.forEach((group) => {
                if (group.showAllMetrics) {
                    group.focusGraphHeight = this.currentTab.overviewModel.metricList.length * this.config.focusGraph.metricMaxHeight +
                        (this.currentTab.overviewModel.metricList.length - 1) * this.config.focusGraph.marginBetweenMetrics;
                } else {
                    group.focusGraphHeight = this.config.focusGraph.metricMaxHeight;
                }
            });
        } else {
            this.currentTab.focusModel.data.forEach((instance) => {
                if (instance.showAllMetrics) {
                    instance.focusGraphHeight = this.currentTab.overviewModel.metricList.length * this.config.focusGraph.metricMaxHeight +
                        (this.currentTab.overviewModel.metricList.length - 1) * this.config.focusGraph.marginBetweenMetrics;
                } else {
                    instance.focusGraphHeight = this.config.focusGraph.metricMaxHeight;
                }
            });
        }
    }

    setFocusGraphPointWidth() {
        var pointCount = this.currentTab.focusModel.focusedIndexList.length - 1;
        var pointWidth;

        if (this.isGrouped) {
            pointWidth = Math.max(1, Math.floor(this.config.focusGraph.maxWidth / pointCount));
        } else {
            pointWidth = this.config.focusGraph.ungroupedPointWidth;
        }

        this.focusGraphWidth = Math.min(this.config.focusGraph.maxWidth, pointCount * pointWidth);
        this.currentTab.focusModel.pointWidth = Math.max(1, Math.floor(this.focusGraphWidth / pointCount));
    }

    moveMouseOnHistogram(evt) {
        this.currentTab.histogramModel.mousePosition = this.getMousePos(evt, this.histogramCanvas);

        if (this.currentTab.histogramModel.isSelectingBar) {
            this.setNewThresholdValue();
        } else {
            this.checkAndSetSelectedHistogramThresholdBar();
        }
    }

    setNewThresholdValue() {
        this.changedColorThreshold = true;
        var value = Math.round((this.currentTab.histogramModel.mousePosition.x - this.currentTab.histogramModel.horizontalAxisStartX) / this.config.histogram.barWidth);
        value = Math.max(value, 1);
        value = Math.min(value, this.currentTab.histogramModel.metric.max - 1);

        this.currentTab.histogramModel.metric.colorMap.forEach((color, threshold) => {
            if (threshold != this.currentTab.histogramModel.selectedBar.threshold) {
                if (value >= this.currentTab.histogramModel.selectedBar.threshold.max) {
                    // move right
                    if (threshold.min == this.currentTab.histogramModel.selectedBar.threshold.max) {
                        value = Math.min(value, threshold.max - 1);
                        threshold.min = value;
                    }
                } else {
                    // move left
                    if (this.currentTab.histogramModel.selectedBar.threshold.min == 0) {
                        // left most threshold
                        if (threshold.min == this.currentTab.histogramModel.selectedBar.threshold.max) {
                            threshold.min = value;
                        }
                    } else {
                        // left threshold
                        if (threshold.max == this.currentTab.histogramModel.selectedBar.threshold.min) {
                            value = Math.max(value, threshold.max + 1);
                        }

                        // right threshold
                        if (threshold.min == this.currentTab.histogramModel.selectedBar.threshold.max) {
                            threshold.min = value;
                        }
                    }
                }
            }
        });

        this.currentTab.histogramModel.selectedBar.threshold.max = value;
        this.drawHistogram();
    }

    checkAndSetSelectedHistogramThresholdBar() {
        this.histogramCursor = "default";
        this.currentTab.histogramModel.selectedBar = null;
        var topY = this.currentTab.histogramModel.sliderY - this.config.histogram.thresholdBarLength / 2;
        var bottomY = this.currentTab.histogramModel.sliderY + this.config.histogram.thresholdBarLength / 2;

        if (this.isBetween(this.currentTab.histogramModel.mousePosition.y, topY, bottomY)) {
            for (var i = 0; i < this.currentTab.histogramModel.thresholdBarList.length; ++i) {
                var bar = this.currentTab.histogramModel.thresholdBarList[i];
                var leftX = bar.x - this.config.histogram.barWidth;
                var rightX = bar.x + this.config.histogram.barWidth;

                if (this.isBetween(this.currentTab.histogramModel.mousePosition.x, leftX, rightX)) {
                    this.histogramCursor = "pointer";
                    this.currentTab.histogramModel.selectedBar = bar;
                    break;
                }
            }
        }
    }

    mouseDownOnHistogram() {
        if (this.currentTab.histogramModel.selectedBar) {
            this.currentTab.histogramModel.isSelectingBar = true;
        }
    }

    mouseUpOnHistogram() {
        this.currentTab.histogramModel.isSelectingBar = false;
        this.currentTab.histogramModel.selectedBar = null;
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
        this.currentTab.focusModel.groupList = [];
        this.currentTab.overviewModel.timeRangePositionMap = new Map();
        this.deselectSingleMetricGroups();
        // this.deselectMultiMetricGroups();
    }

    deselectSingleMetricGroups() {
        this.currentTab.overviewModel.metricList.forEach((metric) => {
            if (metric.originalGroupList) {
                metric.thresholdGroupListMap.set(this.previousGroupThreshold, metric.originalGroupList);
                metric.originalGroupList = null;
            }

            var groupList = this.getCurrentSingleMetricGroupList(metric);

            if (groupList) {
                groupList.forEach((group) => {
                    group.isSelected = false;
                    group.timeRangeIndexList = null;
                    group.overlapCount = 0;
                });
            }
        });
    }

    deselectMultiMetricGroups() {
        if (this.currentTab.overviewModel.originalGroupList) {
            this.currentTab.overviewModel.thresholdGroupListMap.set(this.previousGroupThreshold, this.currentTab.overviewModel.originalGroupList);
            this.currentTab.overviewModel.originalGroupList = null;
        }

        var groupList = this.getCurrentMultiMetricGroupList();

        groupList.forEach((group) => {
            group.isSelected = false;
            group.timeRangeIndexList = null;
        });
    }

    changeGroupingThreshold() {
        this.initialiseSingleMetricInstanceGroupList(this.currentTab);
        this.changeGroupingSelection();
    }

    selectGroupsizeChart() {
        this.drawOverview();
    }

    groupUngroup() {
        this.isGrouped = !this.isGrouped;

        if (this.isGrouped && this.currentTab.isClustering) {
            this.waitUntilGroupProcessingIsFinished();
        } else {
            this.changeGroupingSelection();
        }
    }

    waitUntilGroupProcessingIsFinished() {
        if (this.currentTab.isClustering) {
            this.$timeout(() => {
                this.waitUntilGroupProcessingIsFinished();
            }, 100);
        } else if (this.isGrouped) {
            this.changeGroupingSelection();
        }
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
        this.currentTab.overviewModel.metricList.forEach((metric) => {
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
        var oldFocusGroupList = this.currentTab.focusModel.groupList;
        this.currentTab.focusModel.groupList = [];

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.currentTab.overviewModel.metricList.forEach((metric) => {
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
        focusGroup.mainMetricIndex = this.currentTab.overviewModel.selectedMetricIndex;

        group.instanceList.forEach((overviewInstance) => {
            var length = 0;

            var metricWithMostData = _.maxBy(overviewInstance.metricList, (metric) => {
                return metric.data.length;
            });

            if (metricWithMostData) {
                length = metricWithMostData.data.length;
            }

            this.currentTab.focusModel.focusedIndexList = Array.from(Array(length).keys());
            var focusInstance = this.getFocusInstance(overviewInstance, this.currentTab.focusModel.focusedIndexList);
            focusGroup.instanceList.push(focusInstance);

        });

        this.currentTab.focusModel.groupList.push(focusGroup);
    }

    setMainMetricIndexAfterMerging(oldFocusGroupList) {
        this.currentTab.focusModel.groupList.forEach((group) => {
            var oldGroup = _.find(oldFocusGroupList, (search) => {
                return search.overviewGroup == group.overviewGroup;
            });

            if (oldGroup) {
                group = oldGroup.mainMetricIndex;
            }
        });
    }

    initialiseGroupsOverlapCount() {
        this.currentTab.overviewModel.selectedMetricIndexSet = new Set();

        this.currentTab.focusModel.groupList.forEach((group) => {
            this.currentTab.overviewModel.selectedMetricIndexSet.add(group.overviewGroup.metricIndex);
        });

        this.currentTab.overviewModel.metricList.forEach((metric) => {
            var groupList = this.getCurrentSingleMetricGroupList(metric);

            groupList.forEach((group) => {
                group.overlapCount = 0;

                if (this.currentTab.focusModel.groupList.length > 0) {
                    this.checkOverlappingGroupsAndSetOverlapCount(group);
                }
            });
        });
    }

    checkOverlappingGroupsAndSetOverlapCount(group) {
        group.instanceList.forEach((instance) => {
            var check = 0;

            this.currentTab.focusModel.groupList.forEach((overlappingGroup) => {
                if (overlappingGroup.overviewGroup.metricIndex != group.metricIndex) {
                    var overlappingInstance = _.find(overlappingGroup.overviewGroup.instanceList, (search) => {
                        return search.instance == instance.instance;
                    });

                    if (overlappingInstance) {
                        ++check;
                    }
                }
            });

            if (group.isSelected) {
                if (check == this.currentTab.overviewModel.selectedMetricIndexSet.size - 1) {
                    ++group.overlapCount;
                }
            } else if (check == this.currentTab.overviewModel.selectedMetricIndexSet.size) {
                ++group.overlapCount;
            }
        });
    }

    mergeMultipleMetricGroups() {
        var groupList = this.getCurrentMultiMetricGroupList();

        if (!this.currentTab.overviewModel.originalGroupList) {
            this.currentTab.overviewModel.originalGroupList = [];

            groupList.forEach((group) => {
                this.currentTab.overviewModel.originalGroupList.push(group);
            });
        }

        this.mergeSelectedGroupsWrapper(groupList);
    }

    compressDecompress() {
        this.isCompressed = !this.isCompressed;
        this.drawOverview();
        this.clearFocusArea();
        this.clearTimeIndicator();
    }

    selectTimeHighlightMode() {
        this.clearTimeIndicator();

        if (this.currentTab.overviewModel.thresholdGroupListMap) {
            this.currentTab.overviewModel.thresholdGroupListMap.forEach((groupList) => {
                this.clearGroupIndexRangeIndexList(groupList);
            });
        }

        if (this.currentTab.overviewModel.metricList) {
            this.currentTab.overviewModel.metricList.forEach((metric) => {
                metric.thresholdGroupListMap.forEach((groupList) => {
                    this.clearGroupIndexRangeIndexList(groupList);
                });
            });
        }
    }

    clearGroupIndexRangeIndexList(groupList) {
        groupList.forEach((group) => {
            group.timeRangeIndexList = [];
        });
    }

    clearTimeIndicator() {
        this.overviewTimeIndicatorContext.clearRect(0, 0, this.overviewTimeIndicatorCanvas.width, this.overviewTimeIndicatorCanvas.height);
    }

    mouseDownOnOverview(evt) {
        if (this.isSelectingMetricLabel) {
            this.showHistogram = true;
            this.drawHistogram();
        } else if (this.isGrouped) {
            if (this.currentTab.overviewModel.hoveredGroup && this.timeHighlightMode == this.enumList.timeHighlightMode.RANGE) {
                this.currentTab.overviewModel.isSelectingTimeRange = true;
                this.currentTab.overviewModel.timeRangeStartOffset = this.currentTab.overviewModel.mousePositionXOffset;
                this.currentTab.overviewModel.timeRangeGroup = this.currentTab.overviewModel.hoveredGroup;
            }
        } else {
            this.currentTab.overviewModel.focusAreaStartPoint = {};
            this.focusInArea = false;
            var firstMetric = this.currentTab.overviewModel.metricList[0];
            this.currentTab.overviewModel.focusAreaStartPoint.x =
                Math.max(firstMetric.startX, this.currentTab.overviewModel.mousePositionXOffset - firstMetric.startX);
            this.currentTab.overviewModel.focusAreaStartPoint.y = this.currentTab.overviewModel.mousePosition.y;
            this.isDrawingFocusArea = true;
        }
    }

    drawHistogram() {
        this.histogramCanvasContext.clearRect(0, 0, this.histogramCanvas.width, this.histogramCanvas.height);
        this.currentTab.histogramModel.metric = this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.selectedMetricIndex];
        this.histogramMetric = this.panel.metricList[this.currentTab.overviewModel.selectedMetricIndex];

        this.scope.$watch("ctrl.histogramMetric.color", (newValue, oldValue) => {
            if (newValue != oldValue) {
                this.initialiseColorListByMetric(this.histogramMetric);
                this.initialiseColorMapByMetric(this.currentTab.histogramModel.metric, this.histogramMetric);
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
        this.currentTab.histogramModel.verticalAxisStartY = this.currentTab.overviewModel.labelTextHeight + this.config.histogram.marginBetweenAxesAndNumbers;
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
        var maxOccurenceWidth = this.histogramCanvasContext.measureText(this.currentTab.histogramModel.metric.histogram.max).width;
        this.currentTab.histogramModel.horizontalAxisStartX = maxOccurenceWidth + this.config.histogram.marginBetweenAxesAndNumbers;
        this.histogramCanvasContext.fillText("occurences", this.currentTab.histogramModel.horizontalAxisStartX - verticalLabelWidth / 2, this.currentTab.overviewModel.labelTextHeight);
        this.currentTab.histogramModel.horizontalAxisY = this.currentTab.histogramModel.verticalAxisStartY + this.config.histogram.verticalAxisLength;
        this.histogramCanvasContext.beginPath();
        this.histogramCanvasContext.moveTo(this.currentTab.histogramModel.horizontalAxisStartX, this.currentTab.histogramModel.verticalAxisStartY);
        this.histogramCanvasContext.lineTo(this.currentTab.histogramModel.horizontalAxisStartX, this.currentTab.histogramModel.horizontalAxisY);
        this.histogramCanvasContext.stroke();
        this.histogramCanvasContext.closePath();
    }

    drawHistogramHorizontalAxis() {
        this.currentTab.histogramModel.horizontalAxisEndX = this.currentTab.histogramModel.horizontalAxisStartX +
            this.config.histogram.barWidth * (this.currentTab.histogramModel.metric.max + 1);
        var labelX = this.currentTab.histogramModel.horizontalAxisEndX + this.config.histogram.marginBetweenAxesAndNumbers;
        var labelY = this.currentTab.histogramModel.horizontalAxisY + this.currentTab.overviewModel.labelTextHeight / 2;
        this.histogramCanvasContext.fillText(this.histogramMetric.unit, labelX, labelY);
        this.histogramCanvasContext.beginPath();
        this.histogramCanvasContext.moveTo(this.currentTab.histogramModel.horizontalAxisStartX, this.currentTab.histogramModel.horizontalAxisY);
        this.histogramCanvasContext.lineTo(this.currentTab.histogramModel.horizontalAxisEndX, this.currentTab.histogramModel.horizontalAxisY);
        this.histogramCanvasContext.stroke();
        this.histogramCanvasContext.closePath();
    }

    drawHistogramMaxValueAndOccurence() {
        this.histogramCanvasContext.font = this.config.overview.metricFontSize + "px Arial";
        var occurenceLabelY = this.currentTab.histogramModel.verticalAxisStartY + this.currentTab.overviewModel.labelTextHeight / 2
        this.histogramCanvasContext.fillText(this.currentTab.histogramModel.metric.histogram.max, 0, occurenceLabelY);
        var maxValueWidth = this.histogramCanvasContext.measureText(this.currentTab.histogramModel.metric.max).width;
        var valueLabelY = this.currentTab.histogramModel.horizontalAxisY + this.config.histogram.marginBetweenAxesAndNumbers + this.currentTab.overviewModel.labelTextHeight;
        this.histogramCanvasContext.fillText(this.currentTab.histogramModel.metric.max, this.currentTab.histogramModel.horizontalAxisEndX - maxValueWidth / 2, valueLabelY);
        var originX = this.currentTab.histogramModel.horizontalAxisStartX - this.currentTab.overviewModel.labelTextHeight - this.config.histogram.marginBetweenAxesAndNumbers;
        this.histogramCanvasContext.fillText(0, originX, valueLabelY);
    }

    drawHistogramBars() {
        var occurenceStep = this.config.histogram.verticalAxisLength / this.currentTab.histogramModel.metric.histogram.max;

        this.currentTab.histogramModel.metric.histogram.data.forEach((occurences, value) => {
            this.histogramCanvasContext.fillStyle = this.getColorFromMap(value, this.currentTab.histogramModel.metric.colorMap);
            var x = this.currentTab.histogramModel.horizontalAxisStartX + this.config.histogram.barWidth * value;
            var y = this.currentTab.histogramModel.horizontalAxisY - occurenceStep * occurences;
            var height = this.currentTab.histogramModel.horizontalAxisY - y;
            var minHeight = this.config.histogram.minimumBarHeight;

            if (height < minHeight) {
                y = this.currentTab.histogramModel.horizontalAxisY - minHeight;
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
        this.currentTab.histogramModel.sliderY = this.currentTab.histogramModel.horizontalAxisY + this.config.histogram.marginBetweenSliderAndChart;
        this.histogramCanvasContext.beginPath();
        this.histogramCanvasContext.moveTo(this.currentTab.histogramModel.horizontalAxisStartX, this.currentTab.histogramModel.sliderY);
        this.histogramCanvasContext.lineTo(this.currentTab.histogramModel.horizontalAxisEndX, this.currentTab.histogramModel.sliderY);
        this.histogramCanvasContext.stroke();
        this.histogramCanvasContext.closePath();
    }

    drawHistogramThresholdBars() {
        var thresholdBarY = this.currentTab.histogramModel.sliderY - this.config.histogram.thresholdBarLength / 2;
        this.currentTab.histogramModel.thresholdBarList = [];
        var i = 0;

        this.currentTab.histogramModel.metric.colorMap.forEach((color, threshold) => {
            var bar = {};
            bar.threshold = threshold;
            bar.x = this.currentTab.histogramModel.horizontalAxisStartX + this.config.histogram.barWidth * (threshold.max + 1);

            // no need to draw slider bar for last threshold
            if (i < this.currentTab.histogramModel.metric.colorMap.size - 1) {
                this.histogramCanvasContext.beginPath();
                this.histogramCanvasContext.moveTo(bar.x, thresholdBarY);
                this.histogramCanvasContext.lineTo(bar.x, thresholdBarY + this.config.histogram.thresholdBarLength);
                this.histogramCanvasContext.stroke();
                this.histogramCanvasContext.closePath();
                ++i;
            }

            this.currentTab.histogramModel.thresholdBarList.push(bar);
        });
    }

    selectTab(tab) {
        this.currentTab = tab;
        this.showMergeSelectedGroups = false;
        this.waitForTabProcessingToFinish(tab);
    }

    waitForTabProcessingToFinish(tab) {
        if (this.currentTab == tab) {
            if (this.currentTab.isClustering) {
                this.$timeout(() => {
                    this.waitForTabProcessingToFinish(tab);
                }, 100);
            } else {
                this.$timeout(() => {
                    this.drawOverview();
                    this.drawSelectedGroupsMarkers();
                    this.drawFocusGraph();

                    this.$timeout(() => {
                        if (this.timeHighlightMode == this.enumList.timeHighlightMode.POINT) {
                            this.drawTimeIndicators();
                        } else {
                            this.drawSelectedTimeRanges();
                        }
                    });
                });
            };
        }
    }

    removeTab(tab) {
        _.remove(this.tabList, (search) => {
            return search == tab;
        });

        if (this.currentTab == tab) {
            this.selectTab(this.tabList[0]);
        }
    }

    moveMouseOnOverview(evt) {
        if (this.currentTab.overviewModel.metricList) {
            this.setOverviewMousePosition(evt);
            this.setSelectedMetricIndex();

            if (this.currentTab.overviewModel.selectedMetricIndex > -1) {
                // check if mouse is on metric label
                var bottomY = this.currentTab.overviewModel.overviewStartY - this.config.overview.marginBetweenLabelsAndOverview;

                if (this.isBetween(this.currentTab.overviewModel.mousePosition.y, 0, bottomY)) {
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
            } else if (this.currentTab.overviewModel.selectedMetricIndex > -1) {
                if (this.isDrawingFocusArea) {
                    this.drawFocusArea();
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
        this.currentTab.overviewModel.mousePosition = this.getMousePos(evt, this.focusAreaCanvas);
    }

    getMousePos(evt, canvas) {
        var rect = canvas.getBoundingClientRect();

        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    setSelectedMetricIndex() {
        this.currentTab.overviewModel.selectedMetricIndex = -1;

        for (var metricIndex = 0; metricIndex < this.currentTab.overviewModel.metricList.length; ++metricIndex) {
            var metric = this.currentTab.overviewModel.metricList[metricIndex];

            if (metric) {
                // only check if mouse is on a metric graph
                if (this.checkMouseIsInMetric(metric)) {
                    this.currentTab.overviewModel.selectedMetricIndex = metricIndex;
                    // set x position of mouse per overview graph for easier manipulation with mouse positions
                    this.currentTab.overviewModel.mousePositionXOffset =
                        this.currentTab.overviewModel.mousePosition.x - metric.startX + this.currentTab.overviewModel.metricList[0].startX;
                    break;
                }
            }
        }
    }

    checkMouseIsInMetric(metric) {
        if (this.isBetween(this.currentTab.overviewModel.mousePosition.x, metric.startX, metric.endX)) {
            if (this.isSingleGrouped()) {
                return this.isBetween(this.currentTab.overviewModel.mousePosition.y, metric.startY, metric.endY);
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    setOverviewCursorToPointer() {
        this.overviewCursor = "pointer";
    }

    deselectMetricLabel() {
        this.isSelectingMetricLabel = false;
        this.initialiseOverviewCanvasCursor();
    }

    handleMouseMoveOnGroupedOverview() {
        this.currentTab.overviewModel.hoveredGroup = null;
        this.currentTab.overviewModel.hoveredMarker = null;

        if (this.currentTab.overviewModel.isSelectingTimeRange) {
            this.initialiseSelectedGroupTimeRangeIndexList();
            this.initialiseGroupsOverlapCount();
            this.drawSelectedTimeRanges();
            this.drawFocusGraph(false);
        } else {
            this.checkAndSetSelectedOverviewMarker();

            if (this.currentTab.overviewModel.selectedMetricIndex >= 0) {
                this.checkAndSetHoveredGroup();
                this.checkMouseIsOnTimeRange();
            }

            if (this.currentTab.overviewModel.isHoveringOnTimeRange) {
                this.overviewCursor = "pointer";
            }

            if (this.timeHighlightMode == this.enumList.timeHighlightMode.POINT) {
                this.setSelectedTimeIndexAndDrawTimeIndicators();
            }
        }
    }

    checkAndSetSelectedOverviewMarker() {
        for (var markerIndex = 0; markerIndex < this.currentTab.overviewModel.groupMarkerList.length; ++markerIndex) {
            var marker = this.currentTab.overviewModel.groupMarkerList[markerIndex];

            if (this.isBetween(this.currentTab.overviewModel.mousePosition.x, marker.startX, marker.endX) &&
                this.isBetween(this.currentTab.overviewModel.mousePosition.y, marker.startY, marker.endY)) {
                this.setOverviewCursorToPointer();
                this.currentTab.overviewModel.hoveredMarker = marker;
                return;
            }
        }
    }

    checkAndSetHoveredGroup() {
        var groupList;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            var metric = this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.selectedMetricIndex];
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
        if (this.isBetween(this.currentTab.overviewModel.mousePosition.y, group.y, group.y + this.config.overview.groupedPointHeight)) {
            this.currentTab.overviewModel.hoveredGroup = group;
            this.setOverviewCursorToPointer();
            return true;
        }
    }

    setSelectedTimeIndexAndDrawTimeIndicators() {
        if (this.currentTab.overviewModel.hoveredGroup) {
            if (this.isCompressed && this.groupingMode == this.enumList.groupingMode.MULTIPLE) {
                this.setSelectedTimeIndex();
            }

            this.drawTimeIndicators();
        } else {
            this.clearTimeIndicator();
        }
    }

    setSelectedTimeIndex() {
        var overviewMetric = this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.selectedMetricIndex];
        var groupList = this.getCurrentMultiMetricGroupList();

        for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
            var instanceMetric = groupList[groupIndex].instanceList[0].metricList[this.currentTab.overviewModel.selectedMetricIndex];

            for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                var pointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];
                var point = instanceMetric.data[pointIndex];

                if (point) {
                    if (this.checkDataPointIsSelected(point)) {
                        this.currentTab.overviewModel.selectedTimeIndex = pointIndex;
                        return;
                    }
                }
            }
        }
    }

    checkDataPointIsSelected(point) {
        return this.isBetween(this.currentTab.overviewModel.mousePosition.x, point.x, point.x + this.currentTab.overviewModel.pointWidth);
    }

    drawTimeIndicators() {
        this.clearTimeIndicator();
        this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.drawTimeIndicatorWrapper(this.currentTab.overviewModel.metricList[this.currentTab.overviewModel.selectedMetricIndex]);
        } else {
            this.currentTab.overviewModel.metricList.forEach((metric, metricIndex) => {
                this.drawTimeIndicatorWrapper(metric, metricIndex);
            });
        }

        this.drawSelectedTimeLabel();
    }

    drawTimeIndicatorWrapper(overviewMetric, metricIndex) {
        var horizontalLineY = this.drawHorizontalTimeLine(overviewMetric, this.currentTab.overviewModel.hoveredGroup);
        var verticalLineX;

        if (this.isCompressed && this.groupingMode == this.enumList.groupingMode.MULTIPLE &&
            metricIndex != null && metricIndex != this.currentTab.overviewModel.selectedMetricIndex) {
            verticalLineX = this.getTimeIndicatorXForNonSelectedMetric(overviewMetric, metricIndex);
        } else {
            verticalLineX = overviewMetric.startX + this.currentTab.overviewModel.mousePositionXOffset - this.currentTab.overviewModel.metricList[0].startX;
        }

        this.drawSelectedTimePoint(overviewMetric, horizontalLineY, verticalLineX);
    }

    getTimeIndicatorXForNonSelectedMetric(overviewMetric, metricIndex) {
        var previousPointIndex = 0;

        for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
            var currentPointIndex = overviewMetric.compressedTimeIndexList[compressedTimeIndex];

            if (this.isBetween(this.currentTab.overviewModel.selectedTimeIndex, previousPointIndex, currentPointIndex)) {
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
        this.overviewTimeIndicatorContext.lineTo(verticalLineX, this.currentTab.overviewModel.hoveredGroup.y);
        this.overviewTimeIndicatorContext.stroke();
        this.overviewTimeIndicatorContext.closePath();
    }

    drawSelectedTimeLabel() {
        for (var metricIndex = 0; metricIndex < this.currentTab.overviewModel.metricList.length; ++metricIndex) {
            var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex];

            // some groups are empty -> need to iterate through group list until find one that isn't
            var groupList = this.getCurrentSingleMetricGroupList(overviewMetric)

            for (var groupIndex = 0; groupIndex < groupList.length; ++groupIndex) {
                var instanceMetric = groupList[groupIndex].instanceList[0].metricList[metricIndex];

                if (this.isCompressed) {
                    for (var compressedTimeIndex = 0; compressedTimeIndex < overviewMetric.compressedTimeIndexList.length; ++compressedTimeIndex) {
                        var point = instanceMetric.data[overviewMetric.compressedTimeIndexList[compressedTimeIndex]];

                        if (point) {
                            if (this.checkDataPointIsSelectedAndDrawTimeLabel(point, overviewMetric)) {
                                return;
                            }
                        }
                    }
                } else {
                    for (var pointIndex = 0; pointIndex < instanceMetric.data.length; ++pointIndex) {
                        var point = instanceMetric.data[pointIndex];

                        if (this.checkDataPointIsSelectedAndDrawTimeLabel(point, overviewMetric)) {
                            return;
                        }
                    }
                }
            }
        }
    }

    checkDataPointIsSelectedAndDrawTimeLabel(point, metric) {
        if (this.checkDataPointIsSelected(point)) {
            this.overviewTimeIndicatorContext.font = "italic " + this.config.overview.timeFontSize + "px Arial";
            this.overviewTimeIndicatorContext.fillStyle = "black";
            var date = this.convertDateToString(point.date);
            var y = metric.timeLabelY + this.config.overview.marginBetweenLabelsAndOverview;
            var x = Math.max(0, this.currentTab.overviewModel.mousePosition.x - this.currentTab.overviewModel.toDateWidth / 2);
            this.overviewTimeIndicatorContext.fillText(date, x, y);
            return true;
        } else {
            return false;
        }
    }

    checkMouseIsOnTimeRange() {
        this.currentTab.overviewModel.isHoveringOnTimeRange = false;
        this.currentTab.overviewModel.mouseIsInsideTimeRange = false;
        this.currentTab.overviewModel.hoveredTimeRangeGroup = null;

        this.currentTab.overviewModel.timeRangePositionMap.forEach((position, group) => {
            if (this.currentTab.overviewModel.selectedMetricIndex == group.metricIndex &&
                this.isBetween(this.currentTab.overviewModel.mousePosition.y, position.startY, group.y)) {
                this.currentTab.overviewModel.isHoveringOnTimeRange = true;
                this.currentTab.overviewModel.hoveredTimeRangeGroup = group;

                if (this.isBetween(this.currentTab.overviewModel.mousePosition.x, position.startX, position.endX)) {
                    this.currentTab.overviewModel.mouseIsInsideTimeRange = true;
                }
            }
        });
    }

    initialiseSelectedGroupTimeRangeIndexList() {
        if (!this.currentTab.overviewModel.timeRangeGroup.isSelected) {
            this.addOrRemoveGroupToFocus(this.currentTab.overviewModel.timeRangeGroup, false);
            this.drawOverview();
            this.drawSelectedGroupsMarkers();
        }

        this.currentTab.overviewModel.timeRangeGroup.timeRangeIndexList = [];
        var metricIndex = this.currentTab.overviewModel.selectedMetricIndex;
        var instanceMetric = this.currentTab.overviewModel.timeRangeGroup.instanceList[0].metricList[metricIndex];
        var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex];
        var startX = overviewMetric.startX + this.currentTab.overviewModel.timeRangeStartOffset - this.currentTab.overviewModel.metricList[0].startX;
        var firstMetric = this.currentTab.overviewModel.metricList[0];
        var endX = overviewMetric.startX + this.currentTab.overviewModel.mousePositionXOffset - firstMetric.startX;

        if (startX > endX) {
            var temp = startX;
            startX = endX;
            endX = temp;
        }

        instanceMetric.data.forEach((point, pointIndex) => {
            if (this.isBetween(point.x, startX, endX)) {
                this.currentTab.overviewModel.timeRangeGroup.timeRangeIndexList.push(pointIndex);
            }
        });

        if (this.currentTab.overviewModel.timeRangeGroup.timeRangeIndexList.length > 0) {
            this.setTimeRangeStartAndEndDate();
        }
    }

    setTimeRangeStartAndEndDate() {
        var timeRangeGroup = this.currentTab.overviewModel.timeRangeGroup;
        var metric = timeRangeGroup.instanceList[0].metricList[this.currentTab.overviewModel.selectedMetricIndex];
        var timeRangeIndexList = timeRangeGroup.timeRangeIndexList;
        var startPoint = metric.data[timeRangeIndexList[0]];
        timeRangeGroup.startTimeRangeDate = this.convertDateToString(startPoint.date);
        var endPoint = metric.data[timeRangeIndexList[timeRangeIndexList.length - 1]];
        timeRangeGroup.endTimeRangeDate = this.convertDateToString(endPoint.date);
    }

    drawSelectedTimeRanges() {
        this.clearTimeIndicator();
        this.overviewTimeIndicatorContext.strokeStyle = this.config.timeIndicator.color;
        this.overviewTimeIndicatorContext.fillStyle = this.config.timeIndicator.color;

        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.currentTab.overviewModel.metricList.forEach((metric) => {
                var groupList = this.getCurrentSingleMetricGroupList(metric);

                groupList.forEach((group) => {
                    this.drawSelectedTimeRangeWrapper(group, [group.metricIndex]);
                });
            });
        } else {
            var groupList = this.getCurrentMultiMetricGroupList();

            groupList.forEach((group) => {
                this.drawSelectedTimeRangeWrapper(group, Array.from(Array(this.currentTab.overviewModel.metricList.length).keys()));
            });
        }
    }

    drawSelectedTimeRangeWrapper(group, metricIndexList) {
        if (group.timeRangeIndexList && group.timeRangeIndexList.length > 0) {
            metricIndexList.forEach((metricIndex) => {
                var instanceMetric = group.instanceList[0].metricList[metricIndex];
                var overviewMetric = this.currentTab.overviewModel.metricList[metricIndex];
                var startPoint, endPoint;
                var startRangeIndex = group.timeRangeIndexList[0];
                var endRangeIndex = group.timeRangeIndexList[group.timeRangeIndexList.length - 1];

                if (this.isCompressed && metricIndex != group.metricIndex) {
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
        var endX = endPoint.x + this.currentTab.overviewModel.pointWidth;
        var width = endX - startX;
        var height = group.y - startY;

        if (group.overlapCount > 0 || this.currentTab.focusModel.groupList.length == 1) {
            this.overviewTimeIndicatorContext.fillRect(startX, startY, width, height);
        } else {
            this.drawSelectedTimeRangeVerticalLine(startX, startY, group.y);
            this.drawSelectedTimeRangeVerticalLine(endX, startY, group.y);
        }

        var position = {
            startX: startX,
            endX: endX,
            startY: startY
        };

        this.currentTab.overviewModel.timeRangePositionMap.set(group, position);
    }

    drawSelectedTimeRangeVerticalLine(x, startY, endY) {
        this.overviewTimeIndicatorContext.beginPath();
        this.overviewTimeIndicatorContext.moveTo(x, startY);
        this.overviewTimeIndicatorContext.lineTo(x, endY);
        this.overviewTimeIndicatorContext.stroke();
        this.overviewTimeIndicatorContext.closePath();
    }

    drawFocusArea() {
        this.initialiseFocusAreaPoints();

        if (this.currentTab.focusAreaModel.startX != this.currentTab.focusAreaModel.endX &&
            this.currentTab.focusAreaModel.startY != this.currentTab.focusAreaModel.endY) {
            this.focusInArea = true;
            this.focusAreaIsFixed = false;
            this.drawFocusAreaSquare();
        } else {
            this.focusInArea = false;
        }
    }

    initialiseFocusAreaPoints() {
        var firstMetric = this.currentTab.overviewModel.metricList[0];
        this.currentTab.focusAreaModel.startX = this.currentTab.overviewModel.focusAreaStartPoint.x;
        this.currentTab.focusAreaModel.endX = this.currentTab.overviewModel.mousePositionXOffset - firstMetric.startX;

        if (this.currentTab.focusAreaModel.startX > this.currentTab.overviewModel.mousePositionXOffset) {
            this.currentTab.focusAreaModel.startX = this.currentTab.overviewModel.mousePositionXOffset;
            this.currentTab.focusAreaModel.endX = this.currentTab.overviewModel.focusAreaStartPoint.x;
        }

        this.currentTab.focusAreaModel.startY = this.currentTab.overviewModel.focusAreaStartPoint.y;
        this.currentTab.focusAreaModel.endY = this.currentTab.overviewModel.mousePosition.y;

        if (this.currentTab.focusAreaModel.startY > this.currentTab.overviewModel.mousePosition.y) {
            this.currentTab.focusAreaModel.startY = this.currentTab.overviewModel.mousePosition.y;
            this.currentTab.focusAreaModel.endY = this.currentTab.overviewModel.focusAreaStartPoint.y;
        }

        this.currentTab.focusAreaModel.startX = Math.max(this.currentTab.focusAreaModel.startX, firstMetric.startX);
        this.currentTab.focusAreaModel.endX = Math.min(this.currentTab.focusAreaModel.endX, firstMetric.endX);
        this.currentTab.focusAreaModel.startY = Math.max(this.currentTab.focusAreaModel.startY, this.currentTab.overviewModel.overviewStartY);
        this.currentTab.focusAreaModel.endY = Math.min(this.currentTab.focusAreaModel.endY, this.currentTab.overviewModel.overviewEndY);
    }

    drawFocusAreaSquare() {
        this.clearFocusArea();
        this.focusAreaContext.strokeStyle = this.config.focusArea.color;
        var width = this.currentTab.focusAreaModel.endX - this.currentTab.focusAreaModel.startX;
        var height = this.currentTab.focusAreaModel.endY - this.currentTab.focusAreaModel.startY;

        this.currentTab.overviewModel.metricList.forEach((metric) => {
            this.focusAreaContext.strokeRect(metric.startX + this.currentTab.focusAreaModel.startX, this.currentTab.focusAreaModel.startY, width, height);
        });
    }

    mouseUpOnOverView() {
        if (this.isGrouped) {
            if (this.currentTab.overviewModel.hoveredMarker) {
                this.startFocusMarkerInterval(this.currentTab.overviewModel.hoveredMarker.group);
            } else if (this.currentTab.overviewModel.isHoveringOnTimeRange) {
                if (this.currentTab.overviewModel.mouseIsInsideTimeRange && this.currentTab.overviewModel.hoveredTimeRangeGroup.overlapCount > 0) {
                    this.addNewTab();
                    this.selectTab(this.currentTab);
                } else {
                    this.currentTab.overviewModel.hoveredTimeRangeGroup.timeRangeIndexList = null;
                    this.drawSelectedTimeRanges();
                    this.drawFocusGraph(false);
                }
            } else {
                this.updateSelectedGroupListAndDrawFocusGraph(false);
            }

            this.currentTab.overviewModel.isHoveringOnTimeRange = false;
            this.currentTab.overviewModel.isSelectingTimeRange = false;
        } else {
            if (this.isDrawingFocusArea) {
                this.drawFocusGraph(false);
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

                if (this.currentTab.focusModel.overviewGroupWithIntervalList) {
                    this.currentTab.focusModel.overviewGroupWithIntervalList.forEach((overviewGroup) => {
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
                this.drawAllGroupFocusMarkers();
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

            this.drawAllGroupFocusMarkers();
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

    addNewTab() {
        var newTab = this.initialiseNewTab();
        this.initialiseNewTabDatesAndData(newTab);

        newTab.overviewModel.metricList.forEach((newMetric, metricIndex) => {
            var oldMetric = this.currentTab.overviewModel.metricList[metricIndex];
            newMetric.layerRange = oldMetric.layerRange;
            newMetric.colorMap = oldMetric.colorMap;
        });

        this.currentTab = newTab;
        this.initialiseOverviewData();

        this.initialiseOverviewGroups();
        this.initialiseCompressedTimeIndexes();
    }

    initialiseNewTabDatesAndData(newTab) {
        var timeRangeGroupList = this.getTimeRangeGroupList();
        this.initialiseNewTabDates(newTab, timeRangeGroupList);
        this.initialiseNewTabData(newTab);
    }

    getTimeRangeGroupList() {
        var timeRangeGroupList = [];

        this.currentTab.overviewModel.metricList.forEach((metric) => {
            var groupList = this.getCurrentSingleMetricGroupList(metric);

            groupList.forEach((group) => {
                if (group.timeRangeIndexList && group.timeRangeIndexList.length > 0) {
                    timeRangeGroupList.push(group);
                }
            });
        });

        return timeRangeGroupList;
    }

    initialiseNewTabDates(newTab, timeRangeGroupList) {
        newTab.fromDate = -1;
        newTab.toDate = -1;

        timeRangeGroupList.forEach((group) => {
            var timeRangeIndexList = group.timeRangeIndexList;
            var metric = group.instanceList[0].metricList[group.metricIndex];
            var fromDate = metric.data[timeRangeIndexList[0]].date;
            var toDate = metric.data[timeRangeIndexList[timeRangeIndexList.length - 1]].date;

            if (newTab.fromDate == -1 || newTab.fromDate > fromDate) {
                newTab.fromDate = fromDate;
            }

            if (newTab.toDate == -1 || newTab.toDate < toDate) {
                newTab.toDate = toDate;
            }
        });

        newTab.fromDateString = this.convertDateToString(newTab.fromDate);
        newTab.toDateString = this.convertDateToString(newTab.toDate);
    }

    initialiseNewTabData(newTab) {
        this.currentTab.overviewModel.metricList.forEach((metric) => {
            var newMetric = {};
            newMetric.data = [];

            metric.data.forEach((metricInstance) => {
                if (this.checkInstanceIsInOverlapList(metricInstance)) {
                    var newMetricInstance = {};
                    newMetricInstance.metric = metricInstance.metric;
                    newMetricInstance.values = [];

                    metricInstance.values.forEach((value) => {
                        var date = value[0];

                        if (this.isBetween(date, newTab.fromDate, newTab.toDate)) {
                            newMetricInstance.values.push(value);
                        }
                    });

                    newMetric.data.push(newMetricInstance);
                }
            });

            newTab.overviewModel.metricList.push(newMetric);
        });
    }

    checkInstanceIsInOverlapList(instance) {
        for (var i = 0; i < this.currentTab.focusModel.overlappingList.length; ++i) {
            var overlappingInstance = this.currentTab.focusModel.overlappingList[i];

            if (instance.metric.instance == overlappingInstance.instance) {
                return true;
            }
        }

        return false;
    }

    updateSelectedGroupListAndDrawFocusGraph() {
        var updatedSelectedGroups = false;

        if (this.currentTab.overviewModel.isSelectingTimeRange) {
            var removeExisting = this.currentTab.overviewModel.timeRangeStartOffset == this.currentTab.overviewModel.mousePositionXOffset;
            this.addOrRemoveGroupToFocus(this.currentTab.overviewModel.timeRangeGroup, removeExisting);
            updatedSelectedGroups = true;
        } else if (this.currentTab.overviewModel.hoveredGroup) {
            this.addOrRemoveGroupToFocus(this.currentTab.overviewModel.hoveredGroup, true);
            updatedSelectedGroups = true;
        } else {
            this.stopInterval();
        }

        if (updatedSelectedGroups) {
            this.drawFocusAfterUpdatingSelectedGroups();
        }
    }

    removeExistingGroupsInMetricByGroup(group) {
        _.remove(this.currentTab.focusModel.groupList, (search) => {
            search.overviewGroup.metricIndex == group.metricIndex &&
                search.overviewGroup != group;
        });

        var groupList = this.getCurrentSingleMetricGroupList(this.currentTab.overviewModel.metricList[group.metricIndex]);

        if (groupList) {
            groupList.forEach((existingGroup) => {
                if (existingGroup != group) {
                    existingGroup.isSelected = false;
                    existingGroup.timeRangeIndexList = null;
                }
            });
        }
    }

    drawFocusAfterUpdatingSelectedGroups() {
        if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
            this.initialiseGroupsOverlapCount();
            this.initialiseOverlapList();
            this.drawOverview();
        }

        this.drawSelectedGroupsMarkers();
        this.drawFocusGraph(false);
        this.drawOverlapDetails();

        if (this.timeHighlightMode == this.enumList.timeHighlightMode.RANGE) {
            this.drawSelectedTimeRanges();
        }
    }

    initialiseOverlapList() {
        this.currentTab.focusModel.overlappingList = [];
        var metricIndex = this.currentTab.overviewModel.selectedMetricIndexSet.values().next().value;
        var instanceList = this.getAllInstanceListForSelectedMetric(metricIndex);

        instanceList.forEach((instance) => {
            this.checkAndAddOverlappingInstance(metricIndex, instance)
        });
    }

    getAllInstanceListForSelectedMetric(metricIndex) {
        var instanceList = [];

        this.currentTab.focusModel.groupList.forEach((group) => {
            if (group.overviewGroup.metricIndex == metricIndex) {
                instanceList = instanceList.concat(group.instanceList);
            }
        });

        return instanceList;
    }

    checkAndAddOverlappingInstance(metricIndex, instance) {
        var check = 0;

        this.currentTab.focusModel.groupList.forEach((group) => {
            if (group.overviewGroup.metricIndex != metricIndex) {
                var overlappingInstance = _.find(group.instanceList, (search) => {
                    return search.instance == instance.instance;
                });

                if (overlappingInstance) {
                    ++check;
                }
            }
        });

        if (check == this.currentTab.overviewModel.selectedMetricIndexSet.size - 1) {
            this.currentTab.focusModel.overlappingList.push(instance);
        }
    }

    drawOverlapDetails() {
        if (this.showOverlapDetails) {
            this.$timeout(() => {
                this.overlapGraphHeight = this.currentTab.focusModel.groupList.length * this.config.focusGraph.metricMaxHeight +
                    (this.currentTab.focusModel.groupList.length - 1) * this.config.focusGraph.marginBetweenMetrics;
                this.scope.$apply();

                var metricIndexList = [];

                this.currentTab.focusModel.groupList.forEach((group) => {
                    metricIndexList.push(group.overviewGroup.metricIndex);
                });

                this.currentTab.focusModel.overlappingList.forEach((instance, instanceIndex) => {
                    this.drawOverlapInstance(instance, instanceIndex, metricIndexList);
                });
            });
        }
    }

    drawOverlapInstance(instance, instanceIndex, metricIndexList) {
        var canvas = this.getElementByID("focusGraphOverlapCanvas-" + instanceIndex)
        var context = this.getCanvasContext(canvas);
        context.clearRect(0, 0, canvas.width, canvas.height);
        var valueIndexList = Array.from(Array(this.getMaxMetricLength()).keys());
        var metricList = [];

        metricIndexList.forEach((metricIndex) => {
            metricList.push(instance.metricList[metricIndex]);
        });

        this.drawFocusGraphInstance(context, valueIndexList, this.currentTab.focusModel.pointWidth, metricList, metricIndexList);
    }

    drawFocus() {
        for (var i = 0; i < this.currentTab.overviewModel.metricList.length; ++i) {
            var metric = this.currentTab.overviewModel.metricList[i];

            if (metric) {
                // only update focus graph if mouse is pointing on one of metric overview graphs
                if (this.checkMouseIsInMetric(metric)) {
                    this.drawFocusGraph(true);
                    break;
                }
            }
        }
    }

    setFocusFromAndToDate() {
        for (var instanceIndex = 0; instanceIndex < this.currentTab.overviewModel.data.length; ++instanceIndex) {
            var instance = this.currentTab.overviewModel.data[instanceIndex];
            var set = false;

            for (var metricIndex = 0; metricIndex < instance.metricList.length; ++metricIndex) {
                var metric = instance.metricList[metricIndex];
                var fromIndex = this.currentTab.focusModel.focusedIndexList[0];
                var toIndex = this.currentTab.focusModel.focusedIndexList[this.currentTab.focusModel.focusedIndexList.length - 1];

                if (metric.data[fromIndex] && metric.data[toIndex]) {
                    this.focusedFromDate = this.convertDateToString(metric.data[fromIndex].date);
                    this.focusedToDate = this.convertDateToString(metric.data[toIndex].date);
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
        if (this.isGrouped) {
            this.$timeout(() => {
                if (this.groupingMode == this.enumList.groupingMode.SINGLE) {
                    this.focusGraphMarkerWidth = (this.config.focusGraph.markerSize / 2 + this.config.focusGraph.marginBetweenMarkers) *
                        this.currentTab.overviewModel.metricList.length;
                } else {
                    this.focusGraphMarkerWidth = this.config.focusGraph.markerSize / 2 + this.config.focusGraph.marginBetweenMarkers;
                }

                this.focusGraphMarkerHeight = this.config.focusGraph.markerSize;
                this.scope.$apply();
                this.drawAllGroupFocusMarkers();
                this.drawGroupedFocusGraph();
            });
        } else if (this.currentTab.overviewModel.selectedMetricIndex > -1) {
            this.drawUngroupedFocusGraph();
        }
    }

    drawAllGroupFocusMarkers() {
        this.currentTab.focusModel.groupList.forEach((group, groupIndex) => {
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

        context.font = this.config.focusGraph.markerSize + "px calculator";
        context.fillStyle = group.color;
        // context.fillRect(x, 0, this.config.focusGraph.markerSize, this.config.focusGraph.markerSize);
        context.fillText(this.getGroupNumber(group), x, 0 + this.config.focusGraph.markerSize);
    }

    drawGroupedFocusGraph() {
        this.currentTab.focusModel.groupList.forEach((group, groupIndex) => {
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
        var metricList = instance.metricList;
        var metricIndexList = Array.from(Array(instance.metricList.length).keys())

        if (this.groupingMode == this.enumList.groupingMode.SINGLE && !group.showAllMetrics) {
            metricList = [instance.metricList[group.mainMetricIndex]];
            metricIndexList = [group.mainMetricIndex];
        }

        // selected time range
        if (group.overviewGroup.timeRangeIndexList) {
            var pointWidth = Math.max(1, Math.floor(this.config.focusGraph.maxWidth / group.overviewGroup.timeRangeIndexList.length));
            this.drawGroupedFocusGraphInstance(canvas, group.overviewGroup.timeRangeIndexList, pointWidth, metricList, metricIndexList);
        } else {
            var valueList = Array.from(Array(maxMetricLength).keys());
            this.drawGroupedFocusGraphInstance(canvas, valueList, this.currentTab.focusModel.pointWidth, metricList, metricIndexList);
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
                var panelMetric = this.panel.metricList[metricIndexList[metricListIndex]];
                context.fillStyle = panelMetric.colorList[layerIndex];
                var y = (this.config.focusGraph.metricMaxHeight + this.config.focusGraph.marginBetweenMetrics) * metricListIndex +
                    this.config.focusGraph.metricMaxHeight;
                context.beginPath();

                // start drawing from bottom
                context.moveTo(0, y);
                var x = 0;
                var totalValue = 0;

                valueIndexList.forEach((valueIndex, positionIndex) => {
                    var value = layer.valueList[valueIndex];

                    if (value != null) {
                        x = pointWidth * positionIndex;
                        this.moveFocusGraphContextBasedOnValue(context, value, layer, layerIndex, x, y);
                        totalValue += value;
                    }
                });

                // draw straight line to base at the end
                context.lineTo(x, y);

                // move back to the starting point
                context.lineTo(0, y);
                context.closePath();

                if (totalValue > 0 || layerIndex == 0) {
                    context.fill();
                }
            });
        });
    }

    drawUngroupedFocusGraph() {
        this.currentTab.focusModel.data.forEach((instance, instanceIndex) => {
            var canvas = this.getUngroupedFocusCanvas(instanceIndex);
            var context = this.getCanvasContext(canvas);
            context.clearRect(0, 0, canvas.width, canvas.height);
            var valueIndexList = Array.from(Array(this.getMaxMetricLength()).keys());
            var metricList = [instance.metricList[this.currentTab.overviewModel.selectedMetricIndex]];
            var metricIndexList = [this.currentTab.overviewModel.selectedMetricIndex];

            if (instance.showAllMetrics) {
                metricList = instance.metricList;
                metricIndexList = Array.from(Array(instance.metricList.length).keys());
            }

            this.drawFocusGraphInstance(context, valueIndexList, this.currentTab.focusModel.pointWidth, metricList, metricIndexList);
        });
    }

    getUngroupedFocusCanvas(instanceIndex) {
        return this.getElementByID("focusGraphCanvas-" + instanceIndex);
    }

    moveFocusGraphContextBasedOnValue(context, value, layer, layerIndex, x, y) {
        if (value == 0) {
            // draw line straight down to base if value is 0
            var baseY = layerIndex == 0 ? y - this.config.focusGraph.metricMinHeight : y;
            context.lineTo(x, baseY);
        } else {
            var height;

            if (value >= layer.range) {
                height = this.config.focusGraph.metricMaxHeight;
            } else {
                height = value * this.config.focusGraph.metricMaxHeight / layer.range;
            }

            height = Math.max(this.config.focusGraph.metricMinHeight, height);
            context.lineTo(x, y - height);
        }
    }

    autoSrollFocusGraph() {
        if (this.isGrouped) {
            if (this.currentTab.overviewModel.hoveredGroup && this.currentTab.overviewModel.hoveredGroup.isSelected) {
                var rowCount = 0;

                this.currentTab.focusModel.groupList.forEach((group) => {
                    if (group.showDetails) {
                        rowCount += group.instanceList.length;
                    } else {
                        ++rowCount;
                    }
                });

                this.focusGraphContainer.scrollTop = this.currentTab.focusModel.focusRowHeight * rowCount;
            }
        } else {
            this.scrollByInstance();
        }
    }

    scrollByInstance() {
        var instance = this.getHoveredInstance();

        if (instance) {
            for (var i = 0; i < this.currentTab.focusModel.data.length; ++i) {
                var focusModelInstance = this.currentTab.focusModel.data[i];

                if (instance.instance == focusModelInstance.instance) {
                    focusModelInstance.isSelected = true;
                    this.focusGraphContainer.scrollTop = this.currentTab.focusModel.focusRowHeight * i;
                } else {
                    focusModelInstance.isSelected = false;
                }
            }
        }
    }

    getHoveredInstance() {
        for (var i = 0; i < this.currentTab.overviewModel.data.length; ++i) {
            var instance = this.currentTab.overviewModel.data[i];

            if (this.isBetween(this.currentTab.overviewModel.mousePosition.y, instance.y - this.config.overview.ungroupedPointHeight, instance.y)) {
                return instance;
            }
        }
    }

    leaveMouseFromOverview() {
        this.currentTab.overviewModel.isSelectingTimeRange = false;
    }

    collapseExpandFocus() {
        this.collapseFocusGraph = !this.collapseFocusGraph;

        if (this.collapseFocusGraph) {
            this.focusPanelHeight -= this.config.focusGraph.graphHeight;
            this.overviewPanelHeight += this.config.focusGraph.graphHeight;
        } else {
            this.focusPanelHeight += this.config.focusGraph.graphHeight;
            this.overviewPanelHeight -= this.config.focusGraph.graphHeight;
        }
    }

    moveMouseOnFocusGroup(group, instance) {
        if (this.groupingMode == this.enumList.groupingMode.MULTIPLE || !group.showDetails) {
            this.currentTab.focusModel.overviewGroupWithIntervalList = [group.overviewGroup];
            this.startOverviewMarkerInterval(group);
        } else {
            this.currentTab.focusModel.overviewGroupWithIntervalList = instance.groupWithMarkerList;
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

            if (this.currentTab.focusModel.overviewGroupWithIntervalList) {
                this.currentTab.focusModel.overviewGroupWithIntervalList.forEach((overviewGroup) => {
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
            this.currentTab.focusModel.groupList.forEach((group) => {
                group.instanceList.forEach((instance) => {
                    instance.isSelected = false;
                })
            });
        } else {
            this.currentTab.focusModel.data.forEach((focusInstance) => {
                focusInstance.isSelected = false;
            });
        }

        instance.isSelected = true;
        var canvas = this.getGroupedFocusCanvas(groupIndex, instanceIndex);
        //  this.showPopup(instance, evt, groupIndex, instanceIndex, canvas)
    }

    showPopup(instance, evt, canvas) {
        var mousePos = this.getMousePos(evt, canvas);
        var metricHeight = this.config.focusGraph.metricMaxHeight + this.config.focusGraph.marginBetweenMetrics;

        for (var i = 0; i < this.currentTab.overviewModel.metricList.length; ++i) {
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

    showHideOverlapDetails() {
        this.showOverlapDetails = !this.showOverlapDetails;
        this.drawOverlapDetails();
    }

    selectNode(index, evt) {
        var instance = this.currentTab.focusModel.data[index];
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