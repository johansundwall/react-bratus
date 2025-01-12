"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ASTParser_1 = __importDefault(require("../ASTParser"));
const Edge_1 = __importDefault(require("./Edge"));
const Node_1 = __importDefault(require("./Node"));
class Graph {
    constructor(componentMap) {
        this.nodes = [];
        this.edges = [];
        this.level = 0;
        this.componentMap = componentMap;
    }
    build() {
        ASTParser_1.default.logEntryToFile(`[Info] Building graph`);
        const component = this.componentMap.get('App');
        if (component) {
            ASTParser_1.default.logEntryToFile(`[Info] Creating root node`);
            const elements = component.getJSXElements();
            component.timesUsed++;
            const root = this.createNode(component.getElementName(), {
                label: component.getElementName(),
                linesOfCode: component.getLinesOfCode(),
                component,
                outDegree: 0,
                inDegree: 0,
            });
            for (let k = 0; k < elements.length; k++) {
                const element = elements[k];
                this.buildComponentTree(root, element);
            }
        }
    }
    buildComponentTree(source, element) {
        try {
            const component = this.componentMap.get(element.getElementName());
            if (component) {
                component.timesUsed++;
                const targetNodeId = `${source.id}:${component.getElementName()}`;
                if (!this.nodes.some((node) => node.id === targetNodeId)) {
                    ASTParser_1.default.logEntryToFile(`[Info] Creating link between: ${source.data.label} and ${component.getElementName()}`);
                    const target = this.createNode(`${source.id}:${component.getElementName()}`, {
                        label: component.getElementName(),
                        linesOfCode: component.getLinesOfCode(),
                        component: component,
                        outDegree: 0,
                        inDegree: 0,
                    });
                    this.createEdge(source, target, element);
                    if (component.hasJSX()) {
                        component.getJSXElements().forEach((subElement) => {
                            this.buildComponentTree(target, subElement);
                        });
                    }
                }
                else {
                    ASTParser_1.default.logEntryToFile(`[Warnig] Node with id: ${targetNodeId} already exist. Not creating duplicate node`);
                }
            }
        }
        catch (error) {
            ASTParser_1.default.logEntryToFile(`Error thrown: ${error.getMessage()}`);
        }
    }
    createNode(id, data) {
        const node = new Node_1.default(id, data);
        this.nodes.push(node);
        return node;
    }
    createEdge(source, target, element) {
        const edge = new Edge_1.default(target.id, source.id, target.id, element.isOptional());
        if (element.isRouteElement && element.routePath) {
            edge.label = element.routePath;
        }
        this.edges.push(edge);
        source.data.outDegree++;
        target.data.inDegree++;
        return edge;
    }
    calculateInfo() {
        const components = [...new Set(this.componentMap.values())];
        return {
            uniqueComponents: components.length,
            averageTimesUsed: components
                .map((component) => component.timesUsed)
                .reduce((a, b) => a + b) / components.length,
            averageLinesOfCode: components
                .map((component) => component.getLinesOfCode())
                .reduce((a, b) => a + b) / components.length,
        };
    }
    toString() {
        return JSON.stringify({
            info: this.calculateInfo(),
            nodes: this.nodes,
            edges: this.edges,
        });
    }
}
exports.default = Graph;
//# sourceMappingURL=Graph.js.map