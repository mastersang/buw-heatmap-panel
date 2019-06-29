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
            colors:
                [
                    ["f2d9e6", "d98cb3", "bf4080", "73264d"],
                    ["ccddff", "6699ff", "0055ff", "003399"],
                    ["eeeedd", "cccc99", "aaaa55", "666633"]
                ],
            marginBetweenOverviewMetrics: 2,
            marginBetweenInstances: 6,
            overviewPointWidth: 1,
            overviewPointHeight: 2,
            paddingBetweenGraphs: 50,
            leftPadding: 0,
            horizontalMargin: 40,
            fontSize: 15,
            focusPointWidth: 5,
            focusMetricMaxHeight: 30,
            marginBetweenFocusMetrics: 10,
            marginBetweenFocusInstances: 20
        }
    }

    link(scope, elem, attrs, ctrl) {
        this.scope = scope;
        this.elem = elem;
        var parent = this;

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

    onDataReceived(data) {
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
            metric.colorMap = new Map();
            metric.layerRange = metric.max / (colors.length - 0.5);

            for (var i = 0; i < colors.length; ++i) {
                var threshold = {};
                threshold.min = i * metric.layerRange;
                threshold.max = threshold.min + metric.layerRange;
                metric.colorMap.set(threshold, colors[i]);
            }
        });
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
        newInstance.metricList = [[], [], []];
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
        var maxLength = this.getMaxLength();
        this.overviewModel.overviewInstantHeight = this.config.overviewPointHeight * this.overviewModel.metricList.length +
            this.config.marginBetweenOverviewMetrics * (this.overviewModel.metricList.length - 1) + this.config.marginBetweenInstances;
        this.scope.ctrl.overviewWidth = maxLength * this.config.overviewPointWidth;
        this.scope.ctrl.overviewHeight = this.overviewModel.data.length * this.overviewModel.overviewInstantHeight;
        this.scope.ctrl.focusGraphMarginTop = this.scope.ctrl.overviewHeight + this.config.paddingBetweenGraphs;
        this.scope.$apply();

        this.overviewModel.data.forEach((instance, instanceIndex) => {
            instance.overviewY = instanceIndex * this.overviewModel.overviewInstantHeight;

            instance.metricList.forEach((metric, metricIndex) => {
                metric.forEach((point, pointIndex) => {
                    point.x = this.config.leftPadding + pointIndex * this.config.overviewPointWidth;
                    point.color = this.getColorFromMap(point.value, this.overviewModel.metricList[metricIndex].colorMap);
                    this.overviewContext.fillStyle = point.color;
                    var y = instance.overviewY + metricIndex * this.config.overviewPointHeight * this.config.marginBetweenOverviewMetrics;
                    this.overviewContext.fillRect(point.x, y, this.config.overviewPointHeight, this.config.overviewPointHeight);
                });
            });
        });
    }

    getMaxLength() {
        var firstInstance = this.overviewModel.data[0];
        var maxLength = 0;

        firstInstance.metricList.forEach((metric) => {
            if (metric.length > maxLength) {
                maxLength = metric.length;
            }
        });

        return maxLength;
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
        this.mousePos = this.getMousePos(evt, this.overviewCanvas);
        this.clearFocus();
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

        this.overviewModel.data.forEach((overviewInstance) => {
            if (overviewInstance.overviewY <= this.focusStartY + this.getFocusAreaSize() &&
                overviewInstance.overviewY + this.overviewModel.overviewInstantHeight >= this.focusStartY) {
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
                metric.forEach((point, index) => {
                    if (point.x >= this.focusStartX && point.x <= this.focusStartX + this.getFocusAreaSize()) {
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
                focusMetric.data.push(overviewInstance.metricList[metricIndex][index]);
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
        var instanceHeight = this.config.focusMetricMaxHeight * this.overviewModel.metricList.length +
            this.config.marginBetweenFocusMetrics * (this.overviewModel.metricList.length - 1) + this.config.marginBetweenFocusInstances;

        this.focusModel.data.forEach((instance, index) => {
            var x = this.config.leftPadding;
            var label = instance.instance;
            var metrics = this.focusGraphContext.measureText(label);
            instance.y = index * instanceHeight;
            var labelY = instance.y + instanceHeight / 2;
            this.focusGraphContext.fillText(label, x, labelY);

            if (index > 0) {
                this.drawSeperator(instance, x);
            }

            if (metrics.width > this.focusModel.horizontalX) {
                this.focusModel.horizontalX = metrics.width + this.config.leftPadding;
            }
        });

        this.focusModel.horizontalX += this.config.horizontalMargin;
    }

    drawSeperator(instance, x) {
        var lineY = instance.y - this.config.marginBetweenFocusInstances / 2;
        this.focusGraphContext.beginPath();
        this.focusGraphContext.moveTo(x, lineY);
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
        if (!this.updateVariable) {
            var mousePos = this.getMousePos(event, this.focusGraphCanvas);
            this.scope.ctrl.menuX = mousePos.x;
            this.scope.ctrl.menuY = mousePos.y;
            var height = this.focusModel.instanceHeight + this.config.marginBetweenFocusInstances;

            for (var i = 0; i < this.focusModel.data.length; ++i) {
                if (height * i <= mousePos.y && mousePos.y <= height * (i + 1)) {
                    var instance = this.focusModel.data[i];

                    this.variableSrv.variables.forEach((v) => {
                        if (v.name == 'node') {
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
}

HeatmapCtrl.templateUrl = "module.html";