import ASTParser from '../ASTParser';
import Component from '../Builder/Component';
import JSXElement from '../Builder/JSXElement';
import Edge from './Edge';
import Node, { NodeData } from './Node';

class Graph {
  public nodes: Node[] = [];
  private componentMap: Map<string, Component>;
  public edges: Edge[] = [];
  public level = 0;

  constructor(componentMap: Map<string, Component>) {
    this.componentMap = componentMap;
  }

  public build(): void {
    ASTParser.logEntryToFile(`[Info] Building graph`);
    const component = this.componentMap.get('App');
    if (component) {
      ASTParser.logEntryToFile(`[Info] Creating root node`);
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

  private buildComponentTree(source: Node, element: JSXElement): void {
    try {
      const component = this.componentMap.get(element.getElementName());
      if (component) {
        component.timesUsed++;
        const targetNodeId = `${source.id}:${component.getElementName()}`;
        if (!this.nodes.some((node) => node.id === targetNodeId)) {
          ASTParser.logEntryToFile(
            `[Info] Creating link between: ${
              source.data.label
            } and ${component.getElementName()}`
          );
          const target = this.createNode(
            `${source.id}:${component.getElementName()}`,
            {
              label: component.getElementName(),
              linesOfCode: component.getLinesOfCode(),
              component: component,
              outDegree: 0,
              inDegree: 0,
            }
          );
          this.createEdge(source, target, element);
          if (component.hasJSX()) {
            component.getJSXElements().forEach((subElement) => {
              this.buildComponentTree(target, subElement);
            });
          }
        } else {
          ASTParser.logEntryToFile(
            `[Warnig] Node with id: ${targetNodeId} already exist. Not creating duplicate node`
          );
        }
      }
    } catch (error) {
      ASTParser.logEntryToFile(`Error thrown: ${error.getMessage()}`);
    }
  }

  private createNode(id: string, data: NodeData): Node {
    const node = new Node(id, data);
    this.nodes.push(node);
    return node;
  }
  private createEdge(source: Node, target: Node, element: JSXElement): Edge {
    const edge = new Edge(
      target.id,
      source.id,
      target.id,
      element.isOptional()
    );
    if (element.isRouteElement && element.routePath) {
      edge.label = element.routePath;
    }
    this.edges.push(edge);
    source.data.outDegree++;
    target.data.inDegree++;
    return edge;
  }

  private calculateInfo() {
    const components: Component[] = [...new Set(this.componentMap.values())];

    return {
      uniqueComponents: components.length,
      averageTimesUsed:
        components
          .map((component) => component.timesUsed)
          .reduce((a, b) => a + b) / components.length,
      averageLinesOfCode:
        components
          .map((component) => component.getLinesOfCode())
          .reduce((a, b) => a + b) / components.length,
    };
  }

  public toString(): string {
    return JSON.stringify({
      info: this.calculateInfo(),
      nodes: this.nodes,
      edges: this.edges,
    });
  }
}
export default Graph;
